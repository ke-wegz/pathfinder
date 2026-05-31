import React from "react";
import MainLayout from "../components/MainLayout";
import {
  Compass,
  Cpu,
  BookOpen,
  Users,
  Target,
  Shield,
  Zap,
} from "lucide-react";

const About = () => {
  return (
    <MainLayout>
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="text-primary-600">PathFinder AI</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The PathFinder AI system is a comprehensive career advice platform
              that leverages artificial intelligence to provide personalized
              career guidance, educational recommendations, and community
              engagement features to users.
            </p>
          </div>

          {/* Mission & Scope */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Compass className="text-primary-600" /> Our Purpose
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our mission is to empower individuals to make informed academic
                and career decisions. By integrating advanced technology with
                user-centric design, we facilitate a seamless journey from
                profile creation to goal achievement.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="text-primary-600" /> Privacy & Security
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We prioritize user trust above all else. Our system ensures all
                user data is encrypted in transit and at rest, while remaining
                fully compliant with GDPR and other critical privacy regulations
                to protect your sensitive information.
              </p>
            </div>
          </div>

          {/* What We Offer */}
          <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              {
                title: "AI-Powered Interviews",
                desc: "Our system conducts interactive, AI-powered interviews to gather comprehensive user information through intelligent questioning.",
                icon: Cpu,
              },
              {
                title: "Personalized Recommendations",
                desc: "We analyze your academic background, interests, and industry trends to generate tailored career and educational matches.",
                icon: Target,
              },
              {
                title: "Resource Hub",
                desc: "Access a central repository of educational materials and recommendations for local learning centers to boost your skill set.",
                icon: BookOpen,
              },
              {
                title: "Community Engagement",
                desc: "Join our discussion forums where regular users, experts, and mentors share insights and collaborate to achieve career milestones.",
                icon: Users,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <item.icon className="text-primary-600 mb-4" size={32} />
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Reliability Section */}
          <div className="bg-primary-600 rounded-2xl p-8 text-white text-center">
            <Zap className="mx-auto mb-4" size={40} />
            <h2 className="text-2xl font-bold mb-4">
              Built for Reliability & Scale
            </h2>
            <p className="text-primary-100 max-w-xl mx-auto">
              Our infrastructure is designed to maintain 99.5% uptime, ensuring
              that our services are available whenever you need them. We are
              engineered to support up to 10,000 concurrent users, providing a
              stable and scalable environment for your career growth.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
