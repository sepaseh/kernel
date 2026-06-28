import { Flex, Typography } from "antd";
import dayjs from "dayjs";
import { FC } from "react";

export const DateView: FC<{ date: number }> = ({ date }) => {
  const d = dayjs(date * 1000);

  return (
    <Flex gap={4} vertical>
      <Typography.Text>{d.format("YYYY/MM/DD")}</Typography.Text>
      <Typography.Text type="secondary">{d.format("HH:mm")}</Typography.Text>
    </Flex>
  );
};
