'use client';

import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useServiceAccount } from '@/hooks/blockchain/use-service-account';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@gigentic-frontend/ui-kit/ui';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { ellipsify } from '../ui/ui-layout';
// import { ExplorerLink } from '../cluster/cluster-ui';
import { useState } from 'react';

interface ServiceCardProps {
  account: PublicKey;
}

export function ServiceCard({ account }: ServiceCardProps) {
  const { data: serviceAccount, isLoading } = useServiceAccount(account);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serviceAccount) {
    return null;
  }

  const descriptionParts = serviceAccount.description.split(' | ');
  const title = descriptionParts[0].replace('title: ', '');
  const description = descriptionParts[1]?.replace('description: ', '') || '';
  const priceInSol = serviceAccount.price.toNumber() / LAMPORTS_PER_SOL;

  return (
    <Card variant="service">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl max-w-[80%] truncate" title={title}>
              {title}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {priceInSol} SOL
            </Badge>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`https://explorer.testnet.soo.network/account/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-primary"
                >
                  {ellipsify(account.toString())}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Service Account on Explorer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <span className="font-semibold block">Description</span>
          <div className="relative">
            <p
              className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-3' : ''}`}
            >
              {description}
            </p>
            {description.length > 150 && (
              <Button
                variant="link"
                className="px-0 h-auto text-sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground truncate">
            {ellipsify(serviceAccount.provider.toString())}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
