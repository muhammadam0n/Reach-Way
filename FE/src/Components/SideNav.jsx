import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { sideNavItems } from "../Utils/DummyData";
// import { IMAGES } from "../Utils/Images";
import { useSelector } from "react-redux";

const SideNav = ({ menu, setMenu }) => {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  const them = useSelector((state) => state.theme.theme);

  return (
    <div
      className={`bg-primaryColor dark:bg-whiteColor h-screen md:w-[125px] transition-all duration-500 ${
        menu
          ? "w-[110px] absolute left-0 top-0 z-50"
          : "w-[0px] md:relative absolute left-0 top-0 z-50"
      } overflow-hidden`}
    >
      {sideNavItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-center md:py-6 py-5 lg:px-10 md:px-8 px-6"
        >
          <Link to={item.href}>
            {them === "light" ? (
              <img
                onClick={() => {
                  setMenu(false);
                  setActive(item.href);
                }}
                src={active === item.href ? item.activeImg : item.image}
                alt={item.image}
                draggable={false}
                className="md:w-7 w-5 cursor-pointer"
              />
            ) : (
              <img
                onClick={() => {
                  setMenu(false);
                  setActive(item.href);
                }}
                src={active === item.href ? item.darkActive : item.darkImg}
                alt={item.image}
                draggable={false}
                className="md:w-7 w-5 cursor-pointer"
              />
            )}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SideNav;
