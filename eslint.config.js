import betterTailwind from 'eslint-plugin-better-tailwindcss'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// ESLint is retained for React Compiler rules (eslint-plugin-react-hooks) and
// Tailwind class utilities (eslint-plugin-better-tailwindcss).
// All other linting, formatting, and import rules are handled by Biome.
//
// NOTE: biome.json disables noUnusedTemplateLiteral to allow
// enforce-consistent-line-wrapping to emit template literals stably.
export default defineConfig([
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwind },
    rules: {
      'better-tailwindcss/enforce-consistent-line-wrapping': ['warn', {
        printWidth: 100,
        entryPoint: 'src/styles/app.css',
        // Only wrap strings inside cn()/cva() calls — NOT bare className="..."
        // attributes. Biome always collapses bare string attributes to single
        // line, causing infinite oscillation with attribute-level wrapping.
        selectors: [
          { kind: 'callee', match: [{ type: 'strings' }], name: 'cn' },
          { kind: 'callee', match: [{ type: 'objectKeys' }], name: 'cn' },
          { kind: 'callee', match: [{ type: 'strings' }], name: 'cva' },
          { kind: 'callee', match: [{ type: 'objectValues', path: '^variants.*$' }], name: 'cva' },
          { kind: 'callee', match: [{ type: 'objectValues', path: '^compoundVariants\\[\\d+\\]\\.(?:className|class)$' }], name: 'cva' },
        ],
      }],
      'better-tailwindcss/no-unnecessary-whitespace': 'warn',
      'better-tailwindcss/no-duplicate-classes': 'warn',
    },
  },
])
