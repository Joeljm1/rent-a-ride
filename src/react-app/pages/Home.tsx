import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import CarImages from "./carImages";

export default function Home() {
  const { carImages, currentImageIndex, carDetailsImages, currentDetailImageIndex, setCurrentImageIndex, setCurrentDetailImageIndex } = CarImages();
  return (
    <div className="flex-grow bg-white dark:bg-gray-900">
      {/* Hero Section with Background Image */}
      <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        {/* Background Image with Overlay */}
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-blue-900/60"
        >
          <div 
            className="absolute inset-0 contrast-80 bg-cover bg-center bg-no-repeat opacity-100"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070')",
            }}
          />
        </motion.div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 max-w-5xl leading-tight tracking-tight"
          >
            Rent A Ride
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl leading-relaxed font-light tracking-wide"
          >
            Unlock the power of seamless car rentals with instant booking
            <br className="hidden md:block" />
            and premium vehicles at your fingertips.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/vehicles">
              <Button 
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-10 py-6 rounded-full shadow-2xl transition-all transform tracking-wide"
              >
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="text-gray-300 text-sm font-semibold tracking-wider uppercase">Vehicle Association</div>
            <div className="text-gray-400 text-2xl">|</div>
            <div className="text-gray-300 text-sm font-semibold tracking-wider uppercase">Cloudflare Workers Partner</div>
            <div className="text-gray-400 text-2xl">|</div>
            <div className="text-gray-300 text-sm font-semibold tracking-wider uppercase">IIIT Kottayam</div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Clean Experience */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-200 to-blue-300 dark:from-gray-700 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              A seamless experience for
              <br />
              every journey.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
              RentARide provides travelers and businesses with the essential
              tools for hassle-free vehicle rentals and smart trip management.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Card 1 - Quick Booking */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white dark:bg-gray-900 p-8 lg:p-12 rounded-3xl shadow-xl border border-gray-500 dark:border-gray-800">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-19 rounded-2xl mb-6 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 max-w-sm border border-gray-500 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-white text-2xl font-bold">🚗</span>
                        </motion.div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">YOUR RIDE</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">BMW 3 Series</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">₹12k/day</div>
                      <Link to="/vehicles">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors tracking-wide">
                          BOOK
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-snug">
                  From search to booking, streamline your
                  rental process in just minutes.
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-normal leading-relaxed">
                  Browse vehicles, compare prices, and confirm your booking instantly with secure payment options.
                </p>
              </Card>
            </motion.div>

            {/* Card 2 - AI Chat Support */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white dark:bg-gray-900 p-8 lg:p-12 rounded-3xl shadow-xl border border-gray-500 dark:border-gray-800">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl mb-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm mx-auto"
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 mb-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="space-y-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: "75%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="h-3 bg-blue-500 rounded"
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="h-2 bg-gray-300 rounded"
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: "83%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="h-2 bg-gray-300 rounded"
                          />
                          <div className="text-xs text-gray-600 mt-2 font-medium">🤖 AI Assistant</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-semibold tracking-wide">Find Your Perfect Ride</span>
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs">✓</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-snug">
                  Ask our AI and get instant recommendations
                  tailored to your needs.
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-normal leading-relaxed">
                  Smart AI chatbot understands your requirements and suggests the perfect vehicle for your journey.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Control Your Money Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-100 to-blue-200 dark:from-gray-900 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                Find your perfect ride in
                seconds.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-normal">
                Browse vehicles, compare features, and book instantly—no barriers, no
                waiting, no hassle with our streamlined rental process.
              </p>

              {/* Feature List with Expandable Items */}
              <div className="space-y-4">
                <motion.details 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="group border-b border-gray-500 dark:border-gray-700 pb-4"
                >
                  <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                    <span>Diverse fleet selection</span>
                    <span className="text-2xl group-open:rotate-180 transition-transform">→</span>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                    Choose from economy, luxury, SUVs, electric vehicles, and more. Every car maintained to the highest standards.
                  </p>
                </motion.details>

                <motion.details 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="group border-b border-gray-500 dark:border-gray-700 pb-4"
                >
                  <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                    <span>Flexible booking options</span>
                    <span className="text-2xl group-open:rotate-180 transition-transform">→</span>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                    Book hourly, daily, or weekly. Modify or cancel your reservation anytime with our flexible policies.
                  </p>
                </motion.details>

                <motion.details 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="group border-b border-gray-500 dark:border-gray-700 pb-4"
                >
                  <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                    <span>Instant confirmation</span>
                    <span className="text-2xl group-open:rotate-180 transition-transform">→</span>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                    Get immediate booking confirmation with digital keys and pickup instructions sent to your phone.
                  </p>
                </motion.details>

                <motion.details 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="group border-b border-gray-500 dark:border-gray-700 pb-4"
                >
                  <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                    <span>24/7 roadside support</span>
                    <span className="text-2xl group-open:rotate-180 transition-transform">→</span>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                    Round-the-clock assistance and emergency support wherever your journey takes you.
                  </p>
                </motion.details>
              </div>
            </motion.div>

            {/* Right Image Carousel */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-200 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-8 lg:p-12 rounded-3xl shadow-lg">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl/20 overflow-hidden relative h-[400px] border border-gray-100 dark:border-gray-700">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentDetailImageIndex}
                      src={carDetailsImages[currentDetailImageIndex].url}
                      alt={carDetailsImages[currentDetailImageIndex].alt}
                      initial={{ opacity: 0, scale: 1.1, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.95, rotate: 5 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {carDetailsImages.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentDetailImageIndex(index)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          index === currentDetailImageIndex 
                            ? 'w-8 bg-blue-600' 
                            : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skip the hassle section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-200 to-blue-300 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Image Carousel */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-gradient-to-br from-gray-200 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-8 lg:p-12 rounded-3xl shadow-xl/30 relative overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="relative h-[400px] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={carImages[currentImageIndex].url}
                      alt={carImages[currentImageIndex].alt}
                      initial={{ opacity: 0, scale: 1.2, x: 100 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -100 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                  </AnimatePresence>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {carImages.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          index === currentImageIndex 
                            ? 'w-8 bg-blue-600' 
                            : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                  
                  
                </div>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                Skip the hassle and
                hit the road.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed font-normal">
                No paperwork delays, no waiting in lines. That's why we've designed every
                step to get you on the road faster.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                From vehicle selection to key pickup, every detail is streamlined for
                your convenience and peace of mind.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Money Calculator Section */}
      <section className="py-20 lg:py-32 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
              Calculate your rental
              <br />
              savings
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
              See how much you could save compared to traditional car ownership or
              legacy rental services. Here's how we stack up.
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-8 lg:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Starting Budget */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 tracking-wide uppercase">Monthly travel budget</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">₹25,000</div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-normal">Rental type</span>
                    <div className="flex items-center gap-1">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-3 h-3 bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Savings Breakdown */}
                <div className="space-y-4">
                  {[
                    { label: "vs. Ownership", value: "₹15,680", width: "90%", color: "bg-green-500", delay: 0.3 },
                    { label: "vs. Traditional Rental", value: "₹8,249", width: "75%", color: "bg-blue-500", delay: 0.4 },
                    { label: "Maintenance Saved", value: "₹4,275", width: "60%", color: "bg-purple-500", delay: 0.5 },
                    { label: "Insurance Included", value: "₹2,190", width: "45%", color: "bg-orange-500", delay: 0.6 },
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: item.delay }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
                        <div className="mt-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: item.width }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: item.delay + 0.2 }}
                            className={`h-2 ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white ml-4 tracking-tight">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Real Results Section */}
      <section className="py-20 lg:py-32 bg-blue-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16 tracking-tight leading-tight"
          >
            Real experiences from real
            <br />
            customers
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Result Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="relative overflow-hidden rounded-2xl shadow-xl h-64 border border-gray-500 dark:border-gray-800">
                <motion.img 
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000" 
                  alt="Customer testimonial" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-sm text-white/80 mb-1 font-medium tracking-wide">Business Traveler</div>
                  <div className="text-4xl font-bold text-white mb-2 tracking-tight">500+</div>
                  <div className="text-sm text-white/90 font-normal">successful rentals</div>
                </div>
              </Card>
            </motion.div>

            {/* Result Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="relative overflow-hidden rounded-2xl shadow-xl h-64 border border-gray-500 dark:border-gray-800">
                <motion.img 
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000" 
                  alt="Customer testimonial" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-sm text-white/80 mb-1 font-medium tracking-wide">Weekend Explorer</div>
                  <div className="text-4xl font-bold text-white mb-2 tracking-tight">4.9★</div>
                  <div className="text-sm text-white/90 font-normal">average customer rating</div>
                </div>
              </Card>
            </motion.div>

            {/* Result Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="relative overflow-hidden rounded-2xl shadow-xl h-64 border border-gray-500 dark:border-gray-800">
                <motion.img 
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000" 
                  alt="Customer testimonial" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-sm text-white/80 mb-1 font-medium tracking-wide">Family Vacation</div>
                  <div className="text-4xl font-bold text-white mb-2 tracking-tight">35%</div>
                  <div className="text-sm text-white/90 font-normal">savings vs competitors</div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Trust Logos */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-12"
          >
            <span className="text-gray-700 dark:text-gray-100 text-sm font-semibold tracking-wider">Featured on AutoTrader</span>
            <span className="text-gray-700 dark:text-gray-100 text-sm font-semibold tracking-wider">CarGurus Certified</span>
            <span className="text-gray-700 dark:text-gray-100 text-sm font-semibold tracking-wider">Google Partner</span>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16 tracking-tight leading-tight">
            Questions all resolved
            <br />
            in one place
          </h2>

          <div className="space-y-6">
            <details className="group border-b border-gray-500 dark:border-gray-700 pb-6">
              <summary className="flex items-center justify-between cursor-pointer text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                <span>How do I book a car?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                Simply browse our fleet, select your preferred vehicle, choose your rental dates, and complete the secure payment. You'll receive instant confirmation with pickup details sent to your email and phone.
              </p>
            </details>

            <details className="group border-b border-gray-500 dark:border-gray-700 pb-6">
              <summary className="flex items-center justify-between cursor-pointer text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                <span>What's included in the rental?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                All rentals include comprehensive insurance coverage, 24/7 roadside assistance, unlimited mileage on most vehicles, and complimentary vehicle sanitization. Additional options like GPS and child seats are available.
              </p>
            </details>

            <details className="group border-b border-gray-500 dark:border-gray-700 pb-6">
              <summary className="flex items-center justify-between cursor-pointer text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                <span>Are there any hidden fees?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                Never. We believe in complete transparency. The price you see is the price you pay—no surprise charges, no hidden fees, no fuel surcharges, no airport fees.
              </p>
            </details>

            <details className="group border-b border-gray-500 dark:border-gray-700 pb-6">
              <summary className="flex items-center justify-between cursor-pointer text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                <span>What are the age requirements?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                Drivers must be at least 21 years old with a valid driver's license. Some premium and luxury vehicles may require drivers to be 25+. Additional young driver fees may apply for drivers under 25.
              </p>
            </details>

            <details className="group border-b border-gray-500 dark:border-gray-700 pb-6">
              <summary className="flex items-center justify-between cursor-pointer text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition tracking-normal">
                <span>Can I cancel or modify my booking?</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                Yes! Modify or cancel your reservation anytime from your account dashboard. Free cancellation is available up to 24 hours before pickup. Our flexible policies ensure you're never locked into a booking.
              </p>
            </details>
          </div>

          <div className="text-center mt-12">
            <Link to="/vehicles">
              <Button 
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-10 py-6 rounded-full shadow-xl transition-all transform hover:scale-105 tracking-wide"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-32 bg-gray-900 dark:bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight">
            Built for travelers who care deeply
            <br />
            about every journey and
            <br />
            every destination.
          </h2>
          <Link to="/register">
            <Button 
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-10 py-6 rounded-full shadow-2xl transition-all transform hover:scale-105 tracking-wide"
            >
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
