import React from "react";
import MainLayout from "../components/MainLayout";
import {
  FileText,
  UserCheck,
  Wifi,
  Users,
  AlertCircle,
  Laptop,
} from "lucide-react";

const Terms = () => {
  return (
    <MainLayout>
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl text-secondary-600">
              <FileText size={40} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-10">
            {/* Section 1: User Classes & Responsibility */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-600">
                <Users size={24} /> User Classes & Account Responsibility
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                The PathFinder AI platform is designed to support a multi-tiered
                user ecosystem. Our system architecture defines specific roles
                including Regular Users, Career Experts, and System
                Administrators. By creating an account, you agree to fulfill the
                responsibilities inherent to your assigned user class. Regular
                users are responsible for the accuracy of the academic and
                career information provided during profile creation, as this
                directly influences the AI's ability to generate relevant career
                and educational recommendations.
              </p>
            </section>

            {/* Section 2: Assumptions & Literacy */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-600">
                <UserCheck size={24} /> User Prerequisites
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Access to the PathFinder AI system is provided under the
                assumption that all users possess basic computer literacy. The
                system interface is built for usability, requiring minimal
                training, but foundational technical competence is expected to
                interact with our AI-powered features effectively[cite: 1].
                Users are strictly prohibited from attempting to bypass
                role-based access controls or engage in unauthorized access to
                system features reserved for administrators or experts[cite: 1].
              </p>
            </section>

            {/* Section 3: Operating Environment */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-600">
                <Wifi size={24} /> Service Environment
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                PathFinder AI is delivered as a comprehensive web-based
                application with support for responsive mobile interfaces[cite:
                1]. To maintain optimal functionality, users must ensure they
                have stable internet connectivity. The platform relies on a
                cloud-hosted backend architecture, and we are committed to
                maintaining 99.5% service uptime[cite: 1]. By using this
                service, you acknowledge that our ability to provide
                AI-generated recommendations and career guidance is dependent on
                this technological infrastructure.
              </p>
            </section>

            {/* Section 4: System Limitations */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-600">
                <AlertCircle size={24} /> Disclaimer & Accuracy
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                While we strive for excellence, the accuracy of our AI
                recommendations is contingent upon the quality of the training
                data and the information provided by the user[cite: 1].
                Furthermore, availability of recommended local learning
                resources may vary significantly by region. PathFinder AI acts
                as a guidance platform; final career and educational decisions
                remain the sole responsibility of the user[cite: 1].
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
