"""Logging with a per-request id attached to every record."""

import logging
from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

_FORMAT = "%(asctime)s %(levelname)s [%(request_id)s] %(name)s: %(message)s"


def setup_logging(level: str = "INFO") -> None:
    previous_factory = logging.getLogRecordFactory()

    def factory(*args, **kwargs):
        record = previous_factory(*args, **kwargs)
        record.request_id = request_id_var.get()
        return record

    logging.setLogRecordFactory(factory)
    logging.basicConfig(level=level.upper(), format=_FORMAT)
    logging.getLogger().setLevel(level.upper())
