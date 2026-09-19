from pathlib import Path
import py_compile
import sys

ROOT = Path(__file__).resolve().parents[1]

FORBIDDEN = (
    "studio-dev.genlayer.com",
    "61997",
    "wallet_getSnaps",
    "@metamask/snaps",
    "walletconnect",
    "WalletConnect",
)

REQUIRED_NETWORKS = {
    "frontend/.env.example": (
        "NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api",
        "NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999",
        "NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com",
    ),
    "contracts/faultline.py": (
        'NETWORK_ID = "61999"',
        'RPC_URL = "https://studio.genlayer.com/api"',
    ),
}

TEXT_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".jsx", ".json", ".yaml", ".yml", ".css"}


def main() -> int:
    errors = []
    excluded_dirs = {"node_modules", ".next", ".git", "__pycache__"}
    for path in ROOT.rglob("*"):
        if any(part in excluded_dirs for part in path.parts):
            continue
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
            continue
        if path.name == "check_release.py":
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        for needle in FORBIDDEN:
            if needle in text:
                errors.append(f"{path.relative_to(ROOT)} contains forbidden token: {needle}")
    for path in [ROOT / "contracts" / "faultline.py", ROOT / "tests" / "direct" / "test_faultline.py"]:
        try:
            py_compile.compile(str(path), doraise=True)
        except Exception as exc:
            errors.append(f"python compile failed for {path.name}: {exc}")
    required = {
        "contracts/faultline.py",
        "frontend/src/app/page.tsx",
        "frontend/src/app/warranties/page.tsx",
        "frontend/src/app/incidents/page.tsx",
        "frontend/src/app/open/page.tsx",
        "docs/ARCHITECTURE.md",
        "docs/LIVE_DEMO.md",
        "AGENT_HANDOFF.md",
    }
    for rel in required:
        if not (ROOT / rel).exists():
            errors.append(f"missing required file: {rel}")
    for rel, needles in REQUIRED_NETWORKS.items():
        path = ROOT / rel
        if not path.is_file():
            errors.append(f"missing network configuration file: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                errors.append(f"{rel} does not pin required Studionet setting: {needle}")
    if errors:
        print("FAULTLINE_RELEASE_CHECK=FAIL")
        for err in errors:
            print("-", err)
        return 1
    print("FAULTLINE_RELEASE_CHECK=PASS")
    print("NETWORK=Studionet")
    print("CHAIN_ID=61999")
    print("RPC=https://studio.genlayer.com/api")
    print("CONTRACTS=1")
    return 0


if __name__ == "__main__":
    sys.exit(main())
