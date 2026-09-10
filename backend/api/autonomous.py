from django.shortcuts import get_object_or_404
from ninja import Router

from agents.autonomous_loop import run_autonomous_loop
from cases.models import Case

from .schemas import AutonomousLoopResponse
from .errors import provider_api_error


router = Router(tags=["autonomous-loop"])


@router.post(
    "/{case_id}/run",
    response=AutonomousLoopResponse,
)
def run_case_autonomously(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)

    try:
        return run_autonomous_loop(case)
    except Exception as exc:
        provider_error = provider_api_error(exc)
        if provider_error:
            raise provider_error from exc
        raise
