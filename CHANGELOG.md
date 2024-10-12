# Change log

## Unreleased

### New Features

* Added `_build/prereqs` parsing to handle ancient Module::Build
* Added `Makefile.PL` parsing for `use` or `MIN_PERL_VERSION` declarations
* Added `all-sources` option to include prereqs from all sources rather than
  first found

### Internal Changes

* More testing
* Use a module hook or esbuild plugin to load peggy parsers. Avoids needing to
  rebuild the parsers when developing, but has no impact on the final build.

## 1.2.1 (2024-09-14)

### Bug Fixes

* Fixed handling of named plugins in `dist.ini`.

## 1.2.0 (2024-09-14)

### New Features

* Added `exclude` option.

### Internal Changes

* Revised to use eslint only for linting
* Various refactorings
* Additional tests

## 1.1.0 (2024-09-13)

### New Features

* Can now parse `dist.ini` files for `author` dependencies.

### Internal Changes

* Apply prettier and more linting to all files

## 1.0.0 (2024-09-13)

* Initial release
