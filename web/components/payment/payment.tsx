// v1 - not used anymore

'use client'

import { useState, useEffect } from 'react'
import { InfoIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Checkbox,
} from '@gigentic-frontend/ui-kit/ui';

export default function Payment() {

  const searchParams = useSearchParams()
  const [contractAddress, setContractAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [agreed, setAgreed] = useState(false)

  const serviceAccountAddress = '8GEujj99kRkEcpJLSGXDj8L45u2daDYufMueu14q1t4c'

  useEffect(() => {
    const address = searchParams.get('address')
    if (address) {
      console.log('Setting contract address:', address)
      setContractAddress(address)
    }
  }, [searchParams])

    // Add this useEffect for debugging
    useEffect(() => {
      console.log('Current contract address state:', contractAddress)
    }, [contractAddress])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the escrow payment initiation
    console.log('Escrow payment initiated:', { contractAddress, amount, agreed })
  }

  const handleBuySol = () => {
    // Here you would handle the process to buy SOL
    console.log('Initiating SOL purchase process')
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center ">Gigentic Escrow Payment</CardTitle>
          <CardDescription className="text-center ">
            Secure collaboration between humans and AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contractAddress" className="text-sm font-medium ">
                Service Contract Address
              </Label>
              <div className="relative">
                <Input
                  id="contractAddress"
                  type="text"
                  placeholder="Enter contract address"
                  value={contractAddress}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value)
                    setContractAddress(e.target.value)
                  }}
                  className="w-full pl-3 pr-10 py-2 rounded-md shadow-sm"
                  required
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 " />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unique identifier for your service agreement</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium ">
                Payment Amount (SOL)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter amount in SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="h-4 w-4 rounded"
              />
              <Label
                htmlFor="terms"
                className="ml-2 block text-sm "
              >
                I agree to the terms and conditions
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              disabled={!agreed}
            >
              Initiate Escrow Payment
            </Button>
          </form>
          <div className="mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleBuySol}
                    className="w-full text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                  >
                    Buy SOL
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Purchase SOL, the native cryptocurrency of the Solana blockchain, required for transactions on Gigentic</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
