import { useState, useEffect } from "react";
import HostProfileHeader from "./HostProfile/HostProfileHeader";
import TabNavigation from "./HostProfile/TabNavigation";
import PersonalTab from "./HostProfile/PersonalTab";
import BusinessTab from "./HostProfile/BuisnessTab";
import SecurityTab from "./HostProfile/SecurityTab";
import PreferenceTab from "./HostProfile/PreferenceTab";
import VerificationTab from "./HostProfile/VerificationTab";
import type { ProfileData } from "./types";
import BaseURL from "@/../../BaseURL.ts";

export default function HostProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    language: "English",
    
    // Address
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    
    // Host Information
    hostSince: "",
    responseTime: "Within 1 hour",
    responseRate: "98%",
    bio: "",
    
    // Business Details
    businessName: "",
    gstNumber: "",
    panNumber: "",
    bankAccount: "",
    ifscCode: "",
    
    // Preferences
    instantBook: false,
    minRentalPeriod: "4 hours",
    maxRentalPeriod: "30 days",
    cancellationPolicy: "Moderate",
    
    // Verification Status
    emailVerified: false,
    phoneVerified: false,
    identityVerified: false,
    addressVerified: false,
    backgroundCheck: false
  });

  // Load profile data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('hostProfileData');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile) as ProfileData;
        setProfileData(parsedProfile);
        setLoading(false);
      } catch (err) {
        console.error("Error parsing saved profile:", err);
      }
    }
  }, []);

  // Fetch profile data from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BaseURL}/api/profile`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json() as {
          id: string;
          name: string;
          email: string;
          emailVerified: boolean;
          image: string | null;
          createdAt: string;
        };
        
        // Split name into first and last name
        const nameParts = data.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setProfileData((prev) => {
          const updatedProfile = {
            ...prev,
            firstName,
            lastName,
            email: data.email,
            emailVerified: data.emailVerified || false,
            hostSince: data.createdAt
              ? new Date(data.createdAt).toISOString().split("T")[0]
              : "",
          };
          // Save to localStorage
          localStorage.setItem('hostProfileData', JSON.stringify(updatedProfile));
          return updatedProfile;
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = target.name;
    let value: string | boolean = (target as HTMLInputElement).value;

    // handle checkbox specially
    if ((target as HTMLInputElement).type === 'checkbox') {
      value = (target as HTMLInputElement).checked;
    }

    setProfileData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      // Save to localStorage whenever data changes
      localStorage.setItem('hostProfileData', JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <HostProfileHeader profileData={profileData} isEditing={isEditing} setIsEditing={setIsEditing} />


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
