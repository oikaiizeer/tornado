# Roman Storm Coverage Donation Mini App

A Farcaster Mini App that allows users to donate USDC to support independent journalism covering Roman Storm and The Rage.

## Features

- 🔗 **Wallet Connection**: Connect your wallet using Farcaster Frame SDK
- 💰 **USDC Balance Check**: View your current USDC balance
- 💸 **One-Click Donation**: Enter amount and send donation with a single click
- ✅ **Balance Validation**: Ensures you have sufficient USDC before donating
- 🎉 **Success Confirmation**: Beautiful success screen after donation
- 📢 **Farcaster Sharing**: Share your donation on Farcaster with one click

## Supported Networks

- Ethereum Mainnet
- Optimism
- Base
- Arbitrum

## Donation Address

All donations are sent to: `0x8570Cac50327839880079F40953aCb8507075b00`

## Getting Started

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Start Development Server**
   ```bash
   yarn dev
   ```

3. **Build for Production**
   ```bash
   yarn build
   ```

## How to Use

1. **Connect Wallet**: Click "Connect Wallet" to connect your Farcaster wallet
2. **Check Balance**: Your USDC balance will be displayed automatically
3. **Enter Amount**: Type the amount of USDC you want to donate
4. **Send Donation**: Click "Send Donation" to complete the transaction
5. **Share**: After successful donation, click "Share on Farcaster" to share your contribution

## Technical Details

- Built with React + TypeScript + Vite
- Uses Farcaster Frame SDK for wallet integration
- Wagmi for blockchain interactions
- Ethers.js for USDC token operations
- Tailwind CSS for styling

## USDC Contract Addresses

- **Mainnet**: `0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8`
- **Optimism**: `0x7F5c764cBc14f9669B88837ca1490cCa17c31607`
- **Base**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Arbitrum**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`

## Security

- All transactions are validated on-chain
- USDC balance is checked before allowing donations
- Transaction failures are handled gracefully
- No private keys are stored or transmitted

## Contributing

This is a simple donation app for supporting independent journalism. Feel free to fork and modify for your own causes!

