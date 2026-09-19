#!/usr/bin/env bash
set -euo pipefail

echo "Faultline deployment target: GenLayer Studionet / 61999"
genlayer network set studionet
genlayer network info
genlayer deploy --contract contracts/faultline.py
