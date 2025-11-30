import React, { useState, useEffect, useRef } from 'react';
import {
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
// ---------------------------------------------------------
// FIX: Import directly from your local firebase.js file
// ---------------------------------------------------------
import { auth, db } from './firebase';

import {
  Compass,
  User,
  MessageSquare,
  Map,
  BookOpen,
  Users,
  Settings,
  Send,
  CheckCircle,
  TrendingUp,
  Award,
  Briefcase,
  Loader,
  Menu,
  X,
  Target
} from 'lucide-react';

// --- Gemini API Helper (LOCAL VERSION) ---
const callGemini = async (prompt, systemInstruction = "") => {
  // FIX: Use your local .env file variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing. Check your .env file.");
    // We return a polite error to the UI instead of crashing
    return "Error: API Key missing. Please check your .env configuration.";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Gemini API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to the AI. Please try again.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I encountered an error analyzing that.";
  }
};

// --- Components ---

const Sidebar = ({ activeView, setActiveView, isMobileOpen, toggleMobile }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass size={20} /> },
    { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
    { id: 'interview', label: 'AI Interview', icon: <MessageSquare size={20} /> },
    { id: 'paths', label: 'Career Paths', icon: <Map size={20} /> },
    { id: 'resources', label: 'Resource Hub', icon: <BookOpen size={20} /> },
    { id: 'community', label: 'Community', icon: <Users size={20} /> },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0
  `;

  return (
    <div className={sidebarClasses}>
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Compass size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">PathFinder AI</span>
        </div>
        <button onClick={toggleMobile} className="md:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); toggleMobile(); }}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${activeView === item.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-6 border-t border-slate-700">
        <div className="flex items-center space-x-3 text-slate-400 text-sm">
          <Settings size={16} />
          <span>v1.0.0 Alpha</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, profile, recommendations, goals }) => {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back, {profile?.name || 'Explorer'}!</h1>
        <p className="text-slate-500 mt-2">Here is your career progression overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Profile Status</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {profile?.interests ? '85%' : '30%'}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${profile?.interests ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              <User size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {profile?.interests ? 'Profile mostly complete' : 'Add more details to get better matches'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Goals</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{goals.filter(g => !g.completed).length}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Target size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {goals.filter(g => g.completed).length} goals completed this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Career Matches</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {recommendations ? JSON.parse(recommendations).length : 0}
              </h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Briefcase size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Based on your AI interview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Your Milestones</h3>
            <button className="text-blue-600 text-sm hover:underline">Add New</button>
          </div>
          <div className="p-6">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Target className="mx-auto mb-2 opacity-50" size={40} />
                <p>No goals set yet.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {goals.slice(0, 4).map((goal, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${goal.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                      {goal.completed && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {goal.text}
                      </p>
                      <span className="text-xs text-slate-400">{goal.deadline || 'Ongoing'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-6">
          <h3 className="font-bold text-lg mb-2">Ready for your AI Interview?</h3>
          <p className="text-blue-100 mb-6 text-sm">
            Our AI interviewer is ready to analyze your skills and suggest the perfect career path.
          </p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-blue-50 transition-colors">
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileForm = ({ user, profile, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    skills: '',
    interests: '',
    goals: '',
    ...profile
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Jane Doe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Academic Background</label>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Degree, University, Major..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Career Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="What do you want to achieve?"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Skills & Technologies</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Python, React, Project Management..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Interests & Hobbies</label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Gaming, Writing, Robotics..."
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center"
          >
            {isSaving ? <Loader className="animate-spin mr-2" size={18} /> : null}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

const AIInterview = ({ user, profile, onRecommendation }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${profile?.name?.split(' ')[0] || 'there'}! I'm your PathFinder AI interviewer. To help find your best career fit, I'll ask you a few questions. Ready to start?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build context
    const conversationHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const systemPrompt = `
      You are PathFinder AI, an expert career counselor. 
      Your goal is to interview the user (User Profile: ${JSON.stringify(profile)}) to determine their ideal career path.
      
      Rules:
      1. Ask ONE concise question at a time.
      2. Be friendly and professional.
      3. Focus on finding their strengths, hidden talents, and work style preferences.
      4. After you have gathered enough information (usually 3-5 exchanges), OR if the user explicitly asks for results, you MUST output a JSON block with recommendations.
      
      JSON FORMAT (only when finishing):
      \`\`\`json
      {
        "recommendations": [
          {
            "title": "Job Title",
            "matchScore": 95,
            "salary": "$80k - $120k",
            "reason": "Why this fits...",
            "skills": ["Skill 1", "Skill 2"]
          },
          ... (3 recommendations total)
        ]
      }
      \`\`\`
      
      If you are NOT finished, just output plain text for the next question. Do NOT output JSON unless you are presenting final results.
    `;

    const response = await callGemini(`${conversationHistory}\nUSER: ${input}`, systemPrompt);

    // Check for JSON in response (End of interview)
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1];
        const data = JSON.parse(jsonStr);
        setMessages(prev => [...prev, { role: 'ai', text: "Thank you! I've analyzed our conversation and your profile. I've generated some career paths for you. Check the 'Career Paths' tab!" }]);
        if (onRecommendation) onRecommendation(JSON.stringify(data.recommendations));
      } catch (e) {
        console.error("JSON Parse Error", e);
        setMessages(prev => [...prev, { role: 'ai', text: response.replace(/```json[\s\S]*```/, '') }]);
      }
    } else {
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex-1 bg-white rounded-t-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <span className="font-semibold">AI Career Interview</span>
          </div>
          <span className="text-xs bg-blue-500 px-2 py-1 rounded">Beta</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-slate-100 text-slate-500 text-xs p-3 rounded-b-xl text-center">
        AI can make mistakes. Please verify important career information.
      </div>
    </div>
  );
};

