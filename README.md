# EduChain Lite

EduChain Lite is a decentralized application (dApp) designed to eliminate academic credential fraud by issuing, storing, and verifying digital certificates on an immutable blockchain ledger.

## Features

-   **Secure Issuance:** Educational institutions can securely upload and issue digital certificates to students.
-   **Immutable Records:** Certificates are hashed and their metadata is stored on the Sepolia testnet, ensuring they cannot be tampered with.
-   **IPFS Storage:** Certificate PDF files and metadata are stored decentrally using Pinata (IPFS).
-   **Instant Verification:** Anyone can verify the authenticity of a certificate using its Registration Number or IPFS CID.
-   **Comprehensive Details:** Verification results include the student's name, degree, university, CGPA, issue date, and a direct link to the blockchain transaction hash on Etherscan.

## Technology Stack

-   **Frontend:** Next.js 15, React, Tailwind CSS, Lucide Icons
-   **Blockchain/Web3:** Solidity, Hardhat, Wagmi v2, Viem v2, WalletConnect (Web3Modal)
-   **Decentralized Storage:** Pinata SDK (IPFS)
-   **Smart Contracts:** Deployed on the Sepolia Ethereum Testnet

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   npm or yarn
-   A Web3 Wallet (e.g., MetaMask, Coinbase Wallet)
-   [Pinata Account](https://pinata.cloud/) (for IPFS storage)
-   [WalletConnect Account](https://cloud.walletconnect.com/) (for Web3Modal)

## Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd educhain-lite
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    # Your Pinata JWT for IPFS uploads
    PINATA_JWT=your_pinata_jwt_here

    # Your WalletConnect Project ID
    NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id_here

    # (Optional) For local Smart Contract Deployment
    PRIVATE_KEY=your_wallet_private_key
    SEPOLIA_RPC_URL=your_sepolia_rpc_url
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Smart Contract Deployment (Optional)

If you want to deploy your own instance of the `AdminAuth` contract:

1.  Start a local Hardhat node:
    ```bash
    npx hardhat node
    ```

2.  In a new terminal, deploy the contract to localhost:
    ```bash
    npm run deploy
    ```
    *Note: The project is currently configured to use a pre-deployed contract on the Sepolia network. If you deploy your own, you will need to update `src/artifacts/contract-address.json` and ensure your wallet is connected to the correct network.*

## Deployment to Vercel

This project is ready to be deployed on Vercel.

1.  Push your code to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com/) and click "Add New..." -> "Project".
3.  Import your GitHub repository.
4.  In the **Environment Variables** section, add the required keys (`PINATA_JWT`, `NEXT_PUBLIC_PROJECT_ID`).
5.  Click **Deploy**.

## Usage

1.  **Connect Wallet:** Click the "Connect Wallet" button in the navigation bar to authenticate.
2.  **Admin Portal:** Navigate to the `/admin` page to upload new student details and PDF certificates.
3.  **Verify Certificates:** Navigate to the `/verify` page and enter a Registration Number or IPFS CID to check the authenticity and retrieve blockchain transaction details.
