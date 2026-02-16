package services

import (
	"fmt"
	"log"
	"time"

	"onboarding-backend/internal/models"
)

// SlackService is the interface for Slack integration
type SlackService interface {
	PublishFeedback(feedback *models.Feedback) error
}

// MockSlackService is a mock implementation of Slack integration
type MockSlackService struct {
	messages []SlackMessage
}

// SlackMessage represents a message sent to Slack
type SlackMessage struct {
	Channel   string    `json:"channel"`
	Text      string    `json:"text"`
	Timestamp time.Time `json:"timestamp"`
}

// NewMockSlackService creates a new mock Slack service
func NewMockSlackService() *MockSlackService {
	return &MockSlackService{
		messages: make([]SlackMessage, 0),
	}
}

// PublishFeedback publishes feedback to Slack (mocked)
func (s *MockSlackService) PublishFeedback(feedback *models.Feedback) error {
	// Format the message
	text := fmt.Sprintf(
		"📝 *New Feedback Received*\n"+
			"👤 User: %s\n"+
			"📧 Email: %s\n"+
			"📱 Platform: %s\n"+
			"💬 Feedback: %s\n"+
			"🕒 Time: %s",
		feedback.UserID,
		feedback.Email,
		feedback.Platform,
		feedback.Content,
		feedback.CreatedAt.Format(time.RFC3339),
	)

	message := SlackMessage{
		Channel:   "#feedback",
		Text:      text,
		Timestamp: time.Now(),
	}

	// Store the message (simulating sending)
	s.messages = append(s.messages, message)

	// Log the message (simulating Slack webhook)
	log.Printf("📤 [MOCK SLACK] Message sent to %s:\n%s\n", message.Channel, message.Text)

	return nil
}

// GetMessages returns all mock messages (for testing/debugging)
func (s *MockSlackService) GetMessages() []SlackMessage {
	return s.messages
}
