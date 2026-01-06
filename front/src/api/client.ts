import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { ApiRequestConfig } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  // Zustand 스토어에서 직접 토큰을 가져옴
  const token = useAuthStore.getState().token; 
  
  if (token) {
    config.headers = config.headers ?? {};
    // Bearer 접두사가 없으면 붙여서 전송
    config.headers.Authorization = `${token.startsWith("Bearer ") ? "" : "Bearer "}${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] = config.headers["Content-Type"] ?? "application/json";
  }
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const config = error.config as ApiRequestConfig;

    // 401 에러 발생 시 자동 로그아웃 처리
    if (status === 401 && !config?.skipAuthLogout) {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      useAuthStore.getState().logout(); // 스토어의 logout 함수 호출
      // 필요한 경우 로그인 페이지로 이동 시키는 로직 추가 가능
      // window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;