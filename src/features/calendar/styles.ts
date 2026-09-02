import { createStyles } from "antd-style";

export const useCalendarStyles = createStyles(({ css, cx }) => {
  const cell = css`
    align-items: center;
    border-radius: var(--ant-border-radius-sm);
    display: flex;
    height: var(--ant-calendar-cell-height);
    justify-content: center;
    line-height: var(--ant-calendar-cell-height);
    min-width: var(--ant-calendar-cell-height);
    position: relative;
    transition: background-color var(--ant-motion-duration-mid);
    z-index: 2;
  `;

  return {
    calendar: css`
      .ant-picker-cell-in-view:not(.ant-picker-cell-disabled):hover {
        .${cx(cell)} {
          background: var(--ant-calendar-cell-hover-bg);
        }
      }
    `,
    cell,
    holiday: css`
      color: var(--ant-color-error);
    `,
  };
});
