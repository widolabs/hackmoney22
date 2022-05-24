# README

## Table of Contents

- [Installation](#installation)
- [Running](#running)
- [Known issues and improvements](#known-issues-and-improvements)
- [Polyfills for Node simulation](#polyfills-for-node-simulation)
- [Connecting to a local Hardhat node](#connecting-to-a-local-hardhat-node)

## Installation

Clone this repo

1. Run `yarn install`

## Running

1. Run `yarn start`

Open the app at [localhost:1234](http://localhost:1234)

## Known issues and improvements

## Polyfills for Node simulation

The following polyfiils were installed by parcel because certain 3rd-party modules depend on native node modules, such as `http`, `https`, `os` and `querystring`.

- `querystring-es3` needed by `authereum` and `bnc-onboard`.
- `stream-http` needed by `web3`
- `https-browserify` needed by `web3`
- `os-browserify` needed by `bnc-onboard`.

Read more: <https://parceljs.org/features/node-emulation/#polyfilling-%26-excluding-builtin-node-modules>

## Connecting to a local Hardhat node

- Update `rpcURL` of the network you are interested in `config.ts` to `http://localhost:8545`
- Connect the wallet to app and ensure it is connected to the local hardhat node.
