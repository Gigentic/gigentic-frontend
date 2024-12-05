'use client';

import { Card, CardContent, Button } from '@gigentic-frontend/ui-kit/ui';
import { UnreviewedService } from '../mock-data';
import { Briefcase, User } from 'lucide-react';

interface UnreviewedServiceCardProps {
  service: UnreviewedService;
}

export function UnreviewedServiceCard({ service }: UnreviewedServiceCardProps) {
  const isProvider = service.role === 'provider';
  const Icon = isProvider ? Briefcase : User;
  const colorClass = isProvider ? 'blue' : 'green';

  return (
    <Card
      className={`border-${colorClass}-200/50 hover:border-opacity-100 transition-colors`}
    >
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{service.serviceTitle}</h3>
                <Icon className={`w-4 h-4 text-${colorClass}-500`} />
              </div>
              <p className="text-sm text-muted-foreground">
                {isProvider ? 'Customer' : 'Provider'}: {service.providerName}
              </p>
              <p className="text-sm text-muted-foreground">
                Completed on: {service.date}
              </p>
              <p className="text-sm mt-2">
                <span className={`text-${colorClass}-600`}>
                  {isProvider ? 'As Service Provider' : 'As Customer'}
                </span>
              </p>
            </div>
            <Button
              onClick={() => {
                console.log('Open review dialog for:', service.id);
              }}
            >
              Leave Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
