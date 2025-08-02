import React, {useState} from "react";
import UploadImage from "../../../Components/UploadImage"
const UploadDoc = () => {
  const [formData, setFormData] = useState({
    image: null,
  });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      console.log("File Type:", fileType);
      setFormData({
        ...formData,
        image: URL.createObjectURL(file),
        type: fileType.includes("video") ? "video" : "image",
      });
    }
  };
  return (
    <div className="mt-8">
      <p className="md:text12 text9 mb-3 font-medium dark:text-white">Add Image</p>
      <UploadImage
        handleImageChange={handleImageChange}
        imageUrl={formData.image}
      />
    </div>
  );
};

export default UploadDoc;
