import React, { useEffect, useRef, useState } from "react";
import Container from "../../Components/Container";
import { IMAGES } from "../../Utils/images";
import { AddIntegrations, MyIntegrations } from "../../Utils/DummyData";
import { useSelector } from "react-redux";
import api from "../../api/AxiosInterceptor";
import { showToast } from "../../Components/Toast";
import { socialConfig } from "../../config/socialConfig";

const Integrations = () => {
  const theme = useSelector((state) => state.theme.theme);

  const [socialLogin, setSocialLogin] = useState(null)
  const [userID, setUserID] = useState(null);
  const [pageAccessToken, setPageAccessToken] = useState(null);
  const [pages, setPages] = useState([]);


  // Facebook Login data
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: socialConfig.facebook.appId,
        cookie: true,
        xfbml: true,
        version: socialConfig.facebook.version,
      });
      const storedToken = localStorage.getItem("fbAccessToken");
      if (storedToken) {
        // setIsLoggedIn(true);
        setPageAccessToken(storedToken);
        fetchUserPages(storedToken);
      }
      window.FB.getLoginStatus((response) => {
        if (response.status === "connected") {
          // setIsLoggedIn(true);
          setUserID(response.authResponse.userID || localStorage.getItem("fbUserID"));
          fetchUserPages(response.authResponse.accessToken);
        }
      });
    };

    // Load Facebook SDK with HTTPS
    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);


  // FceBook use Pages
  const fetchUserPages = (userAccessToken) => {
    window.FB.api("/me/accounts", { access_token: userAccessToken }, (response) => {
      if (response.data && response.data.length > 0) {
        const pagesData = response.data.map((page) => ({
          id: page.id,
          name: page.name,
          accessToken: page.access_token,
        }));

        // Store the object in localStorage
        localStorage.setItem("fbPages", JSON.stringify(pagesData));
        setPages(response.data);
      }
    });
  };

  // Save selected Facebook page as an account in backend
  const saveFacebookAccount = async (page) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        showToast({ message: "User not found. Please log in again.", isError: true });
        return;
      }
      const payload = {
        userId,
        platform: "facebook",
        accountType: "page",
        accountName: page.name,
        accountId: page.id,
        accessToken: localStorage.getItem("fbAccessToken"),
        pageId: page.id,
        pageAccessToken: page.accessToken,
      };
      const res = await api.post({ url: "accounts", data: payload });
      if (res.success) {
        showToast({ message: "Facebook page connected", isError: false });
      }
    } catch (err) {
      console.error("Failed to save Facebook account:", err);
      showToast({ message: "Failed to save Facebook account", isError: true });
    }
  };

  // Save IG business account (from first linked FB page) in backend
  const saveInstagramAccount = async (page) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        showToast({ message: "User not found. Please log in again.", isError: true });
        return;
      }
      // Fetch IG Business Account ID for the page
      const resp = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.accessToken}`
      );
      const data = await resp.json();
      const igId = data?.instagram_business_account?.id;
      if (!igId) {
        showToast({ message: "No Instagram Business Account linked to this page", isError: true });
        return;
      }
      const payload = {
        userId,
        platform: "instagram",
        accountType: "business",
        accountName: page.name,
        accountId: igId,
        instagramBusinessAccountId: igId,
        accessToken: localStorage.getItem("fbAccessToken"),
        pageId: page.id,
        pageAccessToken: page.accessToken,
      };
      const res = await api.post({ url: "accounts", data: payload });
      if (res.success) {
        showToast({ message: "Instagram account connected", isError: false });
      }
    } catch (err) {
      console.error("Failed to save Instagram account:", err);
      showToast({ message: "Failed to save Instagram account", isError: true });
    }
  };

  // Do not auto-connect the first page; render selectable list instead
  const hasConnectedRef = useRef(false);
  useEffect(() => {
    // Keep this effect to ensure pages are fetched after login, but avoid auto-connect
    hasConnectedRef.current = false;
  }, [pages, socialLogin]);

  // const frameworks = createListCollection({
  //   items: [
  //     ...pages.map((page) => ({
  //       label: page.name,
  //       value: page.id,
  //     })),
  //   ],
  // })




  const handleLogin = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          // If login is successful, retrieve user info and page access token
          // setIsLoggedIn(true);
          const accessToken = response.authResponse.accessToken;
          console.log("test ", response);
          localStorage.setItem("fbAccountInfo", JSON.stringify(response?.authResponse));
          localStorage.setItem("fbUserID", response.authResponse.userID);
          setUserID(response.authResponse.userID);
          fetchUserPages(accessToken);
          setPageAccessToken(accessToken);
          localStorage.setItem("fbAccessToken", accessToken);

        } else {
          alert("Login failed. Please try again.");
        }
      },
      {
        scope: "pages_show_list,pages_manage_posts,pages_read_engagement,pages_read_user_content,instagram_basic,instagram_content_publish",
      }
    );
  };


  const [message, setMessage] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const hasFetchedToken = useRef(false);
  // LinkedIn OAuth login URL - Using configuration
  const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${socialConfig.linkedin.clientId}&redirect_uri=${encodeURIComponent(socialConfig.linkedin.redirectUri)}&scope=${encodeURIComponent(socialConfig.linkedin.scope)}`;

  useEffect(() => {
    if (hasFetchedToken.current) return; // Prevent multiple runs

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    const savedToken = localStorage.getItem("linkedin_token");

    if (savedToken) {
      setAccessToken(savedToken);
    } else if (code) {
      fetchAccessToken(code);
    }

    hasFetchedToken.current = true; // Mark as fetched
  }, []); //
  const fetchAccessToken = async (code) => {
    try {
      const response = await fetch("http://localhost:5000/api/getLinkedInToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        localStorage.setItem("linkedin_token", data.access_token);
      } else {
        console.error("Failed to get access token:", data);
      }
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };
  const fetchUserURN = async () => {
    if (!accessToken) {
      alert("Please authenticate with LinkedIn first!");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/getUserProfile?accessToken=${accessToken}`
      );

      const data = await response.json();
      console.log("data ", data);

      if (data.urn) {
        return data.urn;
      } else {
        // console.error("Failed to fetch user URN:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching LinkedIn user URN:", error);
      return null;
    }
  };

  const handleImageUpload = async (imageFile, userURN, message) => {
    if (!accessToken) {
      alert("Please authenticate with LinkedIn first!");
      return null;
    }
    const formData = new FormData();
    formData.append("accessToken", accessToken);
    formData.append("image", imageFile);
    formData.append("userURN", userURN);
    formData.append("text", message);

    try {
      const response = await fetch("http://localhost:5000/api/uploadLinkedInImage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("data ", data.id);

      if (data.id) {
        return data.id; // Return the asset URN of the uploaded image
      } else {
        // console.error("Failed to upload image:", data);
        return null;
      }
    } catch (error) {
      console.error("Error uploading image to LinkedIn:", error);
      return null;
    }
  };

  const handlePostToLinkedIn = async () => {
    if (!message) {
      alert("Please enter a message!");
      return;
    }

    if (!accessToken) {
      alert("Please authenticate with LinkedIn first!");
      return;
    }

    const userURN = await fetchUserURN();
    if (!userURN) {
      alert("Failed to get user URN. Please try again.");
      return;
    }

    // let imageAsset = null;
    if (selectedImage) {
      const imageAsset = await handleImageUpload(selectedImage, userURN, message);
      console.log("imageAsset ", imageAsset);

      if (imageAsset) {
        alert("LinkedIn post published successfully!");
        setMessage("");
        setSelectedImage(null);
      } else {
        alert("Failed to publish LinkedIn post!");
      }
    }


  };


  const handleSelectedIntegration = (data) => {
    setSocialLogin(data);

    switch (data) {
      case "Facebook":
        handleLogin();
        break;
      case "Instagram":
        handleLogin();
        break;
      case "LinkedIn":
        if (!accessToken) {
          window.location.href = linkedInAuthURL;
        } else {
          handlePostToLinkedIn();
        }
        break;
      case "Twitter":
        // Twitter integration - placeholder
        alert("Twitter integration coming soon!");
        break;
      case "TikTok":
        // TikTok integration - placeholder
        alert("TikTok integration coming soon!");
        break;
      case "Reddit":
        // Reddit integration - placeholder
        alert("Reddit integration coming soon!");
        break;
      default:
        console.log("Unknown integration:", data);
        break;
    }
  };

  console.log("pages", localStorage.getItem("fbPages"));
  console.log("pages Access Token", localStorage.getItem("fbAccessToken"));
  console.log("user ID", localStorage.getItem("fbUserID"));



















  return (
    <Container>
      <div className="w-full">
        <div className="flex flex-col sm:gap-8 gap-4">
          {/* My Integration Icon  */}
          <div>
            <h1 className="text8 font-semibold text-primaryColor dark:text-whiteColor">
              My Integrations
            </h1>
            <div
              className="grid sm:grid-cols-4 grid-cols-2 gap-4 md:justify-start 
            justify-center items-start py-4"
            >
              {MyIntegrations.map((integration, index) => {
                const isConnected = 
                  (integration.name === "Facebook" && localStorage.getItem("fbAccessToken")) ||
                  (integration.name === "LinkedIn" && localStorage.getItem("linkedin_token"));
                
                return (
                  <div key={index} className="flex items-start justify-start sm:p-6 p-4 rounded-md cursor-pointer relative">
                    <div className="flex flex-col gap-y-1 items-center justify-center">
                      <button
                        onClick={() => {
                          if (integration?.name === "LinkedIn" && !accessToken) {
                            window.location.href = linkedInAuthURL; // Redirect for LinkedIn login
                          } else {
                            handleSelectedIntegration(integration?.name); // Handle other integrations
                          }
                        }}
                        className="relative"
                      >
                        <img
                          src={integration.img}
                          alt={integration.name}
                          draggable={false}
                          className={`md:w-[55px] w-[35px] object-contain opacity-100 drop-shadow`}
                          onError={(e) => {
                            // Fallback to a default icon if the image fails to load
                            e.target.src = "https://cdn-icons-png.flaticon.com/512/3670/3670157.png";
                          }}
                        />
                        {isConnected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </button>

                      <h2 className="text14 text-primaryColor dark:text-whiteColor">
                        {integration.name}
                      </h2>
                      {isConnected && (
                        <span className="text-xs text-green-600 font-medium">Connected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* My Integration Icon  */}
          {/* Add Integration Icon  */}
          {/* Meta pages selection (allows adding multiple accounts) */}
          {(pages?.length > 0 && (socialLogin === "Facebook" || socialLogin === "Instagram")) && (
            <div className="mt-2">
              <h2 className="text14 font-medium text-primaryColor dark:text-whiteColor mb-2">Select a Page to Connect</h2>
              <div className="flex flex-wrap gap-2">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
                    <span className="text13 text-primaryColor dark:text-whiteColor">{page.name}</span>
                    {socialLogin === "Facebook" ? (
                      <button onClick={() => saveFacebookAccount({ id: page.id, name: page.name, accessToken: page.access_token || page.accessToken })} className="text12 bg-primaryColor text-whiteColor rounded px-2 py-1">Connect</button>
                    ) : (
                      <button onClick={() => saveInstagramAccount({ id: page.id, name: page.name, accessToken: page.access_token || page.accessToken })} className="text12 bg-primaryColor text-whiteColor rounded px-2 py-1">Connect IG</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* <div>
            <h1 className="text8 font-semibold text-primaryColor dark:text-whiteColor">
              +Add Intergration
            </h1>
            <div className="grid sm:grid-cols-4 grid-cols-2 gap-4 justify-start items-center py-4">
              {AddIntegrations.map((addintegration, index) => (
                <div className="flex items-center justify-start sm:p-6 p-4 rounded-md cursor-pointer">
                  <div
                    key={index}
                    className="flex flex-col gap-1 items-center justify-center"
                  >
                    <img
                      src={addintegration.img}
                      alt={addintegration.name}
                      draggable={false}
                      className="md:w-[55px] w-[35px] object-contain"
                    />
                    <h2 className="text14 text-primaryColor dark:text-whiteColor">
                      {addintegration.name}
                    </h2>
                  </div>
                </div>
              ))}
              <div className="cursor-pointer sm:p-6 p-4 rounded-md">
                <img
                  src={theme === "dark" ? IMAGES.PLUSGRAY : IMAGES.PLUS}
                  alt={IMAGES.PLUS}
                  className="md:w-[80px] sm:w-[50px] w-[50px] object-contain 
                  hover:shadow-custom border-[1px] dark:border-gray border-primaryColor border-dashed md:p-6 p-4 rounded-md"
                />
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </Container>
  );
};

export default Integrations;
