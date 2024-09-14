# get-prereqs

GitHub action to get prerequisites for a local CPAN distribution.

```yaml
- id: get-prereqs
  name: Get prerequisites
  uses: perl-actions/get-prereqs@v1
- name: Install prerequisites
  uses: perl-actions/install-with-cpanm@v1
  with:
    install: ${{ steps.get-prereqs.prereqs }}
```

## Inputs

### `phases`

List of phases to get prerequsites for, as defined in
[CPAN::Meta::Spec](https://metacpan.org/pod/CPAN::Meta::Spec#Phases).

Defaults to `build test runtime`.

### `relationships`

List of relationships to get prerequsites for, as defined in
[CPAN::Meta::Spec](https://metacpan.org/pod/CPAN::Meta::Spec#Relationships).

Defaults to `requires`.

### `features`

List of optional features to include prequisites for, as defined in
[CPAN::Meta::Spec](https://metacpan.org/pod/CPAN::Meta::Spec#optional_features).

Defaults to none.

### `sources`

List of files to search for prerequisites. Supported formats are:

- [META files](https://metacpan.org/pod/CPAN::Meta::Spec) in JSON and YAML
  formats.
- [`cpmfile`](https://metacpan.org/pod/Module::cpmfile) in JSON and YAML
  formats.
- [`cpanfile`](https://metacpan.org/dist/Module-CPANfile/view/lib/cpanfile.pod)
  files as generated by [Module::CPANfile](https://metacpan.org/pod/Module::CPANfile)
  or [Dist::Zilla::Plugin::CPANFile](https://metacpan.org/pod/Dist::Zilla::Plugin::CPANFile).
  These files are parsed statically, files doing dynamic checks will not be
  supported. These files must be named `cpanfile`.
- [Prereqs File](https://metacpan.org/pod/Dist::Zilla::Plugin::PrereqsFile)
  in JSON and YAML formats. These files must named `prereqs.yml` or
  `prereqs.json`.
- `Makefile` as emitted by
  [ExtUtils::MakeMaker](https://metacpan.org/pod/ExtUtils::MakeMaker). This
  was used to communicated dependencies before `MYMETA` files were invented.
- `dist.ini` as used by [Dist::Zilla](https://metacpan.org/pod/Dist::Zilla).
  This will only extract the needed to run a `dzil build`, listing them with
  the unofficial phase of `author`.

Defaults to `MYMETA.json MYMETA.yml META.json META.yml Makefile cpanfile`.

### `excludes`

A list of regular expressions of prerequisites to exclude. One pattern per line.

## Outputs

### `perl`

The perl version declared as a prerequisite. Formatted like `v5.30`.

### `prereqs`

The prerequisites declared including the required versions, formatted as
expected by `cpanm` or `cpm`.

### `prereqs-no-version`

The prerequisites declared, not including the required versions.

### `prereqsJSON`

The prerequisites declared, formatted as a JSON string. The keys of the object
will be the module name, and the values will be the versions required.
