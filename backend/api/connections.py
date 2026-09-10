from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from integrations.models import Connection

from .schemas import ConnectionOut

router = Router(tags=["connections"])


@router.get("", response=list[ConnectionOut])
def list_connections(request):
    return Connection.objects.all().order_by("name")


@router.post("/{connection_id}/toggle", response=ConnectionOut)
def toggle_connection(request, connection_id: int):
    connection = get_object_or_404(Connection, pk=connection_id)

    if connection.status == Connection.Status.CONNECTED:
        connection.status = Connection.Status.NOT_CONNECTED
    else:
        connection.status = Connection.Status.CONNECTED
        connection.last_synced = timezone.now()

    connection.save(
        update_fields=["status", "last_synced", "updated_at"]
    )

    return connection
