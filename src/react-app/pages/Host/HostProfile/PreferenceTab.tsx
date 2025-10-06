import { ProfileData } from "../types";

export default function PreferenceTab({ activeTab, profileData, isEditing, handleInputChange }: { activeTab: string; profileData: ProfileData; isEditing: boolean; handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; }) {
    return (
        <>
        {activeTab === "preferences" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Hosting Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium">Instant Book</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow guests to book instantly without approval</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="instantBook"
                      checked={profileData.instantBook}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Rental Period</label>
                    <select
                      name="minRentalPeriod"
                      value={profileData.minRentalPeriod}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    >
                      <option value="1 hour">1 hour</option>
                      <option value="4 hours">4 hours</option>
                      <option value="1 day">1 day</option>
                      <option value="3 days">3 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Rental Period</label>
                    <select
                      name="maxRentalPeriod"
                      value={profileData.maxRentalPeriod}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    >
                      <option value="7 days">7 days</option>
                      <option value="15 days">15 days</option>
                      <option value="30 days">30 days</option>
                      <option value="60 days">60 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
                    <select
                      name="cancellationPolicy"
                      value={profileData.cancellationPolicy}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    >
                      <option value="Flexible">Flexible</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Strict">Strict</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
    );
}