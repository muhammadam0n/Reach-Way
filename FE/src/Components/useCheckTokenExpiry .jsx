import { useEffect } from "react";

const useCheckTokenExpiry = () => {
    useEffect(() => {
        const tokenData = JSON.parse(localStorage.getItem("fbAccountInfo")); // Change key if needed

        if (tokenData && tokenData.expiresIn) {
            const currentTime = Math.floor(Date.now() / 1000); // in seconds
            const expiryTime = tokenData.expiresIn;

            if (currentTime >= expiryTime) {
                localStorage.removeItem("fbAccountInfo");
                localStorage.removeItem("fbAccessToken");
                localStorage.removeItem("fbPages");
                localStorage.removeItem("fbUserID");
                console.log("❌ Facebook token expired and removed.");
            } else {
                console.log("✅ Facebook token is still valid.");
            }
        }
    }, []);
};

export default useCheckTokenExpiry;
