import { toast } from "react-hot-toast";
 
export const showToast = ({
  message,
  isError = false,
  position = "top-right",
  autoClose = 1000,
}) => {
  toast(message, {
    type: isError ? "error" : "success",
    position,
    duration: autoClose,
    style: {
      border: isError ? "1px solid red" : "1px solid green",
      padding: "12px",
      color: isError ? "red" : "green",
    },
  });
};
