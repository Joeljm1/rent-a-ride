import { useState } from "react";
import HostProfileHeader from "./HostProfile/HostProfileHeader";
import ProfileStats from "./HostProfile/ProfileStats";
import TabNavigation from "./HostProfile/TabNavigation";
import PersonalTab from "./HostProfile/PersonalTab";
import BusinessTab from "./HostProfile/BuisnessTab";
import SecurityTab from "./HostProfile/SecurityTab";
import PreferenceTab from "./HostProfile/PreferenceTab";
import VerificationTab from "./HostProfile/VerificationTab";
import type { ProfileData } from "./types";

export default function HostProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  const [profileData, setProfileData] = useState<ProfileData>({
    // Personal Information
    firstName: "Karthik",
    lastName: "Das",
    email: "Karthik.Das@email.com",
    phone: "+91 1234567890",
    dateOfBirth: "2004-01-15",
    gender: "Male",
    language: "English",
    
    // Address
    address: "Shiganshina",
    city: "Kozhikode",
    state: "Kerala",
    zipCode: "6732890",
    country: "India",
    
    // Host Information
    hostSince: "2022-03-15",
    responseTime: "Within 1 hour",
    responseRate: "98%",
    bio: "Passionate car enthusiast with 5+ years of hosting experience. I ensure all my vehicles are well-maintained and provide excellent customer service.",
    
    // Business Details
    businessName: "RENTIGO",
    gstNumber: "29ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    bankAccount: "****6789",
    ifscCode: "HDFC0001234",
    
    // Preferences
    instantBook: true,
    minRentalPeriod: "4 hours",
    maxRentalPeriod: "30 days",
    cancellationPolicy: "Moderate",
    
    // Verification Status
    emailVerified: true,
    phoneVerified: true,
    identityVerified: true,
    addressVerified: false,
    backgroundCheck: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = target.name;
    let value: string | boolean = (target as HTMLInputElement).value;

    // handle checkbox specially
    if ((target as HTMLInputElement).type === 'checkbox') {
      value = (target as HTMLInputElement).checked;
    }

    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <HostProfileHeader profileData={profileData} isEditing={isEditing} setIsEditing={setIsEditing} />

      {/* Quick Stats */}
      <ProfileStats profileData={profileData} />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}

        <div className="p-6">
          {/* Personal Information Tab */}
          <PersonalTab activeTab={activeTab} profileData={profileData} isEditing={isEditing} handleInputChange={handleInputChange} />

          {/* Business Details Tab */}
          <BusinessTab activeTab={activeTab} profileData={profileData} isEditing={isEditing} handleInputChange={handleInputChange} />

          {/* Hosting Preferences Tab */}
          <PreferenceTab activeTab={activeTab} profileData={profileData} isEditing={isEditing} handleInputChange={handleInputChange} />

          {/* Verification Tab */}
          <VerificationTab profileData={profileData} activeTab={activeTab} />

          {/* Security Tab */}
          <SecurityTab activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}
