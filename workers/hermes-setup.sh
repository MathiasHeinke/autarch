#!/bin/bash
# Hermes Agent Setup Script for Autarch Workers
# Run this on the target machine (VPS / Cloud Run container)

set -e

echo "🤖 Installing Hermes Agent..."
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

echo "⚙️ Reloading shell..."
source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null

echo "✅ Hermes Agent installed successfully"
echo ""
echo "Next steps:"
echo "  hermes model    # Configure LLM provider"
echo "  hermes tools    # Enable tools (web, file, code)"
echo "  hermes config   # Set configuration values"
