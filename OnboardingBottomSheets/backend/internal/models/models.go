package models

import "time"

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	IsNewUser bool      `json:"is_new_user"`
}

// MagicLink represents a magic link for authentication
type MagicLink struct {
	Token     string    `json:"token"`
	Email     string    `json:"email"`
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `json:"used"`
	CreatedAt time.Time `json:"created_at"`
}

// Feedback represents user feedback
type Feedback struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	Content   string    `json:"content"`
	Platform  string    `json:"platform"`
	CreatedAt time.Time `json:"created_at"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	Token     string `json:"token"`
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	IsNewUser bool   `json:"is_new_user"`
}

// RequestMagicLinkRequest represents the request body for magic link
type RequestMagicLinkRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// SubmitFeedbackRequest represents the request body for feedback submission
type SubmitFeedbackRequest struct {
	Content  string `json:"content" binding:"required"`
	Platform string `json:"platform"`
}
