package services

import (
	"sync"
	"time"

	"onboarding-backend/internal/models"

	"github.com/google/uuid"
)

// FeedbackService handles feedback storage
type FeedbackService struct {
	feedback map[string]*models.Feedback // feedbackID -> feedback
	mu       sync.RWMutex
}

// NewFeedbackService creates a new feedback service
func NewFeedbackService() *FeedbackService {
	return &FeedbackService{
		feedback: make(map[string]*models.Feedback),
	}
}

// StoreFeedback stores user feedback
func (s *FeedbackService) StoreFeedback(userID, email, content, platform string) (*models.Feedback, error) {
	feedback := &models.Feedback{
		ID:        uuid.New().String(),
		UserID:    userID,
		Email:     email,
		Content:   content,
		Platform:  platform,
		CreatedAt: time.Now(),
	}

	s.mu.Lock()
	s.feedback[feedback.ID] = feedback
	s.mu.Unlock()

	return feedback, nil
}

// GetFeedbackByUser returns all feedback for a user
func (s *FeedbackService) GetFeedbackByUser(userID string) []*models.Feedback {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []*models.Feedback
	for _, fb := range s.feedback {
		if fb.UserID == userID {
			result = append(result, fb)
		}
	}
	return result
}

// GetAllFeedback returns all feedback
func (s *FeedbackService) GetAllFeedback() []*models.Feedback {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]*models.Feedback, 0, len(s.feedback))
	for _, fb := range s.feedback {
		result = append(result, fb)
	}
	return result
}
