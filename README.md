# kvikk-fix

A CLI tool for applying prettier to all TypeScript files in your project. It
automatically reads your `tsconfig.json` from the current working directory,
expands a list from that config file, and rewrites every file in that list.
This tool runs in two modes:

- Rewrite mode, which does what is described above. This is the default mode.
- Check mode, a dry run which outputs which files would have been rewritten
  by prettier, but does not actually rewrite. This is enabled by supplying
  the `-l` or `--list-different` flag when invoking. One way to use this mode
  is to use it in a CI job to prevent unformatted code from being checked in.

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

## Errors and Exit Status

Here is a list of exit statuses common across both modes:

- `0`, the operation completed successfully
- `1`, the supplied flag was not recognized
- `2`, there was an error in reading, writing, or resolving the configuration.

The exit status `3` is exclusive to check mode. It occurs when there are files
that do not conform to prettier's standards, and would have been rewritten by
it.

## Configuration

Unlike the vanilla `prettier` CLI utility, `kvikk-fix` does not allow
configuring formatting options using command line options. Instead, the config
file resolution process is used. See the
[prettier README] (https://github.com/prettier/prettier/blob/master/README.md#configuration-file)
for more details.

## Name

The word "kvikk" means "quick" in Norwegian.
