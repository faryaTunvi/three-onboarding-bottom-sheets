#!/bin/bash

# Quick start script for backend with email configuration

echo "🚀 Starting Onboarding Backend..."
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📧 Loading email configuration from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Emails will only be logged to console."
    echo "   To send actual emails, create a .env file (see EMAIL_SETUP.md)"
    echo ""
fi

# Display configuration status
if [ -n "$SMTP_USERNAME" ] && [ -n "$SMTP_PASSWORD" ]; then
    echo "✅ Email configured: $SMTP_USERNAME via $SMTP_HOST:$SMTP_PORT"
else
    echo "📋 Running in development mode (no email sending)"
fi

echo ""
echo "🌐 Starting server on port ${PORT:-8080}..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the server
go run main.go
