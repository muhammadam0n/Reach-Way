import React, { useEffect, useState } from 'react';
import Inputfield from '../../Components/InputField';
import Button from '../../Components/Button';
import { useSelector } from 'react-redux';


const ForgotPassword = () => {
    const theme = useSelector((state) => state.theme.theme);

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const [formData, setFormData] = useState({
        email: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch('http://localhost:5000/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Password reset link sent!");
            } else {
                setMessage(data.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }

        e.target.reset();
    };

    return (
        <div className='bg-background dark:bg-backgroundDark bg-no-repeat bg-cover w-full flex items-center h-screen justify-center dark:text-whiteColor'>
            <div className='text-center lg:w-[40%] w-[90%]'>
                <h2 className='subheading font-medium py-6 text-3xl'>Reset Password</h2>
                <p className="text-gray-400 dark:text-gray-300 mb-8 text-sm">
                    Enter your email to receive a password reset link
                </p>

                <div className='bg-[#00000015] dark:bg-[#fff1] rounded-xl w-full p-8 shadow-lg backdrop-blur-sm'>
                    <form onSubmit={handleSubmit} className='text-center'>
                        <Inputfield
                            Labelname="Email"
                            type="email"
                            placeholder="Enter Email"
                            name="email"
                            htmlFor="email"
                            labelstyle="text8"
                            inputStyle="p-4 lg:w-[70%] w-full mt-2 mx-auto rounded-full placeholder:text-gray bg-gray2 text-black dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600 focus:border-primaryColor focus:ring-2 focus:ring-primaryColor focus:ring-opacity-20 transition-all duration-200"
                            divstyle="w-full"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <div className='md:py-6 py-4'>
                            <Button
                                btnname={loading ? "Sending..." : "Reset Password"}
                                btnStyle="px-10 py-4 text11 rounded-full bg-primaryColor text-whiteColor hover:bg-primaryColor/90 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                                disabled={loading}
                            />
                        </div>

                        {message && (
                            <div className={`py-3 px-4 rounded-lg text-sm ${
                                message.includes("sent") 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
