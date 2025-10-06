import { Link } from "react-router";
import HostBookings from "./HostBookings";
import HostHeader from "./HostHeader";

export default function Dashboard() {
  return (
    <div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16 space-y-8">
            {<HostHeader />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {<HostBookings />}

                {/* Quick Actions */}
                <aside className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-3">
                    <Link to="../upload" className="block w-full text-left px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded">➕ Add New Vehicle</Link>
                    <Link to="../vehicles" className="block w-full text-left px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded">🚗 Manage Vehicles</Link>
                    <Link to="../bookings" className="block w-full text-left px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded">📅 Review Bookings</Link>
                </div>
                </aside>
            </div>
        </div>
    </div>
  );
}