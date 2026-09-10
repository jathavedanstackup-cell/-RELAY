from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from agents.models import AgentRun, AgentStep, ToolAction
from cases.models import Case, Task
from documents.models import Evidence
from outcomes.models import ActivityEvent, Approval, Outcome


def verify_task(case_id: int, task_id: int) -> dict:
    case = get_object_or_404(Case, pk=case_id)
    task = get_object_or_404(Task, pk=task_id, case=case)

    latest_action = (
        ToolAction.objects
        .filter(agent_step__task=task)
        .order_by("-created_at")
        .first()
    )

    evidence = (
        Evidence.objects
        .filter(case=case, tool_action=latest_action, verified=True)
        if latest_action
        else Evidence.objects.none()
    )

    verified_evidence_count = evidence.count()

    if task.status == Task.Status.WAITING_APPROVAL:
        verdict = "NEEDS_APPROVAL"
        explanation = (
            "The task is blocked at the human approval boundary. "
            "No consequential action may proceed without explicit approval."
        )

    elif latest_action is None:
        verdict = "NEEDS_ATTENTION"
        explanation = (
            "No recorded ToolAction exists for this task, so execution "
            "cannot be verified."
        )

    elif latest_action.requires_approval and latest_action.status != ToolAction.Status.SUCCEEDED:
        verdict = "NEEDS_APPROVAL"
        explanation = (
            "The action requires human approval and has not produced a "
            "successful authorized execution."
        )

    elif verified_evidence_count > 0:
        verdict = "VERIFIED"
        explanation = (
            "Verified evidence is attached to the recorded tool action. "
            "The resulting state is supported by application evidence."
        )

    elif task.status == Task.Status.COMPLETED:
        verdict = "READY_FOR_NEXT_STEP"
        explanation = (
            "The internal task completed, but no verified external evidence "
            "exists. RELAY must not claim an external outcome occurred."
        )

    else:
        verdict = "NEEDS_ATTENTION"
        explanation = (
            "The task state does not contain sufficient evidence to verify "
            "the proposed outcome."
        )

    with transaction.atomic():
        Outcome.objects.update_or_create(
            case=case,
            defaults={
                "summary": explanation,
                "status": (
                    Outcome.Status.RESOLVED
                    if verdict == "VERIFIED"
                    else Outcome.Status.PARTIAL
                    if verdict == "READY_FOR_NEXT_STEP"
                    else Outcome.Status.PENDING
                ),
                "results": [
                    {
                        "task_id": task.id,
                        "verdict": verdict,
                        "verified_evidence_count": verified_evidence_count,
                    }
                ],
                "verified": verdict == "VERIFIED",
                "resolved_at": (
                    timezone.now()
                    if verdict == "VERIFIED"
                    else None
                ),
            },
        )

        ActivityEvent.objects.create(
            case=case,
            agent_name="Verification Agent",
            event_type="verification_completed",
            message=explanation,
            metadata={
                "task_id": task.id,
                "tool_action_id": (
                    latest_action.id
                    if latest_action
                    else None
                ),
                "verdict": verdict,
                "verified_evidence_count": verified_evidence_count,
            },
        )

    return {
        "case_id": case.id,
        "task_id": task.id,
        "verdict": verdict,
        "verified_evidence_count": verified_evidence_count,
        "explanation": explanation,
    }
