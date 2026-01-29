#!/bin/bash

# ChuMail Deployment Automation Script
# Usage: ./commit.sh "your message"

MESSAGE=${1:-"122"}

echo "---[ CHUMAIL_KERNEL_SYNC_STARTING ]---"

# Add all changes
git add .

# Commit with provided message or default 122
git commit -m "$MESSAGE"

# Push to main
git push origin main

echo "---[ SYNC_PROCESS_COMPLETE ]---"
