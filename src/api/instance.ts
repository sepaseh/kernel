import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

import { apiUrl } from "@/config";
import { AccessTokenProps } from "@/types";
import { toCamelCase, toSnakeCase } from "@/utils";

import { clearAccessToken, getAccessToken, setAccessToken } from "./token";
const api = axios.create({ baseURL: apiUrl, withCredentials: true });
const refreshUrl = "/auth/refresh-token";
const publicAuthUrls = new Set([
  "/auth/forgot-password",
  "/auth/login",
  "/auth/otp-request",
  "/auth/register",
  refreshUrl,
]);

let onUnauthorized: (() => void) | null = null;
let isHandlingUnauthorized = false;
let refreshPromise: Promise<AccessTokenProps> | null = null;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
};

const handleUnauthorized = () => {
  if (isHandlingUnauthorized) return;

  isHandlingUnauthorized = true;
  clearAccessToken();
  onUnauthorized?.();
};

const refreshAccessToken = (): Promise<AccessTokenProps> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<AccessTokenProps>(refreshUrl, undefined, {
        baseURL: apiUrl,
        withCredentials: true,
      })
      .then(({ data }) => {
        const result = toCamelCase(data);

        setAccessToken(result.accessToken);

        return result;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    const authToken = getAccessToken();

    if (!authToken) return config;

    isHandlingUnauthorized = false;

    return {
      ...config,
      headers: config.headers.setAuthorization(`Bearer ${authToken}`),
    };
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      axios.isAxiosError<{ errors: Record<string, string>; message: string }>(
        error,
      )
    ) {
      if (error.response?.status === 401) {
        const requestConfig = error.config as
          RetryableRequestConfig | undefined;
        const isPublicAuthRequest = publicAuthUrls.has(
          requestConfig?.url ?? "",
        );
        const canRefresh =
          requestConfig && !requestConfig._retried && !isPublicAuthRequest;

        if (canRefresh) {
          requestConfig._retried = true;

          try {
            await refreshAccessToken();
            return api.request(requestConfig);
          } catch {
            handleUnauthorized();
          }
        } else if (!isPublicAuthRequest) {
          handleUnauthorized();
        }
      }

      if (error.response) {
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

export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};
