import { App as AntdApp, theme as antdTheme } from "antd";

export const useAntd = () => {
  const {
    message: messageAPI,
    modal: modalAPI,
    notification: notificationAPI,
  } = AntdApp.useApp();
  const { token } = antdTheme.useToken();

  return { messageAPI, modalAPI, notificationAPI, token };
};
