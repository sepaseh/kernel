import { apiClient } from "./client";

export type FileVisibility = "private" | "public";

export type FileResource = {
  contentType: string;
  id: string;
  url?: string;
  visibility: FileVisibility;
};

export const uploadFile = (
  file: File,
  visibility: FileVisibility,
): Promise<FileResource> => {
  const data = new FormData();
  data.append("file", file);
  data.append("visibility", visibility);

  return apiClient.post<FileResource>("/files", data);
};
