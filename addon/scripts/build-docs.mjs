import { rollup } from 'rollup';
import { execa } from 'execa';
import config from '../rollup.config.mjs';

// documentation.js cannot follow the import-then-export that the chunked
// build produces, so the docs are generated from one file per module.
const skip = new Set(['delete', 'copy', 'Build declarations']);
const outDir = 'tmp/docs';

const bundle = await rollup({
  ...config,
  plugins: config.plugins.filter((plugin) => !skip.has(plugin.name)),
});
await bundle.write({ ...config.output, dir: outDir, preserveModules: true });
await bundle.close();

// Explicit path: a PATH lookup can resolve a
// different documentation.js from a parent node_modules.
await execa(
  './node_modules/.bin/documentation',
  [
    'build',
    '--document-exported',
    `${outDir}/index.js`,
    '--config',
    'documentation.yml',
    '--markdown-toc-max-depth',
    '3',
    '-f',
    'md',
    '-o',
    '../API.md',
  ],
  { stdio: 'inherit' },
);
