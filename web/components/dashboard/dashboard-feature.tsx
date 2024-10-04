'use client';

import { Card, CardContent, Input, Button } from '@gigentic-frontend/ui-kit/ui';
import Search from '../search-agent/search';

export default function DashboardFeature() {
  return (
    <div>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Search Agent</h2>
          <div className="space-y-4 mb-4">
            <div className="flex gap-2">
              <span className="font-semibold">user:</span>
              <p>What is the weather in London?</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">assistant:</span>
              <p>Heres the weather for London!</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">user:</span>
              <p>What is the weather in Berlin?</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">assistant:</span>
              <p>Heres the weather for Berlin!</p>
            </div>
          </div>
          <div className="bg-sky-300 w-48 h-48 rounded-lg flex flex-col items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-24 h-24 text-yellow-300"
            >
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
            <span className="text-4xl font-bold text-white">25°C</span>
          </div>
          <Input placeholder="Enter your weather query..." className="mb-4" />
          <Button className="w-full">Send Message</Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Lets make business:</h3>
          <p className="mb-4">Pay xx SOL to #234 service offering escrow</p>
          <Button variant="secondary">Pay</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// <Search />;
