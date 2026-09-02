# Styling

## Theme architecture

Ant Design is the source of truth for theming.

- Theme config lives in `src/shared/config/theme.ts`.
- Runtime language direction and Ant Design locale are handled by `AntdProvider`.
- Prefer Ant Design components and tokens over custom CSS.

## Component styling

- Prefer Ant Design props such as `type`, `variant`, `color`, `size`, and `layout` before custom styles.
- Use inline `style` or Ant Design `styles` only for local layout tweaks.
- Put global styles in `src/assets/styles/index.css`.
- Keep `index.html` free of page-specific styling.
- Keep delete triggers in tables visually neutral; do not mark their icon
  buttons as `danger` or red. Apply the danger treatment to the destructive
  confirmation button inside the modal instead.

## CSS property order

Keep object style props (`style` and Ant Design `styles`) in alphabetical order.
The local ESLint rule `local/style-props-alphabetical-order` warns and can
auto-fix the ordering. Objects containing spread or computed properties are
left unchanged because reordering them could change behavior.

Do not mix a CSS shorthand with one of its longhands in the same object, such
as `margin` with `marginTop`. The local rule
`local/style-props-no-shorthand-conflicts` reports these ambiguous overrides as
errors. Duplicate object keys are errors through ESLint's standard
`no-dupe-keys` rule.
