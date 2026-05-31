import React from "react";
import MainLayout from "../components/MainLayout";
import { Mail, MapPin, Phone, Send } from "lucide-react";

const Contact = () => {
  return (
    <MainLayout>
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              تواصل <span className="text-primary-600">معنا</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              نحن هنا لمساعدتك. إذا كانت لديك أي استفسارات أو ملاحظات، لا تتردد
              في مراسلتنا.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-600 outline-none transition-all"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-600 outline-none transition-all"
                    placeholder="example@mail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    الرسالة
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-600 outline-none transition-all"
                    placeholder="كيف يمكننا مساعدتك؟"
                  ></textarea>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-all">
                  <Send size={18} /> إرسال الرسالة
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">راسلنا عبر البريد</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    support@pathfinder.ai
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">مقرنا</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    عمان، المملكة الأردنية الهاشمية
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
