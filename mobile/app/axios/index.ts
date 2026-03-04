import axios from "axios";
import Config from "react-native-config";

const baseURL = Config.VITE_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
