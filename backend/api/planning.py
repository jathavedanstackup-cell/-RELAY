from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from ninja import Router

from agents.orchestrator import plan_case
from cases.models import Case
from .schemas import PlanResponse
from .errors import provider_api_error

router = Router(tags=["planning"])


@router.post("/{case_id}/plan", response=PlanResponse)
def create_case_plan(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)

    try:
        agent_run = plan_case(case)
    except Exception as exc:
        provider_error = provider_api_error(exc)
        if provider_error:
            raise provider_error from exc
        raise

    case.refresh_from_db()

    step = (
        agent_run.steps
        .order_by("-sequence", "-id")
        .first()
    )

    return {
        "agent_run_id": agent_run.id,
        "case_id": case.id,
        "case_status": case.status,
        "summary": step.summary if step else "",
        "objective_count": case.objectives.count(),
        "task_count": case.tasks.count(),
        "created_at": agent_run.created_at,
    }
