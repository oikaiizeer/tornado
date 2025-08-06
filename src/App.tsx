import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useWriteContract, useReadContract } from "wagmi";
import { ethers } from "ethers";

// USDC contract ABI (minimal for balance and transfer)
const USDC_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// USDC contract addresses for different networks
const USDC_ADDRESSES = {
  1: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8", // Mainnet
  10: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // Optimism
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" // Arbitrum
};

const DONATION_ADDRESS = "0x8570Cac50327839880079F40953aCb8507075b00";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Roman Storm Coverage</h1>
          <p className="text-gray-300 mb-4">
            Support independent journalism covering Roman Storm and The Rage
          </p>
        </div>
        <ConnectMenu />
      </div>
    </div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-1">Connected account:</div>
          <div className="font-mono text-sm break-all">{address}</div>
        </div>
        <DonationInterface />
      </div>
    );
  }

  return (
    <div className="text-center">
      <button 
        type="button" 
        onClick={() => connect({ connector: connectors[0] })}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}

function DonationInterface() {
  const { address, chainId } = useAccount();
  const [amount, setAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");

  // Get USDC balance
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES] as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!chainId && !!USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES],
    },
  });

  // Transfer function
  const { writeContract, isPending, data: txHash, isSuccess, isError } = useWriteContract();

  const getBasescanUrl = (txHash: string) => {
    if (chainId === 8453) return `https://basescan.org/tx/${txHash}`;
    if (chainId === 1) return `https://etherscan.io/tx/${txHash}`;
    return `https://basescan.org/tx/${txHash}`;
  };

  const handleDonation = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!balance || parseFloat(amount) > Number(balance) / 1e6) {
      setError("Insufficient USDC balance");
      return;
    }

    setIsDonating(true);
    setError("");

    try {
      const amountInWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
      
      await writeContract({
        address: USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES] as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [DONATION_ADDRESS as `0x${string}`, amountInWei],
      });

      setDonatedAmount(amount);
      setAmount("");
    } catch (err: any) {
      console.error("Transaction error:", err);
      if (err?.message?.includes("User rejected")) {
        setError("Transaction cancelled");
      } else {
        setError("Transaction failed");
      }
    } finally {
      setIsDonating(false);
    }
  };

  // Watch for transaction success
  useEffect(() => {
    if (isSuccess && txHash && donatedAmount) {
      setTransactionHash(txHash);
      setDonationSuccess(true);
    }
  }, [isSuccess, txHash, donatedAmount]);

  // Handle transaction errors
  useEffect(() => {
    if (isError) {
      setError("Transaction failed");
    }
  }, [isError]);

  const handleShare = async () => {
    try {
      const basescanUrl = getBasescanUrl(transactionHash);
      await sdk.actions.openUrl({
        url: `https://warpcast.com/~/compose?text=I just donated $${donatedAmount} USDC to support independent journalism covering Roman Storm and The Rage! 🎉%0A%0ATransaction: ${basescanUrl}`
      });
    } catch (err) {
      console.error("Failed to share cast:", err);
    }
  };

  if (donationSuccess) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-bold text-green-400">Donation Successful!</div>
          <div className="text-sm text-gray-300 mt-2">
            Thank you for supporting independent journalism!
          </div>
        </div>
        
        <button
          onClick={handleShare}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Share on Farcaster
        </button>
        
        <button
          onClick={() => setDonationSuccess(false)}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/10 rounded-lg p-4">
        <div className="text-sm text-gray-300 mb-2">Your USDC Balance:</div>
        <div className="font-bold text-xl">
          {balanceLoading ? "Loading..." : 
           balance ? `${(Number(balance) / 1e6).toFixed(2)} USDC` : 
           "Not available"}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Donation Amount (USDC)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleDonation}
        disabled={isDonating || isPending || !amount || parseFloat(amount) <= 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {isDonating || isPending ? "Processing..." : "Send Donation"}
      </button>

      <div className="text-xs text-gray-400 text-center">
        Donation address: {DONATION_ADDRESS}
      </div>
    </div>
  );
}

export default App;
