from django.db import models


class Connection(models.Model):
    class Status(models.TextChoices):
        CONNECTED = "connected", "Connected"
        NOT_CONNECTED = "not_connected", "Not Connected"
        NEEDS_ATTENTION = "needs_attention", "Needs Attention"

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.NOT_CONNECTED,
        db_index=True,
    )
    icon = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=list, blank=True)
    last_synced = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
