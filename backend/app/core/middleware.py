"""Request-id + access logging, last-resort error capture, and security headers."""

import logging
import re
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.errors import error_response
from app.core.logging_config import request_id_var

logger = logging.getLogger("app.access")

_VALID_ID = re.compile(r"^[A-Za-z0-9._-]{8,64}$")
_DOC_PATHS = ("/api/docs", "/api/openapi.json")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Assigns X-Request-ID, logs one line per request, and turns escaped exceptions into a clean 500.

    Sits inside the CORS middleware so even error responses carry CORS headers.
    """

    async def dispatch(self, request: Request, call_next):
        incoming = request.headers.get("x-request-id", "")
        request_id = incoming if _VALID_ID.match(incoming) else uuid.uuid4().hex
        token = request_id_var.set(request_id)
        started = time.perf_counter()
        try:
            try:
                response = await call_next(request)
            except Exception:
                logger.exception("Unhandled error on %s %s", request.method, request.url.path)
                response = error_response(500, "internal_error", "Something went wrong on our side. Please try again.")
            elapsed_ms = int((time.perf_counter() - started) * 1000)
            # Path only: query strings can carry search terms and other user data.
            logger.info("%s %s -> %s (%d ms)", request.method, request.url.path, response.status_code, elapsed_ms)
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            request_id_var.reset(token)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        h = response.headers
        h.setdefault("X-Content-Type-Options", "nosniff")
        h.setdefault("X-Frame-Options", "DENY")
        h.setdefault("Referrer-Policy", "no-referrer")
        h.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
            h.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        if request.url.path not in _DOC_PATHS:  # Swagger UI needs scripts/styles from a CDN
            h.setdefault("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
            h.setdefault("Cache-Control", "no-store")
        return response
