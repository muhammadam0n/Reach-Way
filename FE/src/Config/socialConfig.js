// Social Media Integration Configuration
const getOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

export const socialConfig = {
  // Facebook Configuration
  facebook: {
    appId: "9099617093459439",
    version: "v18.0",
    redirectUri: "http://localhost:3001", // Using HTTP for local development
    scope: "pages_show_list,pages_manage_posts,pages_read_engagement,pages_read_user_content,instagram_basic,instagram_content_publish"
  },
  
  // LinkedIn Configuration
  linkedin: {
    clientId: "77q0wyhcsxoutt",
    // Must exactly match the value configured in LinkedIn Developer Portal
    redirectUri: `${getOrigin()}/linkedin`,
    // Minimal, valid scopes for profile read and posting as member
    scope: "r_liteprofile r_emailaddress w_member_social"
  },
  
  // Twitter Configuration
  twitter: {
    apiKey: import.meta.env.VITE_TWITTER_API_KEY || "your_twitter_api_key_here"
  },
  
  // Instagram Configuration
  instagram: {
    apiKey: import.meta.env.VITE_INSTAGRAM_API_KEY || "your_instagram_api_key_here"
  }
};

// Helper function to get Facebook login URL
export const getFacebookLoginUrl = () => {
  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${socialConfig.facebook.appId}&redirect_uri=${encodeURIComponent(socialConfig.facebook.redirectUri)}&scope=${encodeURIComponent(socialConfig.facebook.scope)}`;
};

// Helper function to get LinkedIn auth URL
export const getLinkedInAuthUrl = () => {
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${socialConfig.linkedin.clientId}&redirect_uri=${encodeURIComponent(socialConfig.linkedin.redirectUri)}&scope=${encodeURIComponent(socialConfig.linkedin.scope)}`;
};
