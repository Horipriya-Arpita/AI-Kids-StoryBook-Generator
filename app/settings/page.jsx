"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import ApiKeySettings from "./_components/ApiKeySettings";
import UsageStats from "./_components/UsageStats";

function Settings() {
  const { userId } = useAuth();
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/store-user").catch((err) =>
      console.error("User sync failed:", err)
    );
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/user/usage");
      const data = await response.json();
      setUsageData(data);
    } catch (error) {
      console.error("Failed to fetch usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUsageData();
    }
  }, [userId]);

  return (
    <div className="p-10 md:px-20 lg:px-40 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your API keys and view your usage statistics
        </p>

        {/* Usage Stats */}
        <UsageStats
          usageData={usageData}
          loading={loading}
          onRefresh={fetchUsageData}
        />

        {/* API Key Settings */}
        <ApiKeySettings onUpdate={fetchUsageData} />
      </div>
    </div>
  );
}

export default Settings;
