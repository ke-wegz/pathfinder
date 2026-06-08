import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import api from '../services/api';
import { normalizeGoals } from '../utils/goalUtils';
import i18n, { normalizeLanguage } from '../i18n';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
        });

        try {
          const profileRes = await api.get('/users/profile');
          if (profileRes.data && profileRes.data.data) {
            const userData = profileRes.data.data;
            const profileLanguage = normalizeLanguage(userData.language || 'en');

            setProfile({
              name: userData.name || '',
              email: userData.email || '',
              role: userData.role || 'standard',
              phone: userData.phone || '',
              location: userData.location || '',
              education: Array.isArray(userData.education)
                ? userData.education.join(', ')
                : userData.education || '',
              skills: userData.skills || [],
              interests: userData.interests || [],
              careerGoals: userData.careerGoals || [],
              experience: userData.experience || '',
              language: profileLanguage,
              timezone: userData.timezone || 'Pacific Time (PT)',
              privacySettings: userData.privacySettings || {},
              notificationSettings: userData.notificationSettings || {}
            });
          }

          const goalsRes = await api.get('/goals');
          setGoals(normalizeGoals(goalsRes.data.data || []));

          const notifsRes = await api.get('/notifications');
          const notifs = notifsRes.data.data || [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.isRead).length);

          const recsRes = await api.get('/recommendations');
          if (recsRes.data.data && Array.isArray(recsRes.data.data) && recsRes.data.data.length > 0) {
            const latestDoc = recsRes.data.data[0];
            setRecommendations(latestDoc.recommendations || latestDoc);
          } else if (recsRes.data.data?.recommendations) {
            setRecommendations(recsRes.data.data.recommendations);
          } else if (recsRes.data.data) {
            setRecommendations(recsRes.data.data);
          }
        } catch (error) {
          console.error('Error fetching user data from backend:', error);
        }
      } else {
        setUser(null);
        setProfile({});
        setGoals([]);
        setNotifications([]);
        setUnreadCount(0);
        setRecommendations(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (profile?.language) {
      const normalized = normalizeLanguage(profile.language);
      if (i18n.language !== normalized) {
        i18n.changeLanguage(normalized);
      }
    }
  }, [profile?.language]);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await userCredential.user.getIdToken(true);
    await api.post('/users/register', { name, email });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateRecommendations = (newRecs) => {
    setRecommendations(newRecs);
  };

  const setUnreadCountFromNotifications = (notifs) => {
    const list = Array.isArray(notifs) ? notifs : [];
    setUnreadCount(list.filter((n) => !(n.isRead ?? n.read)).length);
  };

  const refreshNotifications = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const notifsRes = await api.get('/notifications');
      const notifs = notifsRes.data.data || [];
      setNotifications(notifs);
      setUnreadCountFromNotifications(notifs);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const value = {
    user,
    profile,
    setProfile,
    goals,
    setGoals,
    notifications,
    unreadCount,
    setUnreadCount,
    setUnreadCountFromNotifications,
    refreshNotifications,
    recommendations,
    setRecommendations: updateRecommendations,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
