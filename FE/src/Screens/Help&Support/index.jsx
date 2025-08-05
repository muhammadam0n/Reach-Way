import React, {useState} from "react";
import Send from "./Component/Send"
import Container from "../../Components/Container";
import SupportDropDown from "./Component/SupportDropDown";
import TextArea from "./Component/TextArea";
import UploadDoc from "./Component/UploadDoc";
import { useEffect } from "react";
const index = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitSuccess = () => {
    setShowSuccess(true);
    // Auto-hide after 5 seconds
    setTimeout(() => setShowSuccess(false), 10000);
  };

  useEffect(() => {
    console.log("[log the success]:", showSuccess);
  },[])
  return (
    <Container>
    <SupportDropDown/>
    <TextArea/>
    <UploadDoc/>
    <Send onSubmitSuccess={handleSubmitSuccess} />

    {showSuccess && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Message sent successfully!
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm">
                We'll get back to you soon.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default index;
