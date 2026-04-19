import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const srcRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "src"
);

// Recess order: positioning → box model → flex/grid → border → background/color → typography → ui → transform/animation
// https://github.com/stormwarning/stylelint-config-recess-order
const RECESS_ORDER = [
  // Generated content
  "content",
  // Positioning
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "insetBlock",
  "insetBlockStart",
  "insetBlockEnd",
  "insetInline",
  "insetInlineStart",
  "insetInlineEnd",
  "zIndex",
  // Box model
  "display",
  "visibility",
  "float",
  "clear",
  "overflow",
  "overflowX",
  "overflowY",
  "overflowBlock",
  "overflowInline",
  "clipPath",
  "boxSizing",
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "inlineSize",
  "minInlineSize",
  "maxInlineSize",
  "blockSize",
  "minBlockSize",
  "maxBlockSize",
  "aspectRatio",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingBlock",
  "paddingBlockStart",
  "paddingBlockEnd",
  "paddingInline",
  "paddingInlineStart",
  "paddingInlineEnd",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginBlock",
  "marginBlockStart",
  "marginBlockEnd",
  "marginInline",
  "marginInlineStart",
  "marginInlineEnd",
  // Flex
  "flex",
  "flexDirection",
  "flexWrap",
  "flexFlow",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "alignContent",
  "alignItems",
  "alignSelf",
  "justifyContent",
  "justifyItems",
  "justifySelf",
  "placeContent",
  "placeItems",
  "placeSelf",
  "gap",
  "rowGap",
  "columnGap",
  "order",
  // Grid
  "grid",
  "gridTemplate",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridTemplateAreas",
  "gridAutoColumns",
  "gridAutoRows",
  "gridAutoFlow",
  "gridArea",
  "gridColumn",
  "gridColumnStart",
  "gridColumnEnd",
  "gridRow",
  "gridRowStart",
  "gridRowEnd",
  // Border
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderBlock",
  "borderBlockStart",
  "borderBlockEnd",
  "borderInline",
  "borderInlineStart",
  "borderInlineEnd",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "borderStartStartRadius",
  "borderStartEndRadius",
  "borderEndStartRadius",
  "borderEndEndRadius",
  "borderSpacing",
  "borderCollapse",
  "outline",
  "outlineWidth",
  "outlineStyle",
  "outlineColor",
  "outlineOffset",
  "boxShadow",
  // Background & color
  "background",
  "backgroundColor",
  "backgroundImage",
  "backgroundPosition",
  "backgroundPositionX",
  "backgroundPositionY",
  "backgroundSize",
  "backgroundRepeat",
  "backgroundAttachment",
  "backgroundClip",
  "backgroundOrigin",
  "color",
  "opacity",
  "filter",
  "backdropFilter",
  "mixBlendMode",
  "isolation",
  // Typography
  "font",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontVariant",
  "fontStretch",
  "lineHeight",
  "letterSpacing",
  "wordSpacing",
  "textAlign",
  "textDecoration",
  "textDecorationColor",
  "textDecorationLine",
  "textDecorationStyle",
  "textTransform",
  "textOverflow",
  "textShadow",
  "textIndent",
  "whiteSpace",
  "wordBreak",
  "wordWrap",
  "overflowWrap",
  "hyphens",
  "verticalAlign",
  "direction",
  // List & table
  "listStyle",
  "listStyleType",
  "listStylePosition",
  "listStyleImage",
  "tableLayout",
  "captionSide",
  "emptyCells",
  // UI
  "cursor",
  "pointerEvents",
  "resize",
  "userSelect",
  "appearance",
  "caretColor",
  "scrollBehavior",
  "scrollSnapType",
  "scrollSnapAlign",
  "touchAction",
  "willChange",
  // SVG
  "fill",
  "fillOpacity",
  "fillRule",
  "stroke",
  "strokeWidth",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeMiterlimit",
  "strokeOpacity",
  // Transform & animation
  "transform",
  "transformOrigin",
  "transformStyle",
  "perspective",
  "perspectiveOrigin",
  "backfaceVisibility",
  "transition",
  "transitionProperty",
  "transitionDuration",
  "transitionTimingFunction",
  "transitionDelay",
  "animation",
  "animationName",
  "animationDuration",
  "animationTimingFunction",
  "animationDelay",
  "animationIterationCount",
  "animationDirection",
  "animationFillMode",
  "animationPlayState",
];

const STYLE_PROPS = new Set(["$style", "$before", "$after", "$hover", "$focus"]);

function getRecessIndex(key) {
  const i = RECESS_ORDER.indexOf(key);
  return i === -1 ? Infinity : i;
}

function checkAndFixStyleObject(context, objNode) {
  const props = objNode.properties.filter(
    (p) => p.type === "Property" && (p.key.type === "Identifier" || p.key.type === "Literal")
  );

  const sorted = [...props].sort((a, b) => {
    const keyA = a.key.type === "Identifier" ? a.key.name : a.key.value;
    const keyB = b.key.type === "Identifier" ? b.key.name : b.key.value;
    return getRecessIndex(keyA) - getRecessIndex(keyB);
  });

  const sourceCode = context.sourceCode;

  props.forEach((prop, i) => {
    if (prop !== sorted[i]) {
      const key = prop.key.type === "Identifier" ? prop.key.name : prop.key.value;
      const expectedKey =
        sorted[i].key.type === "Identifier" ? sorted[i].key.name : sorted[i].key.value;
      context.report({
        node: prop.key,
        message: `CSS property "${key}" is out of recess order (expected "${expectedKey}" here)`,
        fix(fixer) {
          return props.map((original, j) =>
            fixer.replaceText(original, sourceCode.getText(sorted[j]))
          );
        },
      });
    }
  });
}

const localRules = {
  rules: {
    "no-parent-relative-imports": {
      create(context) {
        return {
          ImportDeclaration(node) {
            if (node.source.value.startsWith("../")) {
              context.report({
                node: node.source,
                message: "Use @/ alias instead of relative parent imports (../)",
              });
            }
          },
        };
      },
    },
    "no-alias-for-same-dir": {
      create(context) {
        return {
          ImportDeclaration(node) {
            const importPath = node.source.value;
            if (!importPath.startsWith("@/")) return;
            const resolvedImport = path.join(srcRoot, importPath.slice(2));
            if (fs.existsSync(resolvedImport) && fs.statSync(resolvedImport).isDirectory()) return;
            const importDir = path.dirname(resolvedImport);
            const currentDir = path.dirname(context.filename);
            if (currentDir === importDir) {
              context.report({
                node: node.source,
                message: "Use ./ instead of @/ for same-directory imports",
              });
            }
          },
        };
      },
    },
    "style-props-recess-order": {
      meta: { fixable: "code" },
      create(context) {
        return {
          JSXAttribute(node) {
            const name = node.name?.name;
            if (!STYLE_PROPS.has(name)) return;
            if (node.value?.type !== "JSXExpressionContainer") return;
            const expr = node.value.expression;
            if (expr?.type !== "ObjectExpression") return;
            checkAndFixStyleObject(context, expr);
          },
        };
      },
    },
  },
};

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
      local: localRules,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "local/no-parent-relative-imports": "error",
      "local/no-alias-for-same-dir": "error",
      "local/style-props-recess-order": "error",
    },
  }
);
