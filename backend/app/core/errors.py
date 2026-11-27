"""One error shape for every failure: {"error": <code>, "message": <text>, "requestId": <id>}.

Messages are written for end users; stack traces and internals go to the server log only.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging_config import request_id_var

logger = logging.getLogger(__name__)

_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    413: "payload_too_large",
    422: "validation_error",
    429: "rate_limited",
    503: "service_unavailable",
}


def error_response(status: int, code: str, message: str, headers: dict | None = None, **extra) -> JSONResponse:
    body = {"error": code, "message": message, "requestId": request_id_var.get(), **extra}
    return JSONResponse(status_code=status, content=body, headers=headers)


def _field_message(err: dict) -> str:
    loc = [str(p) for p in err.get("loc", ()) if p not in ("body", "query", "path", "header")]
    field = ".".join(loc)
    msg = err.get("msg", "Invalid value")
    return f"{field}: {msg}" if field else msg


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_error(_: Request, exc: StarletteHTTPException):
        message = exc.detail if isinstance(exc.detail, str) else "Request failed"
        code = _CODES.get(exc.status_code, f"http_{exc.status_code}")
        return error_response(exc.status_code, code, message, headers=getattr(exc, "headers", None))

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        errors = exc.errors()
        details = [{"field": ".".join(str(p) for p in e.get("loc", ())), "message": e.get("msg", "")} for e in errors[:10]]
        message = _field_message(errors[0]) if errors else "Invalid request"
        return error_response(422, "validation_error", message, details=details)

    @app.exception_handler(Exception)
    async def unhandled_error(request: Request, exc: Exception):
        logger.error("Unhandled error on %s %s", request.method, request.url.path, exc_info=exc)
        return error_response(500, "internal_error", "Something went wrong on our side. Please try again.")
