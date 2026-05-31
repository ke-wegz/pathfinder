const User = require('../../models/user');

exports.getSettings = async (userId) => {
  // Assuming a privacySettings object in the User model or a separate Privacy model
  const user = await User.findById(userId).select('privacySettings');
  if (!user) throw new Error('User not found');
  return user.privacySettings || { dataSharing: false, emailAlerts: true }; // Default mock
};

exports.updateSettings = async (userId, settingsData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { privacySettings: settingsData },
    { new: true }
  ).select('privacySettings');
  if (!user) throw new Error('User not found');
  return user.privacySettings;
};
