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
  walletAddress: string
  matchScore: number
}


interface FreelancerProfile3CardsProps {
    freelancer1_title: string
    freelancer1_pricePerHour: number
    freelancer1_experience: string
    freelancer1_rating: number
    freelancer1_walletAddress: string
    freelancer1_matchScore: number

    freelancer2_title: string
    freelancer2_pricePerHour: number
    freelancer2_experience: string
    freelancer2_rating: number
    freelancer2_walletAddress: string
    freelancer2_matchScore: number

    freelancer3_title: string
    freelancer3_pricePerHour: number
    freelancer3_experience: string
    freelancer3_rating: number
    freelancer3_walletAddress: string
    freelancer3_matchScore: number
  }

function FreelancerProfileCard({ 
  title,
  pricePerHour,
  experience,
  rating,
  walletAddress,
  matchScore
}: FreelancerProfileProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  const handleContactNow = () => {
    const solchatUrl = `https://example.com/solchat/${walletAddress}`
    window.open(solchatUrl, '_blank', 'noopener,noreferrer')
  }

  const handlePayEscrow = () => {
    console.log("Initiating escrow payment process")
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card className="w-full bg-white shadow-lg">
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
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-center">
              <Zap className={`w-4 h-4 mr-1 ${getMatchScoreColor(matchScore)}`} />
              <span className={`font-semibold ${getMatchScoreColor(matchScore)}`}>
                {matchScore}% match
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
              {typeof rating === 'number' ? rating.toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Price per hour</span>
          <Badge variant="secondary" className="text-lg">
            ${pricePerHour}
          </Badge>
        </div>
        <div>
          <span className="font-semibold">Experience</span>
          <p className={`mt-1 text-sm text-muted-foreground ${!isExpanded && 'line-clamp-3'}`}>
            {experience}
          </p>
          {experience.length > 150 && (
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
  )
}

export default function FreelancerProfile3Cards(props: FreelancerProfile3CardsProps) {
  const freelancers: FreelancerProfileProps[] = [
    {
      title: props.freelancer1_title,
      pricePerHour: props.freelancer1_pricePerHour,
      experience: props.freelancer1_experience,
      rating: props.freelancer1_rating,
      walletAddress: props.freelancer1_walletAddress,
      matchScore: props.freelancer1_matchScore
    },
    {
      title: props.freelancer2_title,
      pricePerHour: props.freelancer2_pricePerHour,
      experience: props.freelancer2_experience,
      rating: props.freelancer2_rating,
      walletAddress: props.freelancer2_walletAddress,
      matchScore: props.freelancer2_matchScore
    },
    {
      title: props.freelancer3_title,
      pricePerHour: props.freelancer3_pricePerHour,
      experience: props.freelancer3_experience,
      rating: props.freelancer3_rating,
      walletAddress: props.freelancer3_walletAddress,
      matchScore: props.freelancer3_matchScore
    }
  ]

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map((freelancer, index) => (
          <FreelancerProfileCard key={index} {...freelancer} />
        ))}
      </div>
    </div>
  )
}