const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/goals', require('./modules/goals/goal.routes'));
app.use('/api/interview', require('./modules/interview/interview.routes'));
app.use('/api/recommendations', require('./modules/recommendations/recommendation.routes'));
app.use('/api/resources', require('./modules/resources/resource.routes'));
app.use('/api/community', require('./modules/community/community.routes'));
app.use('/api/notifications', require('./modules/notifications/notification.routes'));
app.use('/api/feedback', require('./modules/feedback/feedback.routes'));
app.use('/api/privacy', require('./modules/privacy/privacy.routes'));
app.use('/api/cv', require('./modules/cv/cv.routes'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

const startDeadlineWorker = require('./workers/deadlineWorker');

// Error handling middleware (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start background workers
  startDeadlineWorker();
});
