# Onboarding Backend - Go Server

This is the Go backend for the onboarding app with email link authentication and feedback management.

## Features

- **Email Link Authentication (Magic Links)**
  - Secure random token generation
  - Time-limited links (15 minutes)
  - Single-use tokens
  - Rate limiting (5 requests per hour per email)
  - JWT token generation for API access
  - **✅ SMTP Email Sending** (Gmail, SendGrid, Mailgun, AWS SES)
  - Beautiful HTML email templates

- **Feedback Management**
  - Store user feedback
  - Associate feedback with authenticated users
  - Mock Slack integration for feedback notifications

- **Security**
  - JWT authentication
  - Rate limiting
  - CORS configuration
  - Secure token generation

## Getting Started

### Prerequisites

- Go 1.22 or higher
- Make (optional, for running commands)

### Installation

1. Initialize Go modules:
```bash
cd backend
go mod download
```

### Running the Server

**Without Email (Development Mode)**
```bash
# Magic links will be printed to console only
go run main.go
```

**With Email Configuration**
```bash
# Option 1: Use the start script
./start-with-email.sh

# Option 2: Set environment variables manually
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export FROM_EMAIL=your-email@gmail.com
export FROM_NAME="Onboarding App"

go run main.go
```

📧 **See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed email configuration instructions**

The server will start on port 8080 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=3000 go run main.go
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication

#### Request Magic Link
```
POST /api/auth/request-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "Magic link sent to your email",
  "magic_link": "onboardingapp://auth/verify?token=TOKEN",
  "token": "TOKEN"
}
```

#### Verify Magic Link
```
GET /api/auth/verify?token=TOKEN
```

Response:
```json
{
  "token": "JWT_TOKEN",
  "user_id": "USER_ID",
  "email": "user@example.com",
  "is_new_user": true
}
```

#### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer JWT_TOKEN
```

### Feedback (Requires Authentication)

#### Submit Feedback
```
POST /api/feedback/submit
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "content": "This is my feedback",
  "platform": "ios"
}
```

Response:
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback_id": "FEEDBACK_ID"
}
```

#### List User Feedback
```
GET /api/feedback/list
Authorization: Bearer JWT_TOKEN
```

## Architecture

### EmailService**: Sends magic link emails via SMTP (Gmail, SendGrid, etc.)
- **FeedbackService**: Manages feedback storage and retrieval
- **MockSlackService**: Simulates Slack webhook integration for feedback notifications

## Email Configuration

The backend now supports sending actual emails! See [EMAIL_SETUP.md](EMAIL_SETUP.md) for:

- ✅ Gmail setup (recommended for testing)
- ✅ SendGrid setup (recommended for production)
- ✅ Other SMTP providers (Mailgun, AWS SES)
- ✅ Development mode (no email sending)
- ✅ Troubleshooting guide

**Quick Gmail Setup:**
1. Create an App Password at https://myaccount.google.com/apppasswords
2. Set environment variables (see .env.example)
3. **Configure email sending** (see EMAIL_SETUP.md)
2. Change the JWT secret in `auth_service.go` to a secure random value
3. Use environment variables for all secrets
4. Add HTTPS/TLS
5. Configure CORS for specific origins only
6. Implement database persistence (PostgreSQL, MongoDB)
7. Add logging and monitoring
8. Implement proper error handling and retry logic
9. Use a production-ready email service (SendGrid, AWS SES)

Currently uses in-memory storage for simplicity. For production:
- Add a database (PostgreSQL, MongoDB)
- Implement proper persistence
- Add backup and recovery

### Rate Limiting

Email requests are rate-limited to 5 per hour per email address to prevent abuse.

### Security Notes

⚠️ **For Production:**
1. Change the JWT secret in `auth_service.go`
2. Use environment variables for secrets
3. Implement proper email sending service
4. Add HTTPS/TLS
5. Configure CORS for specific origins
6. Implement database persistence
7. Add logging and monitoring
8. Implement proper error handling and retry logic

## Testing

Test the endpoints using curl:

```bash
# Request magic link
curl -X POST http://localhost:8080/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify magic link (use token from above)
curl "http://localhost:8080/api/auth/verify?token=TOKEN"

# Submit feedback (use JWT token from verify)
curl -X POST http://localhost:8080/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"content":"Great app!","platform":"ios"}'
```

## Development

### Project Structure

```
backend/
├── main.go                    # Application entry point
├── go.mod                     # Go module dependencies
├── internal/
│   ├── models/
│   │   └── models.go         # Data models
│   ├── services/
│   │   ├── auth_service.go   # Authentication logic
│   │   ├── feedback_service.go # Feedback management
│   │   └── slack_service.go  # Mock Slack integration
│   └── api/
│       ├── auth_handler.go   # Auth HTTP handlers
│       └── feedback_handler.go # Feedback HTTP handlers
└── README.md
```

## Slack Integration

The mock Slack service logs messages to console. To implement real Slack integration:

1. Create a Slack app and get webhook URL
2. Replace `MockSlackService` with a real implementation
3. Use the Slack webhook API to send messages

Example real implementation:
```go
func (s *RealSlackService) PublishFeedback(feedback *models.Feedback) error {
    payload := map[string]interface{}{
        "text": formatFeedbackMessage(feedback),
    }
    return httpPost(s.webhookURL, payload)
}
```
