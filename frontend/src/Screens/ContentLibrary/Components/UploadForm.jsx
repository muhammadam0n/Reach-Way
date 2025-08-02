import React, { useState } from "react";
import Inputfield from "../../../Components/InputField";
import Button from "../../../Components/Button";
import { IMAGES } from "../../../utils/Images";
import UploadImage from "../../../Components/UploadImage";
import { platforma } from "../../../Utils/DummyData";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import DropDown from "../../../Components/DropDown";
import { showToast } from "../../../Components/Toast";
import api from "../../../api/AxiosInterceptor";
import ENDPOINTS from "../../../Utils/Endpoints";

const animatedComponents = makeAnimated();

const ImageUploadForm = () => {
  const user = localStorage.getItem("user")
  const parse_user = JSON.parse(user);
  
  const [formData, setFormData] = useState({
    image: [],
    description: "",
    date: "",
    platForm: "",
    tags: "",
    type: "",
  });

  // console.log("parse_user",parse_user)

  const [selectedPages, setSelectedPages] = useState([]);
  const [postType, setPostType] = useState("page");
  const [image, setImage] = useState(null);

  const fbAuthData = localStorage.getItem("fbAccountInfo")
  const parseFbAuthData = JSON.parse(fbAuthData)

  const fbPages = localStorage.getItem("fbPages")
  const parseFbPages = JSON.parse(fbPages)
  // console.log("parseFbPages", parseFbPages);

  const [edit, setEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // Track which item is being edited
  const [wordCount, setWordCount] = useState(0);
  const [uploads, setUploads] = useState([]); // Array to store uploaded images and descriptions
  const [showForm, setShowForm] = useState(true); // Toggle form visibility
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    if (files.length > 0) {
      const updatedImages = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.includes("video") ? "video" : "image",
      }));
  
      setFormData((prev) => ({
        ...prev,
        image: [...prev.image, ...updatedImages],
        type: "image", // Optional, based on first image type or override later
      }));
    }
  };
  

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
    setWordCount(e.target.value.length);
  };

  const handleAdd = async(e) => {
    e.preventDefault();
  if ( !formData.platForm || !formData.description?.trim() || !formData.image || !formData.date) {
    showToast({
      message: "Please fill in all required fields: Platform, Pages, Description, Image, and Date.",
      isError: true,
    });
    return; // Prevent form submission
  }
    // if (edit) {
    //   const updatedUploads = [...uploads];
    //   updatedUploads[editIndex] = formData; // Update the selected item
    //   setUploads(updatedUploads);
    //   setEdit(false);
    //   setEditIndex(null);
    // } else {
    //   setUploads([...uploads, formData]); // Add new item
    // }
      const userId = localStorage.getItem("userId");
      const form = new FormData();
      
      form.append("image", formData.image[0]?.file);
      form.append("description", formData.description);
      form.append("date", formData.date);
      form.append("platform", formData.platForm);
      form.append("tags", formData.tags);
      form.append("postType", formData.type);
      form.append("userId", parse_user?._id);
      form.append("selectedPages", selectedPages);
      // form.append("postId", postId); // if needed
     try {
            const response = await api.post({
            url: `${ENDPOINTS.OTHER.ADD_POST}`,
            data: form,
            config: {
            headers: { "Content-Type": "multipart/form-data" }, // optional, axios handles this if not manually set
              },
              isFile: true, 
          });

            if (response) {
                showToast({ message: response.message, isError: false });
                   setFormData({
                    image: [],
                    description: "",
                    platForm: "",
                    tags: "",
                    type: "",
                    date: "",
                  });
                  setShowForm(false);
            setTimeout(() => setShowForm(true), 0);
            }
        } catch (error) {
            console.log(error.message);
            showToast({ message: error.message, isError: true });
        }
  };

  const handleDelete = (index) => {
    const newUploads = [...uploads];
    newUploads.splice(index, 1);
    setUploads(newUploads);
  };

  const handleEdit = (index) => {
    const selectedUpload = uploads[index];
    setFormData({
      image: selectedUpload.image,
      description: selectedUpload.description,
      date: selectedUpload.date,
      platForm: selectedUpload.platForm,
      tags: selectedUpload.tags,
      type: selectedUpload.type,
    });
    setEdit(true);
    setEditIndex(index);
    setShowForm(false);
    setTimeout(() => setShowForm(true), 0);
  };


  const handleGenerateWithAI = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading


    try {
      const apiKey = import.meta.env.VITE_API_KEY; // Replace with your actual API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;


      const promptText = formData?.description?.trim()
        ? formData.description
        : 'Write description for social media post.'; // Dynamic prompt

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch generated text');
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      // console.log(generatedText);

      setFormData((formData) => ({
        ...formData,
        description: generatedText,
      }));
    } catch (error) {
      console.error('Error generating text:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const frameworks = {
    items: parseFbPages && parseFbPages.length > 0
      ? parseFbPages.map((page) => ({
        label: page.name,
        value: page.id,
      }))
      : []
  };




  const savePostDetails = async (postId, platform, postType, imageUrl) => {
    try {
      const formDatas = new FormData();
      formDatas.append("image", image); // Attach image file
      formDatas.append("userId", parse_user?._id);
      formDatas.append("postId", postId); // Unique post ID
      formDatas.append("platform", "facebook");
      formDatas.append("postType", postType);
      formDatas.append("description", formData?.description);
      await fetch("http://localhost:5000/api/save-post", {
        method: "POST",
        body: formDatas,
      });

      showToast({ message: "Post saved successfully", isError: false });
      console.log("Post saved successfully!");
      setFormData({
        image: null,
        description: "",
        platForm: "",
        tags: "",
        type: "",
        date: "",
      })
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };




  const handlePost = async () => {
    if (!formData?.description) return alert("Please enter a message!");
    if (selectedPages.length === 0) return alert("Please select at least one page!");

    for (const pageId of selectedPages) {
      const page = parseFbPages.find((p) => p.id === pageId);

      if (!page) continue;

      const formDatas = new FormData();
      formDatas.append("message", formData.description);
      formDatas.append("access_token", page.accessToken);
      formDatas.append("published", "true");

      let endpoint = "feed";
      if (image) {
        try {
          let imageBlob;
          let imageName = "photo.jpg"; // Default filename

          endpoint = "photos";
          if (typeof image === "string" && image.startsWith("http")) {
            const response = await fetch(image, {
              mode: "cors", // Ensure Cross-Origin support
            });
            if (!response.ok) throw new Error("Image fetch failed!");

            imageBlob = await response.blob();

            // Extract filename from URL if possible
            const urlParts = image.split("/");
            imageName = urlParts[urlParts.length - 1] || imageName;
          } else {
            imageBlob = image; // Direct file upload
            imageName = image.name || "photo.jpg";
          }


          formDatas.append("source", imageBlob, imageName);
        } catch (error) {
          console.error("Error processing image:", error);
          return;
        }
      }

      try {
        const response = await fetch(`https://graph.facebook.com/${pageId}/${endpoint}`, {
          method: "POST",
          body: formDatas,
        });

        const result = await response.json();
        if (result.id) {
          if (image) {
            savePostDetails(result.post_id, "facebook", postType, image);
          } else {
            savePostDetails(result.id, "facebook", postType);
          }
        } else {
          console.error(`Failed to post on Page ${pageId}`, result);
        }
      } catch (error) {
        console.error("Error posting to Facebook:", error);
      }
    }
  };








  return (
    <div className="py-8">
      {uploads.map((upload, index) => (
        <div
          key={index}
          className="mb-4 rounded-lg shadow-custom md:w-[62%] w-full bg-whiteColor flex items-center justify-between gap-4"
        >
          <Inputfield
            type={"text"}
            placeholder={"Description"}
            inputStyle={"p-2 px-4 w-full"}
            divstyle={"w-full"}
            values={upload.description}
            disabled={true}
          />
          <div className="flex items-center md:gap-4 gap-2 pr-6">
            <Button
              image={IMAGES.EDITICON}
              imageStyle={`w-8 `}
              onPress={() => handleEdit(index)}
            />
            <span className="text-gray text-4xl">|</span>
            <Button
              image={IMAGES.DELETEICON}
              imageStyle={`w-8 `}
              onPress={() => handleDelete(index)}
            />
          </div>
        </div>
      ))}
      {showForm && (
        <div>
          <UploadImage
           handleImageChange={handleImageChange}
           imageUrls={formData.image}
           fileize={true}
          />
          {/* {textarea} */}
          <div className="xl:w-[62%] w-full relative md:mt-10 mt-4">
            <div className="relative md:h-[350px] h-[250px] custom-scroll border border-gray rounded-lg shadow-xl  px-4 py-6 bg-white ">
              <textarea
                onChange={handleDescriptionChange}
                minLength={10}
                value={formData.description}
                maxLength={2000}
                placeholder="Description"
                className="w-full h-full text11 placeholder:text-gray3 scroll-m-2 resize-none border-none outline-none pr-8"
                defaultValue={formData.description}
              ></textarea>

              <p className="absolute -bottom-2 right-2 text-black text-sm mb-2">
                {wordCount}/2000
              </p>
            </div>
          </div>
          {/* {textarea} */}

          <div className="md:py-4 py-2 grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2 xl:w-[62%] w-full">
            <Inputfield
              type="date"
              inputStyle={
                "md:p-4 p-3 px-4 border border-gray rounded-lg w-full text-gray text12 shadow-custom"
              }
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              defaultValue={formData.date}
            />

            {/* <select
              onChange={(e) =>
                setFormData({ ...formData, platForm: e.target.value })
              }
              className="md:p-4 p-3 px-4 border  border-gray rounded-lg w-full focus:outline-none text-gray text12 shadow-custom"
              value={formData.platForm}
            >
              <option value="" selected={true} disabled>
                Platform
              </option>
              {platforma.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select> */}

            <DropDown
              selectValue={platforma}
              value={formData.platForm}
              selected={"Platform"}
              className={
                "appearance-none md:p-4 p-3 px-4 border  border-gray rounded-lg w-full focus:outline-none text-gray text12 shadow-custom"
              }
              onSelect={(value) => setFormData({ ...formData, platForm: value })}
            />
            {
              parseFbPages && (
                <Select
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  // defaultValue={[colourOptions[4], colourOptions[5]]}
                  onChange={(selectedOptions) => {
                    setSelectedPages(selectedOptions.map((option) => option.value));
                  }}
                  isMulti
                  options={frameworks?.items}
                />
              )
            }

          </div>

          <div className="flex  items-center md:flex-row flex-col md:gap-3 gap-2">
            <div className="xl:w-[46%] w-full flex items-center justify-center border bg-whiteColor border-gray rounded-lg shadow-custom">
              <p className="text12 border w-fit py-3 px-4 rounded-lg bg-lightblueColor dark:bg-cgreen text-whiteColor">
                Tags
              </p>
              <Inputfield
                type={"text"}
                inputStyle="p-2 px-4 rounded-lg w-full text10"
                divstyle={"w-full"}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                defaultValue={formData.tags}
              />
            </div>

            <div className="flex items-center md:flex-row flex-col md:gap-3 gap-2 md:pb-0 pb-20">
              <Button
                onPress={handleGenerateWithAI}
                btnStyle={
                  "px-2 py-3 md:w-[200px] sm:w-[664px] w-[240px] text12  rounded-lg bg-blueColor dark:bg-cgreen text-whiteColor"
                }
                btnname={isLoading ? 'Generating...' : 'Generate with AI'}
              />
              {/* <Button
                onPress={handlePost}
                btnname={"Upload"}
                btnStyle={
                  "px-2 py-3 md:w-[96px] sm:w-[664px] w-[240px]  text12   rounded-lg bg-black dark:bg-whiteColor dark:text-black  text-whiteColor"
                }
              /> */}
              <Button
                btnname={edit ? "Update" : "Add"}
                btnStyle={
                  "px-2 py-3 md:w-[96px] sm:w-[664px] w-[240px] text12  rounded-lg bg-blueColor dark:bg-cgreen text-whiteColor"
                }
                onPress={handleAdd}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadForm;
