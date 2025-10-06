export default function TabNavigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tabId: string) => void; }) {
    const tabs = [
        { id: "personal", label: "Personal Info", icon: "👤" },
        { id: "business", label: "Business Details", icon: "🏢" },
        { id: "preferences", label: "Hosting Preferences", icon: "⚙️" },
        { id: "verification", label: "Verification", icon: "✅" },
        { id: "security", label: "Security", icon: "🔒" }
    ];
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
    );
}