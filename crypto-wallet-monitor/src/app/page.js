"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Wallet, ArrowUpDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NETWORK_CONFIGS = {
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    apiEndpoint: "https://api.etherscan.io/api",
    explorerUrl: "https://etherscan.io",
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
    apiKey: "YOUR_ETHERSCAN_API_KEY", // Replace with your API key
  },
  solana: {
    name: "Solana",
    symbol: "SOL",
    apiEndpoint: "https://api.mainnet-beta.solana.com",
    explorerUrl: "https://solscan.io",
    addressPattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    apiKey: "YOUR_SOLANA_API_KEY", // Replace with your API key
  },
  binance: {
    name: "Binance Smart Chain",
    symbol: "BNB",
    apiEndpoint: "https://api.bscscan.com/api",
    explorerUrl: "https://bscscan.com",
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
    apiKey: "YOUR_BNCSCAN_API_KEY", // Replace with your API key
  },
};

const CryptoMonitor = () => {
  const [network, setNetwork] = useState("ethereum");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateAddress = (address) => {
    const config = NETWORK_CONFIGS[network];
    return config.addressPattern.test(address);
  };

  const fetchEthereumData = async (address) => {
    const config = NETWORK_CONFIGS.ethereum;

    // Fetch balance
    const balanceResponse = await fetch(
      `${config.apiEndpoint}?module=account&action=balance&address=${address}&tag=latest&apikey=${config.apiKey}`
    );
    const balanceData = await balanceResponse.json();

    // Convert balance from Wei to ETH
    const balance = (parseInt(balanceData.result) / 1e18).toFixed(4);

    // Fetch transactions
    const txResponse = await fetch(
      `${config.apiEndpoint}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${config.apiKey}`
    );
    const txData = await txResponse.json();

    return {
      balance,
      transactions: txData.result.map((tx) => ({
        id: tx.hash,
        type: tx.from.toLowerCase() === address.toLowerCase() ? "OUT" : "IN",
        amount: (parseInt(tx.value) / 1e18).toFixed(4),
        timestamp: new Date(tx.timeStamp * 1000).toISOString(),
        hash: tx.hash,
      })),
    };
  };

  const fetchSolanaData = async (address) => {
    const config = NETWORK_CONFIGS.solana;

    // Fetch balance
    const balanceResponse = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const balanceData = await balanceResponse.json();
    const balance = (balanceData.result.value / 1e9).toFixed(4);

    // Fetch transactions (simplified for demo)
    const txResponse = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [address, { limit: 5 }],
      }),
    });
    const txData = await txResponse.json();

    return {
      balance,
      transactions: txData.result.map((tx, index) => ({
        id: tx.signature,
        type: index % 2 === 0 ? "IN" : "OUT", // Simplified for demo
        amount: (Math.random() * 1).toFixed(4), // Simplified for demo
        timestamp: new Date(tx.blockTime * 1000).toISOString(),
        hash: tx.signature,
      })),
    };
  };

  const fetchBinanceData = async (address) => {
    const config = NETWORK_CONFIGS.binance;

    // Fetch balance
    const balanceResponse = await fetch(
      `${config.apiEndpoint}?module=account&action=balance&address=${address}&apikey=${config.apiKey}`
    );
    const balanceData = await balanceResponse.json();
    const balance = (parseInt(balanceData.result) / 1e18).toFixed(4);

    // Fetch transactions
    const txResponse = await fetch(
      `${config.apiEndpoint}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${config.apiKey}`
    );
    const txData = await txResponse.json();

    return {
      balance,
      transactions: txData.result.map((tx) => ({
        id: tx.hash,
        type: tx.from.toLowerCase() === address.toLowerCase() ? "OUT" : "IN",
        amount: (parseInt(tx.value) / 1e18).toFixed(4),
        timestamp: new Date(tx.timeStamp * 1000).toISOString(),
        hash: tx.hash,
      })),
    };
  };

  const fetchWalletData = async (address) => {
    setLoading(true);
    setError("");
    try {
      let data;
      switch (network) {
        case "ethereum":
          data = await fetchEthereumData(address);
          break;
        case "solana":
          data = await fetchSolanaData(address);
          break;
        case "binance":
          data = await fetchBinanceData(address);
          break;
        default:
          throw new Error("Unsupported network");
      }

      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (err) {
      setError(`Failed to fetch wallet data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address) {
      setError("Please enter a wallet address");
      return;
    }
    if (!validateAddress(address)) {
      setError(`Invalid ${NETWORK_CONFIGS[network].name} address format`);
      return;
    }
    fetchWalletData(address);
  };

  const handleNetworkChange = (value) => {
    setNetwork(value);
    setBalance(null);
    setTransactions([]);
    setError("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Crypto Wallet Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Select value={network} onValueChange={handleNetworkChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NETWORK_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder={`Enter ${NETWORK_CONFIGS[network].name} address`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="bg-black text-white">
                {loading ? "Loading..." : "Monitor"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {balance !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-600">Current Balance</div>
                <div className="text-2xl font-bold">
                  {balance} {NETWORK_CONFIGS[network].symbol}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-lg font-semibold">Recent Transactions</div>
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpDown
                          className={`h-4 w-4 ${
                            tx.type === "IN" ? "text-green-500" : "text-red-500"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {tx.type === "IN" ? "Received" : "Sent"} {tx.amount}{" "}
                            {NETWORK_CONFIGS[network].symbol}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <a
                        href={`${NETWORK_CONFIGS[network].explorerUrl}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 truncate max-w-xs"
                      >
                        {tx.hash}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CryptoMonitor;
