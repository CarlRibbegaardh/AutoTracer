# @autotracer/network

## Overview

`@autotracer/network` is the browser runtime package for AutoTracer network tracing. The package is under active implementation and does not yet expose a supported public runtime API.

## Availability

Do not install or ship this package in an application yet. The `networkTracer()` initializer and browser transport integration are not implemented in the current source.

The implemented foundation reads a validated version 1 configuration document from `__autotracer.network.config.v1`. This persistence primitive remains internal until the runtime control surface is available and verified.

## Development

The package uses the React 19-era repository toolchain without taking a React dependency. TypeScript 7 builds declarations, TypeScript 6 checks source and consumer compatibility, Vite produces the ESM distribution, Oxlint checks source, and Vitest runs the package tests with 100% unit coverage thresholds.

Repository contributors run build, test, and verification through the root pnpm scripts. Public installation, configuration, and usage examples will be added when the corresponding runtime behavior is available.
