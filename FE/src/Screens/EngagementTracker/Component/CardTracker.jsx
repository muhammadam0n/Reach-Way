import React, { useEffect, useState } from "react";
import { CardTracker1 } from "../../../Utils/DummyData";
import { IMAGES } from "../../../Utils/images";
// import { IMAGES } from "../../../utils/Images";
const CardTracker = () => {


  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const storedToken = localStorage.getItem("fbAccessToken");


  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  // Fetch likes & comments from Facebook Graph API
  const fetchPostStats = async (postId, accessToken) => {
    if (!storedToken) return { likes: 0, comments: 0 };

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=reactions.summary(total_count),comments.summary(total_count)&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Facebook API Error:", errorData.error.message);
        return { likes: 0, comments: 0 };
      }

      const data = await response.json();

      return {
        likes: data.reactions?.summary?.total_count || 0,
        comments: data.comments?.data || 0,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { likes: 0, comments: 0 };
    }
  };

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);
  // console.log("post", posts);

  // Fetch post stats after posts are loaded
  useEffect(() => {
    if (posts.length === 0) return;

    const fetchStats = async () => {
      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          if (!post.postId.includes("_")) {
            console.error("Invalid postId format:", post.postId);
            return post;
          }

          const [pageId, postId] = post.postId.split("_"); // Splitting the post ID

          // Retrieve stored pages from localStorage
          const storedPages = JSON.parse(localStorage.getItem("fbPages")) || [];

          // Find the access token for the matching Page ID
          const page = storedPages.find((p) => p.id === pageId);
          if (!page) {
            console.error("No access token found for page:", pageId);
            return post;
          }

          const pageAccessToken = page.accessToken;

          // Fetch post stats with the correct Page Access Token
          const stats = await fetchPostStats(post.postId, pageAccessToken);

          return { ...post, ...stats, pageId, postId, pageAccessToken };
        })
      );

      setPosts(updatedPosts);
    };

    fetchStats(); // Run only once after posts are loaded
  }, [posts.length]); // Depend on posts.length to ensure it runs once



  function formatDateToDayAndDate(dateString) {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., Sun, Mon
    const dayOfMonth = date.getDate(); // e.g., 12
    return `${dayOfMonth} | ${day}`;
  }

  // Example usage:
  const formatted = formatDateToDayAndDate("2025-04-14T19:19:25.165Z");
  // console.log(formatted); // Output: Mon|14





  const [selectedPost, setSelectedPost] = useState([null]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const seeComments = (postId) => {
    const postIdWithPageId = posts.find((post) => post?._id === postId);
    setSelectedPost(postIdWithPageId);
    setIsModalOpen(true);
    // console.log("See Posts Comments", postId);

  }

  // console.log("postIdWithPageId", selectedPost?.comments);


  return (
    <div className=" ">
      {posts &&
        posts.map((data, ind) => (
          <div
            key={ind}
            className="flex lg:gap-5 sm:flex-row sm:gap-4 flex-col mt-10 w-full rounded-lg shadow-custom p-3 bg-whiteColor"
          >
            {/* LeftDiv*/}
            <div className="md:w-[50%] w-full flex sm:flex-row flex-col lg:gap-8 sm:gap-4">
              {/* ImageWork */}
              <div className="sm:w-[40%] w-full">
                <img
                  className=" w-48 h-48 object-contain rounded-lg mx-auto"
                  src={data?.image}
                  alt={data?.image}
                />
              </div>
              {/* TextWork */}
              <div className="sm:w-[60%] flex flex-col sm:justify-normal sm:items-start justify-center items-center w-full xl:pt-10 lg:py-8 md:py-5 sm:py-6 py-4">
                <div className="flex md:justify-normal md:items-start justify-center items-center">
                  <p className="lg:text9 md:text12 sm:text10 text5 font-bold">
                    {formatDateToDayAndDate(`${data?.createdAt}`)}
                  </p>
                  {/* <span className="lg:text9 md:text12 sm:text10 text5 text-gray1 px-2 ">
                    |
                  </span>
                  <p className="lg:text9 md:text12 sm:text10 text5">
                    {data.date}
                  </p> */}
                </div>
                {/* <div className=""> */}
                <p className="lg:text9 sm:text10 lg:mt-3 md:text12 md:mt-2 text5 mt-3 font-semibold">
                  {data?.description?.slice(0, 10)}...
                </p>
                <p className="lg:text12 sm:text12 text6 sm:pt-1 line-clamp-3">{data?.description}</p>
                {/* </div> */}
              </div>
            </div>

            <div className="w-full border sm:w-[1px] sm:h-auto h-[1px] bg-black sm:mx-0 mx-auto sm:my-0 my-5"></div>

            {/* RightDiv*/}
            <div className="flex xl:gap-16 lg:gap-10 flex-row md:w-[50%] md:gap-7 justify-center items-center gap-5 w-full">
              <div className="flex flex-col items-center justify-center">
                <img
                  className="xl:w-[60px] xl:h-[60px] lg:w-[50px] lg:h-[50px] w-[40px] h-[40px]"
                  src={IMAGES.LIKE}
                  alt={IMAGES.LIKE}
                />
                <p className="md:text12 text8 font-semibold mt-2">
                  {data?.likes}
                </p>
                {/* <p className="md:text14 text11 text-lightblueColor">
                  {data.para2}
                </p> */}
              </div>
              <div className="flex flex-col items-center justify-center">
                <img
                  className="xl:w-[60px] xl:h-[60px] lg:w-[50px] lg:h-[50px] w-[40px] h-[40px] cursor-pointer"
                  src={IMAGES.COMMENT}
                  alt={IMAGES.COMMENT}
                  onClick={() => { seeComments(data?._id) }}
                />
                <p className="md:text12 text8 text-black font-semibold mt-2">
                  {data?.comments?.length}
                </p>
                {/* <p className="md:text14 text11 text-lightblueColor">
                  {data.para2}
                </p> */}
              </div>
              {/* <div className="flex flex-col items-center justify-center">
                <img
                  className="xl:w-[60px] xl:h-[60px] lg:w-[50px] lg:h-[50px] w-[40px] h-[40px]"
                  src={data.img4}
                  alt={data.img4}
                />
                <p className="md:text12 text8 text-black font-semibold mt-2">
                  {data.para1}
                </p>
                <p className="md:text14 text11 text-lightblueColor">
                  {data.para2}
                </p>
              </div> */}
            </div>
          </div>
        ))}




      {isModalOpen && selectedPost && (
        <PostCommentsModal
          selectedPosts={selectedPost}
          onClose={() => setIsModalOpen(false)}
        />
      )}






    </div>
  );







};

