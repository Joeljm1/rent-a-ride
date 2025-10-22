export default function Contact() {
  return (
    <div className="w-full h-full transition-colors duration-300 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Main Content Container */}
        <div className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Contact Us</h1>
                <p className="text-blue-100 text-sm">We'd love to hear from you!</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Intro */}
              <div className="text-center">
                <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold">
                  Have questions? Need support? We're here to help!
                </p>
              </div>

              {/* Contact Methods Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Email Support */}
                <a
                  href="mailto:support@rentARide.com"
                  className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Support</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Get help with your account</p>
                    <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                      support@rentARide.com
                    </span>
                  </div>
                </a>

                {/* Email Feedback */}
                <a
                  href="mailto:feedback@rentARide.com"
                  className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                      <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Feedback</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Share your thoughts</p>
                    <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline">
                      feedback@rentARide.com
                    </span>
                  </div>
                </a>

                {/* Email General */}
                <a
                  href="mailto:info@rentARide.com"
                  className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-full group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                      <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">General</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">General inquiries</p>
                    <span className="text-pink-600 dark:text-pink-400 font-medium group-hover:underline">
                      info@rentARide.com
                    </span>
                  </div>
                </a>
              </div>

              {/* Phone Contact */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-center space-x-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-full">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Call us directly</p>
                    <a 
                      href="tel:+911234567890" 
                      className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:underline transition-all duration-300"
                    >
                      +91 12345 67890
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-8 text-center shadow-xl">
                <h2 className="text-xl font-bold text-white mb-3">Need Immediate Help?</h2>
                <p className="text-blue-100 mb-4">
                  Our support team typically responds within 24 hours. For urgent matters, please call us directly.
                </p>
                <div className="flex justify-center space-x-2">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-white text-sm font-medium">We're here to help!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
