from django.db import models

from cases.models import Case, Task


class ActivityEvent(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="activity_events",
    )
    agent_run_id = models.BigIntegerField(null=True, blank=True)
    agent_name = models.CharField(max_length=100, blank=True)
    event_type = models.CharField(max_length=100)
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event_type}: {self.message[:60]}"


class Approval(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        EXPIRED = "expired", "Expired"

    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="approvals",
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approvals",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    requested_action = models.JSONField(default=dict, blank=True)
    rationale = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-requested_at"]

    def __str__(self):
        return f"{self.title} ? {self.status}"


class Outcome(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PARTIAL = "partial", "Partial"
        RESOLVED = "resolved", "Resolved"
        FAILED = "failed", "Failed"

    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name="outcome",
    )
    summary = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    results = models.JSONField(default=list, blank=True)
    verified = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Outcome for Case #{self.case_id} ? {self.status}"
