import { ProfileData } from "../types";

export default function PersonalTab({ activeTab, profileData, isEditing, handleInputChange }: { activeTab: string; profileData: ProfileData; isEditing: boolean; handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; }) {
    return (
        <>
        {activeTab === "personal" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    name="language"
                    value={profileData.language}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-md font-medium mb-4">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={profileData.zipCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={profileData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2">About Me</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  placeholder="Tell renters about yourself, your experience, and what makes you a great host..."
                />
              </div>
            </div>
          )}
        </>
    );
}