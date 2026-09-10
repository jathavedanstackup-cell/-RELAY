import os

from django.db import transaction
from django.utils import timezone

from agents.models import AgentRun, AgentStep
from cases.models import Case, Objective, Task
from outcomes.models import Approval

from .runtime import build_relay_agent
from .schemas import ExecutionPlan, PlannedTask


RELAY_MODE = os.getenv("RELAY_MODE", "demo").lower()


def _build_demo_plan(case: Case) -> ExecutionPlan:
    """
    Deterministic, zero-quota execution plan for RELAY_MODE=demo.

    Mirrors the flight-cancellation demo scenario already used elsewhere in
    the codebase (see agents.multi_agent.DEMO_OUTPUTS) without calling Gemini.
    """
    return ExecutionPlan(
        summary=(
            f"Deterministic demo plan for case '{case.title}': resolve the "
            "passenger's flight disruption and pursue any compensation the "
            "passenger is entitled to."
        ),
        objectives=[
            "Resolve the passenger's travel disruption with a confirmed itinerary.",
            "Secure any compensation, refund, or expense reimbursement the passenger is entitled to.",
        ],
        tasks=[
            PlannedTask(
                title="Gather flight and travel information",
                description=(
                    "Collect the booking reference, passenger details, original "
                    "flight itinerary, and cancellation notice needed to act on "
                    "this case."
                ),
                requires_approval=False,
            ),
            PlannedTask(
                title="Identify alternative travel options",
                description=(
                    "Research available rebooking options, alternative flights, "
                    "or routes consistent with the passenger's original itinerary."
                ),
                requires_approval=False,
            ),
            PlannedTask(
                title="Assess passenger rights and compensation eligibility",
                description=(
                    "Determine what compensation, refund, or reimbursement the "
                    "passenger may be entitled to under the applicable airline "
                    "policy or passenger rights regulation."
                ),
                requires_approval=False,
            ),
            PlannedTask(
                title="Present options to the passenger",
                description=(
                    "Summarize the available rebooking options and compensation "
                    "eligibility for the passenger to review before any "
                    "consequential action is taken."
                ),
                requires_approval=False,
            ),
            PlannedTask(
                title="Execute rebooking or refund action",
                description=(
                    "Submit the selected rebooking or refund request on the "
                    "passenger's behalf. This is a consequential external "
                    "action and requires explicit human approval."
                ),
                requires_approval=True,
            ),
            PlannedTask(
                title="File compensation or expense claim",
                description=(
                    "Submit a compensation or expense reimbursement claim on "
                    "the passenger's behalf. This is a consequential external "
                    "action and requires explicit human approval."
                ),
                requires_approval=True,
            ),
        ],
    )


def plan_case(case: Case) -> AgentRun:
    if RELAY_MODE == "live":
        prompt = f"""
CASE TITLE:
{case.title}

USER PROBLEM:
{case.problem_statement}

Create the execution plan for this case.

Requirements:
- Identify the concrete outcomes the user wants.
- Break the work into ordered executable tasks.
- Keep tasks practical and specific.
- Do not claim any external action has already happened.
- Mark a task as requiring approval when it could create a consequential
  external effect such as spending money, submitting a legal claim,
  signing a document, sending a message, or making a booking.
"""

        agent = build_relay_agent()

        result = agent(
            prompt,
            structured_output_model=ExecutionPlan,
        )

        plan = result.structured_output

        if not isinstance(plan, ExecutionPlan):
            raise RuntimeError("RELAY returned an invalid execution plan.")
    else:
        plan = _build_demo_plan(case)

    with transaction.atomic():
        agent_run = AgentRun.objects.create(
            case=case,
            workflow_name="relay_case_planning",
            status=AgentRun.Status.COMPLETED,
            started_at=timezone.now(),
            completed_at=timezone.now(),
        )

        AgentStep.objects.create(
            agent_run=agent_run,
            agent_name="Planning Agent",
            step_type="plan_case",
            status=AgentStep.Status.COMPLETED,
            summary=plan.summary,
            sequence=1,
            started_at=agent_run.started_at,
            completed_at=agent_run.completed_at,
        )

        case.objectives.all().delete()
        Approval.objects.filter(case=case, task__isnull=False).delete()
        case.tasks.all().delete()

        for position, objective_text in enumerate(plan.objectives):
            Objective.objects.create(
                case=case,
                title=objective_text,
                position=position,
            )

        created_tasks = []

        for position, planned_task in enumerate(plan.tasks):
            objective = case.objectives.order_by("position", "id").first()

            task = Task.objects.create(
                case=case,
                objective=objective,
                title=planned_task.title,
                description=planned_task.description,
                position=position,
                requires_approval=planned_task.requires_approval,
                status=(
                    Task.Status.WAITING_APPROVAL
                    if planned_task.requires_approval
                    else Task.Status.QUEUED
                ),
            )

            if task.requires_approval:
                Approval.objects.get_or_create(
                    case=case,
                    task=task,
                    defaults={
                        "title": f"Approval required: {task.title}",
                        "description": task.description,
                        "requested_action": {
                            "task_id": task.id,
                            "action": task.title,
                        },
                        "rationale": (
                            "This task is marked as consequential and requires "
                            "explicit human approval before execution."
                        ),
                        "status": Approval.Status.PENDING,
                    },
                )

            created_tasks.append(task)

        case.status = Case.Status.PLANNING
        case.save(update_fields=["status", "updated_at"])

    return agent_run
