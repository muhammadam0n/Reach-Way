import React, { useEffect, useState } from "react";
import InputField from "../../Components/InputField";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/AxiosInterceptor";
import ENDPOINTS from "../../Utils/Endpoints";
import { showToast } from "../../Components/Toast";
import { LoginUser } from "../../Store/AuthSlice";
import PasswordInput from "../../Components/PasswordInput";


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fromData, setFormData] = useState({
    email: "",
    password: "",
  });

  const theme = useSelector((state) => state.theme.theme);
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post({
        url: `${ENDPOINTS.AUTH.SIGN_IN}`,
        data: {
          email: fromData.email,
          password: fromData.password,
        },
      });

      if (response) {
        showToast({ message: response?.message, isError: false });
        localStorage.setItem("token", response?.token);
        localStorage.setItem("userId", response?.user?._id || response?.user?.id);
        dispatch(LoginUser(response.user));
        navigate("/dashboard");
      }
      setFormData({
        email: "",
        password: "",
      });
    } catch (error) {
      showToast({ message: error?.message, isError: true });
    }
  };

  return (
    <div className="bg-background dark:bg-backgroundDark bg-no-repeat bg-cover w-full flex items-center h-screen justify-center dark:text-whiteColor">
      <div className="text-center lg:w-[30%] w-[80%]">
        <h2 className="subheading font-medium dark:text-whiteColor py-6 text-3xl">
          Welcome Back
        </h2>
        <p className="text-gray-400 dark:text-gray-300 mb-8 text-sm">
          Sign in to your REACH WAY account
        </p>

        <div className="bg-[#00000015] dark:bg-[#fff1] rounded-xl w-full p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={HandleSubmit} className="text-center">
            <InputField
              Labelname="Email"
              values={fromData.email}
              type="email"
              placeholder="Enter Email"
              name="email"
              htmlFor="email"
              labelstyle="text8"
              inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600 focus:border-primaryColor focus:ring-2 focus:ring-primaryColor focus:ring-opacity-20 transition-all duration-200"
              divstyle="w-full"
              onChange={(e) =>
                setFormData({ ...fromData, email: e.target.value })
              }
            />
            <PasswordInput
              Labelname="Password"
              imageStyle={`lg:w-8 w-4 md:mr-20 mr-4 md:mt-2 mt-4`}
              values={fromData.password}
              type="password"
              placeholder="Enter Password"
              name="password"
              htmlFor="password"
              labelstyle="text8"
              inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600 focus:border-primaryColor focus:ring-2 focus:ring-primaryColor focus:ring-opacity-20 transition-all duration-200"
              divstyle="w-full md:mt-4 mt-4"
              onChange={(e) =>
                setFormData({ ...fromData, password: e.target.value })
              }
            />
            <div className="py-4 text-lightblueColor dark:text-cgreen text12">
              <Link to="/forgot-password" className="hover:underline transition-colors duration-200">
                Forgot Password?
              </Link>
            </div>

            <div className="md:py-6 py-2">
              <Button
                btnname="Sign In"
                btnStyle="px-20 py-4 text11 rounded-full bg-primaryColor text-whiteColor hover:bg-primaryColor/90 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                type="submit"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text13 text-gray-500 dark:text-gray-400">
              <p>Don't have an account?</p>
              <Link
                to="/signup"
                className="text-lightblueColor dark:text-cgreen hover:underline transition-colors duration-200 font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
