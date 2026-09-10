import os
from pathlib import Path

from dotenv import load_dotenv
from strands import Agent
from strands.models.gemini import GeminiModel


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE, override=True)


def build_relay_agent(tools=None) -> Agent:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            f"GEMINI_API_KEY is not configured. Expected: {ENV_FILE}"
        )

    model = GeminiModel(
        client_args={"api_key": api_key},
        model_id="gemini-3.6-flash",
    )

    return Agent(
        model=model,
        tools=tools or [],
        system_prompt=(
            "You are RELAY's autonomous execution agent. "
            "Execute only the assigned task. "
            "Use the provided tools when instructed. "
            "Never claim an external action happened unless a tool "
            "explicitly reports that it happened. "
            "Never fabricate evidence, bookings, payments, messages, "
            "legal filings, or confirmations. "
            "Consequential actions require human approval."
        ),
    )
