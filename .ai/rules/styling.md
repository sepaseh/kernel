# Styling

## Theme architecture

Ant Design is the source of truth for theming.

- Theme config lives in `src/config/theme.ts`.
- Runtime language direction and Ant Design locale are handled by `AntdProvider`.
- Prefer Ant Design components and tokens over custom CSS.

## Component styling

- Prefer Ant Design props such as `type`, `variant`, `color`, `size`, and `layout` before custom styles.
- Use inline `style` or Ant Design `styles` only for local layout tweaks.
- Put global styles in `src/styles/index.css`.
- Keep `index.html` free of page-specific styling.

## CSS property order

Object style props (`style` and Ant Design `styles`) follow recess order:

1. `content`
2. Positioning: `position`, `top`, `right`, `bottom`, `left`, `zIndex`
3. Box model: `display`, `overflow`, `width`, `height`, `padding`, `margin`
4. Flex/Grid: `flex`, `flexDirection`, `alignItems`, `justifyContent`, `gap`
5. Border: `border*`, `borderRadius`, `boxShadow`, `outline`
6. Background and color: `background*`, `color`, `opacity`
7. Typography: `font*`, `lineHeight`, `textAlign`, `textOverflow`, `whiteSpace`
8. UI: `cursor`, `pointerEvents`, `userSelect`
9. SVG: `fill`, `stroke`
10. Transform and animation: `transform`, `transition`, `animation`

The local ESLint rule `local/style-props-recess-order` enforces and can auto-fix this ordering.
