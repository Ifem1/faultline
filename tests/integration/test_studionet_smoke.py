"""Opt-in Studionet smoke test.

Run only after a real deployment is available:
    FAULTLINE_CONTRACT=0x... gltest tests/integration/test_studionet_smoke.py -v -s --network studionet

The handoff agent should adapt this to the installed gltest release if its fixture API differs.
"""

import os
import pytest


CONTRACT = os.getenv("FAULTLINE_CONTRACT", "")


@pytest.mark.integration
@pytest.mark.skipif(not CONTRACT, reason="FAULTLINE_CONTRACT not configured")
def test_studionet_contract_is_configured():
    assert CONTRACT.startswith("0x") and len(CONTRACT) == 42
