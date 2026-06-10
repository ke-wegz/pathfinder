import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './translations/en.full';
import arTranslations from './translations/ar.full';

export const normalizeLanguage = (value) => {
  const language = String(value || '').trim().toLowerCase();

  if (language.startsWith('ar')) {
    return 'ar';
  }

  return 'en';
};

const common = {
  save: 'Save',
  saveChanges: 'Save changes',
  saving: 'Saving...',
  cancel: 'Cancel',
  loading: 'Loading...',
  error: 'Something went wrong.',
  success: 'Saved successfully.',
};

const navigation = {
  home: 'Home',
  dashboard: 'Dashboard',
  careerPaths: 'Career paths',
  community: 'Community',
  cvBuilder: 'CV Builder',
  interview: 'Interview prep',
  recommendations: 'Recommendations',
  settings: 'Settings',
  profile: 'Profile',
  login: 'Log in',
  signup: 'Sign up',
  logout: 'Log out',
};

const sidebar = {
  ...navigation,
};

const nav = {
  ...navigation,
};

const settings = {
  title: 'Settings',
  description: 'Manage your account preferences.',
  dashboardBreadcrumb: 'Dashboard',
  accountTitle: 'Account Settings',
  accountDescription: 'Manage your profile preferences, language, and security settings.',
  saveSettings: 'Save Settings',
  themePreference: 'Theme Preference',
  light: 'Light',
  dark: 'Dark',
  emailAddress: 'Email Address',
  timezone: 'Timezone',
  privacyTitle: 'Privacy Settings',
  privacyDescription: 'Control how your profile and data are shared across the app.',
  profileVisibility: 'Profile Visibility',
  profileVisibilityDescription: 'Allow others to see your profile and progress.',
  showLocation: 'Show Location',
  showLocationDescription: 'Allow other users to see your location.',
  showEducation: 'Show Education',
  showEducationDescription: 'Allow other users to see your education.',
  showExperience: 'Show Experience',
  showExperienceDescription: 'Allow other users to see your work experience.',
  showSkills: 'Show Skills',
  showSkillsDescription: 'Allow other users to see your skills.',
  showInterests: 'Show Interests',
  showInterestsDescription: 'Allow other users to see your interests.',
  showEmail: 'Show Email',
  showEmailDescription: 'Allow other users to see your email address.',
  showPhone: 'Show Phone',
  showPhoneDescription: 'Allow other users to see your phone number.',
  dataCollection: 'Data Collection',
  dataCollectionDescription: 'Allow anonymous usage data to help improve the product.',
  shareProgress: 'Share Progress',
  shareProgressDescription: 'Share your achievements with the community.',
  privacyNoticeTitle: 'Your data is safe',
  privacyNoticeBody: 'We encrypt your data and never share it without your explicit consent.',
  notificationsTitle: 'Notification Settings',
  emailNotifications: 'Email Notifications',
  emailNotificationsDescription: 'Receive updates, reminders, and important account alerts.',
  goalReminders: 'Goal Reminders',
  goalRemindersDescription: 'Get reminders to help keep your career goals on track.',
  communityActivity: 'Community Activity',
  communityActivityDescription: 'Receive alerts when people comment or engage with your posts.',
  marketingCommunications: 'Marketing Communications',
  marketingCommunicationsDescription: 'Receive occasional product news and helpful emails.',
  securityTitle: 'Security',
  changePassword: 'Change Password',
  lastChanged: 'Last updated on {{date}}',
  never: 'Never',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmNewPassword: 'Confirm New Password',
  updating: 'Updating...',
  updatePassword: 'Update Password',
  dataManagementTitle: 'Data Management',
  downloadYourData: 'Download Your Data',
  downloadDataDescription: 'Export your saved settings and profile data as a JSON file.',
  download: 'Download',
  downloadFilenamePrefix: 'pathfinder-data-',
  resetAllData: 'Reset All Data',
  resetAllDataDescription: 'Clear local data and reset your account-specific progress.',
  typeResetConfirm: 'Type RESET to confirm.',
  resetting: 'Resetting...',
  confirmReset: 'Confirm Reset',
  deleteAccount: 'Delete Account',
  deleteAccountDescription: 'Permanently delete your account and all associated data.',
  typeDeleteConfirm: 'Type DELETE to confirm.',
  permanentlyDelete: 'Delete Permanently',
  deleting: 'Deleting...',
  passwordMatchError: 'New passwords do not match.',
  passwordLengthError: 'Password must be at least 6 characters.',
  passwordUpdated: 'Password updated successfully.',
  passwordUpdateFailed: 'Unable to update password. Please try again.',
  resetSuccess: 'All data has been reset.',
  resetError: 'Unable to reset data. Please try again.',
  deleteAccountFailed: 'Unable to delete account. Please try again.',
  language: 'Language',
  languageDescription: 'Choose the language used throughout the app and for AI responses.',
  save: 'Save changes',
  saving: 'Saving...',
  saved: 'Your language preference has been updated.',
  settingsSaved: 'All settings were saved.',
  saveError: 'We could not save your settings. Please try again.',
  sectionAccount: 'Account',
  sectionPrivacy: 'Privacy',
  sectionNotifications: 'Notifications',
  sectionSecurity: 'Security',
  sectionData: 'Data',
  english: 'English',
  arabic: 'Arabic',
  languages: {
    english: 'English',
    arabic: 'Arabic',
  },
};

