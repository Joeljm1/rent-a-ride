import type { ProfileData } from "../types";

export default function ProfileStats({ profileData }: { profileData: ProfileData } ) {
    return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profileData.responseRate}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{profileData.responseTime}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">156</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">₹2,45,000</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
        </div>
    </div>
    );
}