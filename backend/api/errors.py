import asyncio
import logging
from concurrent.futures import TimeoutError as FuturesTimeoutError


logger = logging.getLogger("django.request")


class RelayAPIError(Exception):
    def __init__(self, status_code: int, detail: str, code: str, retryable: bool):
        self.status_code = status_code
        self.detail = detail
        self.code = code
        self.retryable = retryable
        super().__init__(detail)


def _exception_chain(exc: Exception):
    current = exc
    seen = set()
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        yield current
        current = current.__cause__ or current.__context__


def is_provider_failure(exc: Exception) -> bool:
    provider_statuses = {408, 429, 502, 503, 504}
    provider_names = {
        "ClientError",
        "ServerError",
        "ResourceExhausted",
        "ServiceUnavailable",
        "DeadlineExceeded",
        "ConnectError",
        "ReadTimeout",
        "WriteTimeout",
        "PoolTimeout",
    }
    provider_markers = (
        "resource_exhausted",
        "quota exceeded",
        "rate limit",
        "temporarily unavailable",
        "service unavailable",
        "timed out",
        "timeout",
        "connection reset",
        "gemini_api_key is not configured",
    )

    for candidate in _exception_chain(exc):
        status = getattr(candidate, "status_code", None) or getattr(candidate, "code", None)
        if status in provider_statuses:
            return True
        if isinstance(candidate, (TimeoutError, FuturesTimeoutError, asyncio.TimeoutError)):
            return True
        if type(candidate).__name__ in provider_names:
            message = str(candidate).lower()
            if any(marker in message for marker in provider_markers) or type(candidate).__name__ != "ClientError":
                return True
        message = str(candidate).lower()
        if any(marker in message for marker in provider_markers):
            return True
    return False


def provider_api_error(exc: Exception) -> RelayAPIError | None:
    if not is_provider_failure(exc):
        return None
    return RelayAPIError(
        status_code=503,
        detail="RELAY AI service is temporarily unavailable. Please retry.",
        code="AI_PROVIDER_UNAVAILABLE",
        retryable=True,
    )