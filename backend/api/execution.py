from django.shortcuts import get_object_or_404
from ninja import Router

from agents.executor import execute_task
from cases.models import Case, Task

from .schemas import ExecutionResponse
from .errors import provider_api_error

router = Router(tags=["execution"])


@router.post(
    "/{case_id}/tasks/{task_id}/execute",
    response=ExecutionResponse,
)
def execute_task_endpoint(request, case_id: int, task_id: int):
    case = get_object_or_404(Case, pk=case_id, owner=request.user)
    task = get_object_or_404(Task, pk=task_id, case=case)

    try:
        agent_run = execute_task(case, task)
    except Exception as exc:
        provider_error = provider_api_error(exc)
        if provider_error:
            raise provider_error from exc
        raise

    task.refresh_from_db()

    return {
        "agent_run_id": agent_run.id,
        "case_id": case.id,
        "task_id": task.id,
        "task_status": task.status,
    }
