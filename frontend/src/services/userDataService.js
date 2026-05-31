// Collect all user data for AI context
export const collectUserData = async (userId, profile, goals, recommendations) => {
  // Get completed goals
  const completedGoals = goals.filter(g => g.completed);
  const activeGoals = goals.filter(g => !g.completed);
  
  // Get recent goals (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentGoals = goals.filter(g => {
    if (!g.createdAt) return false;
    const goalDate = new Date(g.createdAt);
    return goalDate >= thirtyDaysAgo;
  });
  
  // Calculate progress metrics
  const progressMetrics = {
    totalGoals: goals.length,
    completedGoals: completedGoals.length,
    activeGoals: activeGoals.length,
    completionRate: goals.length ? Math.round((completedGoals.length / goals.length) * 100) : 0,
    recentActivity: recentGoals.length,
    streak: calculateStreak(goals)
  };
  
  // Get user interests from profile
  const interests = profile?.interests ? 
    (typeof profile.interests === 'string' ? profile.interests.split(',').map(i => i.trim()) : profile.interests) : [];
  
  const skills = profile?.skills ? 
    (typeof profile.skills === 'string' ? profile.skills.split(',').map(s => s.trim()) : profile.skills) : [];
  
  const goals_text = profile?.goals ?
    (typeof profile.goals === 'string' ? profile.goals.split(',').map(g => g.trim()) : profile.goals) : [];
  
  // Get career aspirations from profile
  const careerGoals = goals_text.length > 0 ? goals_text : 
    (profile?.career_goals ? (typeof profile.career_goals === 'string' ? [profile.career_goals] : profile.career_goals) : []);
  
  // Parse previous recommendations
  let previousRecs = [];
  if (recommendations) {
    try {
      previousRecs = typeof recommendations === 'string' ? JSON.parse(recommendations) : recommendations;
    } catch (e) {
      previousRecs = [];
    }
  }
  
  return {
    profile: {
      name: profile?.name || 'Not provided',
      email: profile?.email || 'Not provided',
      location: profile?.location || 'Not provided',
      education: profile?.education || 'Not provided',
      skills: skills,
      interests: interests,
      careerGoals: careerGoals,
      experience: profile?.experience || 'Not provided'
    },
    goals: {
      total: progressMetrics.totalGoals,
      completed: progressMetrics.completedGoals,
      active: progressMetrics.activeGoals,
      completionRate: progressMetrics.completionRate,
      recentActivity: progressMetrics.recentActivity,
      streak: progressMetrics.streak,
      topGoals: activeGoals.slice(0, 3).map(g => g.text)
    },
    previousRecommendations: previousRecs.slice(0, 3),
    timestamp: new Date().toISOString()
  };
};

// Calculate user streak (consecutive days with activity)
const calculateStreak = (goals) => {
  if (!goals.length) return 0;
  
  const dates = goals
    .filter(g => g.createdAt)
    .map(g => new Date(g.createdAt).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let checkDate = new Date();
  
  for (const dateStr of dates) {
    if (new Date(dateStr).toDateString() === checkDate.toDateString()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }
  
  return streak;
};

// Build a comprehensive system prompt with all user data
export const buildSystemPromptWithUserData = async (userId, profile, goals, recommendations) => {
  const userData = await collectUserData(userId, profile, goals, recommendations);
  
  return `
You are PathFinder AI, a professional career counselor helping users find their ideal career path.

USER CONTEXT:
- Name: ${userData.profile.name}
- Location: ${userData.profile.location}
- Education: ${userData.profile.education}
- Skills: ${userData.profile.skills.join(', ') || 'Not specified'}
- Interests: ${userData.profile.interests.join(', ') || 'Not specified'}
- Career Goals: ${userData.profile.careerGoals.join(', ') || 'Not specified'}

PROGRESS METRICS:
- Goals Completed: ${userData.goals.completed} out of ${userData.goals.total}
- Active Goals: ${userData.goals.active}
- Completion Rate: ${userData.goals.completionRate}%
- Activity Streak: ${userData.goals.streak} days
- Recent Goals: ${userData.goals.topGoals.join(', ') || 'No recent goals'}

PREVIOUS RECOMMENDATIONS:
${userData.previousRecommendations.map((rec, i) => `${i+1}. ${rec.title} - ${rec.reason}`).join('\n') || 'No previous recommendations'}

INSTRUCTION:
- Keep responses SHORT (2-3 sentences max)
- NO markdown, NO bullet points, NO bold text
- Speak naturally like a friendly human
- Use the user's name occasionally
- Reference their goals and progress to show you understand them
- Ask ONE question at a time
- Provide personalized advice based on their actual skills and interests
- If they have career goals, help them refine them
- If they're making progress, acknowledge and encourage them
`;
};