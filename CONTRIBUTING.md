# Contributing

Anyone who makes a PR that's accepted into master gets merge and `npm publish` rights.

## Prepping your PR

Make sure you have the appropriate unit tests for your addition and that they pass build.

Before you create a pull request, do NOT update the `package.json` version and make sure to update `HISTORY.md` using the following process:

- Install https://github.com/defunctzombie/changelog via `npm install -g defunctzombie/changelog`.
- `changelog --increment` and add in your changes to the new line in `HISTORY.md`. Leave the `# UNRELEASED` line untouched.
- Commit the updated `HISTORY.md`.
- Do NOT modify the `package.json` version.

## Making the PR

If your submission is your first PR, also include the following in your PR comments:

- `npm` username

## Once your PR is approved

If you do not have merge permissions, you will be granted it, along with `npm publish` rights. 

Follow semantic versioning rules:

- Major version bump for major architectural changes (eg new major react / babel version, major architectural changes)
- Minor version bump for minor changes (eg minor package updates, feature fixes / additions that could break those on older versions)
- Patch-level version bump for insignificant changes (eg addition of a parameter that does not break older versions, bug fixes that resolve breakages)

- Merge your PR
- In the `master` branch, do `changelog --release <version>`, where `<version>` is the new version number of the package. 
- `HISTORY.md` and `package.json` will be updated with the new version number and both will be automatically committed.
- Push your changes
- `npm publish` to publish to `npm`
