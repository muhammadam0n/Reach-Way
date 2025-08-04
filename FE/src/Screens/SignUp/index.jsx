import React, { useEffect, useState } from 'react'
import Inputfield from '../../Components/InputField'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../Components/Button'
import { useSelector } from 'react-redux'
import api from '../../api/AxiosInterceptor'
import ENDPOINTS from '../../Utils/Endpoints'
import { showToast } from '../../Components/Toast'
import PasswordInput from '../../Components/PasswordInput'

const Signup = () => {

    const theme = useSelector((state) => state.theme.theme);
    const navigate = useNavigate();
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const [fromData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    })

    const HandleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await api.post({
                url: `${ENDPOINTS.AUTH.REGISTER_USER}`,
                data: {
                    name: fromData.firstName + " " + fromData.lastName,
                    email: fromData.email,
                    password: fromData.password
                }
            });

            if (response) {
                showToast({ message: response.message, isError: false });
                console.log(response);
                navigate("/")
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: ""
                })
            }
        } catch (error) {
            console.log(error.message);
            showToast({ message: error.message, isError: true });
        }
    }





    return (
        <div className='bg-background dark:bg-backgroundDark bg-no-repeat bg-cover w-full flex items-center h-screen  justify-center dark:text-whiteColor' >
            <div className=' text-center lg:w-[30%] w-[80%] md:py-6 py-2'>
                <h2 className='subheading font-medium md:py-' >Signup</h2>

                <div className='bg-[#00000015] dark:bg-[#fff1] rounded-xl w-full p-6 mt-6'>

                    <form onSubmit={HandleSubmit} className='text-center ' >

                        <Inputfield
                            Labelname="First Name"
                            values={fromData.firstName}
                            type="text"
                            placeholder="Enter First Name"
                            name="firstName"
                            htmlFor="firstName"
                            labelstyle="text8"
                            inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black "
                            divstyle="w-full"
                            onChange={(e) => setFormData({ ...fromData, firstName: e.target.value })}
                        />
                        <Inputfield
                            Labelname="Last Name"
                            values={fromData.lastName}
                            type="text"
                            placeholder="Enter Last Name"
                            name="lastName"
                            htmlFor="lastName"
                            labelstyle="text8"
                            inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black "
                            divstyle="w-full md:mt-4 mt-4"
                            onChange={(e) => setFormData({ ...fromData, lastName: e.target.value })}
                        />
                        <Inputfield
                            Labelname="Email"
                            values={fromData.email}
                            type="email"
                            placeholder="Enter Email"
                            name="email"
                            htmlFor="email"
                            labelstyle="text8"
                            inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black "
                            divstyle="w-full md:mt-4 mt-4"
                            onChange={(e) => setFormData({ ...fromData, email: e.target.value })}
                        />
                        <PasswordInput
                            imageStyle={`lg:w-8  w-4  md:mr-20 mr-4 md:mt-2 mt-4`}
                            Labelname="Password"
                            values={fromData.password}
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            htmlFor="password"
                            labelstyle="text8"
                            inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black "
                            divstyle="w-full md:mt-4 mt-4"
                            onChange={(e) => setFormData({ ...fromData, password: e.target.value })}
                        />
                        <div className='py-4 text-lightblueColor dark:text-cgreen text12'>
                            <Link to={-1} >
                                Already have an Account
                            </Link>
                        </div>

                        <div className='md:py-4 py-1' >
                            <Button
                                btnname="Sign Up"
                                btnStyle="px-20 py-3 text11 rounded-full  bg-primaryColor text-whiteColor"
                            />
                        </div>
                    </form>

                </div>

            </div>
        </div>
    )
}

export default Signup