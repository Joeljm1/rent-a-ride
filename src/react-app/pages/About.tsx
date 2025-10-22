import { Link } from "react-router";

export default function About() {
    return (
        <div className="w-full h-full transition-colors duration-300 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
                {/* Main Content Container */}
                <div className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0">
                    {/* Header Banner */}
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">About #RentARide</h1>
                                <p className="text-blue-100 text-sm">Your trusted car rental platform</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Mission Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Our Mission
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                    We are dedicated to providing the best car rental experience by connecting renters with quality vehicles at competitive prices. Our platform makes it easy, secure, and convenient for everyone.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Community-Driven</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Built by renters, for renters. Join thousands of satisfied customers.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Safe & Secure</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Verified hosts and fully insured vehicles for peace of mind.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Best Prices</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Transparent pricing with no hidden fees. Save up to 35%.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                            <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Quick & Easy</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Book in minutes with our streamlined process.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-8 text-center shadow-xl">
                                <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
                                <p className="text-blue-100 mb-6 text-lg">Have questions or want to learn more about our services?</p>
                                <Link 
                                    to="/contact" 
                                    className="inline-block px-8 py-3 bg-white text-blue-600 dark:bg-gray-100 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}