export default CardTracker;





const PostCommentsModal = ({ selectedPosts, onClose }) => {


  console.log("selectedPosts in modal", selectedPosts);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:p-4 p-2">
      <div className="bg-white  rounded-lg w-full max-w-lg relative  overflow-hidden ">

        <div className="sticky top-0 p-2 bg-cgreen">
          <button
            onClick={onClose}
            className="absolute top- right-2 text-gray-600 hover:text-black text-xl font-bold"
          >
            &times;
          </button>

          <h2 className="text-lg font-semibold mb-4  ">Comments</h2>
        </div>

        <div className="mt-1">
          <img src={selectedPosts?.image} alt={selectedPosts?.image} className="w-[70%] object-contain mx-auto rounded-md shadow-md" />
        </div>

        <ul className="p-2 bg-gray rounded-lg mt-2 mb-4 w-[90%] mx-auto overflow-hidden overflow-y-auto h-64 shadow-lg">
          {
            selectedPosts?.comments?.length > 0 ? selectedPosts?.comments?.map((comment, index) => (
              <li key={index} className="mb-2 shadow-lg w-[80%] mx-auto p-2 rounded-lg bg-white">
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold break-words">
                      {`${comment?.from?.name || "Unknown User"} : `}
                    </p>
                  </div>
                </div>
                <p className="break-words">{comment?.message || "No message available."}</p>
              </li>

            ))
              :
              <li className="mb-2 border-red-500 border w-fit mx-auto mt-2 p-2 rounded-lg bg-green-300">
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">
                      No Comments
                    </p>
                  </div>
                </div>
              </li>
          }
        </ul>
      </div>
    </div>
  );
};

