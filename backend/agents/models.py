from django.db import models

from cases.models import Case, Task


class AgentRun(models.Model):
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        RUNNING = "running", "Running"
        WAITING = "waiting", "Waiting"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="agent_runs",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.QUEUED,
        db_index=True,
    )
    workflow_name = models.CharField(max_length=255)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.workflow_name} ? {self.case_id} ? {self.status}"


class AgentStep(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    agent_run = models.ForeignKey(
        AgentRun,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agent_steps",
    )
    agent_name = models.CharField(max_length=100)
    step_type = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    summary = models.TextField(blank=True)
    sequence = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sequence", "id"]

    def __str__(self):
        return f"{self.agent_name} ? {self.step_type} ? {self.status}"


class ToolAction(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        RUNNING = "running", "Running"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REQUIRES_APPROVAL = "requires_approval", "Requires Approval"
        REJECTED = "rejected", "Rejected"

    agent_step = models.ForeignKey(
        AgentStep,
        on_delete=models.CASCADE,
        related_name="tool_actions",
    )
    tool_name = models.CharField(max_length=255)
    action_name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.REQUESTED,
    )
    input_data = models.JSONField(default=dict, blank=True)
    output_data = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    requires_approval = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.tool_name} ? {self.action_name} ? {self.status}"
