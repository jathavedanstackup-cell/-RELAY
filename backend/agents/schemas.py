from pydantic import BaseModel, Field


class PlannedTask(BaseModel):
    title: str = Field(description="A concise actionable task title.")
    description: str = Field(description="What must be accomplished.")
    requires_approval: bool = Field(
        default=False,
        description="Whether this task requires explicit human approval before a consequential action."
    )


class ExecutionPlan(BaseModel):
    summary: str = Field(description="Concise understanding of the user's problem and desired outcome.")
    objectives: list[str] = Field(
        min_length=1,
        description="The concrete outcomes RELAY should accomplish."
    )
    tasks: list[PlannedTask] = Field(
        min_length=1,
        description="Ordered execution tasks required to accomplish the objectives."
    )
