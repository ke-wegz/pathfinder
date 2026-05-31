import React from "react";
import MainLayout from "../components/MainLayout";
import { Shield, Lock, Eye, Gavel, Database } from "lucide-react";

const Privacy = () => {
  return (
    <MainLayout>
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600">
              <Shield size={40} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-10">
            {/* Section 1 */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Eye size={24} className="text-primary-600" /> Data Collection &
                Purpose
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                At PathFinder AI, our platform is designed to provide
                comprehensive career advice and personalized guidance. To
                achieve this, the system processes user information, including
                academic backgrounds, personal interests, and career goals. We
                strictly adhere to functional requirements that mandate the
                system to explain all data usage clearly to users before any
                collection occurs.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Lock size={24} className="text-primary-600" /> Security &
                Encryption
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We implement robust security measures to protect your digital
                identity. In accordance with our non-functional security
                requirements, all user data is fully encrypted both in transit
                (while moving between your device and our servers) and at rest
                (stored within our cloud infrastructure). We ensure that no
                personal data is ever exposed to third parties without your
                explicit, documented consent, prioritizing your safety above all
                else.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Gavel size={24} className="text-primary-600" /> Regulatory
                Compliance
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                PathFinder AI maintains strict compliance with major privacy
                regulations, including the General Data Protection Regulation
                (GDPR). The system provides users with dedicated privacy
                controls to manage their data effectively. We are committed to
                refining our AI accuracy through user feedback, ensuring that
                your data remains a tool for your success while maintaining the
                highest standards of confidentiality and legal integrity.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Database size={24} className="text-primary-600" /> Data
                Retention & Reliability
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our reliability standards ensure that we maintain 99.5% uptime
                for our services. Furthermore, our disaster recovery protocols
                are designed to ensure that in the rare event of a system
                failure, data loss will not exceed one hour, protecting the
                integrity of the information you have entrusted to us.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
