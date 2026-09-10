from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from cases.models import Case, Objective
from outcomes.models import Approval, Outcome, ActivityEvent

from .schemas import (
    ActionResponse,
    ActivityEventOut,
    ApprovalOut,
    CaseCreateIn,
    CaseCreateOut,
    CaseDetailOut,
    CaseListOut,
    OutcomeOut,
    TaskOut,
)

router = Router(tags=["cases"])


@router.get("", response=list[CaseListOut])
def list_cases(request):
    return Case.objects.filter(owner=request.user).order_by("-updated_at")


@router.post("", response=CaseCreateOut)
def create_case(request, payload: CaseCreateIn):
    case = Case.objects.create(
        owner=request.user,
        title=payload.title,
        problem_statement=payload.problem_statement,
        status=Case.Status.DRAFT,
    )

    for position, objective in enumerate(payload.objectives):
        Objective.objects.create(
            case=case,
            title=objective.title,
            description=objective.description,
            position=position,
        )

    return case


@router.get("/{case_id}", response=CaseDetailOut)
def get_case(request, case_id: int):
    return get_object_or_404(
        Case.objects.prefetch_related("objectives", "tasks"),
        pk=case_id,
        owner=request.user,
    )


@router.get("/{case_id}/tasks", response=list[TaskOut])
def get_case_tasks(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)
    return case.tasks.all().order_by("position", "id")


@router.get("/{case_id}/activity", response=list[ActivityEventOut])
def get_case_activity(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)
    return case.activity_events.all().order_by("created_at")


@router.get("/{case_id}/outcome", response=OutcomeOut | None)
def get_case_outcome(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)
    return getattr(case, "outcome", None)


@router.get("/{case_id}/approvals", response=list[ApprovalOut])
def get_case_approvals(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)
    return case.approvals.all().order_by("-requested_at")


@router.post("/{case_id}/approve", response=ActionResponse)
def approve_case_action(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)

    approval = case.approvals.filter(
        status=Approval.Status.PENDING
    ).order_by("requested_at").first()

    if approval is None:
        return ActionResponse(
            status="no_pending_approval",
            case_id=case.id,
        )

    approval.status = Approval.Status.APPROVED
    approval.resolved_at = timezone.now()
    approval.save(update_fields=["status", "resolved_at"])

    case.status = Case.Status.IN_PROGRESS
    case.save(update_fields=["status", "updated_at"])

    ActivityEvent.objects.create(
        case=case,
        agent_name="Human Authorization Gate",
        event_type="approval",
        message="User approved the pending consequential action.",
        metadata={"approval_id": approval.id},
    )

    return ActionResponse(
        status="approved",
        case_id=case.id,
    )


@router.post("/{case_id}/pause", response=ActionResponse)
def pause_case(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)

    case.status = Case.Status.PAUSED
    case.save(update_fields=["status", "updated_at"])

    ActivityEvent.objects.create(
        case=case,
        agent_name="Operations Controller",
        event_type="case_paused",
        message="Case execution was paused by the user.",
        metadata={},
    )

    return ActionResponse(
        status="paused",
        case_id=case.id,
    )


@router.post("/{case_id}/resume", response=ActionResponse)
def resume_case(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)

    case.status = Case.Status.IN_PROGRESS
    case.save(update_fields=["status", "updated_at"])

    ActivityEvent.objects.create(
        case=case,
        agent_name="Operations Controller",
        event_type="case_resumed",
        message="Case execution was resumed.",
        metadata={},
    )

    return ActionResponse(
        status="resumed",
        case_id=case.id,
    )
