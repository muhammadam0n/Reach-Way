import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoggedIn: false,
  token: "",
  email: "", 
};

const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    LoginUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.token = action.payload.token;
      localStorage.setItem("user",JSON.stringify(action.payload));
    },
    UpdateReducer: (state, action) => {
      state.user = action.payload;
    },
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    

    GetUser: (state, action) => {
      let user = localStorage.getItem("user");
      if (user) {
        state.user = user;
        state.isLoggedIn = true;
      }
    },

    LogoutUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.token = "";
      localStorage.removeItem("user");
      localStorage.removeItem("token");

    },
  },
   
});

export const {
  UpdateReducer, 
  LoginUser,
  LogoutUser,
  GetUser,
  setEmail,
  setUserData, 
} = AuthSlice.actions;
export default AuthSlice.reducer;