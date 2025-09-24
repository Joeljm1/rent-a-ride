import { Link } from "react-router";

export default function About() {
    return (
        <div className="flex flex-col flex-grow p-8 text-blue-600 dark:text-sky-400 bg-gray-100 dark:bg-gray-800 shadow-md dark:shadow-lg transition-colors text-center space-y-6">
            <h1 className="text-3xl font-bold">About Us</h1>
            <p className="mt-4 font-semibold">
                We are dedicated to providing the best car rental experience.
            </p>
            <div className="flex justify-center space-x-6">
                <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:scale-110 hover:underline">
                    Contact Us
                </Link>
            </div>
        </div>
    )
}