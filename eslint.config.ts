import js from "@eslint/js";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/types";
import { Rule } from "eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import fs from "fs";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const srcRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "src");

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

const STYLE_PROP_LIST = ["style", "styles"] as const;

type StylePropName = (typeof STYLE_PROP_LIST)[number];

const STYLE_PROPS = new Set<StylePropName>(STYLE_PROP_LIST);

function getPropertyName(key: TSESTree.Property["key"]): string {
  if (key.type === AST_NODE_TYPES.Identifier) {
    return key.name;
  }

  if (key.type === AST_NODE_TYPES.Literal) {
    return String(key.value);
  }

  return "";
}

function getRecessIndex(key: string) {
  const i = RECESS_ORDER.indexOf(key);
  return i === -1 ? Infinity : i;
}

function checkAndFixStyleObject(
  context: Rule.RuleContext,
  objNode: TSESTree.ObjectExpression,
) {
  const props = objNode.properties.filter(
    (p): p is TSESTree.Property =>
      p.type === AST_NODE_TYPES.Property &&
      (p.key.type === AST_NODE_TYPES.Identifier ||
        p.key.type === AST_NODE_TYPES.Literal),
  );

  const sorted = [...props].sort((a, b) => {
    const keyA = getPropertyName(a.key);
    const keyB = getPropertyName(b.key);
    return getRecessIndex(keyA) - getRecessIndex(keyB);
  });

  const sourceCode = context.sourceCode;

  props.forEach((prop, i) => {
    if (prop !== sorted[i]) {
      const key = getPropertyName(prop.key);
      const expectedKey = getPropertyName(sorted[i].key);

      context.report({
        node: prop.key,
        message: `CSS property "${key}" is out of recess order (expected "${expectedKey}" here)`,
        fix(fixer) {
          return props.map((original, j) =>
            fixer.replaceText(original, sourceCode.getText(sorted[j] as any)),
          );
        },
      });
    }
  });
}

const localRules = {
  rules: {
    "architecture-boundaries": {
      create(context: Rule.RuleContext) {
        const filename = path
          .relative(srcRoot, context.filename)
          .replaceAll("\\", "/");
        const [sourceLayer, sourceFeature] = filename.split("/");

        const checkSource = (source: TSESTree.StringLiteral) => {
          const importPath = source.value;
          if (typeof importPath !== "string" || !importPath.startsWith("@/"))
            return;

          const [targetLayer, targetFeature] = importPath.slice(2).split("/");

          if (
            sourceLayer === "shared" &&
            ["app", "features", "layouts"].includes(targetLayer)
          ) {
            context.report({
              node: source,
              message: `Shared modules cannot depend on ${targetLayer}.`,
            });
          }

          if (
            sourceLayer === "features" &&
            targetLayer === "features" &&
            sourceFeature !== targetFeature &&
            importPath !== `@/features/${targetFeature}`
          ) {
            context.report({
              node: source,
              message: `Import another feature through its public API: @/features/${targetFeature}.`,
            });
          }
        };

        return {
          ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
            checkSource(node.source);
          },
          ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
            if (node.source) checkSource(node.source);
          },
          ImportDeclaration(node: TSESTree.ImportDeclaration) {
            checkSource(node.source);
          },
          ImportExpression(node: TSESTree.ImportExpression) {
            if (
              node.source.type === AST_NODE_TYPES.Literal &&
              typeof node.source.value === "string"
            ) {
              checkSource(node.source);
            }
          },
        };
      },
    },
    "no-parent-relative-imports": {
      create(context: Rule.RuleContext) {
        return {
          ImportDeclaration(node: TSESTree.ImportDeclaration) {
            const importPath = node.source.value;

            if (
              typeof importPath === "string" &&
              importPath.startsWith("../")
            ) {
              context.report({
                node: node.source,
                message:
                  "Use @/ alias instead of relative parent imports (../)",
              });
            }
          },
        };
      },
    },
    "no-alias-for-same-dir": {
      create(context: Rule.RuleContext) {
        return {
          ImportDeclaration(node: TSESTree.ImportDeclaration) {
            const importPath = node.source.value;
            if (!importPath.startsWith("@/")) return;
            const resolvedImport = path.join(srcRoot, importPath.slice(2));
            if (
              fs.existsSync(resolvedImport) &&
              fs.statSync(resolvedImport).isDirectory()
            )
              return;
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
      create(context: Rule.RuleContext) {
        return {
          JSXAttribute(node: TSESTree.JSXAttribute) {
            if (node.name.type !== AST_NODE_TYPES.JSXIdentifier) return;

            const name = node.name?.name as StylePropName;

            if (!STYLE_PROPS.has(name)) {
              return;
            }

            if (
              !node.value ||
              node.value.type !== AST_NODE_TYPES.JSXExpressionContainer
            ) {
              return;
            }

            const expr = node.value.expression;

            if (expr.type !== AST_NODE_TYPES.ObjectExpression) {
              return;
            }

            if (name === "styles") {
              expr.properties.forEach((slot) => {
                if (
                  slot.type === AST_NODE_TYPES.Property &&
                  slot.value?.type === AST_NODE_TYPES.ObjectExpression
                ) {
                  checkAndFixStyleObject(context, slot.value);
                }
              });

              return;
            }

            checkAndFixStyleObject(context, expr);
          },
        };
      },
    },
  },
};

export default [
  { ignores: [".stryker-tmp", "dist"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
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
      "local/architecture-boundaries": "error",
      "local/no-parent-relative-imports": "error",
      "local/no-alias-for-same-dir": "error",
      "local/style-props-recess-order": "error",
    },
  },
];
