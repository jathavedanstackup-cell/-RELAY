from django.db import transaction

from cases.models import Case, Task
from outcomes.models import Approval, Outcome

from agents.executor import execute_task
from agents.recovery import recover_case
from agents.verification import verify_task
from outcomes.models import ActivityEvent


def run_autonomous_loop(case: Case, max_steps: int = 10) -> dict:
    """
    Run RELAY through its autonomous task cycle.

    The loop:
        execute -> verify -> recover -> continue

    It stops at a human approval boundary, a verified outcome,
    or when no executable task remains.
    """

    executed = []
    verifications = []

    for _ in range(max_steps):

        # ---------------------------------------------------------
        # 1. Already resolved?
        # ---------------------------------------------------------
        outcome = Outcome.objects.filter(case=case).first()

        if outcome and outcome.verified:
            return {
                "case_id": case.id,
                "status": "verified",
                "executed_tasks": executed,
                "verifications": verifications,
                "next_task_id": None,
                "message": "Case outcome is verified. Autonomous loop stopped.",
            }

        # ---------------------------------------------------------
        # 2. Find next executable queued task
        # ---------------------------------------------------------
        task = (
            case.tasks
            .filter(status=Task.Status.QUEUED)
            .order_by("position", "id")
            .first()
        )

        # ---------------------------------------------------------
        # 3. If no queued task exists, check approval boundary
        # ---------------------------------------------------------
        if task is None:
            approval_task = (
                case.tasks
                .filter(status=Task.Status.WAITING_APPROVAL)
                .order_by("position", "id")
                .first()
            )

            if approval_task is not None:
                approval = (
                    Approval.objects
                    .filter(case=case, task=approval_task)
                    .order_by("-id")
                    .first()
                )

                ActivityEvent.objects.create(
                    case=case,
                    agent_name="RELAY Orchestrator",
                    event_type="autonomous_loop_blocked",
                    message=(
                        f"Autonomous execution paused at human approval boundary "
                        f"for task: {approval_task.title}"
                    ),
                    metadata={
                        "task_id": approval_task.id,
                        "approval_id": approval.id if approval else None,
                    },
                )

                return {
                    "case_id": case.id,
                    "status": "waiting_approval",
                    "executed_tasks": executed,
                    "verifications": verifications,
                    "next_task_id": approval_task.id,
                    "message": (
                        "RELAY reached a consequential task and paused for "
                        "explicit human approval."
                    ),
                }

            # -----------------------------------------------------
            # No queue + no approval = recovery/replanning required
            # -----------------------------------------------------
            recovery = recover_case(case)

            if recovery["next_task_id"] is not None:
                continue

            return {
                "case_id": case.id,
                "status": recovery["status"],
                "executed_tasks": executed,
                "verifications": verifications,
                "next_task_id": None,
                "message": recovery["message"],
            }

        # ---------------------------------------------------------
        # 4. Execute exactly one task
        # ---------------------------------------------------------
        agent_run = execute_task(case, task)

        task.refresh_from_db()

        executed.append(
            {
                "task_id": task.id,
                "title": task.title,
                "agent_run_id": agent_run.id,
                "status": task.status,
            }
        )

        # ---------------------------------------------------------
        # 5. Verify the task
        # ---------------------------------------------------------
        verification = verify_task(
            case_id=case.id,
            task_id=task.id,
        )

        verifications.append(verification)

        # ---------------------------------------------------------
        # 6. Fully verified outcome = stop successfully
        # ---------------------------------------------------------
        if verification["verdict"] == "VERIFIED":
            return {
                "case_id": case.id,
                "status": "verified",
                "executed_tasks": executed,
                "verifications": verifications,
                "next_task_id": None,
                "message": "RELAY verified the case outcome.",
            }

        # ---------------------------------------------------------
        # 7. Approval boundary = stop
        # ---------------------------------------------------------
        if verification["verdict"] == "NEEDS_APPROVAL":
            return {
                "case_id": case.id,
                "status": "waiting_approval",
                "executed_tasks": executed,
                "verifications": verifications,
                "next_task_id": task.id,
                "message": (
                    "RELAY paused because human approval is required."
                ),
            }

        # ---------------------------------------------------------
        # 8. Continue through recovery
        # ---------------------------------------------------------
        recovery = recover_case(case)

        if recovery["next_task_id"] is not None:
            continue

        return {
            "case_id": case.id,
            "status": recovery["status"],
            "executed_tasks": executed,
            "verifications": verifications,
            "next_task_id": None,
            "message": recovery["message"],
        }

    return {
        "case_id": case.id,
        "status": "max_steps_reached",
        "executed_tasks": executed,
        "verifications": verifications,
        "next_task_id": None,
        "message": (
            f"Autonomous loop stopped after {max_steps} execution cycles "
            "to prevent uncontrolled looping."
        ),
    }
