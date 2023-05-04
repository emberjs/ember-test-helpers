import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import { Addon } from '@embroider/addon-dev/rollup';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default {
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(['index.js', '**/*.js']),
    addon.dependencies(),

    babel({ babelHelpers: 'bundled', extensions: ['.ts', '.js'] }),
    nodeResolve({ extensions: ['.ts', '.js'] }),

    addon.clean(),

    // Copy Readme and License into published package
    copy({
      targets: [{ src: '../README.md', dest: '.' }],
    }),
  ],
};
