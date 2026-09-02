import type { CalendarProps } from "antd";
import { Calendar, Card, Col, Row, Spin } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import jalaliday from "jalaliday";
import type { PropsWithChildren, ReactElement } from "react";
import { cloneElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAntd, useCore } from "@/app/hooks";
import { getRoutePermissions } from "@/app/lib";
import { getErrorMessage } from "@/shared/lib";

import {
  createCalendarDate,
  deleteCalendarDate,
  fetchCalendarDates,
} from "./api";
import { CalendarHeader } from "./components/calendar-header/CalendarHeader";
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
  const { messageAPI } = useAntd();
  const { user } = useCore();
  const { canUpdate } = getRoutePermissions("calendar", user);
  const { styles } = useCalendarStyles();

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
            headerRender={(props) => <CalendarHeader {...props} />}
            onSelect={handleSelect}
          />
        </Card>
      </Col>
      {loading ? <Spin fullscreen /> : null}
    </Row>
  );
};
