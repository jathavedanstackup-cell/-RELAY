from django.db import transaction
from django.utils import timezone

from agents.airline_tools import (
    lookup_booking,
    search_alternative_flights,
    rebook_flight,
    verify_rebooking,
)
from agents.models import AgentStep, ToolAction
from cases.models import Case, Task
from documents.models import Evidence
from outcomes.models import ActivityEvent, Outcome


def create_verified_rebooking_evidence(case: Case, task: Task) -> dict:
    """
    Safe local hackathon demo flow.

    Simulates:
        booking lookup
        alternative flight search
        approved rebooking
        external verification
        evidence persistence
        verified outcome
    """

    pnr = "ABC123"
    passenger_name = "Demo Passenger"

    booking = lookup_booking(
        pnr=pnr,
        passenger_name=passenger_name,
    )

    if not booking.get("success"):
        raise RuntimeError("Booking lookup failed.")

    search = search_alternative_flights(
        origin=booking["original_flight"]["origin"],
        destination=booking["original_flight"]["destination"],
        travel_date="2026-09-13",
    )

    if not search.get("success") or not search.get("options"):
        raise RuntimeError("No alternative flights available.")

    selected_option = search["options"][0]

    if not selected_option.get("available"):
        raise RuntimeError("Selected demo flight is unavailable.")

    rebooking = rebook_flight(
        pnr=pnr,
        option_id=selected_option["option_id"],
    )

    if not rebooking.get("success"):
        raise RuntimeError("Rebooking action failed.")

    verification = verify_rebooking(
        pnr=pnr,
        transaction_id=rebooking["transaction_id"],
    )

    if not verification.get("verified"):
        raise RuntimeError(
            "External rebooking verification failed."
        )

    with transaction.atomic():

        run_step = (
            AgentStep.objects
            .filter(
                task=task,
                agent_run__case=case,
            )
            .order_by("-id")
            .first()
        )

        if run_step is None:
            raise RuntimeError(
                "No AgentStep exists for this task."
            )

        tool_action = (
            ToolAction.objects
            .filter(agent_step=run_step)
            .order_by("-id")
            .first()
        )

        if tool_action is None:
            tool_action = ToolAction.objects.create(
                agent_step=run_step,
                tool_name="airline_demo",
                action_name="rebook_flight",
                status=ToolAction.Status.SUCCEEDED,
                input_data={
                    "pnr": pnr,
                    "option_id": selected_option["option_id"],
                },
                output_data=rebooking,
                requires_approval=True,
                completed_at=timezone.now(),
            )

        evidence = Evidence.objects.create(
            case=case,
            tool_action=tool_action,
            title="Rebooking confirmation",
            evidence_type="external_confirmation",
            source="RELAY Demo Airline",
            reference=rebooking["transaction_id"],
            content={
                "booking": booking,
                "selected_option": selected_option,
                "rebooking": rebooking,
                "verification": verification,
            },
            verified=True,
        )

        task.status = Task.Status.COMPLETED
        task.completed_at = timezone.now()
        task.save(
            update_fields=[
                "status",
                "completed_at",
                "updated_at",
            ]
        )

        Outcome.objects.update_or_create(
            case=case,
            defaults={
                "summary": (
                    "RELAY prepared the approved rebooking and verified "
                    "the resulting state using explicit confirmation evidence."
                ),
                "status": Outcome.Status.RESOLVED,
                "results": [
                    {
                        "task_id": task.id,
                        "transaction_id": rebooking["transaction_id"],
                        "ticket_status": verification["ticket_status"],
                        "segment_status": verification["segment_status"],
                        "evidence_id": evidence.id,
                    }
                ],
                "verified": True,
                "resolved_at": timezone.now(),
            },
        )

        # Case.Status has no RESOLVED value.
        # COMPLETED is the correct terminal successful state.
        case.status = Case.Status.COMPLETED
        case.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        ActivityEvent.objects.create(
            case=case,
            agent_name="Verification Agent",
            event_type="external_outcome_verified",
            message=(
                "RELAY verified the rebooking using explicit confirmation "
                "evidence from the demo airline system."
            ),
            metadata={
                "task_id": task.id,
                "evidence_id": evidence.id,
                "transaction_id": rebooking["transaction_id"],
                "ticket_status": verification["ticket_status"],
                "segment_status": verification["segment_status"],
            },
        )

    return {
        "case_id": case.id,
        "task_id": task.id,
        "evidence_id": evidence.id,
        "transaction_id": rebooking["transaction_id"],
        "ticket_status": verification["ticket_status"],
        "segment_status": verification["segment_status"],
        "verified": True,
    }
