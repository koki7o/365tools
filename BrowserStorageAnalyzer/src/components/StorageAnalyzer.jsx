import React, { useState, useEffect } from "react";
import {
  Globe,
  AlertCircle,
  RefreshCw,
  Shield,
  Code,
  Users,
} from "lucide-react";

const TabButton = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      active
        ? "bg-blue-50 text-blue-600 border border-blue-200"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <Icon size={16} />
    {children}
  </button>
);

const StorageAnalyzer = () => {
  const [tabsData, setTabsData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [analysis, setAnalysis] = useState({ dev: "", user: "" });
  const [analyzing, setAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [viewMode, setViewMode] = useState("user"); // 'user' or 'dev'

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    chrome.runtime.sendMessage({ type: "getStorageData" }, (response) => {
      setTabsData(response || []);
    });
  };

  const analyzePrivacy = async (tabData) => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setAnalyzing(true);
    try {
      // Prepare storage data
      const storageData = {
        localStorage: Object.entries(tabData.data.localStorage).map(
          ([key, data]) => ({
            key,
            value: data.value,
            size: data.size,
          })
        ),
        sessionStorage: Object.entries(tabData.data.sessionStorage).map(
          ([key, data]) => ({
            key,
            value: data.value,
            size: data.size,
          })
        ),
      };

      // Developer-focused analysis
      const devResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Analyze the browser storage data from ${
                  tabData.url
                } from a technical perspective:

            Local Storage Keys and Sample Values:
            ${storageData.localStorage
              .slice(0, 5)
              .map((item) => `${item.key}: ${item.value.substring(0, 100)}`)
              .join("\n")}

            Session Storage Keys and Sample Values:
            ${storageData.sessionStorage
              .slice(0, 5)
              .map((item) => `${item.key}: ${item.value.substring(0, 100)}`)
              .join("\n")}

            Provide a detailed technical analysis including:
            1. Data structures and formats in use
            2. Identified frameworks or libraries based on storage patterns
            3. Authentication/session management approach
            4. Caching and state management strategies
            5. User tracking implementation details
            6. Potential security vulnerabilities
            7. Storage efficiency and optimization opportunities
            8. Technical recommendations
            9. Compliance considerations (GDPR, CCPA, etc.)
            10. Security best practices evaluation`,
              },
            ],
          }),
        }
      );

      // User-focused analysis
      const userResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Analyze the browser storage data from ${
                  tabData.url
                } and explain it in simple, non-technical terms for regular users:

            Based on the stored data (number of items: ${
              storageData.localStorage.length +
              storageData.sessionStorage.length
            }), explain:

            1. What kind of information is this website remembering about me?
            2. Is there anything I should be concerned about?
            3. How long does this information stick around?
            4. What's the purpose of storing this information?
            5. How does this compare to similar websites?
            6. What can I do if I want to protect my privacy?
            7. Rate the privacy impact (Low/Medium/High) and explain why.
            8. Simple recommendations for regular users.

            Make the explanation very user-friendly and avoid technical terms.
            Focus on real-world implications and practical advice.`,
              },
            ],
          }),
        }
      );

      const [devData, userData] = await Promise.all([
        devResponse.json(),
        userResponse.json(),
      ]);

      if (devData.error) throw new Error(devData.error.message);
      if (userData.error) throw new Error(userData.error.message);

      setAnalysis({
        dev: devData.choices[0].message.content,
        user: userData.choices[0].message.content,
      });
    } catch (error) {
      setAnalysis({
        dev: `Error analyzing data: ${error.message}`,
        user: `Sorry, we encountered an error while analyzing this website's data. Please try again later.`,
      });
    }
    setAnalyzing(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            Website Storage Analyzer
          </h1>
          <button
            onClick={refreshAllData}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Tabs List */}
        <div className="w-1/3 border-r bg-white p-4">
          <h2 className="text-lg font-semibold mb-4">Active Websites</h2>
          <div className="space-y-2">
            {tabsData.map(([tabId, data]) => (
              <div
                key={tabId}
                onClick={() => {
                  setSelectedTab(data);
                  setAnalysis({ dev: "", user: "" });
                }}
                className={`p-3 rounded-md cursor-pointer border ${
                  selectedTab?.url === data.url
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {data.favicon ? (
                    <img src={data.favicon} alt="" className="w-4 h-4" />
                  ) : (
                    <Globe size={16} />
                  )}
                  <div className="truncate flex-1">
                    <div className="font-medium truncate">
                      {data.title || "Unnamed Tab"}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {data.url}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {Object.keys(data.data.localStorage).length +
                    Object.keys(data.data.sessionStorage).length}{" "}
                  items stored
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="flex-1 p-4">
          {selectedTab ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedTab.title || "Unnamed Tab"}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {selectedTab.url}
                    </div>
                  </div>
                  <button
                    onClick={() => analyzePrivacy(selectedTab)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield size={16} />
                        Analyze Website
                      </>
                    )}
                  </button>
                </div>

                {showApiKeyInput && !apiKey && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-yellow-500 mt-1" size={20} />
                      <div>
                        <h4 className="font-medium">OpenAI API Key Required</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Enter your OpenAI API key to analyze this website's
                          data. The key is stored only in memory and never
                          saved.
                        </p>
                        <input
                          type="password"
                          placeholder="sk-..."
                          className="w-full p-2 border rounded"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(analysis.dev || analysis.user) && (
                  <div>
                    <div className="flex gap-2 mb-4">
                      <TabButton
                        active={viewMode === "user"}
                        onClick={() => setViewMode("user")}
                        icon={Users}
                      >
                        For Users
                      </TabButton>
                      <TabButton
                        active={viewMode === "dev"}
                        onClick={() => setViewMode("dev")}
                        icon={Code}
                      >
                        For Developers
                      </TabButton>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">
                        {viewMode === "dev" ? analysis.dev : analysis.user}
                      </div>
                    </div>
                  </div>
                )}

                {!analysis.dev && !analysis.user && (
                  <div className="text-center text-gray-500 py-8">
                    <Shield size={48} className="mx-auto mb-2" />
                    <p>
                      Click "Analyze Website" to understand what data is being
                      stored
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Globe size={48} className="mx-auto mb-2" />
                <p>Select a website to analyze its storage</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageAnalyzer;
