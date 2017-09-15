# kvikk-fix

A CLI tool for applying prettier to all TypeScript files in your project. This
tool runs in two modes:

- Project mode, which automatically reads your `tsconfig.json` from the current
  working directory, expands a list from that config file, and rewrites every
  file in that list. This is activated by invoking `kvikk-fix`, with no
  arguments.
- File mode, which rewrites every file provided as an argument. This is
  activated by invoking `kvikk-fix file1.ts and-so-forth.ts`.

## Stability

This tool is still in its infancy (version 0.0.x), so command line options may
change between patch releases. Use this tool with a locked-down version to
avoid drift between releases.

## Try it out

If you are using npm@5.0.0 or above, you can run the following command instead
of `kvikk-fix`:

```
npx -p prettier -p typescript -p kvikk-fix kvikk-fix
```

This lets you reformat the entire codebase without ever having to change any of
your project's dependencies. Please do not do this on a codebase that is not
under version control! That would irrevocably rewrite everything with no way to
undo it.

## Installation

Run:

```
npm install --save-dev kvikk-fix
```

Make sure the peer dependencies `prettier` and `typescript` are fulfilled
first, e.g. by having them as dev dependencies in your project. As of writing,
`kvikk-fix` requires at least `prettier@1.6.0` and `typescript@2.1.0`.

## Configuration

Unlike the vanilla `prettier` CLI utility, `kvikk-fix` does not allow
configuring formatting options using command line options. Instead, the config
file resolution process is used. See the
[prettier README] (https://github.com/prettier/prettier/blob/master/README.md#configuration-file)
for more details.

## Name

The word "kvikk" means "quick" in Norwegian.
