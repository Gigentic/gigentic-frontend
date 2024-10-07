'use client';

import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"
import { Skeleton } from "@gigentic-frontend/ui-kit/ui"

interface CryptoData {
  name: string
  symbol: string
  currentPrice: number | null
  priceChangePercentage: number | null
}

export default function PriceSkeleton() {
  const cryptoData: CryptoData = {
    name: "Bitcoin",
    symbol: "BTC",
    currentPrice: null,
    priceChangePercentage: null,
  }

  const isLoading = cryptoData.currentPrice === null || cryptoData.priceChangePercentage === null
  const isPositiveChange = (cryptoData.priceChangePercentage ?? 0) >= 0

  return (
    <div className="w-full max-w-md p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <TrendingUpIcon className="w-8 h-8 mr-3 text-yellow-400" />
          <h2 className="text-2xl font-bold">
            {cryptoData.name} <span className="text-gray-400 text-xl">({cryptoData.symbol})</span>
          </h2>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-gray-700 bg-opacity-50 p-4 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-gray-400 mb-1">Current Price</p>
          <div className="flex items-baseline">
            {isLoading ? (
              <Skeleton className="h-9 w-40 bg-gray-600" />
            ) : (
              <>
                <p className="text-3xl font-bold">${cryptoData.currentPrice?.toLocaleString()}</p>
                <p className="ml-2 text-lg text-gray-400">{cryptoData.symbol}</p>
              </>
            )}
          </div>
        </div>
        <div className={`p-4 rounded-xl backdrop-blur-sm ${isPositiveChange ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'}`}>
          <p className="text-sm text-gray-300 mb-1">24h Change</p>
          <div className="flex items-center">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-gray-600" />
            ) : (
              <>
                {isPositiveChange ? (
                  <ArrowUpIcon className="w-6 h-6 text-green-400 mr-2" />
                ) : (
                  <ArrowDownIcon className="w-6 h-6 text-red-400 mr-2" />
                )}
                <p className={`text-2xl font-bold ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(cryptoData.priceChangePercentage ?? 0).toFixed(2)}%
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}