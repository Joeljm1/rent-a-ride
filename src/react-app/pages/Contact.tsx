export default function Contact() {
  return (
    <div className="flex-grow p-8 bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-sky-400 shadow-md dark:shadow-lg transition-colors text-center space-y-6 mx-auto">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-4 font-semibold">
        We would love to hear from you!
      </p>

      {/* Email links */}
      <nav aria-label="Contact email links" className="flex justify-center flex-wrap gap-6">
        <a
          href="mailto:support@rentARide.com"
          className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:scale-110 hover:underline"
        >
          Email Support
        </a>
        <a
          href="mailto:feedback@rentARide.com"
          className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:scale-110 hover:underline"
        >
          Email Feedback
        </a>
        <a
          href="mailto:info@rentARide.com"
          className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:scale-110 hover:underline"
        >
          Email General Inquiries
        </a>
      </nav>

      <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">
        If you have any questions, feel free to reach out!<br /><br />
        <i className="fi fi-rr-phone-call me-2 align-middle"></i>Phone Number:<a href="tel:+911234567890" className="text-blue-600 dark:text-blue-400 hover:underline hover:font-[700]">
        +91 12345 67890
        </a>
      </p>
    </div>
  );
}
