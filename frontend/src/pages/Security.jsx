import React from "react";
import MainLayout from "../components/MainLayout";
import { Lock, ShieldCheck, RefreshCw, Database } from "lucide-react";

const Security = () => {
  return (
    <MainLayout>
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600">
              <Lock size={40} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Security Measures
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-10">
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary-600">
                <Database size={24} /> Data Protection Architecture
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                At PathFinder AI, our commitment to security is integrated into
                our software quality attributes, ensuring a defensive-in-depth
                approach[cite: 1]. We mandate that all user data, ranging from
                academic history to career preferences, must be encrypted both
                in transit via secure HTTPS protocols and at rest within our
                database servers[cite: 1]. Furthermore, we enforce strict secure
                password storage practices and ensure that no personal data is
                ever exposed without the explicit, documented consent of the
                user, adhering to our non-functional safety requirements[cite:
                1].
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary-600">
                <ShieldCheck size={24} /> Access Control & Audits
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                To maintain the integrity of our platform, we implement rigorous
                role-based access control (RBAC), which ensures that only
                authorized personnel can access sensitive system
                components[cite: 1]. We conduct regular, systematic security
                audits to proactively identify, assess, and mitigate potential
                vulnerabilities[cite: 1]. This proactive stance allows us to
                maintain a modular system design that supports both high
                security and efficient maintainability[cite: 1].
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary-600">
                <RefreshCw size={24} /> Reliability & Recovery
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our platform is engineered for high availability, targeting a
                99.5% uptime to ensure reliable access for all user
                classes[cite: 1]. In the event of an unforeseen system failure,
                our disaster recovery protocols are designed to ensure that data
                loss shall not exceed one hour, thereby protecting the
                continuity and integrity of your career roadmap and data[cite:
                1].
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default Security;
