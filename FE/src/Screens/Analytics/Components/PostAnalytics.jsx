import React, { useState, useEffect, useMemo } from "react";
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

const PostAnalytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [postsAnalytics, setPostsAnalytics] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    platform: "",
    dateRange: "",
    sortBy: "date",
    sortOrder: "desc"
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchDashboardData();
    fetchPostsAnalytics();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get({
        url: "analytics/dashboard",
        config: { params: { userId: localStorage.getItem("userId") } }
      });
      if (response.success) setDashboardData(response.dashboard);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast({ message: "Failed to fetch dashboard data", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsAnalytics = async () => {
    try {
      const response = await api.get({ url: "analytics/posts", config: { params: filter } });
      if (response.success) setPostsAnalytics(response.posts);
    } catch (error) {
      console.error("Error fetching posts analytics:", error);
      showToast({ message: "Failed to fetch posts analytics", isError: true });
    }
  };

  const syncAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.post({ url: "analytics/sync/all" });
      if (response.success) {
        showToast({ message: response.message, isError: false });
        fetchDashboardData();
        fetchPostsAnalytics();
      } else {
        showToast({ message: "Failed to sync analytics", isError: true });
      }
    } catch (error) {
      console.error("Error syncing analytics:", error);
      showToast({ message: "Failed to sync analytics", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (sortBy) => {
    const newSortOrder = filter.sortBy === sortBy && filter.sortOrder === "desc" ? "asc" : "desc";
    setFilter(prev => ({ ...prev, sortBy, sortOrder: newSortOrder }));
  };

  const filteredPosts = useMemo(() => {
    const term = (query || "").toLowerCase().trim();
    if (!term) return postsAnalytics;
    return postsAnalytics.filter(p => (p.description || "").toLowerCase().includes(term));
  }, [postsAnalytics, query]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      {dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Posts</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalPosts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Reach</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.totalReach > 0 ? formatNumber(dashboardData.totalReach) : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Engagement</h3>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.totalEngagement > 0 ? formatNumber(dashboardData.totalEngagement) : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-lg transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Avg Engagement Rate</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData.averageEngagementRate > 0 ? dashboardData.averageEngagementRate.toFixed(2) + "%" : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Analytics Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Posts Analytics</h3>
        <button
          onClick={syncAnalytics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Syncing...
            </>
          ) : (
            <>
              🔄 Sync Analytics
            </>
          )}
        </button>
      </div>

      {/* Platform Performance Chart */}
      {dashboardData && (
        <div className="bg-white p-6 rounded-lg shadow-custom border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Platform Performance</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: Object.keys(dashboardData.platformPerformance || {}),
                datasets: [
                  {
                    label: "Posts",
                    data: Object.values(dashboardData.platformPerformance || {}).map(p => p.posts),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                  },
                  {
                    label: "Reach",
                    data: Object.values(dashboardData.platformPerformance || {}).map(p => p.reach),
                    backgroundColor: "rgba(16, 185, 129, 0.8)",
                  },
                  {
                    label: "Engagement",
                    data: Object.values(dashboardData.platformPerformance || {}).map(p => p.engagement),
                    backgroundColor: "rgba(245, 158, 11, 0.8)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Recent Performance Trend */}
      {dashboardData && (
        <div className="bg-white p-6 rounded-lg shadow-custom border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Recent Performance (Last 30 Days)</h3>
          <div className="h-64">
            <Line
              data={{
                labels: dashboardData.recentPerformance.map(p => formatDate(p.date)),
                datasets: [
                  {
                    label: "Reach",
                    data: dashboardData.recentPerformance.map(p => p.reach),
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.3,
                  },
                  {
                    label: "Engagement",
                    data: dashboardData.recentPerformance.map(p => p.engagement),
                    borderColor: "rgb(16, 185, 129)",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Filters and Posts Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-custom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Posts Analytics</h3>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Platform Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <select
              value={filter.platform}
              onChange={(e) => handleFilterChange("platform", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="tiktok">TikTok</option>
              <option value="reddit">Reddit</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={filter.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSort("reach")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.sortBy === "reach" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Reach {filter.sortBy === "reach" && (filter.sortOrder === "desc" ? "↓" : "↑")}
              </button>
              <button
                onClick={() => handleSort("engagement")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.sortBy === "engagement" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Engagement {filter.sortBy === "engagement" && (filter.sortOrder === "desc" ? "↓" : "↑")}
              </button>
              <button
                onClick={() => handleSort("date")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter.sortBy === "date" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Date {filter.sortBy === "date" && (filter.sortOrder === "desc" ? "↓" : "↑")}
              </button>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reach
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-3">📊</span>
                      <p className="text-lg font-medium mb-2">No posts found</p>
                      <p className="text-sm text-gray-400">Try a different search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.image ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={post.image.startsWith('http') ? post.image : `/uploads/${post.image}`}
                            alt="Post"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 mr-3 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">📷</span>
                          </div>
                        )}
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {post.description || "No description"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        post.platform === "facebook" ? "bg-blue-100 text-blue-800" :
                        post.platform === "instagram" ? "bg-pink-100 text-pink-800" :
                        post.platform === "linkedin" ? "bg-blue-600 text-white" :
                        post.platform === "twitter" ? "bg-sky-100 text-sky-800" :
                        post.platform === "tiktok" ? "bg-black text-white" :
                        post.platform === "reddit" ? "bg-orange-100 text-orange-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {post.platform}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(post.date)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.analytics?.reach > 0 ? (
                        formatNumber(post.analytics.reach)
                      ) : (
                        <span className="text-gray-400 text-xs">No data</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.analytics?.engagement > 0 ? (
                        formatNumber(post.analytics.engagement)
                      ) : (
                        <span className="text-gray-400 text-xs">No data</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.performance?.engagementRate > 0 ? (
                        post.performance.engagementRate.toFixed(2) + "%"
                      ) : (
                        <span className="text-gray-400 text-xs">No data</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Post Analytics Details</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Description</h4>
                <p className="text-gray-900">{selectedPost.description || "No description"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Platform</h4>
                  <p className="text-gray-900 capitalize">{selectedPost.platform}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Date</h4>
                  <p className="text-gray-900">{formatDate(selectedPost.date)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Analytics Overview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(selectedPost.analytics?.reach || 0)}</p>
                    <p className="text-sm text-gray-600">Reach</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatNumber(selectedPost.analytics?.impressions || 0)}</p>
                    <p className="text-sm text-gray-600">Impressions</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(selectedPost.analytics?.engagement || 0)}</p>
                    <p className="text-sm text-gray-600">Engagement</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Engagement Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{formatNumber(selectedPost.analytics?.likes || 0)}</p>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{formatNumber(selectedPost.analytics?.comments || 0)}</p>
                    <p className="text-sm text-gray-600">Comments</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{formatNumber(selectedPost.analytics?.shares || 0)}</p>
                    <p className="text-sm text-gray-600">Shares</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{formatNumber(selectedPost.analytics?.clicks || 0)}</p>
                    <p className="text-sm text-gray-600">Clicks</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xl font-bold text-yellow-600">{selectedPost.performance?.engagementRate?.toFixed(2) || "0"}%</p>
                    <p className="text-sm text-gray-600">Engagement Rate</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xl font-bold text-indigo-600">{selectedPost.performance?.clickThroughRate?.toFixed(2) || "0"}%</p>
                    <p className="text-sm text-gray-600">Click Rate</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <p className="text-xl font-bold text-pink-600">{selectedPost.performance?.reachRate?.toFixed(2) || "0"}%</p>
                    <p className="text-sm text-gray-600">Reach Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAnalytics;
