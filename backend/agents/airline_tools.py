from datetime import datetime, timezone

from strands import tool


@tool
def lookup_booking(
    pnr: str,
    passenger_name: str,
) -> dict:
    """
    Simulated read-only airline booking lookup for RELAY development/demo mode.
    """
    return {
        "success": True,
        "provider": "RELAY Demo Airline",
        "pnr": pnr,
        "passenger_name": passenger_name,
        "booking_status": "CANCELLED",
        "original_flight": {
            "flight_number": "RA241",
            "origin": "DEL",
            "destination": "LHR",
            "departure": "2026-09-12T18:30:00Z",
        },
        "ticket_status": "OPEN_FOR_REBOOKING",
        "looked_up_at": datetime.now(timezone.utc).isoformat(),
    }


@tool
def search_alternative_flights(
    origin: str,
    destination: str,
    travel_date: str,
) -> dict:
    """
    Simulated read-only flight inventory search.
    """
    return {
        "success": True,
        "provider": "RELAY Demo Airline",
        "origin": origin,
        "destination": destination,
        "travel_date": travel_date,
        "options": [
            {
                "option_id": "ALT-101",
                "flight_number": "RA301",
                "departure": "2026-09-13T07:15:00Z",
                "arrival": "2026-09-13T19:10:00Z",
                "cabin": "Economy",
                "stops": 0,
                "available": True,
            },
            {
                "option_id": "ALT-102",
                "flight_number": "RA415",
                "departure": "2026-09-13T10:40:00Z",
                "arrival": "2026-09-13T22:35:00Z",
                "cabin": "Economy",
                "stops": 1,
                "available": True,
            },
        ],
        "searched_at": datetime.now(timezone.utc).isoformat(),
    }


@tool
def rebook_flight(
    pnr: str,
    option_id: str,
) -> dict:
    """
    Simulated consequential rebooking action.

    This represents the external side effect that RELAY would perform
    after human approval in a real integration.
    """
    return {
        "success": True,
        "provider": "RELAY Demo Airline",
        "pnr": pnr,
        "option_id": option_id,
        "transaction_id": "RELAY-TXN-9001",
        "ticket_status": "CONFIRMED",
        "new_ticket_number": "ETKT-987654321",
        "flight_number": "RA301",
        "itinerary_status": "CONFIRMED",
        "rebooked_at": datetime.now(timezone.utc).isoformat(),
    }


@tool
def verify_rebooking(
    pnr: str,
    transaction_id: str,
) -> dict:
    """
    Simulated post-action verification against the external reservation system.
    """
    return {
        "success": True,
        "provider": "RELAY Demo Airline",
        "pnr": pnr,
        "transaction_id": transaction_id,
        "ticket_status": "CONFIRMED",
        "segment_status": "HK",
        "verified": True,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }
