'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Button,
  Card,
  CardContent,
  Textarea,
  Input,
} from '@gigentic-frontend/ui-kit/ui';
import { Plus } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { getGigenticProgram } from '@gigentic-frontend/anchor';
import { AnchorProvider } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
// Form validation schema
const serviceSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must not exceed 100 characters'),
  serviceDescription: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  price: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Price must be a positive number',
    ),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// Update these constants at the top of the file
const SERVICE_REGISTRY_PUBKEY =
  process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!;
const MINT_ADDRESS = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

export function AddService() {
  const { connection } = useConnection();
  const walletContext = useWallet();
  const { connected, publicKey } = walletContext;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      serviceDescription: '',
      price: '',
    },
  });

  const handleCreateService = async (data: ServiceFormData) => {
    if (!connected || !publicKey || !walletContext.signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    console.log('Creating Service Offering...');

    try {
      setIsSubmitting(true);

      // Create anchor wallet adapter
      const anchorWallet = {
        publicKey: walletContext.publicKey!,
        signTransaction: walletContext.signTransaction,
        signAllTransactions: walletContext.signAllTransactions!,
      };

      // Get program instance
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: 'confirmed',
      });
      const program = getGigenticProgram(provider);

      // Generate unique ID (matching test pattern)
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Format description
      const fullDescription = `title: ${data.title} | description: ${data.serviceDescription}`;

      // Convert price to lamports and create BN
      const priceInLamports = new anchor.BN(
        Number(data.price) * LAMPORTS_PER_SOL,
      );

      console.log('Transaction parameters:', {
        uniqueId,
        description: fullDescription,
        price: priceInLamports.toString(),
        provider: publicKey.toString(),
        serviceRegistry: SERVICE_REGISTRY_PUBKEY.toString(),
        mint: MINT_ADDRESS.toString(),
      });

      // Call program matching test pattern
      const tx = await program.methods
        .initializeService(uniqueId, fullDescription, priceInLamports)
        .accounts({
          provider: publicKey,
          serviceRegistry: SERVICE_REGISTRY_PUBKEY,
          mint: MINT_ADDRESS,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log('Transaction signature:', tx);
      console.log('Service offering created successfully.');
      toast.success('Service created successfully!');
      form.reset();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Your Service Offering
          </h1>
          <p className="text-muted-foreground text-lg">
            Describe your service and set your rate
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(handleCreateService)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="title" className="text-lg font-semibold">
              Service Title
            </label>
            <Input
              {...form.register('title')}
              placeholder="Enter a clear, descriptive title for your service..."
              className="w-full"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-lg font-semibold">
              Service Description
            </label>
            <Textarea
              {...form.register('serviceDescription')}
              className="min-h-[200px] resize-y"
              placeholder="Describe your services, expertise, and what you can offer to clients..."
            />
            {form.formState.errors.serviceDescription && (
              <p className="text-sm text-red-500">
                {form.formState.errors.serviceDescription.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-lg font-semibold">
              Service Rate (SOL)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                SOL
              </span>
              <Input
                {...form.register('price')}
                type="number"
                step="0.001"
                min="0"
                placeholder="0.000"
                className="pl-12"
              />
            </div>
            {form.formState.errors.price && (
              <p className="text-sm text-red-500">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            type="submit"
            disabled={isSubmitting || !connected}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Service Offering'}
          </Button>
        </form>
      </div>
    </div>
  );
}
