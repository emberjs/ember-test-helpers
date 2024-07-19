import { resolve } from 'node:path';
import url from 'node:url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { execaCommand } from 'execa';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    // These targets are not "support".
    // A consuming app or library should compile further if they need to support
    // old browsers.
    target: ['esnext', 'firefox121'],
    minify: false,
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@ember/test-helpers',
      formats: ['es'],
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        // from ember-source
        '@ember/application',
        '@ember/renderer',
        '@ember/-internals',
        '@ember/object',
        '@ember/engine',
        '@ember/owner',
        '@ember/routing',
        '@ember/debug',
        '@ember/runloop',

        // Libraries (direct dependencies or peerDependencies)
        '@ember/test-waiters',
        '@glint/template',
        '@embroider/macros',
        'dom-element-descriptors',
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      outDir: 'declarations',
    }),
    {
      name: 'use-weird-non-ESM-ember-convention',
      closeBundle: async () => {
        /**
         * Related issues
         * - https://github.com/embroider-build/embroider/issues/1672
         * - https://github.com/embroider-build/embroider/pull/1572
         * - https://github.com/embroider-build/embroider/issues/1675
         *
         * Fixed in @embroider/vite
         */
        await execaCommand('cp dist/index.mjs dist/index.js', {
          stdio: 'inherit',
        });
        console.log(
          '⚠️ Incorrectly (but neededly) renamed MJS module to JS in a CJS package',
        );

        /**
         * https://github.com/microsoft/TypeScript/issues/56571#
         * README: https://github.com/NullVoxPopuli/fix-bad-declaration-output
         */
        await execaCommand(`pnpm fix-bad-declaration-output declarations/`, {
          stdio: 'inherit',
        });
        console.log(
          '⚠️ Dangerously (but neededly) fixed bad declaration output from typescript',
        );
      },
    },
  ],
});