const CareerPaths = ({ recommendations }) => {
  const [parsedRecs, setParsedRecs] = useState([]);

  useEffect(() => {
    if (recommendations) {
      try {
        setParsedRecs(JSON.parse(recommendations));
      } catch (e) {
        console.error("Failed to parse recommendations");
      }
    }
  }, [recommendations]);

  if (!recommendations) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-fade-in">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <Map className="text-blue-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Paths Generated Yet</h2>
        <p className="text-slate-500 max-w-md mt-2 mb-6">
          Complete the AI Interview to unlock personalized career roadmaps tailored to your skills and personality.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Recommended Paths</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {parsedRecs.map((rec, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{rec.title}</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  {rec.matchScore}% Match
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-slate-600">
                  <TrendingUp size={16} className="mr-2 text-blue-500" />
                  <span>Avg. Salary: <span className="font-semibold text-slate-800">{rec.salary}</span></span>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed">
                  {rec.reason}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.skills.map((skill, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    View Learning Roadmap
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResourceHub = () => {
  const resources = [
    { type: 'Course', title: 'Data Science Fundamentals', provider: 'Coursera', link: '#' },
    { type: 'Article', title: 'Top 10 Soft Skills for 2025', provider: 'Harvard Business Review', link: '#' },
    { type: 'Webinar', title: 'The Future of AI in Tech', provider: 'TechCrunch', link: '#' },
    { type: 'Tutorial', title: 'React for Beginners', provider: 'FreeCodeCamp', link: '#' },
    { type: 'Tool', title: 'Resume Builder AI', provider: 'PathFinder Tools', link: '#' },
  ];

  return (
    <div className="p-6 md:p-10 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Resource Hub</h2>
        <div className="relative">
          <input type="text" placeholder="Search resources..." className="pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <BookOpen size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Type</th>
              <th className="p-4">Title</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resources.map((res, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${res.type === 'Course' ? 'bg-blue-100 text-blue-700' :
                    res.type === 'Article' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{res.type}</span>
                </td>
                <td className="p-4 font-medium text-slate-800">{res.title}</td>
                <td className="p-4 text-slate-500 text-sm">{res.provider}</td>
                <td className="p-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Access</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Community = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    // Real-time listener for community posts
    if (!user) return;
    // Standard path for local usage
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetchedPosts);
    }, (err) => console.error("Firestore error:", err));
    return () => unsubscribe();
  }, [user]);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    try {
      await addDoc(collection(db, 'community_posts'), {
        text: newPost,
        author: 'User ' + user.uid.slice(0, 5),
        createdAt: serverTimestamp(),
        likes: 0
      });
      setNewPost('');
    } catch (e) {
      console.error("Error posting:", e);
    }
  };

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Community Discussion</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share an insight or ask for advice..."
          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            onClick={handlePost}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Post Message
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? <p className="text-center text-slate-400">No discussions yet. Be the first!</p> : null}
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs mr-3">
                {post.author ? post.author[0] : 'U'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{post.author}</h4>
                <p className="text-xs text-slate-400">Just now</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">{post.text}</p>
            <div className="flex space-x-4 text-slate-400 text-sm">
              <button className="hover:text-blue-600 flex items-center space-x-1">
                <Award size={16} /> <span>Like</span>
              </button>
              <button className="hover:text-blue-600 flex items-center space-x-1">
                <MessageSquare size={16} /> <span>Reply</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profile, setProfile] = useState({});
  const [recommendations, setRecommendations] = useState(null);
  const [goals, setGoals] = useState([]);

  // Auth Initialization
  useEffect(() => {
    // Standard Anonymous Sign In for Demo
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) return;

    // Fetch Profile
    const fetchProfile = async () => {
      // FIX: Standard path for local 'users/{uid}/profile'
      const docRef = doc(db, 'users', user.uid, 'data', 'profile');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        if (data.recommendations) setRecommendations(data.recommendations);
      }
    };

    // Fetch Goals (Real-time)
    // FIX: Standard path for local 'users/{uid}/goals'
    const goalsQuery = query(collection(db, 'users', user.uid, 'goals'));
    const unsubGoals = onSnapshot(goalsQuery, (snap) => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));

    fetchProfile();
    return () => unsubGoals();
  }, [user]);

  const saveProfile = async (newProfile) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'data', 'profile'), {
      ...newProfile,
      recommendations: recommendations // preserve existing recs
    }, { merge: true });
    setProfile(newProfile);
  };

  const handleRecommendation = async (recsJson) => {
    setRecommendations(recsJson);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'data', 'profile'), {
        recommendations: recsJson
      }, { merge: true });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard user={user} profile={profile} recommendations={recommendations} goals={goals} />;
      case 'profile': return <ProfileForm user={user} profile={profile} onSave={saveProfile} />;
      case 'interview': return <AIInterview user={user} profile={profile} onRecommendation={handleRecommendation} />;
      case 'paths': return <CareerPaths recommendations={recommendations} />;
      case 'resources': return <ResourceHub />;
      case 'community': return <Community user={user} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileOpen={isMobileOpen}
        toggleMobile={() => setIsMobileOpen(!isMobileOpen)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between md:justify-end">
          <button onClick={() => setIsMobileOpen(true)} className="md:hidden text-slate-500">
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{profile?.name || 'Guest User'}</p>
              <p className="text-xs text-slate-500">{user ? 'Online' : 'Connecting...'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {profile?.name ? profile.name[0] : <User size={20} />}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}