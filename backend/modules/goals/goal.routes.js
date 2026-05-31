const express = require('express');
const router = express.Router();
const goalController = require('./goal.controller');
const { protect } = require('../../middleware/authenticate');
// const validate = require('../../middleware/validate');
// const { goalSchema } = require('../../schemas/goal.schema');

router.use(protect); // All goal routes require authentication

router.route('/')
  .get(goalController.getGoals)
  .post(goalController.createGoal); // Add validate(goalSchema) when ready

router.route('/:id')
  .get(goalController.getGoal)
  .put(goalController.updateGoal)
  .delete(goalController.deleteGoal);

router.patch('/:id/progress', goalController.updateProgress);

module.exports = router;
