"""Direct Mode loader compatibility for Faultline.

Current gltest host-mode imports GenLayer's message module before a contract can
be instantiated, so stdin must already contain an encoded message context.
This patch supplies that context to the upstream loader; it does not alter
contract behavior or assertions.
"""

import os

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


def _allocate_contract_compat(contract_cls, vm, *args, **kwargs):
    """Allocate storage-backed contracts for py-genlayer's current module layout."""
    try:
        from genlayer.py.storage import ROOT_SLOT_ID
        from genlayer.py.storage._internal.generate import ORIGINAL_INIT_ATTR, _storage_build
    except ImportError:
        return loader._faultline_original_allocate_contract(contract_cls, vm, *args, **kwargs)

    td = _storage_build(contract_cls, {})
    slot = vm._storage.get_store_slot(ROOT_SLOT_ID)
    instance = td.get(slot, 0)

    init_cls = getattr(td, "cls", None)
    init = getattr(init_cls, "__init__", None) if init_cls is not None else getattr(contract_cls, "__init__", None)
    if init is not None:
        if hasattr(init, ORIGINAL_INIT_ATTR):
            init = getattr(init, ORIGINAL_INIT_ATTR)
        init(instance, *args, **kwargs)
    return instance


if not hasattr(loader, "_faultline_original_allocate_contract"):
    loader._faultline_original_allocate_contract = loader._allocate_contract
loader._allocate_contract = _allocate_contract_compat


# gltest 0.30 targets the v0.3 `genlayer.message` layout, while the pinned
# Faultline runner exposes message state through `genlayer.gl`. Mirror VM
# cheatcode updates into that loaded message object so vm.sender/value/warp
# remain faithful to real GenVM call context.
from gltest.direct.vm import VMContext

if not hasattr(VMContext, "_faultline_original_refresh"):
    VMContext._faultline_original_refresh = VMContext._refresh_gl_message


def _refresh_faultline_message(self):
    VMContext._faultline_original_refresh(self)
    try:
        from genlayer import gl
        from genlayer.py.types import Address, u256
    except ImportError:
        return

    def address(value):
        if value is None or isinstance(value, Address):
            return value
        if isinstance(value, bytes):
            return Address(value)
        if hasattr(value, "as_bytes"):
            return Address(value.as_bytes)
        return value

    sender = address(self.sender)
    origin = address(self.origin)
    message = getattr(gl, "message", None)
    updates = {
        "sender_address": sender,
        "origin_address": origin,
        "value": u256(self._value),
        "chain_id": u256(self._chain_id),
    }
    if message is not None:
        for key, value in updates.items():
            try:
                setattr(message, key, value)
            except Exception:
                pass
        raw = getattr(message, "raw", None)
        if isinstance(raw, dict):
            raw.update(updates)
            raw["datetime"] = self._datetime

    raw = getattr(gl, "message_raw", None)
    if isinstance(raw, dict):
        raw.update(updates)
        raw["datetime"] = self._datetime


VMContext._refresh_gl_message = _refresh_faultline_message
