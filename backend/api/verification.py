from django.shortcuts import get_object_or_404
from ninja import Router

from cases.models import Case

from agents.verification import verify_task
from .schemas import VerificationResponse

router = Router(tags=["verification"])


@router.post(
    "/{case_id}/tasks/{task_id}/verify",
    response=VerificationResponse,
)
def verify_case_task(request, case_id: int, task_id: int):
    get_object_or_404(Case, pk=case_id, owner=request.user)

    return verify_task(
        case_id=case_id,
        task_id=task_id,
    )
