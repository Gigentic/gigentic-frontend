import Image from 'next/image';
import Link from 'next/link';

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
} from '@gigentic-frontend/ui-kit/ui';

export default function Search() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image src="/logo.svg" alt="Logo" width={40} height={40} />
              <Tabs defaultValue="search" className="ml-6">
                <TabsList>
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button variant="ghost" size="icon" className="text-purple-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M4 4h16v12H5.17L4 17.17V4zm0 16h16v2H4v-2zm16-8H4v2h16v-2z" />
              </svg>
              <span className="sr-only">Chat</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <button className="hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
          <button className="hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
          </button>
        </div>
        <p>© 2024 Gigentic</p>
        <span>local</span>
      </footer>
    </div>
  );
}
