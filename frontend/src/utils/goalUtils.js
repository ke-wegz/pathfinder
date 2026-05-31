export const normalizeFirestoreTimestamp = (value) => {
  if (!value) return null;
  if (typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
    return new Date(value.seconds * 1000).toISOString();
  }
  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
};

export const normalizeGoal = (goal) => ({
  ...goal,
  createdAt: normalizeFirestoreTimestamp(goal.createdAt),
  deadline: normalizeFirestoreTimestamp(goal.deadline),
  updatedAt: normalizeFirestoreTimestamp(goal.updatedAt),
  completed: Boolean(goal.completed),
  progress: typeof goal.progress === 'number' ? goal.progress : 0,
});

export const normalizeGoals = (goals) => {
  if (!Array.isArray(goals)) return [];
  return goals.map(normalizeGoal);
};
