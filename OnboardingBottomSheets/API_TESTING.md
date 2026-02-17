# API Testing Examples

This file contains curl commands and examples for testing the backend API.

## Base URL

```bash
export BASE_URL="http://localhost:8080"
```

For device testing, replace with your local IP:
```bash
export BASE_URL="http://192.168.1.100:8080"
```

---

## Authentication Endpoints

### 1. Request Magic Link

Request a magic link for email authentication.

```bash
curl -X POST $BASE_URL/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Response:**
```json
{
  "message": "Magic link sent to your email",
  "magic_link": "onboardingapp://auth/verify?token=abc123...",
  "token": "abc123..."
}
```

**Notes:**
- Rate limited to 5 requests per hour per email
- Token expires in 15 minutes
- Single use only

---

### 2. Verify Magic Link

Verify the magic link token and get JWT.

```bash
# First, get the token from the previous request
export TOKEN="abc123..."

curl -X GET "$BASE_URL/api/auth/verify?token=$TOKEN"
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "is_new_user": true
}
```

**Notes:**
- Returns JWT token for subsequent API calls
- Token expires after 30 days
- `is_new_user` indicates if this is first login

---

### 3. Refresh Token

Refresh an existing JWT token.

```bash
# Store your JWT token
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST $BASE_URL/api/auth/refresh \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com"
}
```

---

## Feedback Endpoints (Require Authentication)

### 4. Submit Feedback

Submit user feedback. Requires authentication.

```bash
curl -X POST $BASE_URL/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "content": "The app is great! I love the smooth animations.",
    "platform": "ios"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Notes:**
- Feedback is stored in backend
- Slack notification is sent (mocked)
- Check backend logs for Slack message

---

### 5. List User Feedback

Get all feedback submitted by the authenticated user.

```bash
curl -X GET $BASE_URL/api/feedback/list \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "feedback": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "test@example.com",
      "content": "The app is great!",
      "platform": "ios",
      "created_at": "2026-02-16T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

## Health Check

Check if the backend is running.

```bash
curl -X GET $BASE_URL/health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## Complete Test Flow

Here's a complete flow from login to feedback submission:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"

echo "=== Step 1: Request Magic Link ==="
RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}')

echo $RESPONSE | jq .

TOKEN=$(echo $RESPONSE | jq -r .token)
echo "Token: $TOKEN"

echo -e "\n=== Step 2: Verify Magic Link ==="
AUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/verify?token=$TOKEN")
echo $AUTH_RESPONSE | jq .

JWT_TOKEN=$(echo $AUTH_RESPONSE | jq -r .token)
USER_ID=$(echo $AUTH_RESPONSE | jq -r .user_id)
echo "JWT Token: $JWT_TOKEN"
echo "User ID: $USER_ID"

echo -e "\n=== Step 3: Submit Feedback ==="
FEEDBACK_RESPONSE=$(curl -s -X POST $BASE_URL/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"content": "Amazing app!", "platform": "ios"}')

echo $FEEDBACK_RESPONSE | jq .

echo -e "\n=== Step 4: List Feedback ==="
curl -s -X GET $BASE_URL/api/feedback/list \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

echo -e "\n=== Test Complete! ==="
```

Save this as `test-api.sh`, make it executable, and run:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid email"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate magic link"
}
```

---

## Testing with Postman

### Import Collection

Create a new Postman collection with these requests:

1. **Request Magic Link**
   - Method: POST
   - URL: `{{base_url}}/api/auth/request-link`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com"
     }
     ```

2. **Verify Magic Link**
   - Method: GET
   - URL: `{{base_url}}/api/auth/verify?token={{token}}`

3. **Submit Feedback**
   - Method: POST
   - URL: `{{base_url}}/api/feedback/submit`
   - Headers:
     - Authorization: Bearer {{jwt_token}}
   - Body (JSON):
     ```json
     {
       "content": "Great app!",
       "platform": "ios"
     }
     ```

### Environment Variables

Set these in Postman:
- `base_url`: `http://localhost:8080`
- `token`: (Set from Step 1 response)
- `jwt_token`: (Set from Step 2 response)

---

## Testing with HTTPie

HTTPie is a user-friendly alternative to curl:

```bash
# Install HTTPie
brew install httpie  # Mac
# or
pip install httpie   # Python

# Request magic link
http POST localhost:8080/api/auth/request-link email=test@example.com

# Verify token
http GET localhost:8080/api/auth/verify token==YOUR_TOKEN

# Submit feedback
http POST localhost:8080/api/feedback/submit \
  Authorization:"Bearer YOUR_JWT" \
  content="Great app!" \
  platform=ios
```

---

## Monitoring Backend Logs

The backend logs important information. Watch them:

```bash
cd backend
go run main.go
```

You'll see:
- Magic link requests
- Token verifications
- Feedback submissions
- Mock Slack messages (formatted nicely)

Example Slack mock output:
```
📤 [MOCK SLACK] Message sent to #feedback:
📝 *New Feedback Received*
👤 User: 550e8400-e29b-41d4-a716-446655440000
📧 Email: test@example.com
📱 Platform: ios
💬 Feedback: Great app!
🕒 Time: 2026-02-16T10:30:00Z
```

---

## Rate Limiting Testing

Test the rate limiter by making multiple requests:

```bash
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST $BASE_URL/api/auth/request-link \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com"}'
  echo -e "\n"
  sleep 1
done
```

The 6th request should fail with a 429 error.

---

## Notes

- All timestamps are in UTC
- Tokens are cryptographically secure random strings
- JWT tokens use HS256 signing
- Feedback IDs are UUIDs
- Platform can be: `ios`, `android`, or any string
