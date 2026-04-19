import { FormInstance, FormProps, UploadProps } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { HookAPI } from "antd/es/modal/useModal";
import { createContext } from "react";

type AntdContextProps = {
  beforeUpload: (props: {
    dimensions?: { height: number; width: number };
    file: Parameters<NonNullable<UploadProps["beforeUpload"]>>[0];
    form: FormInstance;
    name: string;
    onChange: (value: string) => void;
    size?: number;
  }) => Promise<boolean>;
  messageAPI: MessageInstance;
  modalAPI: HookAPI;
  onFinishFailed: (
    errorInfo: Parameters<NonNullable<FormProps["onFinishFailed"]>>[0],
    form: FormInstance,
  ) => void;
};

export const AntdContext = createContext<AntdContextProps | undefined>(
  undefined,
);
