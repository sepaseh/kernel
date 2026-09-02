import { Upload, type UploadFile, type UploadProps } from "antd";
import { createStyles } from "antd-style";
import type { FC } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { uploadFile } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

const useStyles = createStyles(({ css }) => ({
  root: css`
    width: 100%;

    .ant-upload-list {
      width: 100%;
    }

    .ant-upload-select {
      width: 100% !important;

      .ant-upload {
        padding: 16px;
      }
    }
  `,
  image: css`
    width: 100%;
    height: 100%;
    object-fit: contain;
  `,
}));

type LogoUploadProps = {
  onChange?: (id?: string) => void;
  url?: string;
  value?: string;
};

export const LogoUpload: FC<LogoUploadProps> = ({ onChange, url, value }) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previousValue, setPreviousValue] = useState<string>();
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    url?: string;
  }>();
  const { styles } = useStyles();
  const hasPendingFile = fileList.some(({ status }) => status !== "done");
  const displayedFileList =
    hasPendingFile ||
    (uploadedFile && value === uploadedFile.id && url !== uploadedFile.url)
      ? fileList
      : [];

  const handleUpload: NonNullable<UploadProps["customRequest"]> = async ({
    file,
    onError,
    onSuccess,
  }) => {
    try {
      const result = await uploadFile(file as File, "public");
      setPreviousValue(value);
      setUploadedFile(result);
      onChange?.(result.id);
      onSuccess?.(result);
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error(getErrorMessage(error)),
      );
    }
  };

  return (
    <Upload
      accept="image/png,image/jpeg,image/svg+xml,image/webp"
      className={styles.root}
      customRequest={handleUpload}
      fileList={displayedFileList}
      listType="picture-card"
      maxCount={1}
      onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
      onRemove={() => onChange?.(previousValue)}
    >
      {url ? (
        <img alt={t("logo")} className={styles.image} src={url} />
      ) : (
        <Icon name="upload" />
      )}
    </Upload>
  );
};
