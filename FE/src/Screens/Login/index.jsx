import React, { useEffect, useState } from "react";
import Inputfield from "../../Components/InputField";
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
    <div className="bg-background dark:bg-backgroundDark bg-no-repeat bg-cover w-full flex items-center h-screen justify-center dark:text-whiteColor ">
      <div className=" text-center lg:w-[30%] w-[80%]">
        <h2 className="subheading font-medium dark:text-whiteColor py-6">
          Login
        </h2>

        <div className="bg-[#00000015] dark:bg-[#fff1] rounded-xl w-full p-6">
          <form onSubmit={HandleSubmit} className="text-center py-6">
            <Inputfield
              Labelname="Email"
              values={fromData.email}
              type="email"
              placeholder="Enter Email"
              name="email"
              htmlFor="email"
              labelstyle="text8"
              inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black "
              divstyle="w-full"
              onChange={(e) =>
                setFormData({ ...fromData, email: e.target.value })
              }
            />
            <PasswordInput
              Labelname="Password"
              imageStyle={`lg:w-8  w-4  md:mr-20 mr-4 md:mt-2 mt-4`}
              values={fromData.password}
              type="password"
              placeholder="Enter Password"
              name="password"
              htmlFor="password"
              labelstyle="text8"
              inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black "
              divstyle="w-full md:mt-4 mt-4"
              onChange={(e) =>
                setFormData({ ...fromData, password: e.target.value })
              }
            />
            <div className="py-2  text-lightblueColor dark:text-cgreen text12">
              <Link to="/forgot-password">Forgot Password</Link>
            </div>

            <div className="md:py-4 py-1">
              <Button
                btnname="Login"
                btnStyle="px-20 py-3 text11 rounded-full  bg-primaryColor text-whiteColor"
                onPress={() => {
                  navigate("/dashboard");
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-2 text13">
              <p>Create Account</p>
              <span>|</span>
              <Link
                to="/signup"
                className="text-lightblueColor dark:text-cgreen"
              >
                Signup
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
