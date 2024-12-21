'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@gigentic-frontend/ui-kit/ui';
import { Badge } from '@gigentic-frontend/ui-kit/ui';
import { Button } from '@gigentic-frontend/ui-kit/ui';
import { Star, MessageSquare, Zap, Lock } from 'lucide-react';
import { useSelectFreelancer } from '@/hooks/services/use-freelancer-query';
import { useRouter } from 'next/navigation';
import type { Freelancer } from '@/types/freelancer';

const DefaultFreelancerProfileProps: Freelancer = {
  title: 'Test',
  pricePerHour: 50,
  experience: 'Test',
  rating: 4.5,
  matchScore: 80,
  serviceAccountAddress: '0x1234567890123456789012345678901234567890',
};

// render the profile card for one freelancer
export default function FreelancerProfileCard(
  props: Freelancer = DefaultFreelancerProfileProps,
) {
  const router = useRouter();
  const { mutate: selectFreelancer } = useSelectFreelancer();

  // const [isExpanded, setIsExpanded] = useState(false);
  // const fullStars = Math.floor(props.rating);
  // const hasHalfStar = props.rating % 1 !== 0;
  const isMemeAgent =
    props.serviceAccountAddress ===
    'D2ZQ3XT1yD2E4DDbzrE5Ln9jSF2TyDkDEdMSHQxHer1r';

  const handleContactNow = () => {
    // Replace this URL with the actual Solchat URL when available
    const solchatUrl = `https://www.solchat.app/`;
    window.open(solchatUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePayEscrow = () => {
    if (isMemeAgent) {
      router.push('/service-discovery?agent=meme');
      return;
    }

    const freelancerData = {
      ...props,
      isMemeAgent,
    };

    // Cache the freelancer data and navigate on success
    selectFreelancer(freelancerData, {
      onSuccess: () => {
        // console.log('✅ Freelancer data cached successfully');
        router.push('/payment');
      },
      onError: (error) => {
        console.error('❌ Failed to cache freelancer data:', error);
        // Optionally handle error (e.g., show toast notification)
      },
    });
  };

  // const getMatchScoreColor = (score: number) => {
  //   if (score >= 80) return 'text-green-500';
  //   if (score >= 60) return 'text-yellow-500';
  //   return 'text-red-500';
  // };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-16 h-16">
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
              <CardTitle>{props.title}</CardTitle>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                <span>{props.matchScore}% match</span>
              </div>
            </div>
            <div className="flex items-center mt-1">
              <span>⭐ {props.rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-between items-center">
            <span>Price per hour</span>
            <Badge variant="secondary">{props.pricePerHour} SOL</Badge>
          </div>
          <div>
            <span>Experience</span>
            <p>{props.experience}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleContactNow}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Now
          </Button>
          <Button className="w-full" onClick={handlePayEscrow}>
            <Lock className="w-4 h-4 mr-2" />
            Pay into Escrow
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
