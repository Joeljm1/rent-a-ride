import { ProfileData } from "../types";

export default function BusinessTab({ activeTab, profileData, isEditing, handleInputChange }: { activeTab: string; profileData: ProfileData; isEditing: boolean; handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; }) {
    return (
        <>
        {activeTab === "business" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={profileData.businessName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={profileData.gstNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={profileData.panNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bank Account</label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={profileData.bankAccount}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={profileData.ifscCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}
        </>
    );
}