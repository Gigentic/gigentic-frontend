/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Card,
  Textarea,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@gigentic-frontend/ui-kit/ui';
import { useTransactionToast } from '@/components/ui/ui-layout';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import {
  useGigenticProgram,
  useServiceRegistry,
  serviceRegistryPubkey,
} from '@/hooks/blockchain/use-gigentic-program';
import { ServiceCard } from './service-card';

// Form validation schema
const serviceSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(100, 'Title must not exceed 100 characters'),
  serviceDescription: z
    .string()
    .min(1, 'Description must be at least 1 characters')
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
const MINT_ADDRESS = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

export function AddService() {
  const { program } = useGigenticProgram();
  const { connected, publicKey, signTransaction } = useWallet();
  const transactionToast = useTransactionToast();
  const { serviceAccounts } = useServiceRegistry();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filter for all services (already available from accounts)
  const allServices = serviceAccounts.data || [];

  // Filter for user services (already have this)
  const userServices = serviceAccounts.data?.filter(
    (account) => account.account.provider.toString() === publicKey?.toString(),
  );

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      serviceDescription: '',
      price: '',
    },
  });

  const handleCreateService = async (data: ServiceFormData) => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    console.log('Creating Service Offering...');

    try {
      setIsSubmitting(true);

      // Generate unique ID (matching test pattern)
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Format description
      const fullDescription = `title: ${data.title} | description: ${data.serviceDescription}`;

      // Convert price to lamports and create BN
      const priceInLamports = new BN(Number(data.price) * LAMPORTS_PER_SOL);

      console.log('Transaction parameters:', {
        uniqueId,
        description: fullDescription,
        price: priceInLamports.toString(),
        provider: publicKey.toString(),
        serviceRegistry: serviceRegistryPubkey,
        mint: MINT_ADDRESS.toString(),
      });

      // Call program matching test pattern
      const tx = await program.methods
        .initializeService(uniqueId, fullDescription, priceInLamports)
        .accounts({
          provider: publicKey,
          serviceRegistry: serviceRegistryPubkey,
          mint: MINT_ADDRESS,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log('Transaction signature:', tx);
      console.log('Service offering created successfully.');
      toast.success(
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Service created successfully!</div>
          <div className="text-sm text-muted-foreground">
            <div>Title: {data.title}</div>
            <div>Price: {data.price} SOL</div>
          </div>
          <a
            href={`https://explorer.solana.com/tx/${tx}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View transaction
          </a>
        </div>,
        {
          duration: 5000,
        },
      );

      transactionToast(tx);

      // Refetch after confirmation
      await serviceAccounts.refetch();

      // Reset form and hide it
      form.reset();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderServicesList = (services: typeof serviceAccounts.data) => {
    if (serviceAccounts.isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (!services?.length) {
      return (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
          <p className="text-muted-foreground mb-4">
            {publicKey
              ? 'No services available yet.'
              : 'Connect your wallet to view services.'}
          </p>
          {!showForm && publicKey && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Service
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((account) => (
          <ServiceCard
            key={account.publicKey.toString()}
            account={account.publicKey}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground text-lg">
              Browse and manage service offerings
            </p>
          </div>
          {publicKey && (
            <Button
              onClick={() => setShowForm(!showForm)}
              size="lg"
              className="shrink-0"
            >
              {showForm ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Service
                </>
              )}
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="p-6">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Create New Service
              </h2>
              <p className="text-muted-foreground">
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
                    type="text"
                    min="0"
                    placeholder="0.01"
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
          </Card>
        )}

        <Tabs defaultValue="your-services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="your-services">Your Services</TabsTrigger>
            <TabsTrigger value="all-services">All Services</TabsTrigger>
          </TabsList>
          <TabsContent value="your-services" className="mt-6">
            {renderServicesList(userServices)}
          </TabsContent>
          <TabsContent value="all-services" className="mt-6">
            {renderServicesList(allServices)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
