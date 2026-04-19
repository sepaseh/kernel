# Styling

## Theme architecture

Ant Design is the single source of truth for theming.

- Theme config lives in `src/config/theme.ts`
- `TokenBridge` (inside `AntdProvider`) reads `theme.useToken()` and injects `GlobalToken` into styled-components `ThemeProvider`
- `DefaultTheme` in `styled.d.ts` extends `GlobalToken`

## Accessing tokens in styled-components

```ts
const token = useTheme(); // GlobalToken
token.colorBgBase;
token.colorText;
```

## Palette type

Use `Pick<GlobalToken, ...>` to define palette shapes — not custom types with arbitrary names.

## No SASS / no inline style objects in index.html

Global styles live in `src/styles/index.css`, linked from `index.html`.

## Stack component

Use `Stack`, `HStack`, `VStack` from `@/ui/Stack` for layout. Pass styles via `$style`, `$before`, `$after`, `$hover`, `$focus` props.

`$before` and `$after` do not inject a default `content` value — the caller must set it explicitly.

## CSSProperties is string-only

Style prop values are typed as `CSS.Properties<string>` — all values must be strings, including lengths and numbers:

```ts
// correct
$style={{ gap: "8px", opacity: "0.8", zIndex: "10" }}

// wrong — type error
$style={{ gap: 8, opacity: 0.8, zIndex: 10 }}
```

## CSS property order

Style object props (`$style`, `$before`, `$after`, `$hover`, `$focus`) must follow **recess order**:

1. `content`
2. Positioning — `position`, `top`, `right`, `bottom`, `left`, `zIndex`
3. Box model — `display`, `overflow`, `width`, `height`, `padding`, `margin`
4. Flex/Grid — `flex`, `flexDirection`, `alignItems`, `justifyContent`, `gap`, ...
5. Border — `border*`, `borderRadius`, `boxShadow`, `outline`
6. Background & color — `background*`, `color`, `opacity`
7. Typography — `font*`, `lineHeight`, `textAlign`, `textOverflow`, `whiteSpace`
8. UI — `cursor`, `pointerEvents`, `userSelect`
9. SVG — `fill`, `stroke`
10. Transform & animation — `transform`, `transition`, `animation`

Enforced automatically by `local/style-props-recess-order` in `eslint.config.js`. Run `eslint --fix` to auto-sort.