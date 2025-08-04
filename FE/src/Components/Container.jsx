import React, { useEffect } from "react";
import SideNav from "./SideNav";
import { IMAGES } from "../utils/Images";
import InputField from "./InputField";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogoutUser } from "../Store/AuthSlice";
import { showToast } from "./Toast";

const Container = ({ children, search }) => {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const [menu, setMenu] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);


  const handleLogout = () => {
    dispatch(LogoutUser());
    setOpen(false);
    navigation("/");
    showToast({ message: "Logout Successfully", isError: false });
  };





  return (
    <div
      className="flex h-screen overflow-hidden bg-background dark:bg-backgroundDark 
    bg-no-repeat bg-cover w-full"
    >
      {/* Left Sidebar (Fixed) */}
      <SideNav menu={menu} setMenu={setMenu} />

      {/* Right Side (Navbar + Scrollable Content) */}
      <div className="w-full lg:w-full transition-all duration-500 h-full">
        {/* Navbar (Fixed) */}
        <header className="w-full p-4 flex justify-between items-center z-50">
          <div
            className={`flex items-center ${search ? "justify-between" : "md:justify-end justify-between "
              } md:w-[92%] w-[100%] mx-auto relative`}
          >
            <div className="md:hidden block">
              <img
                onClick={() => setMenu(!menu)}
                src={theme === "dark" ? IMAGES.MENU : IMAGES.MENUDARK}
                alt={IMAGES.MENUDARK}
                className="md:w-8 w-5 cursor-pointer"
              />
            </div>

            {search && (
              <div className="flex md:w-auto w-[70%] items-center justify-center gap-2 cursor-pointer">
                <div
                  className="relative bg-whiteColor shadow-custom px-3 flex items-center 
                w-full bg-InputFieldColor overflow-hidden border-[1px] border-gray rounded-md"
                >
                  <InputField
                    placeholder="Search"
                    leadingImage={IMAGES.SEARCHICON}
                    imageStyle="lg:w-6 md:w-5 w-4"
                    innerDiv="flex items-center md:gap-4 gap-2 "
                    inputStyle="md:py-3 py-2 outline-none  text12 text-gray-700 lg:w-[500px] 
                    placeholder:text-PlaceholderColor bg-InputFieldColor"
                  />
                </div>
              </div>
            )}

            <div
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center justify-end gap-2 py-2 cursor-pointer"
            >
              <img
                src={IMAGES.AVATAR}
                alt="Avatar"
                className="lg:w-8 md:w-8 w-6 object-contain"
              />
              <span className="text12  text-whiteColor md:block hidden">
                User Workplace
              </span>
              <MdOutlineKeyboardArrowDown
                className={`lg:w-6 md:w-6 ${open ? "rotate-180" : ""
                  } w-5 lg:h-7 md:h-6 h-5 object-contain text-whiteColor md:block hidden`}
              />
            </div>

            {/* Drop Down  */}
            <div
              className={`bg-whiteColor ${open ? "flex flex-col" : "hidden"
                } transition-all duration-100 shadow-custom rounded-md md:p-4 p-2 flex flex-col gap-2 
              absolute z-50 md:-bottom-28 -bottom-20 right-0 text14`}
            >
              <p
                className="cursor-pointer"
                onClick={() => navigation("/profile")}
              >
                Manage Account
              </p>
              <p
                className="cursor-pointer"
                onClick={() => navigation("/integrations")}
              >
                Add Account
              </p>
              <p className="cursor-pointer" onClick={() => handleLogout()}>
                Logout
              </p>
            </div>
            {/* Drop Down  */}
          </div>
        </header>

        {/* Main Content (Scrollable) */}
        <div
          className="overflow-auto custom-scrollbar p-4 bg-BackgroundColor md:w-[90%] w-[100%] mx-auto pb-6 h-[90%]  
        "
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Container;
