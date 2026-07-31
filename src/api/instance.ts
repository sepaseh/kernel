import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { apiUrl } from "@/config";
import { i18nInstance } from "@/i18n";
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

type ApiErrorBody = {
  cause?: unknown;
  message: string;
};

const isApiErrorBody = (value: unknown): value is ApiErrorBody => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    "message" in value &&
    typeof value.message === "string" &&
    value.message.length > 0
  );
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

const retryUnauthorizedRequest = async (
  error: AxiosError<unknown>,
): Promise<AxiosResponse<unknown> | undefined> => {
  if (error.response?.status !== 401) return;

  const requestConfig = error.config as RetryableRequestConfig | undefined;
  const isPublicAuthRequest = publicAuthUrls.has(requestConfig?.url ?? "");

  if (!requestConfig || requestConfig._retried || isPublicAuthRequest) {
    if (!isPublicAuthRequest) handleUnauthorized();
    return;
  }

  requestConfig._retried = true;

  try {
    await refreshAccessToken();
    return api.request(requestConfig);
  } catch {
    handleUnauthorized();
  }
};

const createResponseError = (data: unknown): Error => {
  if (!isApiErrorBody(data)) {
    return new Error(i18nInstance.t("unexpectedError"));
  }

  return new Error(data.message, { cause: data.cause });
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
    if (axios.isCancel(error)) throw error;

    if (!axios.isAxiosError<unknown>(error)) {
      throw new Error(i18nInstance.t("unexpectedError"));
    }

    const retryResponse = await retryUnauthorizedRequest(error);

    if (retryResponse) return retryResponse;

    if (error.response) {
      throw createResponseError(error.response.data);
    }

    if (error.request) {
      throw new Error(i18nInstance.t("networkError"));
    }

    throw new Error(i18nInstance.t("unexpectedError"));
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
