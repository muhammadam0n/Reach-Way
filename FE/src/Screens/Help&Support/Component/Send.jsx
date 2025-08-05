import React from "react";

import Button from "../../../Components/Button";
import { useState } from "react";
const NeedHelp = ({onSubmitSuccess}) => {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    
    try {

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmitSuccess();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:w-[50%] w-full flex justify-center items-center md:mt-5 mt-7">
      <Button
        onPress={handleSend}
        btnname="Send"
        btnStyle="text10 text-white"
        divstyle={`px-14 py-2 rounded-lg ${
          loading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-black dark:bg-cgreen hover:opacity-90"
        }`}
        disabled={loading}
      />
    </div>
  );
};

export default NeedHelp;
