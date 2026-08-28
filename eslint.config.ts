import js from "@eslint/js";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/types";
import { Rule } from "eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import fs from "fs";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const srcRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "src");

const SHORTHAND_LONGHANDS: Record<string, readonly string[]> = {
  animation: [
    "animationDelay",
    "animationDirection",
    "animationDuration",
    "animationFillMode",
    "animationIterationCount",
    "animationName",
    "animationPlayState",
    "animationTimingFunction",
  ],
  background: [
    "backgroundAttachment",
    "backgroundClip",
    "backgroundColor",
    "backgroundImage",
    "backgroundOrigin",
    "backgroundPosition",
    "backgroundRepeat",
    "backgroundSize",
  ],
  border: [
    "borderBlock",
    "borderBottom",
    "borderColor",
    "borderInline",
    "borderLeft",
    "borderRight",
    "borderStyle",
    "borderTop",
    "borderWidth",
  ],
  font: [
    "fontFamily",
    "fontSize",
    "fontStretch",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "lineHeight",
  ],
  inset: ["bottom", "insetBlock", "insetInline", "left", "right", "top"],
  margin: [
    "marginBlock",
    "marginBottom",
    "marginInline",
    "marginLeft",
    "marginRight",
    "marginTop",
  ],
  outline: ["outlineColor", "outlineOffset", "outlineStyle", "outlineWidth"],
  padding: [
    "paddingBlock",
    "paddingBottom",
    "paddingInline",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
  ],
  transition: [
    "transitionDelay",
    "transitionDuration",
    "transitionProperty",
    "transitionTimingFunction",
  ],
};

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

function getStyleObjects(node: TSESTree.JSXAttribute) {
  if (
    node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
    !node.value ||
    node.value.type !== AST_NODE_TYPES.JSXExpressionContainer ||
    node.value.expression.type !== AST_NODE_TYPES.ObjectExpression
  ) {
    return [];
  }

  const name = node.name.name as StylePropName;

  if (!STYLE_PROPS.has(name)) return [];

  const expression = node.value.expression;

  if (name === "style") return [expression];

  return expression.properties.flatMap((slot) =>
    slot.type === AST_NODE_TYPES.Property &&
    slot.value.type === AST_NODE_TYPES.ObjectExpression
      ? [slot.value]
      : [],
  );
}

function getSortableProperties(objNode: TSESTree.ObjectExpression) {
  const properties = objNode.properties;

  if (
    properties.some(
      (property) =>
        property.type !== AST_NODE_TYPES.Property ||
        property.computed ||
        (property.key.type !== AST_NODE_TYPES.Identifier &&
          property.key.type !== AST_NODE_TYPES.Literal),
    )
  ) {
    return [];
  }

  return properties as TSESTree.Property[];
}

function getNamedProperties(objNode: TSESTree.ObjectExpression) {
  return objNode.properties.filter(
    (property): property is TSESTree.Property =>
      property.type === AST_NODE_TYPES.Property &&
      !property.computed &&
      (property.key.type === AST_NODE_TYPES.Identifier ||
        property.key.type === AST_NODE_TYPES.Literal),
  );
}

function checkAndFixAlphabeticalStyleOrder(
  context: Rule.RuleContext,
  objNode: TSESTree.ObjectExpression,
) {
  const properties = getSortableProperties(objNode);
  if (properties.length < 2) return;

  const sorted = [...properties].sort((a, b) =>
    getPropertyName(a.key).localeCompare(getPropertyName(b.key), "en"),
  );
  const firstMismatch = properties.findIndex(
    (property, index) => property !== sorted[index],
  );

  if (firstMismatch === -1) return;

  context.report({
    node: properties[firstMismatch].key,
    message: "Style properties should be in alphabetical order.",
    fix(fixer) {
      return properties.map((property, index) =>
        fixer.replaceText(property, context.sourceCode.getText(sorted[index])),
      );
    },
  });
}

function checkShorthandConflicts(
  context: Rule.RuleContext,
  objNode: TSESTree.ObjectExpression,
) {
  const properties = getNamedProperties(objNode);
  const propertyByName = new Map(
    properties.map((property) => [getPropertyName(property.key), property]),
  );

  for (const [shorthand, longhands] of Object.entries(SHORTHAND_LONGHANDS)) {
    const shorthandProperty = propertyByName.get(shorthand);
    if (!shorthandProperty) continue;

    const conflicts = longhands.filter((longhand) =>
      propertyByName.has(longhand),
    );
    if (conflicts.length === 0) continue;

    context.report({
      node: shorthandProperty.key,
      message: `Do not mix CSS shorthand "${shorthand}" with ${conflicts.join(", ")}.`,
    });
  }
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
    "style-props-alphabetical-order": {
      meta: { fixable: "code" },
      create(context: Rule.RuleContext) {
        return {
          JSXAttribute(node: TSESTree.JSXAttribute) {
            getStyleObjects(node).forEach((styleObject) =>
              checkAndFixAlphabeticalStyleOrder(context, styleObject),
            );
          },
        };
      },
    },
    "style-props-no-shorthand-conflicts": {
      create(context: Rule.RuleContext) {
        return {
          JSXAttribute(node: TSESTree.JSXAttribute) {
            getStyleObjects(node).forEach((styleObject) =>
              checkShorthandConflicts(context, styleObject),
            );
          },
        };
      },
    },
  },
};

export default [
  { ignores: [".stryker-tmp", "dist", "storybook-static"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["server/**/*.cjs"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
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
      "no-dupe-keys": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "local/architecture-boundaries": "error",
      "local/no-parent-relative-imports": "error",
      "local/no-alias-for-same-dir": "error",
      "local/style-props-alphabetical-order": "warn",
      "local/style-props-no-shorthand-conflicts": "error",
    },
  },
  ...storybook.configs["flat/recommended"],
];
