type StoredObject = {
  bucket: string;
  objectKey: string;
};

export type ObjectStorage = {
  delete(bucket: string, objectKey: string): Promise<void>;
  ensureReady(): Promise<void>;
  get(bucket: string, objectKey: string): Promise<Uint8Array>;
  put(input: {
    contentType: string;
    data: Uint8Array;
    objectKey: string;
    visibility: "private" | "public";
  }): Promise<StoredObject>;
  url(
    bucket: string,
    objectKey: string,
    visibility: string,
  ): string | undefined;
};

export const publicObjectUrl = (
  baseUrl: string,
  bucket: string,
  objectKey: string,
) =>
  `${baseUrl}/${bucket}/${objectKey.split("/").map(encodeURIComponent).join("/")}`;
