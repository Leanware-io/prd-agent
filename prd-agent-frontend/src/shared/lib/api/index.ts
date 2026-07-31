import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/shared/config";
import { getUserIdToken } from "@/shared/lib";
import { v4 as uuidV4 } from "uuid";

let sessionKey: string | null = null;

let idToken: string | null = null;

let attempt = 0;

export const API = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const initializeSessionKey = async (): Promise<string> => {
  try {
    const response = await API.post(`${API_URL}/session`);
    if (response.data?.session_key) {
      return response.data.session_key;
    }
  } catch (error) {
    console.error("Failed to get session key from server:", error);
  }
  return uuidV4();
};

export const getSessionKey = async (): Promise<string> => {
  sessionKey ??= await initializeSessionKey();
  return sessionKey;
};

API.interceptors.request.use(async (config) => {
  idToken ??= await getUserIdToken();

  if (idToken) {
    config.headers["Authorization"] = `Bearer ${idToken}`;
  }

  return config;
});

API.interceptors.response.use(
  function (response) {
    attempt = 0;
    return response;
  },
  async function (error: AxiosError) {
    if (attempt < 3 && error?.config?.url !== "/register/") {
      attempt++;
      if (error?.response?.status === 401) {
        const request = { ...error.config } as InternalAxiosRequestConfig;
        idToken = await getUserIdToken();
        request.headers.Authorization = `Bearer ${idToken}`;
        return API.request(request);
      }
    }
    return Promise.reject(error);
  },
);
