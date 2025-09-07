import { useState } from "react";
import { Link } from "react-router";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="space-y-4">
      <button
        onClick={() => setCount((count) => count + 1)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        aria-label="increment"
      >
        Demo Counter: {count}
      </button>
      <div>
        <Link
          to="/register"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-block transition-colors duration-200"
        >
          Get Started - Register
        </Link>
      </div>
    </div>
  );
}
