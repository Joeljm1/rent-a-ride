import React, { useState } from "react";
import { ProfileData } from "../types";

export default function HostProfileHeader({ profileData, isEditing, setIsEditing }: { profileData: ProfileData; isEditing: boolean; setIsEditing: React.Dispatch<React.SetStateAction<boolean>>; }) {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const handleSave = () => {
        console.log("Saving profile data:", profileData);
        setIsEditing(false);
        // Here you would send data to your backend
      };
    
      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        try {
          const url = URL.createObjectURL(file);
          setProfileImage(url);
        } catch {
          // ignore
        }
      };
    return (
        <>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <span className="text-xs">📷</span>
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{profileData.businessName}</p>
              
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4 md:mt-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
        </>
    );
}