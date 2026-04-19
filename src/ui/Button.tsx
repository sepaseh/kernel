import { Spin } from "antd";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FC,
  HTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { match } from "@/utils/format";

type Kind = "danger" | "info" | "primary" | "secondary" | "success" | "warning";

type ButtonProps = HTMLAttributes<HTMLElement> & {
  disabled?: boolean;
  ghost?: boolean;
  href?: string;
  icon?: ReactNode;
  kind?: Kind;
  loading?: boolean;
  state?: boolean;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

const StyledButton = styled.div<{
  $disabled: boolean;
  $ghost: boolean;
  $kind: Kind;
}>`
  align-items: center;
  border-radius: 44px;
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  display: flex;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s;
  white-space: nowrap;

  ${({ $ghost }) => {
    return (
      !$ghost &&
      css`
        height: 44px;
        padding: 0 24px;
      `
    );
  }}

  ${({ $disabled, $ghost, $kind, theme }) => {
    return $disabled
      ? css`
          background-color: ${$ghost
            ? "transparent"
            : theme.colorBgContainerDisabled};
          color: ${theme.colorTextDisabled};
        `
      : $ghost
        ? css`
            background-color: transparent;
            color: currentColor;

            &:hover {
              ${match($kind, {
                danger: () => css`
                  color: ${theme.colorError};
                `,
                info: () => css`
                  color: ${theme.colorInfo};
                `,
                primary: () => css`
                  color: ${theme.colorPrimary};
                `,
                secondary: () => css`
                  color: ${theme.colorFillTertiary};
                `,
                success: () => css`
                  color: ${theme.colorSuccess};
                `,
                warning: () => css`
                  color: ${theme.colorWarning};
                `,
              })}
            }
          `
        : css`
            box-shadow:
              0px 1px 1px 0px rgba(255, 255, 255, 0.1) inset,
              0px -1px 0.5px 0px rgba(0, 0, 0, 0.1) inset;
            ${match($kind, {
              danger: () => css`
                background-color: ${theme.colorError};
                color: ${theme.colorTextLightSolid};
              `,
              info: () => css`
                background-color: ${theme.colorInfo};
                color: ${theme.colorTextLightSolid};
              `,
              primary: () => css`
                background-color: ${theme.colorPrimary};
                color: ${theme.colorTextLightSolid};
              `,
              secondary: () => css`
                background-color: ${theme.colorFillTertiary};
                color: ${theme.colorText};
              `,
              success: () => css`
                background-color: ${theme.colorSuccess};
                color: ${theme.colorTextLightSolid};
              `,
              warning: () => css`
                background-color: ${theme.colorWarning};
                color: ${theme.colorTextBase};
              `,
            })}

            &:hover {
              ${match($kind, {
                danger: () => css`
                  background-color: ${theme.colorErrorHover};
                `,
                info: () => css`
                  background-color: ${theme.colorInfoHover};
                `,
                primary: () => css`
                  background-color: ${theme.colorPrimaryHover};
                  color: ${theme.colorTextLightSolid};
                `,
                secondary: () => css`
                  background-color: ${theme.colorFillSecondary};
                `,
                success: () => css`
                  background-color: ${theme.colorSuccessHover};
                `,
                warning: () => css`
                  background-color: ${theme.colorWarningHover};
                `,
              })}
            }
          `;
  }}
`;

export const Button: FC<ButtonProps> = (props) => {
  const {
    children,
    disabled = false,
    ghost = false,
    href,
    icon,
    kind = "primary",
    loading = false,
    state = false,
    target,
    type = "button",
    onClick,
    ...rest
  } = props;

  return (
    <StyledButton
      onClick={(e) => !disabled && onClick && onClick(e)}
      $disabled={disabled}
      $ghost={ghost}
      $kind={kind}
      {...rest}
      {...(disabled
        ? { as: "span" }
        : href
          ? { as: Link, state, to: href, target }
          : { as: "button", type })}
    >
      {loading ? <Spin size="small" /> : icon}
      {children}
    </StyledButton>
  );
};
