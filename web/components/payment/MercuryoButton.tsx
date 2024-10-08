'use client';

import React from 'react';
import { Button } from '@gigentic-frontend/ui-kit/ui';
import { useRouter } from 'next/navigation';
import crypto from 'crypto';

export default function MercuryoButton() {
  const router = useRouter();

  const handleRedirect = () => {
    const address = 'ShhjmYA32ExcRemshDAyjSp98HSzz3DqrHvNrHnZHLM';
    const secret = 'secret';

    const signatureInput = `${address}${secret}`;
    const signature = crypto
      .createHash('sha512')
      .update(signatureInput)
      .digest('hex');

    const baseUrl = 'https://exchange.mercuryo.io/';
    const widgetId = '224ad77d-29c0-4e39-bdf1-ff1d7f715df5';

    const params = new URLSearchParams({
      widget_id: widgetId,
      type: 'sell',
      currency: 'SOL',
      network: 'SOLANA',
      amount: '2',
      fiat_currency: 'EUR',
      address: address,
      signature: signature,
    });

    const finalUrl = `${baseUrl}?${params.toString()}`;

    // Use window.open for external links
    window.open(finalUrl, '_blank');
  };

  return (
    <Button onClick={handleRedirect} className="w-full" variant="outline">
      Buy SOL
    </Button>
  );
}
