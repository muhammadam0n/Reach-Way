import React, { useEffect, useState } from "react";
import Inputfield from "../../../Components/InputField";
import Button from "../../../Components/Button";
import { IMAGES } from "../../../Utils/images";
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
    time:"",
    platForm: "",
    tags: "",
    type: "",
  });

  // console.log("parse_user",parse_user)

  const [selectedPages, setSelectedPages] = useState([]);
  const [postType, setPostType] = useState("page");
  const [image, setImage] = useState(null);

  // Read queue preferences from localStorage
  const getQueuePrefs = () => {
    try {
      const raw = localStorage.getItem("queue_prefs");
      if (!raw) return null;
      const prefs = JSON.parse(raw);
      return {
        strategy: prefs?.strategy === "next" ? "next" : "last",
        intervalMin: Math.max(5, Number(prefs?.intervalMin) || 60),
        startTime: typeof prefs?.startTime === "string" ? prefs.startTime : "",
      };
    } catch (_) {
      return null;
    }
  };

  const fetchExistingFuturePosts = async () => {
    try {
      const res = await api.get({ url: ENDPOINTS.OTHER.GET_POSTS });
      const now = new Date();
      return Array.isArray(res)
        ? res.filter((p) => p?.scheduledDateTime && new Date(p.scheduledDateTime) > now)
        : [];
    } catch (_) {
      return [];
    }
  };

  const computeQueueTimes = async (numItems) => {
    const prefs = getQueuePrefs();
    const interval = (prefs?.intervalMin || 60) * 60000;
    const future = await fetchExistingFuturePosts();
    const now = new Date();
    let base;
    if (prefs?.strategy === "next") {
      base = new Date(now.getTime() + interval);
    } else {
      const last = future.sort((a,b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime))[future.length - 1]?.scheduledDateTime;
      base = last ? new Date(last) : new Date(now.getTime() + interval);
    }
    const times = [];
    let cursor = new Date(base);
    for (let i = 0; i < numItems; i++) {
      let d = new Date(cursor);
      if (prefs?.startTime) {
        const [hh, mm] = prefs.startTime.split(":").map((n) => Number(n) || 0);
        d.setHours(hh, mm, 0, 0);
        if (d <= now) d.setDate(d.getDate() + 1);
      }
      const yyyy = d.getFullYear();
      const mm2 = String(d.getMonth() + 1).padStart(2, '0');
      const dd2 = String(d.getDate()).padStart(2, '0');
      const HH = String(d.getHours()).padStart(2, '0');
      const MM = String(d.getMinutes()).padStart(2, '0');
      times.push({ date: `${yyyy}-${mm2}-${dd2}`, time: `${HH}:${MM}` });
      cursor = new Date(cursor.getTime() + interval);
    }
    return times;
  };

  // Auto-draft from AI Image Studio if available
  useEffect(() => {
    try {
      const draft = localStorage.getItem("draft_ai_image");
      if (draft) {
        fetch(draft)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "ai-image.png", { type: blob.type || "image/png" });
            const drafted = { file, url: draft, type: "image" };
            setFormData(prev => ({ ...prev, image: [drafted], type: "image" }));
            setImage(file);
          })
          .finally(() => { try { localStorage.removeItem("draft_ai_image"); } catch (_) {} });
      }
    } catch (_) {}
  }, []);

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
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); // Add image analysis loading state
  const [imageAnalysisComplete, setImageAnalysisComplete] = useState(false); // Track if image analysis is complete
  const [aiOptions, setAiOptions] = useState([]); // AI suggestion options

  const extractAiOptions = (rawText) => {
    if (!rawText || typeof rawText !== 'string') return [];
    let text = rawText
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/\*\*/g, '')
      .replace(/>\s*/g, '')
      .trim();
    // Split by Option headings
    let parts = text.split(/Option\s*\d+[^\n:]*:?/gi).map(p => p.trim()).filter(Boolean);
    if (parts.length <= 1) {
      // Fallback: split by blank lines
      parts = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    }
    // Take the first sentence/paragraph per part, clamp length
    const sanitized = parts.map(p => {
      const para = p.split(/\n+/).filter(Boolean)[0] || p;
      return para.replace(/^[-*•]\s*/, '').trim();
    }).filter(Boolean);
    // Deduplicate and cap
    const unique = Array.from(new Set(sanitized)).slice(0, 6);
    return unique;
  };

  // Function to convert image to base64 for API calls
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Function to test API key connection
  const testAPIKey = async () => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      console.log('API Key found:', apiKey ? 'Yes' : 'No');
      console.log('API Key value:', apiKey);
      
      if (!apiKey) {
        showToast({ 
          message: "API key not found. Please create a .env file with VITE_API_KEY", 
          isError: true 
        });
        return;
      }

      showToast({ 
        message: "Testing API key connection...", 
        isError: false 
      });

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      console.log('API URL:', apiUrl);
      
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
                  text: "Hello, this is a test message to verify the API key is working.",
                },
              ],
            },
          ],
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        showToast({ 
          message: "✅ API key is working! You can now upload images for AI analysis.", 
          isError: false 
        });
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error?.message || 'API test failed');
      }
    } catch (error) {
      console.error('API test error:', error);
      showToast({ 
        message: `API test failed: ${error.message}`, 
        isError: true 
      });
    }
  };

  // Function to analyze image with AI and generate description
  const analyzeImageWithAI = async (imageFile) => {
    try {
      setIsAnalyzingImage(true);
      
      // Validate image file
      if (!imageFile || !imageFile.type.startsWith('image/')) {
        throw new Error('Invalid image file. Please select a valid image.');
      }
      
      // Check file size (limit to 10MB for API efficiency)
      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error('Image file too large. Please use images under 10MB.');
      }
      
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please check your environment configuration.');
      }
      
      // Convert image to base64
      const base64Image = await convertImageToBase64(imageFile);
      
      // Use Gemini API with image analysis
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const prompt = `Analyze this image and provide a detailed, engaging description suitable for social media. 
      Focus on:
      - What you see in the image
      - The mood/atmosphere
      - Any text or objects present
      - Colors and visual elements
      - Make it engaging and social media friendly
      Keep it under 200 characters and make it compelling for social media engagement.`;
      
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
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: imageFile.type,
                    data: base64Image
                  }
                }
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze image');
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from AI service');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      const options = extractAiOptions(generatedText);
      setAiOptions(options);
      setImageAnalysisComplete(true);
      
      showToast({ 
        message: "AI has analyzed your image and generated a description!", 
        isError: false 
      });
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      let errorMessage = "Failed to analyze image. Please try again or write description manually.";
      
      if (error.message.includes('API key')) {
        errorMessage = "API key not configured. Please check your environment settings.";
      } else if (error.message.includes('Invalid image file')) {
        errorMessage = error.message;
      } else if (error.message.includes('Image file too large')) {
        errorMessage = error.message;
      } else if (error.message.includes('Invalid response')) {
        errorMessage = "AI service returned an invalid response. Please try again.";
      }
      
      showToast({ 
        message: errorMessage, 
        isError: true 
      });
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageChange = async (e) => {
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

      // Reset analysis complete flag for new images
      setImageAnalysisComplete(false);

      // Automatically analyze the first image if it's an image file
      if (files[0] && files[0].type.startsWith('image/')) {
        await analyzeImageWithAI(files[0]);
      }
    }
  };


  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
    setWordCount(e.target.value.length);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.platForm || !formData.description?.trim() || !formData.image) {
      showToast({
        message: "Please fill in all required fields: Platform, Pages, Description, and Image.",
        isError: true,
      });
      return; // Prevent form submission
    }
    const userId = localStorage.getItem("userId");
    const images = formData.image || [];
    try {
      let schedulePlan = [];
      if (images.length > 1) {
        schedulePlan = await computeQueueTimes(images.length);
      } else if (formData.date && formData.time) {
        schedulePlan = [{ date: formData.date, time: formData.time }];
      } else {
        schedulePlan = await computeQueueTimes(1);
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const { date, time } = schedulePlan[Math.min(i, schedulePlan.length - 1)];
        const form = new FormData();
        form.append("image", img?.file);
        form.append("description", formData.description);
        form.append("date", date);
        form.append("platform", formData.platForm);
        form.append("tags", formData.tags);
        form.append("postType", formData.type || "image");
        form.append("time", time);
        form.append("userId", parse_user?._id);
        form.append("selectedPages", selectedPages);
        await api.post({
          url: `${ENDPOINTS.OTHER.ADD_POST}`,
          data: form,
          config: { headers: { "Content-Type": "multipart/form-data" } },
          isFile: true,
        });
      }

      showToast({ message: "Queued posts created successfully", isError: false });
      setFormData({
        image: [],
        description: "",
        platForm: "",
        tags: "",
        type: "",
        date: "",
        time: "",
      });
      setShowForm(false);
      setTimeout(() => setShowForm(true), 0);
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
              <h1 className="text-2xl pb-4 font-bold">
                Schedule a post to any platform
              </h1>
              
                             {/* AI Feature Info */}
               <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                 <div className="flex items-start gap-3">
                   <div className="text-blue-600 text-xl">🚀</div>
                   <div className="flex-1">
                     <h3 className="text-blue-800 font-medium mb-1">New AI-Powered Image Analysis</h3>
                     <p className="text-blue-700 text-sm">
                       Upload an image and AI will automatically generate engaging descriptions for your social media posts. 
                       Simply drag and drop an image to get started!
                     </p>
                   </div>
                   <button
                     onClick={testAPIKey}
                     className="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                   >
                     Test API Key
                   </button>
                 </div>
               </div>

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
          
          {/* AI Image Analysis Status */}
          {isAnalyzingImage && (
            <div className="xl:w-[62%] w-full mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="flex-1">
                  <span className="text-blue-700 text-sm font-medium">AI is analyzing your image...</span>
                  <div className="text-blue-600 text-xs mt-1">
                    Analyzing visual content, objects, colors, and mood to create an engaging description
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI Analysis Success Indicator */}
          {imageAnalysisComplete && aiOptions.length > 0 && (
            <div className="xl:w-[62%] w-full mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-green-600 text-xl">✅</div>
                <div className="flex-1">
                  <span className="text-green-700 text-sm font-medium">Image analysis complete!</span>
                  <div className="text-green-600 text-xs mt-1">Choose one suggestion below to use as your description.</div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {aiOptions.map((opt, idx) => (
                  <div key={idx} className="p-3 bg-white border border-green-200 rounded">
                    <p className="text-sm text-gray-800 mb-2">{opt}</p>
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, description: opt }));
                        setWordCount(opt.length);
                        setAiOptions([]);
                      }}
                      className="px-3 py-1 rounded bg-green-600 text-white text-xs"
                    >
                      Use this
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* {textarea} */}
          <div className="xl:w-[62%] w-full relative md:mt-10 mt-4">
            {/* AI Description Indicator */}
            {formData.description && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-sm font-medium">🤖 AI-Generated Description</span>
                    <span className="text-xs text-green-500">(You can edit this description)</span>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, description: "" }));
                      setWordCount(0);
                      setImageAnalysisComplete(false);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Clear Description
                  </button>
                </div>
                <p className="text-sm text-green-700">{formData.description}</p>
              </div>
            )}
            
            <div className="relative md:h=[350px] h-[250px] custom-scroll border border-gray rounded-lg shadow-xl  px-4 py-6 bg-white ">
              <textarea
                onChange={handleDescriptionChange}
                minLength={10}
                value={formData.description}
                maxLength={2000}
                placeholder="Description will be auto-generated when you upload an image, or write your own description here..."
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
            <div className="col-span-1">
              <Inputfield
                type="date"
                inputStyle={
                  "md:p-4 p-3 px-4 border border-gray rounded-lg w-full text-gray text12 shadow-custom"
                }
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                value={formData.date}
              />
            </div>
            <div className="col-span-1">
              <Inputfield
                type="time"
                inputStyle={
                  "md:p-4 p-3 px-4 border border-gray rounded-lg w-full text-gray text12 shadow-custom"
                }
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                value={formData.time}
              />
            </div>

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

          <div className="flex items-center justify-between md:gap-3 gap-2">
            <div className="flex-1" />
            <div className="flex items-center md:flex-row flex-col md:gap-3 gap-2 md:pb-0 pb-20">
              {/* Manual Image Analysis Button */}
              {formData.image.length > 0 && formData.image[0]?.type === 'image' && (
                <Button
                  onPress={() => {
                    setImageAnalysisComplete(false);
                    analyzeImageWithAI(formData.image[0].file);
                  }}
                  btnStyle={
                    "px-2 py-3 md:w-[180px] sm:w-[180px] w-[180px] text12 rounded-lg bg-green-600 hover:bg-green-700 text-whiteColor"
                  }
                  btnname={isAnalyzingImage ? 'Analyzing...' : 'Analyze Image'}
                  disabled={isAnalyzingImage}
                />
              )}
              
              <Button
                onPress={handleGenerateWithAI}
                btnStyle={
                  "px-2 py-3 md:w-[200px] sm:w-[200px] w-[200px] text12  rounded-lg bg-blueColor dark:bg-cgreen text-whiteColor"
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
                  "px-2 py-3 md:w-[96px] sm:w-[96px] w-[120px] text12  rounded-lg bg-blueColor dark:bg-cgreen text-whiteColor"
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
