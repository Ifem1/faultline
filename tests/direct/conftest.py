"""Compatibility helpers for Faultline Direct Mode tests.

The old gltest 0.29.2 Windows loader needed a stdin pipe workaround. Current
Linux/macOS runners must use the upstream loader unchanged; only Windows keeps
this narrowly-scoped compatibility patch.
"""

import os

if os.name == "nt":
    from gltest.direct import loader

    def _inject_message_to_fd0(vm):
        try:
            from genlayer.py import calldata
            from genlayer.py.types import Address
        except ImportError:
            return

        def address(value):
            return Address(value) if isinstance(value, bytes) else value

        message_data = {
            "contract_address": address(vm._contract_address),
            "sender_address": address(vm.sender),
            "origin_address": address(vm.origin),
            "stack": [],
            "value": vm._value,
            "datetime": vm._datetime,
            "is_init": False,
            "chain_id": vm._chain_id,
            "entry_kind": 0,
            "entry_data": b"",
            "entry_stage_data": None,
        }
        encoded = calldata.encode(message_data)
        read_fd, write_fd = os.pipe()
        try:
            os.write(write_fd, encoded)
        finally:
            os.close(write_fd)

        vm._original_stdin_fd = os.dup(0)
        try:
            os.dup2(read_fd, 0)
        finally:
            os.close(read_fd)

    loader._inject_message_to_fd0 = _inject_message_to_fd0
