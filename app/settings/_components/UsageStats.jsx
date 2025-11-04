"use client";
import React from "react";
import { Card, Progress, Button } from "@heroui/react";
import { FiRefreshCw, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function UsageStats({ usageData, loading, onRefresh }) {
  if (loading) {
    return (
      <Card className="mb-8 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!usageData) {
    return null;
  }

  const percentage = (usageData.freeStoriesUsed / usageData.freeStoryLimit) * 100;
  const isLimitReached = usageData.reachedLimit;

  return (
    <Card className="mb-8 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Usage Statistics</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Track your story creation limits and usage
          </p>
        </div>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={onRefresh}
          aria-label="Refresh usage stats"
        >
          <FiRefreshCw className="text-xl" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Free Stories Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Free Stories Used</span>
            <span className="text-sm font-bold">
              {usageData.freeStoriesUsed} / {usageData.freeStoryLimit}
            </span>
          </div>
          <Progress
            value={percentage}
            color={isLimitReached ? "danger" : percentage > 70 ? "warning" : "success"}
            className="mb-2"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {usageData.remainingFreeStories > 0 ? (
              <>
                You have <strong>{usageData.remainingFreeStories}</strong>{" "}
                free {usageData.remainingFreeStories === 1 ? "story" : "stories"} remaining
              </>
            ) : (
              <>
                {usageData.hasCustomKeys ? (
                  "Using your custom API keys for unlimited stories"
                ) : (
                  "Free story limit reached. Add your API keys for unlimited stories."
                )}
              </>
            )}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Stories */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
              Total Stories
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {usageData.totalStories}
            </div>
          </div>

          {/* API Status */}
          <div
            className={`p-4 rounded-lg ${
              usageData.hasCustomKeys
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-orange-50 dark:bg-orange-900/20"
            }`}
          >
            <div
              className={`text-sm mb-1 ${
                usageData.hasCustomKeys
                  ? "text-green-600 dark:text-green-400"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              API Keys Status
            </div>
            <div className="flex items-center gap-2">
              {usageData.hasCustomKeys ? (
                <>
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-2xl" />
                  <span className="font-bold text-green-700 dark:text-green-300">
                    Active
                  </span>
                </>
              ) : (
                <>
                  <FiAlertCircle className="text-orange-600 dark:text-orange-400 text-2xl" />
                  <span className="font-bold text-orange-700 dark:text-orange-300">
                    Not Configured
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {isLimitReached && !usageData.hasCustomKeys && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-red-600 dark:text-red-400 text-xl mt-0.5" />
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-300 mb-1">
                  Free Story Limit Reached
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  You've used all your free stories. Add your own API keys below to
                  continue creating unlimited stories at no cost to you.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default UsageStats;
