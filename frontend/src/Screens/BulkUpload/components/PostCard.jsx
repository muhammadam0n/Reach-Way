import React, { useEffect, useState } from "react";
import { bulkPostData } from "../../../Utils/DummyData";
import Button from "../../../Components/Button";
import api from "../../../api/AxiosInterceptor";
import ENDPOINTS from "../../../Utils/Endpoints";
import { IMAGES } from "../../../Utils/images";

const PostCard = () => {

  const [posts, setPosts] = useState([]);
  const handleUpload = async () => {

    const facebookPosts = posts.filter(post => post.platform === "facebook");

    if (facebookPosts.length === 0) return;

    // Transform posts data to match expected format
    const formattedPosts = facebookPosts.map(post => ({
      _id:post._id,
      platform: post.platform,
      message: post.description,
      image_url: post.image,
      page_id: post.pageID,
      scheduled_time: Math.floor(new Date(post.date).getTime() / 1000),
      page_access_token: post.pageAccessToken // Include token if required
    }));

    try {
      const response = await api.post({
        url: ENDPOINTS.OTHER.SCHEDULE_FACEBOOK_POST,
        data: { posts: formattedPosts }
      });

      console.log("Upload response:", response);
    } catch (error) {
      console.error("Batch upload error:", error.message);
    }
  };
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get({url: `${ENDPOINTS.OTHER.GET_POSTS}`});
        setPosts(response);
        
      } catch (error) {
        // console.error("Error fetching posts:", error.message);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="text-center">
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 pt-5">
        {posts.map((member, ind) => (
          <div
            key={ind}
            className="rounded-2xl shadow-custom bg-white overflow-hidden lg:p-3 p-2"
          >
            {/* ImageSection */}
            <div className="relative h-[180px]">
              <img
                src={member.image}
                alt="Main"
                className="w-full h-full md:object-fill object-cover relative rounded-2xl"
              />
              <img
                src={
                  member.platform === "facebook"
                    ? IMAGES.FACEBOOK
                    : member.platform === "linkedin"
                    ? IMAGES.LINKEDIN
                    : member.platform === "threads"
                    ? IMAGES.THREADS
                    : member.platform === "instagram"
                    ? IMAGES.INSTA
                    : member.ADDICON 
                }
                alt="Platform Icon"
                className="absolute left-4 -bottom-4 w-[40px] h-[40px]"
              />
            </div>

            {/* Text1 */}
            <div className="flex flex-row justify-end mt-4">
              {/* <img
                src={member.img2}
                alt={member.img2}
                className="sm:w-[18px] sm:h-[18px] w-[16px] h-[16px]"
              /> */}
            </div>

            {/* Text2 */}
            <div className="flex flex-row items-center justify-between mt-4">
              <p className="text-black text13 font-Barlow font-semibold">
                {member.heading}
              </p>
              <div className="flex flex-row items-center justify-center">
           <p className="text-black text15 font-medium">
            {(() => {
              const d = new Date(member.date);
              return d.toLocaleDateString("en-US", { weekday: "short" }); // e.g., Mon, Tue
            })()}
          </p>
                <span className="px-1 text9 text-gray1">|</span>
                <p className="text-black text15">
                  {(() => {
                    const d = new Date(member.date);
                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                  })()}
                </p>

              </div>
            </div>
            {/* Text3 */}
            <p className="text15 text-primaryColor text-left mt-2">
             {member.description.length > 100 
              ? `${member.description.slice(0, 100)}...` 
              : member.description}
            </p>
          </div>
          // </div>
        ))}
      </div>
      <Button
        btnname="Upload"
        btnStyle="bg-primaryColor mt-8 px-8 text14 py-2 rounded-md text-whiteColor dark:text-primaryColor dark:bg-whiteColor"
        onPress={()=>handleUpload()}
      />
    </div>
  );
};

export default PostCard;
