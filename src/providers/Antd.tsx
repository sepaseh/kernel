import {
  ConfigProvider,
  FormInstance,
  FormProps,
  message as Message,
  Modal,
  theme,
  UploadProps,
} from "antd";
import { createStyles } from "antd-style";
import { FC, ReactNode } from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";

import { themeConfigs } from "@/config/theme";
import { AntdContext } from "@/contexts/Antd";
import { useCore } from "@/hooks/useCore";
import { imageToBase64, imageToDimensions } from "@/utils/format";

const useStyles = createStyles(({ css, cssVar, prefixCls }) => ({
  modal: css`
    .${prefixCls}-modal-close {
      background-color: ${cssVar.colorBgContainerDisabled};
      inset-inline-end: 24px;
      top: 18px;
    }
    .${prefixCls}-modal-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
    }
    .${prefixCls}-modal-footer {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .${prefixCls}-modal-header {
      padding-right: ${cssVar.controlHeight};
    }
    .${prefixCls}-modal-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
  table: css`
    .${prefixCls}-table-container {
      overflow: hidden;
    }
    .${prefixCls}-table-content table {
      border-spacing: 0 12px;
      margin: -12px 0;
    }
    .${prefixCls}-table-tbody > tr > td {
      border-top: 1px solid ${cssVar.colorBorder};
      &:first-child {
        border-inline-start: 1px solid ${cssVar.colorBorder};
        border-start-start-radius: ${cssVar.borderRadius};
        border-end-start-radius: ${cssVar.borderRadius};
      }
      &:last-child {
        border-inline-end: 1px solid ${cssVar.colorBorder};
        border-start-end-radius: ${cssVar.borderRadius};
        border-end-end-radius: ${cssVar.borderRadius};
      }
    }
    .${prefixCls}-table-thead > tr > th {
      border: none;
      &:first-child {
        border-end-start-radius: ${cssVar.borderRadius};
      }
      &:last-child {
        border-end-end-radius: ${cssVar.borderRadius};
      }
    }
  `,
  upload: css`
    .${prefixCls}-upload {
      &.${prefixCls}-upload-select {
        overflow: hidden;
      }
    }
    .${prefixCls}-upload-drag {
      .${prefixCls}-upload {
        overflow: hidden;
        padding: 0;
      }
      .${prefixCls}-upload-drag-container {
        display: block;
      }
    }
  `,
}));

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.colorBgContainer};
    color: ${({ theme }) => theme.colorText};
  }
`;

const TokenBridge: FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = theme.useToken();
  return (
    <ThemeProvider theme={token}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export const AntdProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [messageAPI, messageHolder] = Message.useMessage();
  const [modalAPI, modalHolder] = Modal.useModal();
  const { theme: currentTheme } = useCore();
  const { styles } = useStyles();

  const beforeUpload: (props: {
    dimensions?: { height: number; width: number };
    file: Parameters<NonNullable<UploadProps["beforeUpload"]>>[0];
    form: FormInstance;
    name: string;
    onChange: (value: string) => void;
    size?: number;
  }) => Promise<boolean> = async ({ dimensions, file, form, name, onChange, size }) => {
    if (size && file.size / 1024 / 1024 > size) {
      form.setFields([{ name, errors: [`Image must be smaller than ${size}MB`] }]);
      return false;
    }

    if (dimensions) {
      const { height, width } = await imageToDimensions(file);

      if (height > dimensions.height || width > dimensions.width) {
        form.setFields([
          {
            errors: [`Image dimensions must be smaller than ${dimensions.width}x${dimensions.height}px`],
            name,
          },
        ]);
        return false;
      }
    }

    const base64 = await imageToBase64(file);
    onChange(base64);
    return false;
  };

  const onFinishFailed: (
    errorInfo: Parameters<NonNullable<FormProps["onFinishFailed"]>>[0],
    form: FormInstance,
  ) => void = (errorInfo, form) => {
    const [errorField] = errorInfo.errorFields;
    if (!errorField) return;

    const element = document.getElementById(errorField.name.join("_"));

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      form.scrollToField(errorField.name, { behavior: "smooth", block: "center" });
    }

    form.focusField(errorField.name);
  };

  return (
    <ConfigProvider
      modal={{ className: styles.modal }}
      table={{ className: styles.table }}
      theme={themeConfigs[currentTheme]}
      upload={{ className: styles.upload }}
    >
      <TokenBridge>
        <AntdContext.Provider
          value={{ beforeUpload, messageAPI, modalAPI, onFinishFailed }}
        >
          {children}
          {messageHolder}
          {modalHolder}
        </AntdContext.Provider>
      </TokenBridge>
    </ConfigProvider>
  );
};
