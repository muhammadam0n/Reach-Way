import React, { useState } from "react";
import Container from "../../Components/Container";
import MultiPlatformDashboard from "./Components/MultiPlatformDashboard";
import PostAnalytics from "./Components/PostAnalytics";
import { IMAGES } from "../../Utils/images";
import Chart from "./Components/Chart";
import DropDown from "../../Components/DropDown";
import { months } from "../../Utils/DummyData";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [postSearch, setPostSearch] = useState("");

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "posts", name: "Posts Analytics", icon: "📝" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <MultiPlatformDashboard />;
      case "posts":
        return <PostAnalytics searchTerm={postSearch} />;
      default:
        return null;
    }
  };

  return (
    <Container>
      <div className="flex flex-col w-full">
        {/* Tab Navigation */}
        <div className="w-full mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Controls per tab */}
        {activeTab === "overview" && (
          <div className="w-full flex items-center justify-end mb-6">
            <DropDown
              selectKey="Month"
              className="w-auto bg-whiteColor appearance-none outline-none text14 shadow-custom rounded-lg px-6 py-2"
              selectValue={months}
            />
          </div>
        )}

        {activeTab === "posts" && (
          <div className="w-full flex items-center justify-end mb-6">
            <input
              type="text"
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-custom"
            />
          </div>
        )}

        {/* Tab Content */}
        <div className="w-full">
          {renderTabContent()}
        </div>
      </div>
    </Container>
  );
};

export default Analytics;
