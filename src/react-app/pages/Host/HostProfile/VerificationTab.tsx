import { ProfileData } from "../types";

export default function VerificationTab({ profileData, activeTab }: { profileData: ProfileData; activeTab: string; }) {
    const getVerificationBadge = (verified: boolean) => (
        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        verified 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}>
        {verified ? "Verified" : "Pending"}
        </span>
    );
    return (
        <>
        {activeTab === "verification" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Account Verification</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📧</span>
                    <div>
                      <h4 className="font-medium">Email Address</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.email}</p>
                    </div>
                  </div>
                  {getVerificationBadge(profileData.emailVerified)}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📱</span>
                    <div>
                      <h4 className="font-medium">Phone Number</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.phone}</p>
                    </div>
                  </div>
                  {getVerificationBadge(profileData.phoneVerified)}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🆔</span>
                    <div>
                      <h4 className="font-medium">Government ID</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Aadhaar/Passport verification</p>
                    </div>
                  </div>
                  {getVerificationBadge(profileData.identityVerified)}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏠</span>
                    <div>
                      <h4 className="font-medium">Address Verification</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Utility bill/Bank statement</p>
                    </div>
                  </div>
                  {getVerificationBadge(profileData.addressVerified)}
                  {!profileData.addressVerified && (
                    <button className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Upload
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🛡️</span>
                    <div>
                      <h4 className="font-medium">Background Check</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Criminal background verification</p>
                    </div>
                  </div>
                  {getVerificationBadge(profileData.backgroundCheck)}
                </div>
              </div>
            </div>
          )}
        </>
    );
}