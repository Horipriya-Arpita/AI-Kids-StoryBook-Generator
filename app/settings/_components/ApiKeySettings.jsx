"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { FiKey, FiSave, FiCheckCircle, FiAlertCircle, FiExternalLink } from "react-icons/fi";
import { toast } from "react-hot-toast";

function ApiKeySettings({ onUpdate }) {
  const [geminiKey, setGeminiKey] = useState("");
  const [huggingFaceKey, setHuggingFaceKey] = useState("");
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasHuggingFaceKey, setHasHuggingFaceKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState({ gemini: false, huggingface: false });
  const [fetchingKeys, setFetchingKeys] = useState(true);

  useEffect(() => {
    fetchApiKeyStatus();
  }, []);

  const fetchApiKeyStatus = async () => {
    try {
      const response = await fetch("/api/user/api-keys");
      const data = await response.json();
      setHasGeminiKey(data.hasGeminiKey);
      setHasHuggingFaceKey(data.hasHuggingFaceKey);
    } catch (error) {
      console.error("Failed to fetch API key status:", error);
    } finally {
      setFetchingKeys(false);
    }
  };

  const validateApiKey = async (apiKey, provider) => {
    setValidating({ ...validating, [provider]: true });

    try {
      const response = await fetch("/api/user/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, provider }),
      });

      const data = await response.json();

      if (data.isValid) {
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(`Failed to validate ${provider} API key`);
      return false;
    } finally {
      setValidating({ ...validating, [provider]: false });
    }
  };

  const handleSaveKeys = async (skipValidation = false) => {
    if (!geminiKey && !huggingFaceKey) {
      toast.error("Please enter at least one API key");
      return;
    }

    setLoading(true);

    try {
      // Basic format validation (no API calls)
      if (geminiKey && (!geminiKey.startsWith("AIza") || geminiKey.length !== 39)) {
        toast.error("Invalid Gemini API key format. Keys should start with 'AIza' and be 39 characters long.");
        setLoading(false);
        return;
      }

      if (huggingFaceKey && (!huggingFaceKey.startsWith("hf_") || huggingFaceKey.length < 20)) {
        toast.error("Invalid HuggingFace API key format. Keys should start with 'hf_'.");
        setLoading(false);
        return;
      }

      // Save keys
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiApiKey: geminiKey || null,
          huggingFaceApiKey: huggingFaceKey || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("API keys saved successfully!");
        setGeminiKey("");
        setHuggingFaceKey("");
        await fetchApiKeyStatus();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Failed to save API keys");
      }
    } catch (error) {
      toast.error("Failed to save API keys");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKeys = async () => {
    if (!confirm("Are you sure you want to delete your API keys?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/api-keys", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("API keys deleted successfully");
        setHasGeminiKey(false);
        setHasHuggingFaceKey(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Failed to delete API keys");
      }
    } catch (error) {
      toast.error("Failed to delete API keys");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">API Key Configuration</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Add your own API keys to create unlimited stories for free. Keys are validated by format only - they'll be tested when you create your first story.
        </p>
      </div>

      {/* Current Status */}
      {!fetchingKeys && (hasGeminiKey || hasHuggingFaceKey) && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl mt-0.5" />
            <div>
              <h3 className="font-bold text-green-700 dark:text-green-300 mb-1">
                API Keys Configured
              </h3>
              <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                {hasGeminiKey && <li>✓ Gemini API key configured</li>}
                {hasHuggingFaceKey && <li>✓ HuggingFace API key configured</li>}
              </ul>
              <Button
                size="sm"
                color="danger"
                variant="light"
                onPress={handleDeleteKeys}
                className="mt-2"
                isLoading={loading}
              >
                Delete API Keys
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Forms */}
      <div className="space-y-4 mb-6">
        {/* Gemini API Key */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FiKey className="inline mr-2" />
            Google Gemini API Key
          </label>
          <Input
            type="password"
            placeholder={hasGeminiKey ? "••••••••••••••••" : "Enter your Gemini API key"}
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            endContent={
              hasGeminiKey && !geminiKey ? (
                <FiCheckCircle className="text-green-500" />
              ) : null
            }
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Used for story text generation. Format: AIza... (39 characters)
          </p>
        </div>

        {/* HuggingFace API Key */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FiKey className="inline mr-2" />
            HuggingFace API Key
          </label>
          <Input
            type="password"
            placeholder={
              hasHuggingFaceKey
                ? "••••••••••••••••"
                : "Enter your HuggingFace API key"
            }
            value={huggingFaceKey}
            onChange={(e) => setHuggingFaceKey(e.target.value)}
            endContent={
              hasHuggingFaceKey && !huggingFaceKey ? (
                <FiCheckCircle className="text-green-500" />
              ) : null
            }
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Used for story image generation. Format: hf_... (starts with hf_)
          </p>
        </div>
      </div>

      {/* Save Button */}
      <Button
        color="primary"
        size="lg"
        className="w-full mb-6"
        onPress={handleSaveKeys}
        isLoading={loading}
        isDisabled={!geminiKey && !huggingFaceKey}
        startContent={<FiSave />}
      >
        {loading ? "Saving..." : "Save API Keys"}
      </Button>

      {/* Instructions */}
      <Accordion variant="bordered">
        <AccordionItem
          key="gemini-instructions"
          title="How to get a free Gemini API key"
          startContent={<FiKey className="text-blue-500" />}
        >
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Visit{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                Google AI Studio
                <FiExternalLink className="text-xs" />
              </a>
            </li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy the generated API key</li>
            <li>Paste it in the field above and save</li>
          </ol>
          <p className="text-xs text-gray-500 mt-3">
            Note: Gemini API has a generous free tier with no credit card required
          </p>
        </AccordionItem>

        <AccordionItem
          key="huggingface-instructions"
          title="How to get a free HuggingFace API key"
          startContent={<FiKey className="text-orange-500" />}
        >
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Visit{" "}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                HuggingFace Tokens
                <FiExternalLink className="text-xs" />
              </a>
            </li>
            <li>Sign in or create a free account</li>
            <li>Click "New token"</li>
            <li>Give it a name and select "Read" access</li>
            <li>Copy the generated token</li>
            <li>Paste it in the field above and save</li>
          </ol>
          <p className="text-xs text-gray-500 mt-3">
            Note: HuggingFace has a free tier for API access
          </p>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export default ApiKeySettings;
