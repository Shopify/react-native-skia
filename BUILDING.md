# Building

Instructions for how to set up and build the library for development is available in the README.md file.

## CI

This project has two CI jobs set up to run as Github workflows.

### build-skia.yml

This workflow builds the Skia Binaries from the main branch whenever the
main branch is changed - and only if the externals folder (where the Skia
sources lives) is changed.

The workflow uses two scripts in the package/package.json:

- build-skia
- build-skia-ios-fatlibs

The `build-skia` script is found in the ./scripts/build-skia.ts file and builds each platform and arch that the project supports, currently all active archs on Android and iOS. The configuration is found in the ./scripts/skia-configuration.ts file.

The build step will call some sub scripts which are basically calling the `build-skia.ts` file for each platform and cpu.

The script `build-skia.ios-fatlibs` archives all the archs for iOS into single files.

After a successfull run the workflow uploads all of the libs used by @shopify/react-native-skia as artifacts that will be used in subsequent builds of the library itself.

## build-npm.yml

This workflow builds the final npm package. It does not yet publish the package.

The script performs several steps.

- Download all artifacts from the Skia Build workflow
- Copy these artifacts into the expected libs folder in the package folder
- Copy all Skia headers/includes
- Build the NPM package

The scripts involved to perform these steps are:

`./scripts/workflow-copy-libs.ts` which copies artifacts.
`./scripts/build-npm-package.ts` which builds the npm package.

### Versioning

We are using the environment variable `GITHUB_RUN_NUMBER` to set the build number in the package file (./package/package.json). This variable is used by the workflow in the repo.

The build number (the last number in the package version) will be incremented on each build. This is not commited to back to the repository.
