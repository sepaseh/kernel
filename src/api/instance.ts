import axios, { AxiosRequestConfig } from "axios";

import { apiUrl, authTokenKey } from "@/config";
import { getCookie, toCamelCase, toSnakeCase } from "@/utils";

const api = axios.create({ baseURL: apiUrl });

let onUnauthorized: (() => void) | null = null;

api.interceptors.request.use(
  (config) => {
    const authToken = getCookie(authTokenKey);

    if (!authToken) return config;

    return {
      ...config,
      headers: config.headers.setAuthorization(`Bearer ${authToken}`),
    };
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError<{ errors: Record<string, string>; message: string }>(
        error,
      )
    ) {
      if (error.response) {
        if (error.response.status === 401 && onUnauthorized) onUnauthorized();

        return Promise.reject(
          new Error(error.response.data.message, {
            cause: error.response.data.errors,
          }),
        );
      }

      if (error.request) {
        return Promise.reject(
          new Error("Network error - please check your connection"),
        );
      }
    }

    return Promise.reject(error);
  },
);

const blob = async (
  url: string,
  config?: AxiosRequestConfig,
): Promise<Blob> => {
  const { data } = await api.get<Blob>(url, {
    ...config,
    responseType: "blob",
  });

  return data;
};

const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await api.delete<T>(url, config);
  return toCamelCase(data);
};

const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await api.get<T>(url, config);
  return toCamelCase(data);
};

const patch = async <T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.patch<T>(url, toSnakeCase(data), config);
  return toCamelCase(response.data);
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

export const apiClient = { blob, del, get, patch, post, put };

export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};
