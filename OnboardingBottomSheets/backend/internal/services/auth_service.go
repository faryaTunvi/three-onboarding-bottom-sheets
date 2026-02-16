package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"sync"
	"time"

	"onboarding-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/time/rate"
)

var (
	// JWT secret - In production, use environment variable
	jwtSecret = []byte("your-secret-key-change-in-production")

	ErrInvalidToken      = errors.New("invalid or expired token")
	ErrTokenAlreadyUsed  = errors.New("token has already been used")
	ErrRateLimitExceeded = errors.New("rate limit exceeded")
)

// AuthService handles authentication logic
type AuthService struct {
	users        map[string]*models.User      // email -> user
	magicLinks   map[string]*models.MagicLink // token -> link
	rateLimiter  map[string]*rate.Limiter     // email -> limiter
	emailService *EmailService
	mu           sync.RWMutex
}

// NewAuthService creates a new auth service
func NewAuthService(emailService *EmailService) *AuthService {
	return &AuthService{
		users:        make(map[string]*models.User),
		magicLinks:   make(map[string]*models.MagicLink),
		rateLimiter:  make(map[string]*rate.Limiter),
		emailService: emailService,
	}
}

// getRateLimiter returns rate limiter for an email (5 requests per hour)
func (s *AuthService) getRateLimiter(email string) *rate.Limiter {
	s.mu.Lock()
	defer s.mu.Unlock()

	limiter, exists := s.rateLimiter[email]
	if !exists {
		limiter = rate.NewLimiter(rate.Every(12*time.Minute), 5) // 5 per hour
		s.rateLimiter[email] = limiter
	}
	return limiter
}

// GenerateMagicLink creates a magic link for email authentication
func (s *AuthService) GenerateMagicLink(email string) (string, error) {
	// Rate limiting
	limiter := s.getRateLimiter(email)
	if !limiter.Allow() {
		return "", ErrRateLimitExceeded
	}

	// Generate secure random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(tokenBytes)

	// Create magic link
	link := &models.MagicLink{
		Token:     token,
		Email:     email,
		ExpiresAt: time.Now().Add(15 * time.Minute), // 15 minute expiry
		Used:      false,
		CreatedAt: time.Now(),
	}

	s.mu.Lock()
	s.magicLinks[token] = link
	s.mu.Unlock()

	// Send email with magic link
	magicLink := fmt.Sprintf("onboardingapp://auth/verify?token=%s", token)
	if err := s.emailService.SendMagicLink(email, magicLink, token); err != nil {
		// Log error but don't fail the request (token is still valid for testing)
		fmt.Printf("Warning: Failed to send email to %s: %v\n", email, err)
	}

	return token, nil
}

// VerifyMagicLink verifies a magic link and returns auth token
func (s *AuthService) VerifyMagicLink(token string) (*models.AuthResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	link, exists := s.magicLinks[token]
	if !exists {
		return nil, ErrInvalidToken
	}

	// Check if expired
	if time.Now().After(link.ExpiresAt) {
		delete(s.magicLinks, token)
		return nil, ErrInvalidToken
	}

	// Check if already used
	if link.Used {
		return nil, ErrTokenAlreadyUsed
	}

	// Mark as used
	link.Used = true

	// Get or create user
	user, exists := s.users[link.Email]
	isNewUser := !exists

	if !exists {
		user = &models.User{
			ID:        uuid.New().String(),
			Email:     link.Email,
			CreatedAt: time.Now(),
			IsNewUser: true,
		}
		s.users[link.Email] = user
	}

	// Generate JWT token
	jwtToken, err := s.GenerateJWT(user.ID, user.Email)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		Token:     jwtToken,
		UserID:    user.ID,
		Email:     user.Email,
		IsNewUser: isNewUser,
	}, nil
}

// GenerateJWT creates a JWT token for a user
func (s *AuthService) GenerateJWT(userID, email string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(30 * 24 * time.Hour).Unix(), // 30 days
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateJWT validates a JWT token and returns user info
func (s *AuthService) ValidateJWT(tokenString string) (string, string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return "", "", ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", ErrInvalidToken
	}

	userID, _ := claims["user_id"].(string)
	email, _ := claims["email"].(string)

	return userID, email, nil
}

// GetUserByEmail returns a user by email
func (s *AuthService) GetUserByEmail(email string) (*models.User, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.users[email]
	return user, exists
}
