import * as CSS from "csstype";
import styled, { css, DefaultTheme } from "styled-components";

const cssPropertiesToString = (styles: CSSProperties) =>
  Object.entries(styles)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${value};`,
    )
    .join("\n");

const pseudoPropertiesToString = (props: PseudoProps) => {
  const { $after, $before, $style } = props;

  return css`
    ${$style && cssPropertiesToString($style)}
    ${$after &&
    css`
      &::after {
        ${cssPropertiesToString($after)}
      }
    `}
    ${$before &&
    css`
      &::before {
        ${cssPropertiesToString($before)}
      }
    `}
  `;
};

const defaultPropertiesToString = (props: DefaultProps) => {
  const { $active, $focus, $hover } = props;

  return css`
    ${pseudoPropertiesToString(props)}
    ${$active &&
    css`
      &:active {
        ${pseudoPropertiesToString($active)}
      }
    `}
    ${$focus &&
    css`
      &:focus {
        ${pseudoPropertiesToString($focus)}
      }
    `}
    ${$hover &&
    css`
      &:hover {
        ${pseudoPropertiesToString($hover)}
      }
    `}
  `;
};

const stackPropertiesToString = (
  props: StackProps & { theme: DefaultTheme },
) => {
  const { $media, theme } = props;

  return css`
    ${defaultPropertiesToString(props)}
    ${$media?.sm &&
    css`
      @media (min-width: ${theme.screenSM}px) {
        ${defaultPropertiesToString($media.sm)}
      }
    `}
    ${$media?.md &&
    css`
      @media (min-width: ${theme.screenMD}px) {
        ${defaultPropertiesToString($media.md)}
      }
    `}
    ${$media?.lg &&
    css`
      @media (min-width: ${theme.screenLG}px) {
        ${defaultPropertiesToString($media.lg)}
      }
    `}
    ${$media?.xl &&
    css`
      @media (min-width: ${theme.screenXL}px) {
        ${defaultPropertiesToString($media.xl)}
      }
    `}
    ${$media?.xxl &&
    css`
      @media (min-width: ${theme.screenXXL}px) {
        ${defaultPropertiesToString($media.xxl)}
      }
    `}
  `;
};

export const Stack = styled.div<StackProps>`
  ${stackPropertiesToString}
`;

export const HStack = styled(Stack).attrs<StackProps>(({ $style = {} }) => ({
  $style: { display: "flex", flexDirection: "row", ...$style },
}))``;

export const VStack = styled(Stack).attrs<StackProps>(({ $style = {} }) => ({
  $style: { display: "flex", flexDirection: "column", ...$style },
}))``;

export type CSSProperties = CSS.Properties<string>;

type PseudoProps = {
  $after?: CSSProperties;
  $before?: CSSProperties;
  $style?: CSSProperties;
};

type DefaultProps = PseudoProps & {
  $active?: PseudoProps;
  $focus?: PseudoProps;
  $hover?: PseudoProps;
};

type StackProps = DefaultProps & {
  $media?: {
    lg?: DefaultProps;
    md?: DefaultProps;
    sm?: DefaultProps;
    xl?: DefaultProps;
    xxl?: DefaultProps;
  };
};
