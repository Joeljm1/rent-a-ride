export default function SecurityTab({ activeTab}: { activeTab: string; }) {
    return (
        <>
        {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Security Settings</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Add an extra layer of security to your account
                  </p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Enable 2FA
                  </button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium mb-2">Login Activity</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Review recent login activity and manage active sessions
                  </p>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    View Activity
                  </button>
                </div>

                <div className="p-4 border border-red-200 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-300">Delete Account</h4>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
    );
}