import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";

export default [
    js.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaVersion: "latest",
                sourceType: "module"
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            ...tsPlugin.configs["strict-type-checked"].rules,
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-unnecessary-condition": "error",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/restrict-template-expressions": ["error", { "allowNumber": true }],
            "class-methods-use-this": "off",
            "@typescript-eslint/class-methods-use-this": "off",
            "no-undef": "off",
            "@typescript-eslint/no-confusing-void-expression": ["error", { "ignoreArrowShorthand": true }]
        }
    },
    {
        // Global ignores must be in their own object
        ignores: ["dist/", "node_modules/", "*.config.js", "*.config.ts"]
    },
    prettier
];
