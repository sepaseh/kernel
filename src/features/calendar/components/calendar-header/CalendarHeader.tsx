import type { CalendarProps } from "antd";
import { Button, Flex, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { FC } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAntd, useCore } from "@/app/hooks";
import { Icon } from "@/shared/ui/icon";

type CalendarHeaderOption = { label: number | string; value: number };
type CalendarHeaderRenderProps = Parameters<
  Required<CalendarProps<Dayjs>>["headerRender"]
>[0];
export type CalendarHeaderProps = Pick<
  CalendarHeaderRenderProps,
  "onChange" | "value"
>;

export const CalendarHeader: FC<CalendarHeaderProps> = ({
  onChange,
  value,
}) => {
  const { t } = useTranslation();
  const { token } = useAntd();
  const { language } = useCore();
  const hasPreviousMonth = value.isAfter(dayjs().startOf("year"), "month");
  const { months, years } = useMemo(() => {
    const calendar = language === "fa" ? "jalali" : "gregory";
    const currentYear = (dayjs().calendar(calendar) as unknown as Dayjs).year();

    return {
      months: Array.from<unknown, CalendarHeaderOption>(
        { length: 12 },
        (_, index) => ({
          label: (dayjs().calendar(calendar) as unknown as Dayjs)
            .month(index)
            .format("MMMM"),
          value: index,
        }),
      ),
      years: Array.from<unknown, CalendarHeaderOption>(
        { length: 12 },
        (_, index) => ({
          label: currentYear + index,
          value: currentYear + index,
        }),
      ),
    };
  }, [language]);

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{ paddingBlockEnd: token.paddingSM }}
    >
      <Flex gap={8}>
        <Select
          aria-label={t("calendarYear")}
          onChange={(year) => onChange(value.clone().year(year))}
          options={years}
          style={{ width: 120 }}
          value={value.year()}
        />
        <Select
          aria-label={t("calendarMonth")}
          onChange={(month) => onChange(value.clone().month(month))}
          options={months}
          style={{ width: 120 }}
          value={value.month()}
        />
      </Flex>
      <Flex gap={8}>
        <Button
          aria-label={t("previousMonth")}
          disabled={!hasPreviousMonth}
          icon={<Icon name="chevronRight" />}
          onClick={() => onChange(value.clone().subtract(1, "month"))}
        />
        <Button
          aria-label={t("nextMonth")}
          icon={<Icon name="chevronLeft" />}
          onClick={() => onChange(value.clone().add(1, "month"))}
        />
      </Flex>
    </Flex>
  );
};
