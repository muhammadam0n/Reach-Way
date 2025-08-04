import React, {useState} from "react";
const TextArea = () => {
  const [charLength, setcharLength] = useState(0);
  return (
    <div className="lg:w-[50%] w-full relative mt-10">
      <div className="relative h-[350px] custom-scroll border border-gray rounded-lg shadow-custom px-4 py-6 bg-white  ">
        <textarea
          onChange={(e) => setcharLength(e.target.value.length)}
          minLength={10}
          maxLength={2000}
          placeholder="Describe the problem"
          className="w-full h-full text12 text-black resize-none border-none outline-none pr-8"
        ></textarea>

        <p className="absolute bottom-0 right-4 text-black text-sm mb-2">
          {charLength}/2000
        </p>
      </div>
    </div>
  );
};

export default TextArea;
