import { useState } from 'react';
import { Search, User, ChevronDown, Send } from 'lucide-react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gigentic-frontend/ui-kit/ui';

import ChatAgent from '@/components/search-agent/chat-agent';

export default function GigenticInterface() {
  const [selectedNetwork, setSelectedNetwork] = useState('devnet');

  const serviceProviders = [
    { id: 'AJ', name: 'Alice Johnson', skill: 'Web Development', rate: 50 },
    { id: 'BS', name: 'Bob Smith', skill: 'Graphic Design', rate: 40 },
    { id: 'CB', name: 'Charlie Brown', skill: 'Content Writing', rate: 30 },
  ];

  return (
    <div className="min-h-screen ">
      <header className="shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo-g.png" alt="Gigentic Logo" className="w-10 h-10" />
            <nav className="hidden md:flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                SearchAgent
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Gigentic
              </a>

              <div className=" dark:bg-white">
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Account
                </a>
              </div>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:flex">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
            <Button variant="outline" className="hidden md:flex">
              <User className="mr-2 h-4 w-4" /> Profile
            </Button>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="devnet">devnet</SelectItem>
                <SelectItem value="local">local</SelectItem>
                <SelectItem value="testnet">testnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Gigentic Frontend Feature Hello
        </h1>
        <div>
          <ChatAgent />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Service Request</CardTitle>
              <CardDescription>
                Describe the service or job you need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="service-description"
                      className="block text-sm font-medium mb-1"
                    >
                      Service Description
                    </label>
                    <Textarea
                      id="service-description"
                      placeholder="Describe the service or job you need..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gigentic Demo</CardTitle>
              <CardDescription>Select a Service Provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{provider.id}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm">{provider.skill}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">${provider.rate}/hr</span>
                      <Button size="sm">Select</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className=" mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          Generated by Gigentic
        </div>
      </footer>
    </div>
  );
}
