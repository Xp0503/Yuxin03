import axios from "axios";
import { useTokenStore } from "@/stores/token";

const baseURL = 'http://localhost:8080';
const request = axios.create({
  baseURL,
  timeout: 50000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const tokenStore = useTokenStore();
    if (tokenStore.token) {
      config.headers.Authorization = `Bearer ${tokenStore.token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('API Response:', response.data);
    return response.data;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

export default request;