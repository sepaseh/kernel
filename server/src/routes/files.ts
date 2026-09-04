import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { files } from "../db/schema.ts";
import type { AppEnvironment } from "../http.ts";
import { ApiError, authenticate } from "../http.ts";

const safeObjectName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");

export const createFileRoutes = () => {
  const app = new Hono<AppEnvironment>();

  app.get("/:fileId/content", async (context) => {
    const dependencies = context.get("dependencies");
    const record = await dependencies.database.query.files.findFirst({
      where: eq(files.id, context.req.param("fileId")),
    });
    if (!record || record.visibility !== "public") {
      throw new ApiError(404, "fileNotFound");
    }
    const contents = await dependencies.storage.get(
      record.bucket,
      record.objectKey,
    );
    return new Response(Buffer.from(contents), {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Length": String(contents.byteLength),
        "Content-Type": record.contentType,
      },
    });
  });

  app.post("/", async (context) => {
    const { account } = await authenticate(context);
    const dependencies = context.get("dependencies");
    const form = await context.req.formData();
    const file = form.get("file");
    const visibility = form.get("visibility");
    if (!(file instanceof File))
      throw new ApiError(400, "fieldRequired", { field: "file" });
    if (visibility !== "public" && visibility !== "private") {
      throw new ApiError(400, "visibilityInvalid");
    }
    if (visibility === "public" && !account.isSystemAdmin) {
      const { getUserPermissions } = await import("../domain.ts");
      const permissions = await getUserPermissions(
        dependencies.database,
        account.id,
      );
      if (!permissions.includes("settings.update")) {
        throw new ApiError(403, "publicUploadDenied");
      }
    }
    if (!file.size) throw new ApiError(400, "fileEmpty");
    if (file.size > dependencies.config.uploadLimitBytes) {
      throw new ApiError(413, "fileTooLarge");
    }
    const id = randomUUID();
    const objectKey = `${id}/${safeObjectName(file.name || "upload")}`;
    const contentType = file.type || "application/octet-stream";
    const stored = await dependencies.storage.put({
      contentType,
      data: new Uint8Array(await file.arrayBuffer()),
      objectKey,
      visibility,
    });
    await dependencies.database.insert(files).values({
      bucket: stored.bucket,
      contentType,
      createdAt: new Date(),
      createdBy: account.id,
      id,
      objectKey: stored.objectKey,
      originalName: file.name || "upload",
      size: file.size,
      visibility,
    });
    const url = dependencies.storage.url(
      stored.bucket,
      stored.objectKey,
      visibility,
    );
    return context.json(
      {
        content_type: contentType,
        id,
        ...(url && { url }),
        visibility,
      },
      201,
    );
  });

  return app;
};
