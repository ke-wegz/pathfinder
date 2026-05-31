import React from "react";
import MainLayout from "../components/MainLayout";
import { Cookie, Zap, Gauge, ShieldCheck } from "lucide-react";

const Cookies = () => {
  return (
    <MainLayout>
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl text-secondary-600">
              <Cookie size={40} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Cookie Policy
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-10">
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-600">
                <Zap size={24} /> Enhancing User Experience
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                PathFinder AI utilizes cookies as a fundamental part of our
                technological infrastructure to maintain active user session
                states[cite: 1]. This is particularly critical during our
                AI-powered interview process, which requires state-dependent
                interactions to accurately process and gather information about
                your academic background and career goals[cite: 1]. By
                maintaining these sessions, we ensure a seamless and
                personalized journey without unnecessary interruptions.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-600">
                <Gauge size={24} /> Performance & Usability
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Our commitment to usability requires that our interface be
                intuitive and accessible to users with minimal training[cite:
                1]. Cookies allow us to optimize this interface by remembering
                user preferences and streamlining resource loading processes,
                which helps us meet our performance target of loading resources
                within 3 seconds[cite: 1]. This optimization contributes
                directly to our overarching commitment of providing a stable
                platform with 99.5% uptime[cite: 1].
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-600">
                <ShieldCheck size={24} /> Consent and Control
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                You retain full control over your cookie preferences through
                your browser settings. However, disabling these features may
                impact the system's ability to provide a tailored user
                experience or may limit access to specific interactive features
                of the PathFinder AI platform[cite: 1]. By continuing to use our
                services, you agree to our use of cookies to facilitate your
                career discovery journey while maintaining the high performance
                and security standards outlined in our system requirements[cite:
                1].
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default Cookies;
