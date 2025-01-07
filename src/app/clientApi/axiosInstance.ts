import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'https://backend.agiverse.io',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GET request wrapper
export const get = async <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance.get(url, {
    params,
    ...config,
  });
  return response.data;
};

// POST request wrapper
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
  return response.data;
};

export default axiosInstance; 