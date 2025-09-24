import { Link } from "react-router";
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex-grow bg-gray-100 dark:bg-gray-800 space-y-20">
      <section className="bg-blue-600 dark:bg-gray-800 text-white dark:text-gray-100 py-20 text-center -mb-2 dark:-mb-3">
        <h1 className="text-4xl font-extrabold mb-4">Drive Your Dreams, Rent with Ease</h1>
        <p className="text-lg mb-8">
          Discover the perfect vehicle for every journey. From city cruising to cross-country adventures,{" "}
          <span className="font-semibold">#RentARide</span> connects you with quality cars at unbeatable prices.
        </p>
        <Link to="/vehicles">
          <Button className="bg-white text-blue-600 dark:bg-gray-100 dark:text-gray-900 font-semibold px-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-200 transition cursor-pointer">
            Find Your Ride Today
          </Button>
        </Link>
      </section>

      {/* Key Features Section */}
      <div className="py-8 dark:bg-gray-900 dark:text-gray-100">
        <section className="max-w-6xl mx-auto px-4 space-y-12 dark:text-gray-100">
          <h2 className="text-3xl font-bold text-center">Why Choose #RentARide?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-2">🚗</div>
              <h3 className="font-semibold mb-1">Diverse Fleet</h3>
              <p>Economy, luxury, SUVs, and more—each maintained to the highest standards.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">Transparent Pricing</h3>
              <p>No hidden fees—see exactly what you pay upfront with clear, competitive rates.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-semibold mb-1">Easy Booking</h3>
              <p>Reserve in minutes. Modify or cancel anytime with just a few clicks.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-semibold mb-1">Trusted & Secure</h3>
              <p>Fully insured cars and verified hosts for your peace of mind.</p>
            </div>
          </div>
        </section>
      </div>
      {/* How It Works Section */}
      <section className="dark:bg-gray-800 pb-6 dark:text-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl font-bold">Rent in 3 Simple Steps</h2>
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold">1. Search & Compare</h4>
              <p>Enter dates & location, then filter by price, type, features, and ratings.</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">2. Book Instantly</h4>
              <p>Select your vehicle, review details, pay securely, and get instant confirmation.</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">3. Pick Up & Go</h4>
              <p>Meet your host, complete a quick inspection, and start your journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proposition Section */}
      <section className="px-4 dark:text-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold mb-2">For Renters</h3>
            <p>
              Access thousands of vehicles at prices up to 35% lower than traditional rentals. From quick errands to weekend
              getaways, find the right car for every occasion.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold mb-2">For Hosts</h3>
            <p>
              Turn your unused vehicle into a revenue stream. List your car, set your price, and we will buy the car for our services to help the community.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="bg-blue-600 dark:bg-gray-900 text-white dark:text-gray-100 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Safety is Our Priority</h2>
        <p className="max-w-2xl p-6 mx-auto">
          Every rental includes comprehensive insurance coverage, 24/7 roadside assistance, and dedicated support. Join our
          community of trusted hosts and renters for a safe, reliable, and enjoyable car-sharing experience.
        </p>
      </section>

      {/* Footer Call-to-Action */}
      <section className="pb-12 text-center dark:bg-gray-800 dark:text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="mb-6 max-w-2xl mx-auto px-4">
          Join thousands of satisfied customers who choose <span className="font-semibold">#RentARide</span> for their
          transportation needs. Whether renting or hosting, your next great journey starts here.
        </p>
        <Link to="/login">
          <Button className="bg-blue-600 text-white dark:bg-sky-500 dark:text-gray-100 font-semibold px-6 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-sky-600 transition cursor-pointer">
            Login Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
