const { db } = require('../firebase');
const notificationService = require('../modules/notifications/notification.service');

const checkDeadlines = async () => {
  try {
    // Get goals where deadline is set and not notified yet, and not completed
    const snapshot = await db.collection('goals')
      .where('completed', '==', false)
      .where('deadlineNotified', '==', false)
      .get();

    if (snapshot.empty) return;

    const now = new Date();
    const msIn24Hours = 24 * 60 * 60 * 1000;

    const batch = db.batch();
    let notificationsSent = 0;

    for (const doc of snapshot.docs) {
      const goal = doc.data();
      if (!goal.deadline) continue;

      const deadlineDate = new Date(goal.deadline);
      const timeDiff = deadlineDate.getTime() - now.getTime();

      // If the deadline is within the next 24 hours (and hasn't passed more than 24 hours ago)
      if (timeDiff > -msIn24Hours && timeDiff <= msIn24Hours) {
        await notificationService.createNotification(
          goal.userId,
          'Goal Deadline Approaching',
          `Your goal "${goal.text}" is due soon!`,
          'goal',
          doc.id
        );

        // Mark as notified so we don't spam them
        batch.update(doc.ref, { deadlineNotified: true });
        notificationsSent++;
      }
    }

    if (notificationsSent > 0) {
      await batch.commit();
      console.log(`[DeadlineWorker] Sent ${notificationsSent} deadline notifications.`);
    }

  } catch (error) {
    console.error('[DeadlineWorker] Error checking deadlines:', error);
  }
};

const startDeadlineWorker = () => {
  // Run once on startup
  checkDeadlines();
  
  // Run every 1 hour (3600000 ms)
  setInterval(checkDeadlines, 60 * 60 * 1000);
  console.log('[DeadlineWorker] Started running every 1 hour.');
};

module.exports = startDeadlineWorker;
