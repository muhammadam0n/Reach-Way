import React, { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../../api/AxiosInterceptor";
import { showToast } from "../../../Components/Toast";
import { IMAGES } from "../../../Utils/images";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MultiPlatformDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      console.log("Dashboard - User ID:", userId);
      
      if (!userId) {
        showToast({ message: "User ID not found. Please log in again.", isError: true });
        return;
      }
      
      const response = await api.get({
        url: "multi-platform",
        config: { params: { userId } }
      });
      
      console.log("Dashboard response:", response);
      
      if (response.success) {
        setDashboardData(response.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast({ message: "Failed to fetch dashboard data", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const syncInsights = async () => {
    try {
      setSyncing(true);
      const userId = localStorage.getItem("userId");
      const response = await api.post({
        url: "sync-insights",
        data: { userId }
      });
      
      if (response.success) {
        showToast({ message: response.message, isError: false });
        await fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Error syncing insights:", error);
      showToast({ message: "Failed to sync insights", isError: true });
    } finally {
      setSyncing(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPlatformIcon = (platform) => {
    if (!platform) return IMAGES.CHAIN;
    
    switch (platform) {
      case "facebook":
        return IMAGES.FACEBOOK;
      case "instagram":
        return IMAGES.INSTA;
      case "linkedin":
        return IMAGES.LINKEDIN;
      case "twitter":
        return IMAGES.TWITTER;
      default:
        return IMAGES.CHAIN;
    }
  };

  const getPlatformColor = (platform) => {
    if (!platform) return "bg-gray-100 text-gray-800 border-gray-200";
    
    switch (platform) {
      case "facebook":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "instagram":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "linkedin":
        return "bg-blue-600 text-white border-blue-700";
      case "twitter":
        return "bg-sky-100 text-sky-800 border-sky-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get chart data based on selected month
  const getChartData = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    
    if (selectedMonth === "all") {
      return {
        labels: months,
        datasets: [
          {
            label: "Instagram",
            data: [6000, 8000, 12000, 16000, 18000, 20000, 21000],
            borderColor: "rgb(236, 72, 153)",
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(236, 72, 153)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "Facebook",
            data: [4500, 6000, 9000, 12000, 14000, 16000, 17500],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "LinkedIn",
            data: [2000, 3000, 4500, 6000, 7500, 9000, 10500],
            borderColor: "rgb(37, 99, 235)",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(37, 99, 235)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "Twitter",
            data: [1500, 2200, 3200, 4500, 5800, 7200, 8500],
            borderColor: "rgb(14, 165, 233)",
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(14, 165, 233)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          }
        ]
      };
    } else {
      const monthIndex = months.indexOf(selectedMonth);
      const monthData = {
        Instagram: [21000],
        Facebook: [17500],
        LinkedIn: [10500],
        Twitter: [8500]
      };
      
      return {
        labels: [selectedMonth],
        datasets: [
          {
            label: "Instagram",
            data: [monthData.Instagram[0]],
            borderColor: "rgb(236, 72, 153)",
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(236, 72, 153)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "Facebook",
            data: [monthData.Facebook[0]],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "LinkedIn",
            data: [monthData.LinkedIn[0]],
            borderColor: "rgb(37, 99, 235)",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(37, 99, 235)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "Twitter",
            data: [monthData.Twitter[0]],
            borderColor: "rgb(14, 165, 233)",
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            tension: 0.3,
            pointBackgroundColor: "rgb(14, 165, 233)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          }
        ]
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fallback to dummy data if no real data is available
  const dummyData = {
    totalAccounts: 4,
    totalPosts: 156,
    totalEngagement: 2847,
    totalReach: 45620,
    totalFollowers: 6660,
    pageViews: 6660,
    impressions: 6660,
    newFollowers: 6660,
    postsThisMonth: 23,
    engagementRate: 6.2,
    topPerformingPost: {
      platform: "instagram",
      description: "Our latest product showcase with amazing results!",
      likes: 234,
      comments: 45,
      shares: 12,
      reach: 1200,
      date: "2024-01-15"
    },
    recentPosts: [
      {
        id: 1,
        platform: "facebook",
        description: "Exciting news about our new features!",
        likes: 89,
        comments: 12,
        shares: 8,
        reach: 450,
        engagement: 109,
        engagementRate: 24.2,
        date: "2024-01-20",
        status: "published"
      },
      {
        id: 2,
        platform: "instagram",
        description: "Behind the scenes of our creative process",
        likes: 156,
        comments: 23,
        shares: 5,
        reach: 780,
        engagement: 184,
        engagementRate: 23.6,
        date: "2024-01-19",
        status: "published"
      },
      {
        id: 3,
        platform: "linkedin",
        description: "Professional insights and industry trends",
        likes: 67,
        comments: 8,
        shares: 15,
        reach: 320,
        engagement: 90,
        engagementRate: 28.1,
        date: "2024-01-18",
        status: "published"
      },
      {
        id: 4,
        platform: "twitter",
        description: "Quick updates and community engagement",
        likes: 45,
        comments: 6,
        shares: 3,
        reach: 210,
        engagement: 54,
        engagementRate: 25.7,
        date: "2024-01-17",
        status: "published"
      }
    ],
    platformBreakdown: [
      { platform: "facebook", posts: 45, engagement: 890, reach: 15600 },
      { platform: "instagram", posts: 67, engagement: 1240, reach: 18900 },
      { platform: "linkedin", posts: 23, engagement: 456, reach: 7800 },
      { platform: "twitter", posts: 21, engagement: 261, reach: 3320 }
    ],
    accountStatus: [
      {
        id: 1,
        platform: "facebook",
        accountName: "My Facebook Page",
        accountType: "page",
        followers: 1200,
        isActive: true
      },
      {
        id: 2,
        platform: "instagram",
        accountName: "My Instagram",
        accountType: "business",
        followers: 850,
        isActive: true
      }
    ],
    performanceTrends: [
      { date: "2024-01-14", reach: 1200, engagement: 150, posts: 2 },
      { date: "2024-01-15", reach: 1400, engagement: 180, posts: 3 },
      { date: "2024-01-16", reach: 1100, engagement: 120, posts: 1 },
      { date: "2024-01-17", reach: 1600, engagement: 200, posts: 4 },
      { date: "2024-01-18", reach: 1300, engagement: 160, posts: 2 },
      { date: "2024-01-19", reach: 1800, engagement: 220, posts: 3 },
      { date: "2024-01-20", reach: 1500, engagement: 190, posts: 2 }
    ],
    insights: {
      bestPerformingPlatform: "Instagram",
      totalFollowers: 57500,
      averagePostsPerDay: 2.4,
      engagementRate: 6.8
    }
  };

  const dataToUse = dashboardData || dummyData;

  // Add defensive check to ensure dataToUse is not null/undefined
  if (!dataToUse) {
    return (
      <div className="text-center py-12">
        <img src={IMAGES.CHAIN} alt="No accounts" className="w-24 h-24 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-6">Unable to load dashboard data</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!dashboardData && !dummyData) {
    return (
      <div className="text-center py-12">
        <img src={IMAGES.CHAIN} alt="No accounts" className="w-24 h-24 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Social Media Accounts Connected</h3>
        <p className="text-gray-600 mb-6">Connect your social media accounts to see analytics and insights</p>
        <button
          onClick={() => showToast({ message: "Navigate to Integrations to connect accounts", isError: false })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Sync Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-Platform Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights from all your social media accounts</p>
        </div>
        <button
          onClick={syncInsights}
          disabled={syncing}
          className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-sm ${
            syncing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white hover:shadow-md"
          }`}
        >
          {syncing ? "Syncing..." : "🔄 Sync Insights"}
        </button>
      </div>

      {/* Performance Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-custom border border-gray-100">
        <h3 className="text-lg font-semibold mb-6 text-gray-900">Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(dataToUse.totalFollowers || 6660)}</p>
            <p className="text-sm text-gray-600 mb-1">Followers</p>
            <p className="text-xs text-red-500">-32.66%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">👁️</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(dataToUse.pageViews || 6660)}</p>
            <p className="text-sm text-gray-600 mb-1">Page Views</p>
            <p className="text-xs text-red-500">-32.66%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(dataToUse.impressions || 6660)}</p>
            <p className="text-sm text-gray-600 mb-1">Impressions</p>
            <p className="text-xs text-red-500">-32.66%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(dataToUse.totalReach || 45620)}</p>
            <p className="text-sm text-gray-600 mb-1">Reach</p>
            <p className="text-xs text-red-500">-32.66%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(dataToUse.totalEngagement || 2847)}</p>
            <p className="text-sm text-gray-600 mb-1">Engagement</p>
            <p className="text-xs text-red-500">-32.66%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">🆕</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(dataToUse.newFollowers || 6660)}</p>
            <p className="text-sm text-gray-600 mb-1">New Followers</p>
            <p className="text-xs text-red-500">-32.66%</p>
          </div>
        </div>
      </div>

      {/* Total Followers Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-custom border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Followers</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter by:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Months</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
            </select>
          </div>
        </div>
        <div className="h-80">
          <Line
            data={getChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: selectedMonth === "all" ? 25000 : 22000,
                  ticks: {
                    callback: function(value) {
                      return value + 'k';
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              },
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                      size: 12
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.dataset.label + ': ' + context.parsed.y + ' followers';
                    }
                  }
                }
              },
              elements: {
                point: {
                  hoverBackgroundColor: function(context) {
                    return context.dataset.borderColor;
                  },
                  hoverBorderColor: "#fff",
                  hoverBorderWidth: 2
                }
              }
            }}
          />
        </div>
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Instagram</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Facebook</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">LinkedIn</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-sky-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Twitter</span>
          </div>
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="bg-white p-6 rounded-lg shadow-custom border border-gray-100">
        <h3 className="text-lg font-semibold mb-6 text-gray-900">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <img src={IMAGES.INSTA} alt="Instagram" className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-2">
              {dataToUse.insights?.bestPerformingPlatform || 'Instagram'}
            </p>
            <p className="text-sm text-gray-600">Best Performing Platform</p>
            <p className="text-xs text-green-500 mt-1">+15.2% this month</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-2">
              {(dataToUse.insights?.totalFollowers || 57500).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Followers</p>
            <p className="text-xs text-green-500 mt-1">+8.7% this month</p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mb-2">
              {dataToUse.insights?.averagePostsPerDay?.toFixed(1) || '2.4'}
            </p>
            <p className="text-sm text-gray-600">Avg Posts/Day</p>
            <p className="text-xs text-green-500 mt-1">+12.3% this month</p>
          </div>
          
          <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mb-2">
              {dataToUse.insights?.engagementRate || '6.8'}%
            </p>
            <p className="text-sm text-gray-600">Avg Engagement Rate</p>
            <p className="text-xs text-green-500 mt-1">+5.1% this month</p>
          </div>
        </div>
        
        {/* Additional Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Top Content Type</h4>
            <p className="text-2xl font-bold text-blue-600">Video Posts</p>
            <p className="text-sm text-gray-600">Generates 3.2x more engagement</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Best Posting Time</h4>
            <p className="text-2xl font-bold text-green-600">7-9 PM</p>
            <p className="text-sm text-gray-600">Peak engagement hours</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Growth Trend</h4>
            <p className="text-2xl font-bold text-purple-600">+12.5%</p>
            <p className="text-sm text-gray-600">Monthly follower growth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiPlatformDashboard;
