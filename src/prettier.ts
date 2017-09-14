import * as prettier from 'prettier';

/**
 * The `prettier` module that comes bundled with `kvikk-fix`.
 */
export const bundledPrettier = prettier;

/**
 * The shape of the `prettier` module. This is an incomplete shape, since it
 * does not include the types exported by `@types/prettier`.
 */
export type PrettierModule = typeof bundledPrettier;

/**
 * `kvikk-fix` automatically selects a version of `prettier`. If your project
 * already has `prettier` as some sort of dependency, it will be loaded as
 * `selectedPrettier`. In the case that your project does not yet have this
 * dependency, the selection falls back to `bundledPrettier`.
 */
export const selectedPrettier: PrettierModule = (() => {
  try {
    // Attempt to load peer dependency
    return require('../../prettier');
  } catch {
    // Fallback to bundled dependency
    return bundledPrettier;
  }
})();
