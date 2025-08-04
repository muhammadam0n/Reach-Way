import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./ToggleButton.css";
import { toggleTheme } from "../../../Store/DarkModeSlice";

const ToggleButton = () => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div>
      <h2 className="text6 font-bold pb-4 dark:text-whiteColor md:hidden block">
        Appearance
      </h2>
      <label className="md:inline-flex items-center cursor-pointer bg-white rounded-full">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={theme === "dark"}
          onChange={() => dispatch(toggleTheme())}
        />
        <div
          className="relative w-11 h-6 bg-gray-200 bg-gray1 
            dark:peer-focus:ring-blue-800 rounded-full dark:bg-white peer-checked:after:translate-x-full
            after:absolute after:top-[2px] after:start-[2px] after:bg-blueColor dark:after:bg-cgreen 
            after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600
            peer-checked:bg-white"
        ></div>
      </label>
    </div>
  );
};

export default ToggleButton;
