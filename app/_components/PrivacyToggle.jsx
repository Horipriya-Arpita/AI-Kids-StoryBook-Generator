"use client";

import { Switch, Chip } from "@heroui/react";
import { useState } from "react";
import { FaGlobe, FaLock } from "react-icons/fa";

export default function PrivacyToggle({ storyId, initialIsPublic, onToggle }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (newValue) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/story/privacy/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newValue }),
      });

      const data = await response.json();

      if (data.success) {
        setIsPublic(newValue);
        if (onToggle) onToggle(newValue);
      } else {
        alert(data.error || "Failed to update privacy settings");
      }
    } catch (error) {
      console.error("Error updating privacy:", error);
      alert("Failed to update privacy settings");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Switch
        isSelected={isPublic}
        onValueChange={handleToggle}
        isDisabled={isUpdating}
        color="success"
        size="lg"
        thumbIcon={({ isSelected, className }) =>
          isSelected ? (
            <FaGlobe className={className} />
          ) : (
            <FaLock className={className} />
          )
        }
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {isPublic ? "Public Story" : "Private Story"}
          </p>
          <p className="text-xs text-gray-500">
            {isPublic
              ? "Visible to everyone on the explore page"
              : "Only you can see this story"}
          </p>
        </div>
      </Switch>

      {isPublic ? (
        <Chip startContent={<FaGlobe />} color="success" variant="flat" size="sm">
          Public
        </Chip>
      ) : (
        <Chip startContent={<FaLock />} color="warning" variant="flat" size="sm">
          Private
        </Chip>
      )}
    </div>
  );
}
