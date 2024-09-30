'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Button,
  Textarea,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@gigentic-frontend/ui-kit/ui';

import { toast } from '@gigentic-frontend/ui-kit/ui/hooks/use-toast';

const formSchema = z.object({
  description: z.string().min(20, {
    message: 'Description must be at least 20 characters.',
  }),
});

export default function ServiceRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log(values);
      setIsSubmitting(false);
      toast({
        title: 'Service Request Submitted',
        description: 'Your service request has been successfully submitted.',
      });
      form.reset();
    }, 2000);
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-9">Submit a Service Request</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the service or job you need..."
                    className="resize-none min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide details about your service requirements. Be as
                  specific as possible to help freelancers understand your
                  needs.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
