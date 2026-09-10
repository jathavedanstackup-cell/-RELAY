from ninja import NinjaAPI
from ninja.security import django_auth

from .auth import router as auth_router
from .errors import RelayAPIError, logger
from .approvals import router as approvals_router
from .autonomous import router as autonomous_router
from .cases import router as cases_router
from .connections import router as connections_router
from .documents import router as documents_router
from .execution import router as execution_router
from .planning import router as planning_router
from .recovery import router as recovery_router
from .verification import router as verification_router


api = NinjaAPI(
    title="RELAY API",
    version="1.0.0",
    description="Backend API for the RELAY autonomous life-administration platform.",
    urls_namespace="relay_api",
)


@api.exception_handler(RelayAPIError)
def relay_error_handler(request, exc: RelayAPIError):
    return api.create_response(
        request,
        {
            "detail": exc.detail,
            "code": exc.code,
            "retryable": exc.retryable,
        },
        status=exc.status_code,
    )


@api.exception_handler(Exception)
def unexpected_error_handler(request, exc: Exception):
    logger.exception("Unhandled RELAY API error", exc_info=exc)
    return api.create_response(
        request,
        {
            "detail": "RELAY could not complete the request.",
            "code": "INTERNAL_ERROR",
            "retryable": False,
        },
        status=500,
    )


@api.get("/health", tags=["system"])
def health(request):
    return {
        "status": "ok",
        "service": "relay-backend",
    }


api.add_router("/cases", cases_router, auth=django_auth)
api.add_router("/auth", auth_router)
api.add_router("/cases", planning_router, auth=django_auth)
api.add_router("/cases", execution_router, auth=django_auth)
api.add_router("/cases", verification_router, auth=django_auth)
api.add_router("/cases", approvals_router, auth=django_auth)
api.add_router("/cases", recovery_router, auth=django_auth)
api.add_router("/cases", autonomous_router, auth=django_auth)
api.add_router("/documents", documents_router, auth=django_auth)
api.add_router("/connections", connections_router, auth=django_auth)
