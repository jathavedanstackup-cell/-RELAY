from django.contrib.auth.models import User
from django.db import models


class Case(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PLANNING = "planning", "Planning"
        IN_PROGRESS = "in_progress", "In Progress"
        WAITING_APPROVAL = "waiting_approval", "Waiting for Approval"
        WAITING_EXTERNAL = "waiting_external", "Waiting for External Action"
        NEEDS_ATTENTION = "needs_attention", "Needs Attention"
        PAUSED = "paused", "Paused"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="relay_cases",
    )
    title = models.CharField(max_length=255)
    problem_statement = models.TextField()
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Case #{self.pk}: {self.title}"


class Objective(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="objectives",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return self.title


class Task(models.Model):
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        IN_PROGRESS = "in_progress", "In Progress"
        WAITING_APPROVAL = "waiting_approval", "Waiting for Approval"
        WAITING_EXTERNAL = "waiting_external", "Waiting for External Action"
        BLOCKED = "blocked", "Blocked"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    objective = models.ForeignKey(
        Objective,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.QUEUED,
        db_index=True,
    )
    position = models.PositiveIntegerField(default=0)
    requires_approval = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return self.title
