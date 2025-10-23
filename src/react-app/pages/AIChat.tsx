import React, { useState, useRef, useEffect } from "react";
import client from "../lib/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VehicleRecommendation {
  id: number;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuelType: string;
}

export default function AIChat(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI vehicle assistant. Tell me about your needs - budget, passengers, trip type, or specific features - and I'll help you find the perfect vehicle! 🚗",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<VehicleRecommendation[]>([]);
  const userQueryRef = useRef<HTMLDivElement>(null);

  const scrollToQuery = () => {
    // Smooth scroll to show the user's query at the top of the viewport
    if (userQueryRef.current) {
      userQueryRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start", // Aligns to the top of the scrolling area
        inline: "nearest"
      });
    }
  };

  useEffect(() => {
    // Scroll to the user's query when messages change
    if (messages.length > 1) { // More than just the initial greeting
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToQuery();
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // @ts-expect-error - AI route types will be available
      const response = await client.api.ai.chat.$post({
        json: {
          message: input,
          conversationHistory: messages,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      if ("error" in data) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (data.relevantVehicles && data.relevantVehicles.length > 0) {
        setRecommendations(data.relevantVehicles);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full transition-colors duration-300 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Main Chat Container */}
        <div className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Vehicle Assistant</h1>
                <p className="text-blue-100 flex items-center space-x-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Powered by Cloudflare Workers AI & Vectorize</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 p-4 flex-1 overflow-hidden min-h-0">
            {/* Chat Section */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50">
                  {messages.map((message, index) => {
                    // Attach ref to the user's query (second-to-last message when AI has responded)
                    const isUserQuery = message.role === "user" && 
                                       index === messages.length - 2 && 
                                       messages[messages.length - 1]?.role === "assistant";
                    
                    return (
                      <div
                        key={index}
                        ref={isUserQuery ? userQueryRef : null}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        } animate-fade-in`}
                      >
                      {message.role === "assistant" && (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center ml-3 flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  {loading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="rounded-2xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full animate-bounce bg-blue-600 dark:bg-blue-400"></div>
                          <div className="w-3 h-3 rounded-full animate-bounce delay-100 bg-purple-600 dark:bg-purple-400"></div>
                          <div className="w-3 h-3 rounded-full animate-bounce delay-200 bg-pink-600 dark:bg-pink-400"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe what you're looking for... (e.g., 'I need a family-friendly SUV')"
                      className="w-full rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-lg transition-all bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      rows={3}
                      disabled={loading}
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                      {input.length}/500
                    </div>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
                  >
                    <span>{loading ? "Sending..." : "Send"}</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations Sidebar */}
            <div className="lg:col-span-1 flex flex-col h-full">
              <div className="rounded-xl p-5 h-full overflow-y-auto bg-gray-50/80 dark:bg-gray-900/50">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    🚗 Recommended
                  </h2>
                  {recommendations.length > 0 && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                      {recommendations.length}
                    </span>
                  )}
                </div>
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((vehicle, idx) => (
                      <div
                        key={vehicle.id}
                        className="rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {vehicle.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">
                              ${vehicle.pricePerDay}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              per day
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3 text-gray-700 dark:text-gray-300">
                          <div className="flex items-center space-x-2">
                            <span>👥</span>
                            <span>{vehicle.seats} seats</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>⚙️</span>
                            <span>{vehicle.transmission}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>⛽</span>
                            <span>{vehicle.fuelType}</span>
                          </div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-20">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="w-10 h-10 text-gray-400 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vehicles will appear here as I make recommendations based on your needs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Footer with Quick Examples */}
          <div className="border-t bg-gray-100/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 p-5 flex-shrink-0">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Try asking:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Budget-friendly car for city",
                  "Luxury sedan for business",
                  "Family SUV with 7 seats",
                  "Eco-friendly electric vehicle"
                ].map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(query)}
                    className="text-left px-4 py-3 rounded-lg text-sm transition-all duration-300 hover:scale-105 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-md group"
                  >
                    <span className="text-blue-500 mr-2 group-hover:animate-pulse">→</span>
                    <span className="font-medium">{query}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> Be specific about budget, passenger count, trip type, or desired features!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
