package api

import (
	"net/http"

	"onboarding-backend/internal/models"
	"onboarding-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// FeedbackHandler handles feedback endpoints
type FeedbackHandler struct {
	feedbackService *services.FeedbackService
	slackService    services.SlackService
	authService     *services.AuthService
}

// NewFeedbackHandler creates a new feedback handler
func NewFeedbackHandler(
	feedbackService *services.FeedbackService,
	slackService services.SlackService,
	authService *services.AuthService,
) *FeedbackHandler {
	return &FeedbackHandler{
		feedbackService: feedbackService,
		slackService:    slackService,
		authService:     authService,
	}
}

// SubmitFeedback handles feedback submission
func (h *FeedbackHandler) SubmitFeedback(c *gin.Context) {
	var req models.SubmitFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
		return
	}

	// Get user info from context (set by auth middleware)
	userID, _ := c.Get("user_id")
	email, _ := c.Get("email")

	// Store feedback
	feedback, err := h.feedbackService.StoreFeedback(
		userID.(string),
		email.(string),
		req.Content,
		req.Platform,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store feedback"})
		return
	}

	// Publish to Slack (async to not block response)
	go func() {
		if err := h.slackService.PublishFeedback(feedback); err != nil {
			// Log error but don't fail the request
			// In production, implement retry logic
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Feedback submitted successfully",
		"feedback_id": feedback.ID,
	})
}

// ListFeedback returns feedback for the authenticated user
func (h *FeedbackHandler) ListFeedback(c *gin.Context) {
	userID, _ := c.Get("user_id")

	feedback := h.feedbackService.GetFeedbackByUser(userID.(string))

	c.JSON(http.StatusOK, gin.H{
		"feedback": feedback,
		"count":    len(feedback),
	})
}
