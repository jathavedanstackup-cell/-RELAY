import os
from pathlib import Path

from dotenv import load_dotenv
from django.db import transaction
from django.utils import timezone

from strands import Agent
from strands.agent.agent_result import AgentResult
from strands.models.gemini import GeminiModel
from strands.multiagent import GraphBuilder
from strands.multiagent.base import (
    MultiAgentBase,
    MultiAgentResult,
    NodeResult,
    Status,
)
from strands.types.content import ContentBlock, Message

from .models import AgentRun, AgentStep
from cases.models import Case
from outcomes.models import ActivityEvent


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=True)

RELAY_MODE = os.getenv("RELAY_MODE", "demo").lower()
GEMINI_MODEL = "gemini-3.6-flash"


NODE_CONFIG = [
    (
        "situation",
        "Situation Agent",
        "situation_analysis",
        "Analyze the user's problem, constraints, missing information, entities, deadlines, and desired outcome.",
    ),
    (
        "planning",
        "Planning Agent",
        "execution_plan",
        "Turn the situation into a concrete execution plan with ordered objectives and tasks.",
    ),
    (
        "research",
        "Research Agent",
        "research_requirements",
        "Determine what information and evidence are required before execution.",
    ),
    (
        "evidence",
        "Evidence Agent",
        "evidence_audit",
        "Identify supported facts, unverified claims, and evidence gaps.",
    ),
    (
        "action",
        "Action Agent",
        "action_preparation",
        "Prepare the next safe action and identify consequential actions requiring approval.",
    ),
    (
        "verification",
        "Verification Agent",
        "verification",
        "Determine whether the proposed next step or external outcome is supported by evidence.",
    ),
]


DEMO_OUTPUTS = {
    "situation": (
        "Situation identified: the user's flight was cancelled and rebooking "
        "assistance is required. Booking, passenger, and flight-specific details "
        "are missing."
    ),
    "planning": (
        "Plan established: collect booking details, assess alternatives, "
        "present options, obtain approval for consequential rebooking, "
        "then verify the result."
    ),
    "research": (
        "Research requirements: booking identifier, passenger identity, "
        "original flight details, preferences, cancellation evidence, "
        "ticket state, and replacement availability."
    ),
    "evidence": (
        "Evidence audit: only the user's cancellation request is supported. "
        "External cancellation status, ticket state, inventory, and itinerary "
        "selection remain unverified."
    ),
    "action": (
        "Action prepared: request missing booking information. No external "
        "booking modification is authorized. Rebooking remains behind the "
        "human approval gate."
    ),
    "verification": (
        "READY_FOR_NEXT_STEP: the safe information-request step is supported. "
        "No external rebooking outcome is verified because there is no external "
        "system evidence."
    ),
}


def get_api_key():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")
    return key


def build_model():
    return GeminiModel(
        client_args={"api_key": get_api_key()},
        model_id=GEMINI_MODEL,
    )


def build_live_agent(node_id, agent_name, system_prompt):
    return Agent(
        name=node_id,
        model=build_model(),
        system_prompt=(
            f"You are RELAY's {agent_name}. "
            f"{system_prompt} "
            "Never invent facts. Never claim an external action occurred "
            "unless explicitly confirmed by a tool. Consequential actions "
            "require human approval."
        ),
    )


class DemoNode(MultiAgentBase):
    """
    Deterministic Strands graph node for zero-quota development.

    This node returns the exact result structure expected by Strands 1.55.0.
    """

    def __init__(self, node_id):
        super().__init__()
        self.name = node_id
        self.node_id = node_id

    async def invoke_async(self, task, invocation_state=None, **kwargs):
        text = DEMO_OUTPUTS[self.node_id]

        agent_result = AgentResult(
            stop_reason="end_turn",
            message=Message(
                role="assistant",
                content=[ContentBlock(text=text)],
            ),
            metrics=None,
            state=invocation_state or {},
        )

        node_result = NodeResult(
            result=agent_result,
            execution_time=0.0,
        )

        return MultiAgentResult(
            status=Status.COMPLETED,
            results={
                self.node_id: node_result,
            },
        )


def build_graph():
    builder = GraphBuilder()

    for node_id, agent_name, _step_type, system_prompt in NODE_CONFIG:
        if RELAY_MODE == "live":
            executor = build_live_agent(
                node_id,
                agent_name,
                system_prompt,
            )
        else:
            executor = DemoNode(node_id)

        builder.add_node(executor, node_id)

    builder.add_edge("situation", "planning")
    builder.add_edge("planning", "research")
    builder.add_edge("research", "evidence")
    builder.add_edge("evidence", "action")
    builder.add_edge("action", "verification")

    builder.set_entry_point("situation")
    builder.set_execution_timeout(60)
    builder.set_node_timeout(15)
    builder.set_max_node_executions(10)

    return builder.build()


def run_relay_case(case):
    prompt = f"""
RELAY CASE

Case ID: {case.id}
Title: {case.title}

User problem:
{case.problem_statement}

Process this case through the RELAY workflow.

Rules:
- Do not invent facts.
- Do not claim external actions happened.
- Identify missing information.
- Consequential actions require human approval.
- Verification must distinguish a safe next step from a verified external outcome.
"""

    started_at = timezone.now()

    graph = build_graph()
    result = graph(prompt)

    completed_at = timezone.now()
    result_status = str(result.status)

    with transaction.atomic():
        run = AgentRun.objects.create(
            case=case,
            workflow_name="relay_multi_agent_graph",
            status=(
                AgentRun.Status.COMPLETED
                if result_status.endswith("COMPLETED")
                else AgentRun.Status.FAILED
            ),
            started_at=started_at,
            completed_at=completed_at,
        )

        node_results = getattr(result, "results", {}) or {}

        for sequence, (
            node_id,
            agent_name,
            step_type,
            _system_prompt,
        ) in enumerate(NODE_CONFIG, start=1):

            node_result = node_results.get(node_id)

            if node_result is None:
                continue

            AgentStep.objects.create(
                agent_run=run,
                agent_name=agent_name,
                step_type=step_type,
                status=AgentStep.Status.COMPLETED,
                summary=str(node_result)[:10000],
                sequence=sequence,
                started_at=started_at,
                completed_at=completed_at,
            )

            ActivityEvent.objects.create(
                case=case,
                agent_name=agent_name,
                event_type="agent_step_completed",
                message=f"{agent_name} completed its workflow step.",
                metadata={
                    "agent_run_id": run.id,
                    "node_id": node_id,
                    "step_type": step_type,
                    "mode": RELAY_MODE,
                },
            )

        ActivityEvent.objects.create(
            case=case,
            agent_name="RELAY Orchestrator",
            event_type="workflow_completed",
            message="RELAY multi-agent workflow completed.",
            metadata={
                "agent_run_id": run.id,
                "node_count": len(node_results),
                "mode": RELAY_MODE,
            },
        )

    return run
