import os

from django.db import transaction
from django.utils import timezone

from agents.models import AgentRun, AgentStep, ToolAction
from cases.models import Case, Task
from outcomes.models import ActivityEvent, Approval

from .runtime import build_relay_agent
from .tools import inspect_task, prepare_task_action


RELAY_MODE = os.getenv("RELAY_MODE", "demo").lower()


def execute_task(case: Case, task: Task) -> AgentRun:

    if task.status != Task.Status.QUEUED:
        raise ValueError(
            f"Task {task.id} cannot execute from status '{task.status}'."
        )

    if task.requires_approval:
        approval = (
            Approval.objects
            .filter(case=case, task=task)
            .order_by("-id")
            .first()
        )

        if approval is None:
            raise PermissionError(
                f"Task {task.id} requires human approval, but no approval exists."
            )

        if approval.status != Approval.Status.APPROVED:
            raise PermissionError(
                f"Task {task.id} requires approved human authorization."
            )

    started_at = timezone.now()

    with transaction.atomic():
        agent_run = AgentRun.objects.create(
            case=case,
            workflow_name="relay_task_execution",
            status=AgentRun.Status.RUNNING,
            started_at=started_at,
        )

        step = AgentStep.objects.create(
            agent_run=agent_run,
            task=task,
            agent_name="Execution Agent",
            step_type="task_execution",
            status=AgentStep.Status.RUNNING,
            sequence=1,
            started_at=started_at,
        )

        task.status = Task.Status.IN_PROGRESS
        task.save(update_fields=["status", "updated_at"])

        ActivityEvent.objects.create(
            case=case,
            agent_name="Execution Agent",
            event_type="execution_started",
            message=f"Execution started for task: {task.title}",
            metadata={
                "task_id": task.id,
                "agent_run_id": agent_run.id,
                "mode": RELAY_MODE,
            },
        )

    try:

        # ---------------------------------------------------------
        # ZERO-QUOTA DEVELOPMENT MODE
        # ---------------------------------------------------------
        if RELAY_MODE != "live":

            with transaction.atomic():

                action_status = (
                    ToolAction.Status.SUCCEEDED
                    if not task.requires_approval
                    else ToolAction.Status.SUCCEEDED
                )

                action = ToolAction.objects.create(
                    agent_step=step,
                    tool_name="relay_execution",
                    action_name="prepare_task_action",
                    status=action_status,
                    input_data={
                        "task_id": task.id,
                        "title": task.title,
                        "mode": "demo",
                    },
                    output_data={
                        "prepared": True,
                        "external_action_executed": False,
                        "mode": "demo",
                    },
                    requires_approval=task.requires_approval,
                    completed_at=timezone.now(),
                )

                task.status = Task.Status.COMPLETED
                task.completed_at = timezone.now()
                task.save(
                    update_fields=[
                        "status",
                        "completed_at",
                        "updated_at",
                    ]
                )

                step.status = AgentStep.Status.COMPLETED
                step.summary = (
                    "Development execution completed deterministically. "
                    "The controlled action was recorded without performing "
                    "an external action."
                )
                step.completed_at = timezone.now()
                step.save(
                    update_fields=[
                        "status",
                        "summary",
                        "completed_at",
                    ]
                )

                agent_run.status = AgentRun.Status.COMPLETED
                agent_run.completed_at = timezone.now()
                agent_run.save(
                    update_fields=[
                        "status",
                        "completed_at",
                    ]
                )

                ActivityEvent.objects.create(
                    case=case,
                    agent_name="Execution Agent",
                    event_type="task_completed",
                    message=f"Task completed: {task.title}",
                    metadata={
                        "task_id": task.id,
                        "tool_action_id": action.id,
                        "mode": "demo",
                        "external_action_executed": False,
                    },
                )

            return agent_run

        # ---------------------------------------------------------
        # LIVE STRANDS + GEMINI MODE
        # ---------------------------------------------------------

        agent = build_relay_agent(
            tools=[
                inspect_task,
                prepare_task_action,
            ]
        )

        prompt = f"""
Execute exactly this RELAY task.

Task ID: {task.id}
Title: {task.title}
Description: {task.description}
Agent Step ID: {step.id}
Requires approval: {str(task.requires_approval).lower()}

Rules:
1. Inspect the task.
2. Prepare the controlled action exactly once.
3. Never claim an external action occurred unless a tool explicitly confirms it.
4. Never fabricate evidence or results.
5. Return a concise execution summary.
"""

        result = agent(
            prompt,
            tool_choice={
                "tool": {
                    "name": "prepare_task_action",
                }
            },
        )

        with transaction.atomic():

            step.refresh_from_db()
            task.refresh_from_db()

            action = (
                step.tool_actions
                .order_by("-created_at")
                .first()
            )

            if action is None:
                raise RuntimeError(
                    "Execution failed: no ToolAction was persisted."
                )

            if action.requires_approval:
                approval = (
                    Approval.objects
                    .filter(case=case, task=task)
                    .order_by("-id")
                    .first()
                )

                if approval is None or approval.status != Approval.Status.APPROVED:
                    raise PermissionError(
                        "Execution blocked: approved human authorization is missing."
                    )

            action.status = ToolAction.Status.SUCCEEDED
            action.completed_at = timezone.now()
            action.save(
                update_fields=[
                    "status",
                    "completed_at",
                ]
            )

            task.status = Task.Status.COMPLETED
            task.completed_at = timezone.now()
            task.save(
                update_fields=[
                    "status",
                    "completed_at",
                    "updated_at",
                ]
            )

            step.status = AgentStep.Status.COMPLETED
            step.summary = str(result)
            step.completed_at = timezone.now()
            step.save(
                update_fields=[
                    "status",
                    "summary",
                    "completed_at",
                ]
            )

            agent_run.status = AgentRun.Status.COMPLETED
            agent_run.completed_at = timezone.now()
            agent_run.save(
                update_fields=[
                    "status",
                    "completed_at",
                ]
            )

            ActivityEvent.objects.create(
                case=case,
                agent_name="Execution Agent",
                event_type="task_completed",
                message=f"Task completed: {task.title}",
                metadata={
                    "task_id": task.id,
                    "tool_action_id": action.id,
                    "mode": "live",
                },
            )

        return agent_run

    except Exception as exc:

        with transaction.atomic():

            step.refresh_from_db()
            agent_run.refresh_from_db()
            task.refresh_from_db()

            step.status = AgentStep.Status.FAILED
            step.error_message = str(exc)
            step.completed_at = timezone.now()
            step.save(
                update_fields=[
                    "status",
                    "error_message",
                    "completed_at",
                ]
            )

            agent_run.status = AgentRun.Status.FAILED
            agent_run.error_message = str(exc)
            agent_run.completed_at = timezone.now()
            agent_run.save(
                update_fields=[
                    "status",
                    "error_message",
                    "completed_at",
                ]
            )

            if task.status == Task.Status.IN_PROGRESS:
                task.status = Task.Status.FAILED
                task.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

        raise


def execute_next_task(case: Case) -> AgentRun:
    task = (
        case.tasks
        .filter(status=Task.Status.QUEUED)
        .order_by("position", "id")
        .first()
    )

    if task is None:
        raise ValueError("No queued task is available for execution.")

    return execute_task(case, task)
