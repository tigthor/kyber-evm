# EVM Runtime Module

The `EVM` class in this module provides functionality related to the Ethereum Virtual Machine (EVM). It extends the `IRuntime` interface from the '@kyve/core' package and provides methods to fetch and format blockchain data. 

## Features
* Fetching specific blockchain data items
* Formatting fetched data
* Setting network settings
* Generating authorization headers for Coinbase Cloud endpoints

## Details

### Class Name and Version
The `name` and `version` properties are defined from the package.json file.

### Method Descriptions

#### getDataItem(core: Node, key: string): Promise<DataItem>

This method takes a `Node` and a `key` as parameters and returns a `Promise` that resolves to a `DataItem`. This method is responsible for:
* Setting up the network settings
* Generating authorization headers for Coinbase Cloud endpoints
* Setting up the web3 provider
* Fetching the blockchain data item
* Formatting and returning the fetched data

#### getNextKey(key: string): Promise<string>

This method takes a `key` as a parameter and returns a `Promise` that resolves to a string. It's responsible for determining the next key.

#### formatValue(value: any): Promise<string>

This method takes a `value` as a parameter and returns a `Promise` that resolves to a string. It formats the fetched value.

#### generateCoinbaseCloudHeaders(core: Node): Promise<any>

This private method takes a `Node` as a parameter and returns a `Promise` that resolves to an object. It's responsible for generating the required authorization headers for Coinbase Cloud endpoints.

## Usage

Please refer to the documentation in the respective methods for more details on their usage.

## Dependencies

* `@kyve/core`: This package is used for the 'IRuntime' interface and 'DataItem' and 'Node' types.
* `ethers`: This package provides the Ethereum JavaScript API and is used for setting up the web3 provider.

## Package Details

* Name: `EVM Runtime Module`
* Version: As defined in package.json

## Installation

Before you can use the EVM runtime module, you need to install the required dependencies in your project.

```bash
npm install @kyve/core ethers
