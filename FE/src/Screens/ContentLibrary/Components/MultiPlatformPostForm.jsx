import React, { useState, useEffect } from "react";
import { UploadImage } from "../../../Components/UploadImage";
import { Button } from "../../../Components/Button";
import { showToast } from "../../../Components/Toast";
import api from "../../../api/AxiosInterceptor";
import { IMAGES } from "../../../Utils/images";

const MultiPlatformPostForm = () => {
  const [formData, setFormData] = useState({
    description: "",
    image: [],
    scheduledDateTime: "",
    selectedAccounts: []
  });

  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const response = await api.get({
        url: `/api/multi-platform/accounts/${userId}`
      });

      if (response.success) {
        setSocialAccounts(response.accounts);
      }
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      showToast({ message: "Failed to fetch social accounts", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (files) => {
    setFormData(prev => ({ ...prev, image: files }));
  };

  const handleAccountSelection = (accountId, isSelected) => {
    setFormData(prev => {
      if (isSelected) {
        return {
          ...prev,
          selectedAccounts: [...prev.selectedAccounts, accountId]
        };
      } else {
        return {
          ...prev,
          selectedAccounts: prev.selectedAccounts.filter(id => id !== accountId)
        };
      }
    });
  };

  const handleSelectAllPlatform = (platform, isSelected) => {
    const platformAccounts = socialAccounts.filter(account => account.platform === platform);
    const platformAccountIds = platformAccounts.map(account => account._id);

    setFormData(prev => {
      if (isSelected) {
        const newSelected = [...prev.selectedAccounts];
        platformAccountIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return { ...prev, selectedAccounts: newSelected };
      } else {
        return {
          ...prev,
          selectedAccounts: prev.selectedAccounts.filter(id => !platformAccountIds.includes(id))
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showToast({ message: "Please enter a description", isError: true });
      return;
    }

    if (formData.selectedAccounts.length === 0) {
      showToast({ message: "Please select at least one account", isError: true });
      return;
    }

    try {
      setPosting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("userId", localStorage.getItem("userId"));
      formDataToSend.append("description", formData.description);
      formDataToSend.append("selectedAccounts", JSON.stringify(formData.selectedAccounts));

      if (formData.image.length > 0) {
        formDataToSend.append("image", formData.image[0].file);
      }

      if (formData.scheduledDateTime) {
        formDataToSend.append("scheduledDateTime", formData.scheduledDateTime);
      }

      const response = await api.post({
        url: "multi-platform/post",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.success) {
        showToast({ message: response.message, isError: false });
        
        // Reset form
        setFormData({
          description: "",
          image: [],
          scheduledDateTime: "",
          selectedAccounts: []
        });
      } else {
        showToast({ message: "Failed to post", isError: true });
      }
    } catch (error) {
      console.error("Error posting to multiple platforms:", error);
      showToast({ message: "Error posting to platforms", isError: true });
    } finally {
      setPosting(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "facebook":
        return IMAGES.FACEBOOK;
      case "instagram":
        return IMAGES.INSTA;
      case "linkedin":
        return IMAGES.LINKEDIN;
      case "twitter":
        return IMAGES.TWITTER;
      case "tiktok":
        return "https://cdn-icons-png.flaticon.com/512/3938/3938056.png"; // TikTok icon
      case "reddit":
        return "https://cdn-icons-png.flaticon.com/512/3670/3670157.png"; // Reddit icon
      default:
        return IMAGES.CHAIN;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "facebook":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "instagram":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "linkedin":
        return "bg-blue-600 text-white border-blue-700";
      case "twitter":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "tiktok":
        return "bg-black text-white border-gray-800";
      case "reddit":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-custom">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Multi-Platform Post</h2>
        <p className="text-gray-600">Post to multiple social media accounts simultaneously</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Social Accounts Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Select Accounts</h3>
          
          {socialAccounts.length === 0 ? (
            <div className="text-center py-8">
              <img src={IMAGES.CHAIN} alt="No accounts" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 mb-4">No social media accounts connected</p>
              <Button 
                btnname="Connect Accounts" 
                onPress={() => showToast({ message: "Navigate to Integrations to connect accounts", isError: false })}
                className="bg-blue-600 hover:bg-blue-700"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Platform Quick Select */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from(new Set(socialAccounts.map(acc => acc.platform))).map(platform => {
                  const platformAccounts = socialAccounts.filter(acc => acc.platform === platform);
                  const selectedCount = formData.selectedAccounts.filter(id => 
                    platformAccounts.some(acc => acc._id === id)
                  ).length;
                  const isAllSelected = selectedCount === platformAccounts.length;
                  
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handleSelectAllPlatform(platform, !isAllSelected)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        isAllSelected 
                          ? getPlatformColor(platform)
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={getPlatformIcon(platform)} 
                          alt={platform} 
                          className="w-5 h-5"
                        />
                        <span className="capitalize">{platform}</span>
                        <span className="text-sm">({selectedCount}/{platformAccounts.length})</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Individual Account Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {socialAccounts.map(account => {
                  const isSelected = formData.selectedAccounts.includes(account._id);
                  
                  return (
                    <div
                      key={account._id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleAccountSelection(account._id, !isSelected)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleAccountSelection(account._id, !isSelected)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        
                        <div className="flex items-center gap-2">
                          <img 
                            src={getPlatformIcon(account.platform)} 
                            alt={account.platform} 
                            className="w-6 h-6"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {account.accountName}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {account.accountType} • {account.platform}
                            </p>
                            {account.followers > 0 && (
                              <p className="text-xs text-gray-400">
                                {account.followers.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="What's on your mind? This will be posted to all selected accounts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-500">
                {formData.description.length}/2000 characters
              </span>
              <span className="text-sm text-gray-500">
                {formData.selectedAccounts.length} account(s) selected
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (Optional)
            </label>
            <UploadImage
              onChange={handleImageChange}
              value={formData.image}
              multiple={false}
              accept="image/*"
            />
          </div>

          {/* Scheduling */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSchedule}
                onChange={(e) => setShowSchedule(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Schedule Post</span>
            </label>

            {showSchedule && (
              <input
                type="datetime-local"
                value={formData.scheduledDateTime}
                onChange={(e) => handleInputChange("scheduledDateTime", e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            btnname={posting ? "Posting..." : "Post to All Platforms"}
            disabled={posting || formData.selectedAccounts.length === 0}
            className={`px-8 py-3 ${
              posting || formData.selectedAccounts.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          />
        </div>
      </form>

      {/* Selected Accounts Summary */}
      {formData.selectedAccounts.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Posting Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Array.from(new Set(socialAccounts
              .filter(acc => formData.selectedAccounts.includes(acc._id))
              .map(acc => acc.platform)
            )).map(platform => {
              const platformAccounts = socialAccounts.filter(acc => 
                acc.platform === platform && formData.selectedAccounts.includes(acc._id)
              );
              
              return (
                <div key={platform} className="flex items-center gap-2 text-sm">
                  <img 
                    src={getPlatformIcon(platform)} 
                    alt={platform} 
                    className="w-4 h-4"
                  />
                  <span className="capitalize font-medium">{platform}:</span>
                  <span className="text-blue-700">
                    {platformAccounts.length} account(s)
                  </span>
                </div>
              );
            })}
          </div>
          {formData.scheduledDateTime && (
            <div className="mt-2 text-sm text-blue-700">
              📅 Scheduled for: {formatDate(formData.scheduledDateTime)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiPlatformPostForm;
