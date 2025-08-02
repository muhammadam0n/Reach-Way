import React, { useEffect, useRef, useState } from "react";
import Container from "../../Components/Container";
import { IMAGES } from "../../utils/Images";
import { AddIntegrations, MyIntegrations } from "../../Utils/DummyData";
import { useSelector } from "react-redux";

const Integrations = () => {
  const theme = useSelector((state) => state.theme.theme);

  const [socialLogin, setSocialLogin] = useState(null)
  const [userID, setUserID] = useState(null);
  const [pageAccessToken, setPageAccessToken] = useState(null);
  const [pages, setPages] = useState([]);


  // Face Book Login data
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "9099617093459439", // Replace with your Facebook App ID
        cookie: true,
        xfbml: true,
        version: "v18.0",
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

    // Load Facebook SDK
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
        scope: "pages_manage_posts,pages_read_engagement,pages_read_user_content,instagram_basic,instagram_content_publish",
      }
    );
  };


  const [message, setMessage] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const hasFetchedToken = useRef(false);
  // LinkedIn OAuth login URL
  const redirect_uri = "http://localhost:3000/linkedin";
  const client_id = "77q0wyhcsxoutt";
  const client_secret = "WPL_AP1.89bee0NweGvmz1qO.5loRdA==";
  const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${encodeURIComponent("r_events rw_events email w_member_social profile openid")}`;

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
      case "Linkedin":
        {
          !accessToken ? (
            handlePostToLinkedIn()) : null
        }

        break;
      case "Threads":
        handleLogin();

        break;
      default:
        console.log("Unknown integration");
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
              {MyIntegrations.map((integration, index) => (
                <div key={index} className="flex items-start justify-start sm:p-6 p-4 rounded-md cursor-pointer">
                  <div
                    key={index}
                    className="flex flex-col gap-y-1 items-center justify-center"
                  >
                    <button
                      onClick={() => {
                        if (integration?.name === "Linkedin" && !accessToken) {
                          window.location.href = linkedInAuthURL; // Redirect for LinkedIn login
                        } else {
                          handleSelectedIntegration(integration?.name); // Handle other integrations
                        }
                      }}
                    >
                      <img
                        src={integration.img}
                        alt={integration.name}
                        draggable={false}
                        className="md:w-[55px] w-[35px] object-contain"
                      />
                    </button>

                    <h2 className="text14 text-primaryColor dark:text-whiteColor">
                      {integration.name}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* My Integration Icon  */}
          {/* Add Integration Icon  */}
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
