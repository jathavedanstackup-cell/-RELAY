from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from documents.models import Document

from .schemas import DocumentOut

router = Router(tags=["documents"])


@router.get("", response=list[DocumentOut])
def list_documents(request):
    return Document.objects.filter(case__owner=request.user).order_by("-created_at")


@router.post("", response=DocumentOut)
def create_document(request):
    raise HttpError(400, "Document upload requires a case association and is not available yet.")
