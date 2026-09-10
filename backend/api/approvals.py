from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from cases.models import Case, Task
from outcomes.models import ActivityEvent, Approval

from .schemas import ApprovalActionResponse

router = Router(tags=["approvals"])


def _apply_approval(case, approval, approved):
    task = approval.task

    if approval.status != Approval.Status.PENDING:
        return {
            "approval_id": approval.id,
            "case_id": case.id,
            "task_id": task.id,
            "status": approval.status,
            "task_status": task.status,
        }

    approval.status = (
        Approval.Status.APPROVED
        if approved
        else Approval.Status.REJECTED
    )
    approval.resolved_at = timezone.now()
    approval.save(update_fields=["status", "resolved_at"])

    if approved:
        task.status = Task.Status.QUEUED
        message = f"Human approval granted for task: {task.title}"
        event_type = "approval_granted"
    else:
        task.status = Task.Status.FAILED
        message = f"Human approval rejected for task: {task.title}"
        event_type = "approval_rejected"

    task.save(update_fields=["status", "updated_at"])

    ActivityEvent.objects.create(
        case=case,
        agent_name="Human Authorization Gate",
        event_type=event_type,
        message=message,
        metadata={
            "approval_id": approval.id,
            "task_id": task.id,
        },
    )

    return {
        "approval_id": approval.id,
        "case_id": case.id,
        "task_id": task.id,
        "status": approval.status,
        "task_status": task.status,
    }


@router.post(
    "/{case_id}/approvals/{approval_id}/approve",
    response=ApprovalActionResponse,
)
def approve(request, case_id: int, approval_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)

    approval = get_object_or_404(
        Approval,
        pk=approval_id,
        case=case,
    )

    return _apply_approval(
        case,
        approval,
        approved=True,
    )


@router.post(
    "/{case_id}/approvals/{approval_id}/reject",
    response=ApprovalActionResponse,
)
def reject(request, case_id: int, approval_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)

    approval = get_object_or_404(
        Approval,
        pk=approval_id,
        case=case,
    )

    return _apply_approval(
        case,
        approval,
        approved=False,
    )
