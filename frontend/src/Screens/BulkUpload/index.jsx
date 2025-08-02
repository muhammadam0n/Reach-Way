import React, { useState } from "react";
import Container from "../../Components/Container";
import UploadImage from "../../Components/UploadImage";
import DatePickerComponent from "./components/DataPickerComponent";
import PostCard from "./components/PostCard";

const BulkUpload = () => {


  const [formData, setFormData] = useState({
    images: [], // Array of images
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const updatedImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.includes("video") ? "video" : "image",
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...updatedImages], // append new images
    }));
  };


  return (
    <Container search>
      <div className="lg:w-[84%] md:py-8 py-5">
        {/* <UploadImage
          handleImageChange={handleImageChange}
          imageUrls={formData.images}
          fileize={true}
        /> */}
        {/* <DatePickerComponent /> */}
        <PostCard />
      </div>
    </Container>
  );
};

export default BulkUpload;