const ai = {
  language: 'AI language',
  languageDescription: 'Select the language used for AI-generated responses.',
  english: 'English',
  arabic: 'Arabic',
  languageHint: 'AI responses use en for English and ar for Arabic.',
};

/** Deep-merge settings so inline overrides do not wipe keys from *.full.js bundles. */
const mergeSettings = (bundleSettings = {}, inlineSettings = {}) => ({
  ...bundleSettings,
  ...inlineSettings,
  settingsSaved: inlineSettings.settingsSaved ?? bundleSettings.settingsSaved,
  languages: {
    ...bundleSettings.languages,
    ...inlineSettings.languages,
  },
  timezones: {
    ...bundleSettings.timezones,
    ...inlineSettings.timezones,
  },
});

const settingsEn = mergeSettings(enTranslations.translation.settings, {
  ...settings,
  settingsSaved: 'All settings were saved.',
});

const settingsAr = mergeSettings(arTranslations.translation.settings, {
  title: 'الإعدادات',
  description: 'إدارة تفضيلات حسابك.',
  dashboardBreadcrumb: 'لوحة التحكم',
  accountTitle: 'إعدادات الحساب',
  accountDescription: 'إدارة تفضيلات ملفك الشخصي واللغة والأمان.',
  saveSettings: 'حفظ الإعدادات',
  themePreference: 'تفضيل الوضع',
  light: 'فاتح',
  dark: 'داكن',
  emailAddress: 'البريد الإلكتروني',
  timezone: 'المنطقة الزمنية',
  privacyTitle: 'إعدادات الخصوصية',
  privacyDescription: 'تحكم في كيفية مشاركة ملفك الشخصي وبياناتك داخل التطبيق.',
  profileVisibility: 'إظهار الملف الشخصي',
  profileVisibilityDescription: 'السماح للآخرين برؤية ملفك الشخصي وتقدمك.',
  showLocation: 'إظهار الموقع',
  showLocationDescription: 'السماح للمستخدمين الآخرين برؤية موقعك.',
  showEducation: 'إظهار التعليم',
  showEducationDescription: 'السماح للمستخدمين الآخرين برؤية تعليمك.',
  showExperience: 'إظهار الخبرة',
  showExperienceDescription: 'السماح للمستخدمين الآخرين برؤية خبرتك العملية.',
  showSkills: 'إظهار المهارات',
  showSkillsDescription: 'السماح للمستخدمين الآخرين برؤية مهاراتك.',
  showInterests: 'إظهار الاهتمامات',
  showInterestsDescription: 'السماح للمستخدمين الآخرين برؤية اهتماماتك.',
  showEmail: 'إظهار البريد الإلكتروني',
  showEmailDescription: 'السماح للمستخدمين الآخرين برؤية بريدك الإلكتروني.',
  showPhone: 'إظهار رقم الهاتف',
  showPhoneDescription: 'السماح للمستخدمين الآخرين برؤية رقم هاتفك.',
  dataCollection: 'جمع البيانات',
  dataCollectionDescription: 'السماح بجمع البيانات المجهولة لتحسين المنتج.',
  shareProgress: 'مشاركة التقدم',
  shareProgressDescription: 'مشاركة إنجازاتك مع المجتمع.',
  privacyNoticeTitle: 'بياناتك آمنة',
  privacyNoticeBody: 'نقوم بتشفير بياناتك ولا نشاركها بدون موافقتك الصريحة.',
  notificationsTitle: 'إعدادات الإشعارات',
  emailNotifications: 'إشعارات البريد الإلكتروني',
  emailNotificationsDescription: 'استلم التحديثات والتذكيرات والإشعارات المهمة.',
  goalReminders: 'تذكيرات الأهداف',
  goalRemindersDescription: 'استلم تذكيرات للحفاظ على أهدافك المهنية.',
  communityActivity: 'نشاط المجتمع',
  communityActivityDescription: 'استلم تنبيهات عند تعليق أو تفاعل الآخرين.',
  marketingCommunications: 'التواصل التسويقي',
  marketingCommunicationsDescription: 'استلم رسائل مُفيدة وأخبار المنتج أحيانًا.',
  securityTitle: 'الأمان',
  changePassword: 'تغيير كلمة المرور',
  lastChanged: 'آخر تحديث في {{date}}',
  never: 'أبدًا',
  currentPassword: 'كلمة المرور الحالية',
  newPassword: 'كلمة المرور الجديدة',
  confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
  updating: 'جارٍ التحديث...',
  updatePassword: 'تحديث كلمة المرور',
  dataManagementTitle: 'إدارة البيانات',
  downloadYourData: 'تنزيل بياناتك',
  downloadDataDescription: 'صدر إعداداتك وبيانات ملفك الشخصي كملف JSON.',
  download: 'تنزيل',
  downloadFilenamePrefix: 'بيانات-المسار-',
  resetAllData: 'إعادة تعيين جميع البيانات',
  resetAllDataDescription: 'مسح البيانات المحلية وإعادة تعيين تقدم الحساب.',
  typeResetConfirm: 'اكتب RESET للتأكيد.',
  resetting: 'جارٍ إعادة التعيين...',
  confirmReset: 'تأكيد إعادة التعيين',
  deleteAccount: 'حذف الحساب',
  deleteAccountDescription: 'حذف حسابك وجميع البيانات المرتبطة به نهائيًا.',
  typeDeleteConfirm: 'اكتب DELETE للتأكيد.',
  permanentlyDelete: 'حذف نهائي',
  deleting: 'جارٍ الحذف...',
  passwordMatchError: 'كلمتا المرور الجديدتان غير متطابقتين.',
  passwordLengthError: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.',
  passwordUpdated: 'تم تحديث كلمة المرور بنجاح.',
  passwordUpdateFailed: 'تعذر تحديث كلمة المرور. حاول مرة أخرى.',
  resetSuccess: 'تم إعادة تعيين جميع البيانات.',
  resetError: 'تعذر إعادة تعيين البيانات. حاول مرة أخرى.',
  deleteAccountFailed: 'تعذر حذف الحساب. حاول مرة أخرى.',
  language: 'اللغة',
  languageDescription: 'اختر اللغة المستخدمة في التطبيق وفي ردود الذكاء الاصطناعي.',
  save: 'حفظ التغييرات',
  saving: 'جارٍ الحفظ...',
  saved: 'تم تحديث تفضيل اللغة بنجاح.',
  settingsSaved: 'تم حفظ جميع الإعدادات.',
  saveError: 'تعذر حفظ الإعدادات. حاول مرة أخرى.',
  english: 'الإنجليزية',
  arabic: 'العربية',
  sectionAccount: 'الحساب',
  sectionPrivacy: 'الخصوصية',
  sectionNotifications: 'الإشعارات',
  sectionSecurity: 'الأمان',
  sectionData: 'البيانات',
  languages: {
    english: 'الإنجليزية',
    arabic: 'العربية',
  },
});

