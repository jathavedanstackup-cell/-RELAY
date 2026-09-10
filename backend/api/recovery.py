from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from agents.recovery import recover_case
from cases.models import Case


class RecoveryResponse(Schema):
    case_id: int
    status: str
    next_task_id: int | None
    message: str


router = Router(tags=["recovery"])


@router.post("/{case_id}/recover", response=RecoveryResponse)
def recover_case_endpoint(request, case_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)
    return recover_case(case)
