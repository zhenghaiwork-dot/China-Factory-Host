/** Isolated verification config. Does not replace the shared deployment config.
 * Astro 7's content environment needs this CJS dependency prebundled on this
 * Windows installation. The override keeps the main config and dist untouched.
 * Run: npx astro build --config ./scripts/hub-finder-preview.config.mjs */
import base from '../astro.config.mjs';

export default {
  ...base,
  outDir: './_hub-finder-preview',
  cacheDir: './_hub-finder-astro-cache',
  vite: {
    ...base.vite,
    cacheDir: './_hub-finder-vite-cache',
    plugins: [
      ...(base.vite?.plugins || []),
      {
        name: 'hub-finder-content-cjs-compat',
        enforce: 'post',
        configEnvironment(name) {
          if (name !== 'client') {
            return { optimizeDeps: { noDiscovery: true, include: ['picomatch'] } };
          }
        },
      },
    ],
  },
};
