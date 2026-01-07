#!/bin/bash

# 76DollShop Announcement System - Startup Script

echo "======================================================"
echo "Starting 76DollShop Announcement System v2.0"
echo "======================================================"

# Set PYTHONPATH
export PYTHONPATH=.

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Start the server
echo "Starting server on port 8080..."
uv run uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
