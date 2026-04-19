import axios, { AxiosRequestConfig } from "axios";

import { apiUrl } from "@/config/constants";
import { toCamelCase, toSnakeCase } from "@/utils/transform";

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

let onUnauthorized: (() => void) | null = null;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 && onUnauthorized) onUnauthorized();

      const message =
        error.response.data?.error?.message || "An error occurred";

      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(
        new Error("Network error - please check your connection"),
      );
    }

    return Promise.reject(error);
  },
);

const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await api.delete<T>(url, config);
  return toCamelCase(data);
};

const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await api.get<T>(url, config);
  return toCamelCase(data);
};

const post = async <T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.post<T>(url, toSnakeCase(data), config);
  return toCamelCase(response.data);
};

const put = async <T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.put<T>(url, toSnakeCase(data), config);
  return toCamelCase(response.data);
};

export const apiClient = { del, get, post, put };

export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};
