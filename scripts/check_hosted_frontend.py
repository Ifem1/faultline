"""Smoke-check the public Faultline frontend and its shipped public config."""

from __future__ import annotations

import os
import re
import urllib.request
from urllib.parse import urljoin

BASE = os.environ.get("FAULTLINE_FRONTEND_URL", "https://faultline-eight-lemon.vercel.app/").rstrip("/") + "/"
CONTRACT = "0x5756f77aa6De57489132D1dB3e1D84E047559bF1"
RPC = "https://studio.genlayer.com/api"
EXPLORER = "https://explorer-studio.genlayer.com"
ROUTES = ("", "warranties", "incidents", "open", "account", "protocol")


def fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "Faultline-CI/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise AssertionError(f"{url} returned HTTP {response.status}")
        return response.read().decode("utf-8", "replace")


def main() -> None:
    pages: list[str] = []
    script_urls: set[str] = set()

    for route in ROUTES:
        url = urljoin(BASE, route)
        body = fetch(url)
        if "faultline" not in body.lower():
            raise AssertionError(f"{url} did not render Faultline content")
        pages.append(body)
        for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', body, re.I):
            if "/_next/" in src and src.endswith(".js"):
                script_urls.add(urljoin(BASE, src))

    bundles = [fetch(url) for url in sorted(script_urls)]
    shipped = "\n".join(pages + bundles).lower()

    required = {
        "canonical contract": CONTRACT.lower(),
        "Studionet RPC": RPC.lower(),
        "Studionet explorer": EXPLORER.lower(),
        "chain id": "61999",
    }
    for label, needle in required.items():
        if needle not in shipped:
            raise AssertionError(f"Public bundle is missing {label}: {needle}")

    print(f"frontend={BASE}")
    print(f"routes_ok={len(ROUTES)}")
    print(f"next_chunks_checked={len(script_urls)}")
    print(f"canonical_contract={CONTRACT}")
    print(f"rpc={RPC}")
    print("chain_id=61999")


if __name__ == "__main__":
    main()
