from django.shortcuts import get_object_or_404

from strands import tool

from agents.models import AgentStep, ToolAction
from cases.models import Task


@tool
def inspect_task(task_id: int) -> dict:
    """
    Inspect a RELAY task before execution.

    Returns the task title, description, approval requirement, and current status.
    This tool is read-only and never performs an external action.
    """
    task = get_object_or_404(Task, pk=task_id)

    return {
        "task_id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "requires_approval": task.requires_approval,
    }


@tool
def prepare_task_action(agent_step_id: int, task_id: int) -> dict:
    """
    Prepare a controlled action for a RELAY task.

    This does not contact an external service or spend money.
    It records the intended action in the RELAY audit database.
    """
    step = get_object_or_404(AgentStep, pk=agent_step_id)
    task = get_object_or_404(Task, pk=task_id)

    action = ToolAction.objects.create(
        agent_step=step,
        tool_name="relay_execution",
        action_name="prepare_task_action",
        status=(
            ToolAction.Status.REQUIRES_APPROVAL
            if task.requires_approval
            else ToolAction.Status.SUCCEEDED
        ),
        input_data={
            "task_id": task.id,
            "title": task.title,
        },
        output_data={
            "prepared": True,
            "external_action_executed": False,
        },
        requires_approval=task.requires_approval,
    )

    return {
        "tool_action_id": action.id,
        "task_id": task.id,
        "prepared": True,
        "requires_approval": task.requires_approval,
        "external_action_executed": False,
    }