const resources = {
  en: {
    translation: {
      ...enTranslations.translation,
      common,
      navigation,
      nav,
      sidebar,
      settings: settingsEn,
      ai,
    },
  },
  ar: {
    translation: {
      ...arTranslations.translation,
      common: {
        save: 'حفظ',
        saveChanges: 'حفظ التغييرات',
        saving: 'جارٍ الحفظ...',
        cancel: 'إلغاء',
        loading: 'جارٍ التحميل...',
        error: 'حدث خطأ ما.',
        success: 'تم الحفظ بنجاح.',
      },
      navigation: {
        home: 'الرئيسية',
        dashboard: 'لوحة التحكم',
        careerPaths: 'المسارات المهنية',
        community: 'المجتمع',
        cvBuilder: 'منشئ السيرة الذاتية',
        interview: 'التحضير للمقابلات',
        recommendations: 'التوصيات',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
        login: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
      },
      nav: {
        home: 'الرئيسية',
        dashboard: 'لوحة التحكم',
        careerPaths: 'المسارات المهنية',
        community: 'المجتمع',
        cvBuilder: 'منشئ السيرة الذاتية',
        interview: 'التحضير للمقابلات',
        recommendations: 'التوصيات',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
        login: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
      },
      sidebar: {
        home: 'الرئيسية',
        dashboard: 'لوحة التحكم',
        careerPaths: 'المسارات المهنية',
        community: 'المجتمع',
        cvBuilder: 'منشئ السيرة الذاتية',
        interview: 'التحضير للمقابلات',
        recommendations: 'التوصيات',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
        login: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
      },
      settings: settingsAr,
      ai: {
        language: 'لغة الذكاء الاصطناعي',
        languageDescription: 'اختر اللغة المستخدمة في الردود التي يولدها الذكاء الاصطناعي.',
        english: 'الإنجليزية',
        arabic: 'العربية',
        languageHint: 'تستخدم الردود en للإنجليزية و ar للعربية.',
      },
    },
  },
};

const updateDocumentLanguage = (lang) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

updateDocumentLanguage('en');
i18n.on('languageChanged', updateDocumentLanguage);

export default i18n;
