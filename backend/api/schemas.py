from datetime import datetime

from ninja import Schema


class ObjectiveIn(Schema):
    title: str
    description: str = ""


class ObjectiveOut(Schema):
    id: int
    title: str
    description: str
    position: int
    completed: bool


class TaskOut(Schema):
    id: int
    title: str
    description: str
    status: str
    position: int
    requires_approval: bool
    completed_at: datetime | None


class CaseListOut(Schema):
    id: int
    title: str
    problem_statement: str
    status: str
    created_at: datetime
    updated_at: datetime


class CaseDetailOut(Schema):
    id: int
    title: str
    problem_statement: str
    status: str
    created_at: datetime
    updated_at: datetime
    objectives: list[ObjectiveOut]
    tasks: list[TaskOut]


class CaseCreateIn(Schema):
    title: str
    problem_statement: str
    objectives: list[ObjectiveIn] = []


class CaseCreateOut(Schema):
    id: int
    title: str
    problem_statement: str
    status: str


class ActivityEventOut(Schema):
    id: int
    agent_name: str
    event_type: str
    message: str
    metadata: dict
    created_at: datetime


class OutcomeOut(Schema):
    id: int
    summary: str
    status: str
    results: list
    verified: bool
    resolved_at: datetime | None


class ApprovalOut(Schema):
    id: int
    title: str
    description: str
    requested_action: dict
    rationale: str
    status: str
    requested_at: datetime
    resolved_at: datetime | None


class ActionResponse(Schema):
    status: str
    case_id: int


class DocumentOut(Schema):
    id: int
    filename: str
    document_type: str
    storage_key: str
    mime_type: str
    size_bytes: int
    processing_status: str
    created_at: datetime


class ConnectionOut(Schema):
    id: int
    name: str
    category: str
    status: str
    icon: str
    description: str
    permissions: list
    last_synced: datetime | None
    created_at: datetime
from datetime import datetime

from ninja import Schema


class PlanResponse(Schema):
    agent_run_id: int
    case_id: int
    case_status: str
    summary: str
    objective_count: int
    task_count: int
    created_at: datetime
class ExecutionResponse(Schema):
    agent_run_id: int
    case_id: int
    task_id: int
    task_status: str
class VerificationResponse(Schema):
    case_id: int
    task_id: int
    verdict: str
    verified_evidence_count: int
    explanation: str
class ApprovalActionResponse(Schema):
    approval_id: int
    case_id: int
    task_id: int
    status: str
    task_status: str
class RecoveryResponse(Schema):
    case_id: int
    status: str
    next_task_id: int | None
    message: str
class AutonomousLoopResponse(Schema):
    case_id: int
    status: str
    executed_tasks: list[dict]
    verifications: list[dict]
    next_task_id: int | None
    message: str
