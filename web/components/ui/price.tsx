'use client';

import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"

interface CryptoData {
  name: string
  symbol: string
  currentPrice: number
  priceChangePercentage: number
}

const DefaultCryptoData: CryptoData = {
  name: "Bitcoin",
  symbol: "BTC",
  currentPrice: 34567.89,
  priceChangePercentage: 2.5,
}

export default function Price(props: CryptoData = DefaultCryptoData) {
  const cryptoData: CryptoData = {
    name: props.name,
    symbol: props.symbol,
    currentPrice: props.currentPrice,
    priceChangePercentage: props.priceChangePercentage,
  }

  const isPositiveChange = cryptoData.priceChangePercentage >= 0

  return (
    <div className="w-full max-w-sm p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <TrendingUpIcon className="w-6 h-6 mr-2 text-yellow-400" />
          <h2 className="text-xl font-bold">
            {cryptoData.name} <span className="text-gray-400 text-lg">({cryptoData.symbol})</span>
          </h2>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-gray-400 mb-1">Current Price</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold">${cryptoData.currentPrice.toLocaleString()}</p>
            <p className="ml-2 text-sm text-gray-400">{cryptoData.symbol}</p>
          </div>
        </div>
        <div className={`p-3 rounded-lg backdrop-blur-sm ${isPositiveChange ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'}`}>
          <p className="text-xs text-gray-300 mb-1">24h Change</p>
          <div className="flex items-center">
            {isPositiveChange ? (
              <ArrowUpIcon className="w-5 h-5 text-green-400 mr-1" />
            ) : (
              <ArrowDownIcon className="w-5 h-5 text-red-400 mr-1" />
            )}
            <p className={`text-xl font-bold ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(cryptoData.priceChangePercentage).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}