"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@gigentic-frontend/ui-kit/ui"
import { Badge } from "@gigentic-frontend/ui-kit/ui"
import { Button } from "@gigentic-frontend/ui-kit/ui"
import { Star, MessageSquare, Zap, Lock } from "lucide-react"

interface FreelancerProfileProps {
  title: string
  pricePerHour: number
  experience: string
  rating: number
  matchScore: number
  paymentWalletAddress: string
}

const DefaultFreelancerProfileProps: FreelancerProfileProps = {
  title: "Test",
  pricePerHour: 50,
  experience: "Test",
  rating: 4.5,
  matchScore: 80,
  paymentWalletAddress: "0x1234567890123456789012345678901234567890"
}

export default function FreelancerProfileCard(props: FreelancerProfileProps = DefaultFreelancerProfileProps) 
{
  const freelancerProfileProps: FreelancerProfileProps = {
    title: props.title,
    pricePerHour: props.pricePerHour,
    experience: props.experience,
    rating: props.rating,
    matchScore: props.matchScore,
    paymentWalletAddress: props.paymentWalletAddress
  }

  const [contractAddress, setContractAddress] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const fullStars = Math.floor(props.rating)
  const hasHalfStar = props.rating % 1 !== 0

  const handleContactNow = () => {
    // Replace this URL with the actual Solchat URL when available
    const solchatUrl = `https://www.solchat.app/`
    window.open(solchatUrl, '_blank', 'noopener,noreferrer')
  }

  const handlePayEscrow = () => {
    // Replace this URL with the actual Escrow URL when available
    setContractAddress(props.paymentWalletAddress)
    const escrowUrl = `http://localhost:3000/payment?address=${props.paymentWalletAddress}`
    window.open(escrowUrl, '_blank', 'noopener,noreferrer')
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="bg-gray-100 p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex flex-col flex-grow">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{props.title}</CardTitle>
              <div className="flex items-center">
                <Zap className={`w-4 h-4 mr-1 ${getMatchScoreColor(props.matchScore)}`} />
                <span className={`font-semibold ${getMatchScoreColor(props.matchScore)}`}>
                  {props.matchScore}% match
                </span>
              </div>
            </div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < fullStars
                      ? 'text-yellow-400 fill-yellow-400'
                      : i === fullStars && hasHalfStar
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 fill-gray-300'
                  }`}
                  strokeWidth={1.5}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {props.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Price per hour</span>
            <Badge variant="secondary" className="text-lg">
              ${props.pricePerHour}
            </Badge>
          </div>
          <div>
            <span className="font-semibold">Experience</span>
            <p className={`mt-1 text-sm text-muted-foreground ${!isExpanded && 'line-clamp-3'}`}>
              {props.experience}
            </p>
            {props.experience.length > 150 && (
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleContactNow}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Now
          </Button>
          <Button className="w-full" variant="outline" onClick={handlePayEscrow}>
            <Lock className="w-4 h-4 mr-2" />
            Pay into Escrow
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}