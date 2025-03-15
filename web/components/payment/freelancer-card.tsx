import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@gigentic-frontend/ui-kit/ui';
import { Freelancer } from '@/types/freelancer';

interface FreelancerCardProps {
  freelancer: Freelancer;
  isServiceInEscrow: boolean;
  onPayIntoEscrow: () => void;
}

export const FreelancerCard: React.FC<FreelancerCardProps> = ({
  freelancer,
  isServiceInEscrow,
  onPayIntoEscrow,
}) => (
  <Card variant="payment" size="lg">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`https://explorer.testnet.soo.network/address/${freelancer.serviceAccountAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-lg hover:underline hover:text-primary"
                  >
                    {freelancer.title}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to view on Explorer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐ {freelancer.rating}</span>
            <span className="text-green-500">
              {freelancer.matchScore}% match
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">
            Service Price to pay into escrow: {freelancer.price} ETH
          </div>
          {isServiceInEscrow ? (
            <div className="space-y-2">
              <p className="text-sm text-red-500">
                This service is already in an active escrow
              </p>
              <Button disabled className="mt-2 opacity-50">
                Pay into Escrow
              </Button>
            </div>
          ) : (
            <Button onClick={onPayIntoEscrow} className="mt-2">
              Pay into Escrow
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);
