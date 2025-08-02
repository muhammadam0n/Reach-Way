import axios from "axios";
import store from "../Store/store";
import { LogoutUser } from "../Store/AuthSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000",
  timeout: 600000,
  headers: {
    Accept: "application/json",
  },
});

const setAuthToken = async () => {
  try {
    const USER_TOKEN = localStorage.getItem("token");
    if (USER_TOKEN) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${USER_TOKEN}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

class HttpError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
  }
}

class SocketError extends Error {
  constructor(message) {
    super(message);
  }
}

const checkUnAuth = async (error) => {
  if (error === "Unauthenticated") {
    store.dispatch(LogoutUser());
  }
};

const handleRequestError = (error) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        throw new SocketError(
          "Socket timeout: The request took too long to complete."
        );
      }
      throw new NetworkError("No Internet Connection");
    }
    const status = error.response.status;
    const responseData = error.response.data;
    if (responseData.error) {
      checkUnAuth(responseData.error.messages[0]);
      throw new HttpError(responseData.error.messages[0], status);
    } else if (responseData.errors || responseData.message) {
      checkUnAuth(responseData.message);
      throw new HttpError(responseData.message, status, responseData.errors);
    } else {
      throw new HttpError(error.response.statusText, status);
    }
  }
  throw error;
};
const addApiPrefix = (url) => `/api/${url}/`;

const request = async ({
  method = "GET",
  url,
  data = null,
  config = {},
  includeToken = true,
  isFile = false,
}) => {
  try {
    if (includeToken) {
      await setAuthToken();
    }

    let requestData = data;
    if (isFile) {
      const formData = new FormData();
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      requestData = formData;
    }

    const response = await axiosInstance({
      method,
      url: addApiPrefix(url),
      data: requestData,
      ...config,
    });

    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
};

const api = {
  get: ({ url, config = {} }) => request({ method: "GET", url, config }),
  post: ({ url, data = null, config = {} }) => request({ method: "POST", url, data, config }),
  patch: ({ url, data = null, config = {} }) => request({ method: "PATCH", url, data, config }),
  put: ({ url, data = null, config = {} }) => request({ method: "PUT", url, data, config }),
  delete: ({ url, config = {} }) => request({ method: "DELETE", url, config }),
};

export default api;
