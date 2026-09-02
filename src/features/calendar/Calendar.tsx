import type { CalendarProps } from "antd";
import { Button, Calendar, Card, Col, Flex, Row, Select, Spin } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import jalaliday from "jalaliday";
import type { PropsWithChildren, ReactElement } from "react";
import { cloneElement, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAntd, useCore } from "@/app/hooks";
import { getRoutePermissions } from "@/app/lib";
import { getErrorMessage } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

import {
  createCalendarDate,
  deleteCalendarDate,
  fetchCalendarDates,
} from "./api";
import { useCalendarStyles } from "./styles";

dayjs.extend(jalaliday);

type CalendarCell = ReactElement<PropsWithChildren<{ className?: string }>>;

const formatCalendarDate = (date: Dayjs) =>
  (date.calendar("gregory") as unknown as Dayjs).format("YYYY-MM-DD");

export const CalendarPage = () => {
  const { t } = useTranslation();
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingDate, setSubmittingDate] = useState<string>();
  const { messageAPI, token } = useAntd();
  const { language, user } = useCore();
  const { canUpdate } = getRoutePermissions("calendar", user);
  const { styles } = useCalendarStyles();

  const { months, years } = useMemo(() => {
    const calendar = language === "fa" ? "jalali" : "gregory";
    const currentYear = (dayjs().calendar(calendar) as unknown as Dayjs).year();

    return {
      months: Array.from({ length: 12 }, (_, index) => ({
        label: (dayjs().calendar(calendar) as unknown as Dayjs)
          .month(index)
          .format("MMMM"),
        value: index,
      })),
      years: Array.from({ length: 12 }, (_, index) => ({
        label: currentYear + index,
        value: currentYear + index,
      })),
    };
  }, [language]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setDates(await fetchCalendarDates());
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [messageAPI]);

  const handleSelect: CalendarProps<Dayjs>["onSelect"] = async (
    date,
    selectInfo,
  ) => {
    if (!canUpdate || selectInfo.source !== "date" || submittingDate) return;

    const formattedDate = formatCalendarDate(date);

    try {
      setSubmittingDate(formattedDate);
      await (dates.includes(formattedDate)
        ? deleteCalendarDate(formattedDate)
        : createCalendarDate(formattedDate));
      messageAPI.success(t("calendarUpdated"));
      await fetchData();
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmittingDate(undefined);
    }
  };

  const fullCellRender: CalendarProps<Dayjs>["fullCellRender"] = (
    date,
    info,
  ) => {
    if (info.type !== "date") return info.originNode;

    const formattedDate = formatCalendarDate(date);
    const originNode = info.originNode as CalendarCell;

    return cloneElement(originNode, {
      className: [
        styles.cell,
        dates.includes(formattedDate) ? styles.holiday : undefined,
      ]
        .filter(Boolean)
        .join(" "),
      children:
        submittingDate === formattedDate ? <Spin size="small" /> : date.date(),
    });
  };

  const renderHeader: CalendarProps<Dayjs>["headerRender"] = ({
    onChange,
    value,
  }) => {
    const hasPreviousMonth = value.isAfter(dayjs().startOf("year"), "month");

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

  useEffect(() => {
    void (() => {
      fetchData();
    })();
  }, [fetchData]);

  return (
    <Row>
      <Col lg={16} md={20} xs={24} xxl={12}>
        <Card size="small" variant="borderless">
          <Calendar
            className={canUpdate ? styles.calendar : undefined}
            disabledDate={(date) => date.isBefore(dayjs().startOf("day"))}
            fullCellRender={fullCellRender}
            fullscreen={false}
            headerRender={renderHeader}
            onSelect={handleSelect}
          />
        </Card>
      </Col>
      {loading && <Spin fullscreen />}
    </Row>
  );
};
