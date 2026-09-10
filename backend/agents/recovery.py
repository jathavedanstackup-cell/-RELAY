from django.db import transaction

from cases.models import Case, Task
from outcomes.models import ActivityEvent, Approval, Outcome


def recover_case(case: Case) -> dict:
    outcome = Outcome.objects.filter(case=case).first()

    if outcome is None:
        raise ValueError("No outcome exists for this case.")

    if outcome.verified:
        return {
            "case_id": case.id,
            "status": "already_verified",
            "next_task_id": None,
            "message": "Case is already verified. No recovery required.",
        }

    # ---------------------------------------------------------
    # First: find a consequential task whose approval is already
    # granted. That task is now safe to resume.
    # ---------------------------------------------------------
    approved_task = (
        case.tasks
        .filter(status=Task.Status.WAITING_APPROVAL, requires_approval=True)
        .filter(
            id__in=Approval.objects.filter(
                case=case,
                status=Approval.Status.APPROVED,
            ).values("task_id")
        )
        .order_by("position", "id")
        .first()
    )

    if approved_task is not None:
        with transaction.atomic():
            approved_task.status = Task.Status.QUEUED
            approved_task.save(update_fields=["status", "updated_at"])

            approval = (
                Approval.objects
                .filter(case=case, task=approved_task)
                .order_by("-id")
                .first()
            )

            ActivityEvent.objects.create(
                case=case,
                agent_name="RELAY Recovery Agent",
                event_type="approved_task_resumed",
                message=(
                    f"Approved task resumed for execution: "
                    f"{approved_task.title}"
                ),
                metadata={
                    "task_id": approved_task.id,
                    "approval_id": approval.id if approval else None,
                    "approval_status": (
                        approval.status if approval else None
                    ),
                },
            )

        return {
            "case_id": case.id,
            "status": "approved_task_ready",
            "next_task_id": approved_task.id,
            "message": (
                "Human approval is already granted. RELAY resumed the "
                "approved consequential task for execution."
            ),
        }

    # ---------------------------------------------------------
    # Second: use an existing queued task.
    # ---------------------------------------------------------
    next_task = (
        case.tasks
        .filter(status=Task.Status.QUEUED)
        .order_by("position", "id")
        .first()
    )

    if next_task is not None:
        with transaction.atomic():
            case.status = Case.Status.PLANNING
            case.save(update_fields=["status", "updated_at"])

            ActivityEvent.objects.create(
                case=case,
                agent_name="RELAY Recovery Agent",
                event_type="recovery_selected",
                message=(
                    f"Recovery selected next task: "
                    f"{next_task.title}"
                ),
                metadata={
                    "task_id": next_task.id,
                    "previous_outcome_status": outcome.status,
                    "verified": outcome.verified,
                },
            )

        return {
            "case_id": case.id,
            "status": "recovery_ready",
            "next_task_id": next_task.id,
            "message": (
                "Outcome is not verified. RELAY selected the next "
                "queued task instead of claiming resolution."
            ),
        }

    # ---------------------------------------------------------
    # Third: no queued task and no approved task.
    # ---------------------------------------------------------
    with transaction.atomic():
        case.status = Case.Status.PLANNING
        case.save(update_fields=["status", "updated_at"])

        ActivityEvent.objects.create(
            case=case,
            agent_name="RELAY Recovery Agent",
            event_type="recovery_blocked",
            message=(
                "No executable task is currently available. "
                "Additional planning is required."
            ),
            metadata={
                "previous_outcome_status": outcome.status,
                "verified": outcome.verified,
            },
        )

    return {
        "case_id": case.id,
        "status": "replanning_required",
        "next_task_id": None,
        "message": (
            "No queued or already-approved task is available. "
            "Additional planning is required."
        ),
    }
