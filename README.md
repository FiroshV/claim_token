# Next.js and Tailwind CSS Project

This project is built using Next.js, a React framework that enables functionality such as server-side rendering and generating static websites, combined with the utility-first CSS framework Tailwind CSS.

## Features

- Connect to Ethereum blockchain using Ethers.js
- Interact with smart contracts
- Claim token functionality
- Responsive UI with Tailwind CSS

## Prerequisites

Before you begin, ensure you have met the following requirements:

- MetaMask extension installed in your browser for wallet interaction

## Installation

To install the dependencies, run the following command:

```bash
npm install
# or
yarn install
```
## Environment Setup

Create a .env.local file in the root directory of the project and add the following environment variables:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<Your_Contract_Address>
NEXT_PUBLIC_SEPOLIA_RPC_URL=<Your_Sepolia_RPC_URL>
```

Replace <Your_Contract_Address> and <Your_Sepolia_RPC_URL> with your actual contract address and Sepolia RPC URL respectively.

## Running the project

To start the development server, run:

```bash
npm run dev
# or
yarn dev
```

Open <http://localhost:3000> with your browser to see the result.
