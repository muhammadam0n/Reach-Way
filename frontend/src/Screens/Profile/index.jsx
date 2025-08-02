// import React from 'react'
// import Container from '../../Components/Container'
// import { IMAGES } from '../../Utils/Images'
// import Inputfield from '../../Components/InputField'
// import ToggleButton from './Components/ToggleButton'

// const Profile = () => {
//     return (
//         <Container>

//             <div className=''  >
//                 <div className='w-[15%] mx-auto'  >
//                     <div className='relative' >
//                         <img src={IMAGES.PROFILEAVATAR} alt={IMAGES.PROFILEAVATAR} className='w-28 border rounded-full object-contain' />
//                     </div>
//                     <div className='absolute -mt-7 ml-20 bg-blueColor p-2 rounded-full '>
//                         <img src={IMAGES.CAMRAICON} alt={IMAGES.CAMRAICON} className='w-4' />
//                     </div>
//                 </div>

//                 <div className=' py-4'>
//                     <h2 className='text3 font-bold ' >Full Name</h2>
//                     <div className='grid md:grid-cols-2 grid-cols-1  items-center justify-center py-4' >

//                         <Inputfield
//                             type="text"
//                             inputStyle=" shadow-xl border border-gray w-[80%]  rounded-md p-2 py-3"
//                             placeholder="First Name"
//                         />
//                         <Inputfield
//                             type="text"
//                             inputStyle=" shadow-xl border border-gray w-[80%]  rounded-md p-2 py-3"
//                             placeholder="Last Name"
//                         />
//                     </div>
//                 </div>



//                 <div className=' py-4 '>
//                     <h2 className='text3 font-bold ' >Connected Email</h2>
//                     <div className='grid md:grid-cols-2 grid-cols-1 gap-4 items-center justify-center py-4' >

//                         <Inputfield
//                             type="text"
//                             inputStyle=" shadow-xl border border-gray w-[80%]  rounded-md p-2 py-3"
//                             placeholder="First Name"
//                         />
//                         <ToggleButton />
//                     </div>
//                 </div>


//                 <div className=' py-4'>
//                     <h2 className='text3 font-bold ' >Change Password</h2>
//                     <div className='grid md:grid-cols-2 grid-cols-1 gap-4 items-center justify-center py-4' >

//                         <Inputfield
//                             type="password"
//                             inputStyle=" shadow-xl border border-gray w-[80%]  rounded-md p-2 py-3"
//                             placeholder="Enter Password"
//                         />
//                         <Inputfield
//                             type="password"
//                             inputStyle=" shadow-xl border border-gray w-[80%]  rounded-md p-2 py-3"
//                             placeholder="Confirm Password"
//                         />
//                     </div>
//                 </div>





//             </div>

//         </Container>
//     )
// }

// export default Profile




import React, { useState } from 'react';
import Container from '../../Components/Container';
import { IMAGES } from '../../Utils/Images';
import Inputfield from '../../Components/InputField';
import ToggleButton from './Components/ToggleButton';
import PasswordInput from '../../Components/PasswordInput';

const Profile = () => {


    const user = localStorage.getItem("user");
    const userData = user ? JSON.parse(user) : null;
    const [firstName, lastName] = userData?.name.split(" ");

    const [formData, setFormData] = useState({
        firstName: firstName,
        lastName: lastName,
        email: userData?.email,
        password: '',
        confirmPassword: '',
        imgUrl: ""
    });


    console.log("Update_formdata", formData);
    


    const HandleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    }


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.type;
            // console.log("File Type:", fileType); // log file type for debugging

            // Create the URL for the file (both video and image)
            setFormData({
                ...formData,
                imgUrl: URL.createObjectURL(file)
            });
        }
    };




    return (
        <Container>
            {/* Profile Avatar Section */}
            <div className="w-full flex flex-col items-center py-8">
                <div className="relative w-32">
                    {
                        formData.imgUrl ?
                            <img
                                src={formData.imgUrl}
                                alt="Profile Avatar"
                                className="md:w-32 w-20 h-20 md:h-32 border rounded-full object-cover shadow-lg"
                            />
                            :
                            <img
                                src={IMAGES.PROFILEAVATAR}
                                alt="Profile Avatar"
                                className="md:w-32 w-20 h-20 md:h-32 border rounded-full object-cover shadow-lg"
                            />
                    }
                    <label htmlFor="file">
                        <Inputfield
                            id={"file"}
                            type={"file"}
                            accept={"image/*"}
                            inputStyle={"hidden"}
                            onChange={(e) => { handleImageChange(e) }}
                        />
                        <div className="file-upload-button">
                            <div className="absolute bottom-0 md:right-0 right-10 bg-blueColor md:p-2 p-1 rounded-full cursor-pointer shadow-md">
                                <img src={IMAGES.CAMRAICON} alt="Camera Icon" className="w-5" />
                            </div>
                        </div>

                    </label>
                </div>
            </div>

            {/* Full Name Section */}
            <form onSubmit={HandleSubmit} className='w-[80%] mx-auto' >
                <div className="px-4 md:py-6">
                    <h2 className="text6 font-bold pb-4 dark:text-whiteColor ">Full Name</h2>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                        <Inputfield
                            type="text"
                            inputStyle="w-full shadow-md border border-gray-300 rounded-lg p-3 "
                            placeholder="First Name"
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            defaultValue={formData.firstName}
                        />
                        <Inputfield
                            type="text"
                            inputStyle="w-full shadow-md border border-gray-300 rounded-lg p-3"
                            placeholder="Last Name"
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            defaultValue={formData.lastName}
                        />
                    </div>
                </div>

                {/* Connected Email Section */}
                <div className="px-4 md:py-6 py-4">
                    <div className='grid md:grid-cols-2 grid-cols-1 gap-8'>
                        <h2 className="text6 font-bold pb-4 dark:text-whiteColor ">Connected Email</h2>
                        <h2 className="text6 font-bold pb-4 dark:text-whiteColor md:block hidden  ">Appearance</h2>
                    </div>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                        <Inputfield
                            type="email"
                            inputStyle="w-full shadow-md border border-gray-300 rounded-lg p-3"
                            placeholder="Email Address"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            defaultValue={formData.email}
                        />
                        <div className="flex items-center">
                            <ToggleButton />
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                {/* <div className="px-4 md:py-6">
                    <h2 className="text6 font-bold pb-4 dark:text-whiteColor ">Change Password</h2>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                        <PasswordInput
                            type="password"
                            imageStyle={`lg:w-6 lg:h-4 w-4 h-3 md:mr-4 mr-3`}
                            placeholder="Enter Password"inputStyle="w-full shadow-md border border-gray-300 rounded-lg p-3 "
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            defaultValue={formData.password}
                        />
                        <PasswordInput
                            type="password"
                            inputStyle="w-full shadow-md border border-gray-300 rounded-lg p-3"
                            imageStyle={`lg:w-6 lg:h-4 w-4 h-3 md:mr-4 mr-3`}
                            placeholder="Confirm Password"
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            defaultValue={formData.confirmPassword}
                        />
                    </div>
                </div> */}

                {/* Submit Button */}
                {/* <div className="px-4 py-6 flex justify-center">
                    <button onClick={HandleSubmit} className="bg-blueColor dark:bg-cgreen text-white font-semibold rounded-full px-8 py-3 shadow-md hover:bg-blue-600">
                        Change
                    </button>
                </div> */}
            </form>



        </Container>
    );
};

export default Profile;
