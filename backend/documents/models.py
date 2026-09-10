from django.db import models

from agents.models import ToolAction
from cases.models import Case


class Evidence(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="evidence",
    )
    tool_action = models.ForeignKey(
        ToolAction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evidence",
    )
    title = models.CharField(max_length=255)
    evidence_type = models.CharField(max_length=100)
    source = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=500, blank=True)
    content = models.JSONField(default=dict, blank=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Document(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    filename = models.CharField(max_length=255)
    document_type = models.CharField(max_length=100, blank=True)
    storage_key = models.CharField(max_length=500, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    size_bytes = models.PositiveBigIntegerField(default=0)
    processing_status = models.CharField(max_length=50, default="uploaded")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.filename
