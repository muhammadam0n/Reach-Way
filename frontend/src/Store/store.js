import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./DarkModeSlice";
import AuthReducer from "./AuthSlice";

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: AuthReducer,

  },
});

export default store;