import axios, { AxiosError } from "axios";

// Create Axios instance with backend base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Important for cookies/session
});

// Custom error type for API errors
type ApiError = {
  message: string;
  cause?: string;
};

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await API.post("/user/login", { email, password });
    if (res.status !== 200) {
      throw new Error(res.data?.message || "Unable to login");
    }
    return res.data;
  } catch (err) {
    const error = err as AxiosError<ApiError>;
    console.error("Login error:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Unable to login"
    );
  }
};

export const signupUser = async (name: string, email: string, password: string) => {
  try {
    const res = await API.post("/user/signup", { name, email, password });
    if (res.status !== 201) {
      throw new Error(res.data?.message || "Unable to signup");
    }
    return res.data;
  } catch (err) {
    const error = err as AxiosError<ApiError>;
    console.error("Signup error:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Unable to signup"
    );
  }
};

export const checkAuthStatus = async () => {
  try {
    const res = await API.get("/user/auth-status");
    if (res.status !== 200) {
      throw new Error(res.data?.message || "Unable to authenticate");
    }
    return res.data;
  } catch (err) {
    const error = err as AxiosError<ApiError>;
    console.error("Auth check error:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Unable to authenticate"
    );
  }
};

export const sendChatRequest = async (message: string) => {
  const res = await API.post("/chat/new", { message });
  if (res.status !== 200) throw new Error("Unable to send chat");
  return res.data;
};

export const getUserChats = async () => {
  const res = await API.get("/chat/all-chats");
  if (res.status !== 200) throw new Error("Unable to get chats");
  return res.data;
};

export const deleteUserChats = async () => {
  const res = await API.delete("/chat/delete");
  if (res.status !== 200) throw new Error("Unable to delete chats");
  return res.data;
};

export const logoutUser = async () => {
  const res = await API.get("/user/logout");
  if (res.status !== 200) throw new Error("Unable to logout");
  return res.data;
};
