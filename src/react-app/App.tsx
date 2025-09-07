// src/App.tsx

import { useState } from "react";
import Counter from "./components/Counter";

function App() {
  const [name, setName] = useState("unknown");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rent-A-Ride</h1>
          <p className="text-lg text-gray-600">
            Your trusted car rental service
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Quick Start
              </h2>
              <Counter />
              <p className="text-gray-600 mb-4">
                Get started with your car rental experience
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                API Connection
              </h2>
              <p className="text-gray-600 mb-4">
                Test connection to our services
              </p>
              <button
                onClick={() => {
                  fetch("/api/")
                    .then((res) => res.json() as Promise<{ name: string }>)
                    .then((data) => setName(data.name));
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 mb-4"
                aria-label="get name"
              >
                Test API Connection
              </button>
              <p className="text-sm text-gray-500">
                API Response: <span className="font-semibold">{name}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose Rent-A-Ride?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚗</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Wide Selection
                </h3>
                <p className="text-gray-600">
                  Choose from our extensive fleet of vehicles
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Best Prices
                </h3>
                <p className="text-gray-600">
                  Competitive rates with no hidden fees
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Top Service
                </h3>
                <p className="text-gray-600">
                  24/7 customer support and roadside assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
