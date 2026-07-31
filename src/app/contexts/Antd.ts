import { MessageInstance } from "antd/es/message/interface";
import { HookAPI } from "antd/es/modal/useModal";
import { NotificationInstance } from "antd/es/notification/interface";
import { createContext } from "react";

type AntdContextProps = {
  messageAPI: MessageInstance;
  modalAPI: HookAPI;
  notificationAPI: NotificationInstance;
};

export const AntdContext = createContext<AntdContextProps | undefined>(
  undefined,
);
