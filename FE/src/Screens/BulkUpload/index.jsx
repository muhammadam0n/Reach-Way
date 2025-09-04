import React, { useState, useEffect } from "react";
import Container from "../../Components/Container";
import { format } from 'date-fns';
import { IMAGES } from "../../Utils/images";
import { showToast } from "../../Components/Toast";

const BulkUpload = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkPosts, setBulkPosts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/posts", { method: "GET" });
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("[ERROR]:", err);
      showToast({ message: "Failed to fetch posts", isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const getPostStatus = (post) => {
    const now = new Date();
    const scheduledTime = post.scheduledDateTime ? new Date(post.scheduledDateTime) : null;
    if (post.status === "posted") return "Posted";
    if (scheduledTime && now >= scheduledTime) return "Pending";
    return scheduledTime ? "Scheduled" : "Posted";
  };

  const statusClass = (status) => {
    if (status === "Posted") return "bg-green-100 text-green-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      parseCSV(file);
    } else {
      showToast({ message: "Please upload a valid CSV file", isError: true });
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedPosts = lines.slice(1).filter(line => line.trim()).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const post = {};
        headers.forEach((header, i) => {
          post[header.toLowerCase()] = values[i] || '';
        });
        post.id = index;
        return post;
      });

      setBulkPosts(parsedPosts);
      setShowUploadModal(true);
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    if (bulkPosts.length === 0) return;

    setUploading(true);
    try {
      // Process each post
      for (const post of bulkPosts) {
        const formData = new FormData();
        formData.append("description", post.description || post.caption || post.message || "");
        formData.append("platform", post.platform || "facebook");
        formData.append("date", post.date || new Date().toISOString().split('T')[0]);
        formData.append("time", post.time || "12:00");
        formData.append("userId", localStorage.getItem("userId") || "1");
        
        // Handle image URL if provided
        if (post.image_url || post.image) {
          // Convert URL to blob for upload
          try {
            const response = await fetch(post.image_url || post.image);
            const blob = await response.blob();
            formData.append("image", blob, "image.jpg");
          } catch (error) {
            console.log("Image processing failed for:", post.image_url);
          }
        }

        await fetch("http://localhost:5000/api/posts", {
          method: "POST",
          body: formData
        });
      }

      showToast({ message: `Successfully uploaded ${bulkPosts.length} posts`, isError: false });
      setShowUploadModal(false);
      setBulkPosts([]);
      setCsvFile(null);
      fetchPosts();
    } catch (error) {
      console.error("Bulk upload error:", error);
      showToast({ message: "Bulk upload failed", isError: true });
    } finally {
      setUploading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const template = `description,platform,date,time,image_url
"Your post description here",facebook,2024-01-15,14:30,https://example.com/image.jpg
"Another post description",instagram,2024-01-16,10:00,https://example.com/image2.jpg
"LinkedIn post",linkedin,2024-01-17,16:00,https://example.com/image3.jpg`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_posts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filtered = posts.filter(p => (platform ? p.platform === platform : true));

  return (
    <Container>
      <div className="md:py-8 py-5">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Bulk Post Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule and manage multiple social media posts across all platforms
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={downloadCSVTemplate}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border transition-colors"
            >
              📥 Download Template
            </button>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-primaryColor hover:bg-primaryColor/90 text-white rounded-lg transition-colors"
            >
              📤 Bulk Upload
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.filter(p => getPostStatus(p) === "Posted").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.filter(p => getPostStatus(p) === "Scheduled").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.filter(p => getPostStatus(p) === "Pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primaryColor"
            >
              <option value="">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <button 
              onClick={fetchPosts} 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filtered.length} of {posts.length} posts
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {platform ? `No posts found for ${platform}` : "Start by creating your first post or uploading a bulk file"}
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-primaryColor hover:bg-primaryColor/90 text-white rounded-lg transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => {
              const status = getPostStatus(post);
              return (
                <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                  {post.image ? (
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={post.image} 
                        alt="post" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📷</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusClass(status)}`}>
                        {status}
                      </span>
                      <span className="text-xs capitalize px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {post.platform}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-3 mb-4 leading-relaxed">
                      {post.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        {post.scheduledDateTime
                          ? `Scheduled: ${format(new Date(post.scheduledDateTime), 'PP p')}`
                          : post.date 
                            ? `Posted: ${format(new Date(post.date), 'PP')}`
                          : 'Posted'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors">
                          ✏️ Edit
                        </button>
                        <button className="px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bulk Upload Posts</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Upload a CSV file with multiple posts to schedule them all at once
                </p>
              </div>
              
              <div className="p-6">
                {!csvFile ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="px-6 py-2 bg-primaryColor hover:bg-primaryColor/90 text-white rounded-lg cursor-pointer transition-colors"
                    >
                      Choose CSV File
                    </label>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        CSV File: {csvFile.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bulkPosts.length} posts found
                      </p>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Description</th>
                            <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Platform</th>
                            <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Date</th>
                            <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkPosts.slice(0, 10).map((post, index) => (
                            <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                              <td className="px-4 py-2 text-gray-900 dark:text-white">
                                {post.description || post.caption || post.message || "N/A"}
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {post.platform || "N/A"}
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {post.date || "N/A"}
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {post.time || "N/A"}
                              </td>
                            </tr>
                          ))}
                          {bulkPosts.length > 10 && (
                            <tr>
                              <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                                ... and {bulkPosts.length - 10} more posts
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setCsvFile(null);
                    setBulkPosts([]);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {csvFile && (
                  <button
                    onClick={handleBulkUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-primaryColor hover:bg-primaryColor/90 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {uploading ? "Uploading..." : `Upload ${bulkPosts.length} Posts`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default BulkUpload;