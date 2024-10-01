// 'use client';

// import { useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// export default function GigenticDemo() {
//   const [selectedProvider, setSelectedProvider] = useState(null);
//   const [currentTab, setCurrentTab] = useState('supplier');
//   const [serviceDescription, setServiceDescription] = useState('');

//   const providers = [
//     { id: 1, name: 'Alice Johnson', skill: 'Web Development', rate: '$50/hr' },
//     { id: 2, name: 'Bob Smith', skill: 'Graphic Design', rate: '$40/hr' },
//     { id: 3, name: 'Charlie Brown', skill: 'Content Writing', rate: '$30/hr' },
//   ];

//   const handleProviderSelect = (provider) => {
//     setSelectedProvider(provider);
//   };

//   const handleServiceSubmit = (e) => {
//     e.preventDefault();
//     alert('Service request submitted successfully!');
//     setServiceDescription('');
//   };

//   return (
//     <div className="container mx-auto p-4 max-w-4xl bg-[#29ABE2] text-white min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Gigentic Demo</h1>
//         <Button
//           variant="outline"
//           className="bg-[#C3EFE8] text-[#29ABE2] hover:bg-[#A3DFD8]"
//         >
//           Account
//         </Button>
//       </div>
//       <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
//         <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#29ABE2]">
//           <TabsTrigger
//             value="supplier"
//             className="data-[state=active]:bg-[#C3EFE8] data-[state=active]:text-[#29ABE2] text-white"
//           >
//             Supplier Selection
//           </TabsTrigger>
//           <TabsTrigger
//             value="payment"
//             className="data-[state=active]:bg-[#C3EFE8] data-[state=active]:text-[#29ABE2] text-white"
//           >
//             Payment & Escrow
//           </TabsTrigger>
//           <TabsTrigger
//             value="review"
//             className="data-[state=active]:bg-[#C3EFE8] data-[state=active]:text-[#29ABE2] text-white"
//           >
//             Review
//           </TabsTrigger>
//         </TabsList>
//         <TabsContent value="supplier">
//           <Card className="bg-white text-[#29ABE2]">
//             <CardHeader>
//               <CardTitle>Select a Service Provider</CardTitle>
//               <CardDescription>
//                 Choose a freelancer for your task
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {providers.map((provider) => (
//                   <div
//                     key={provider.id}
//                     className="flex items-center justify-between p-4 border rounded-lg"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <Avatar className="w-12 h-12 bg-[#C3EFE8]">
//                         <AvatarFallback className="text-lg font-semibold text-[#29ABE2]">
//                           {provider.name
//                             .split(' ')
//                             .map((n) => n[0])
//                             .join('')}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <p className="font-semibold">{provider.name}</p>
//                         <p className="text-sm text-gray-500">
//                           {provider.skill}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <span className="font-medium">{provider.rate}</span>
//                       <Button
//                         onClick={() => handleProviderSelect(provider)}
//                         className="bg-[#29ABE2] hover:bg-[#1E8CB3] text-white"
//                       >
//                         Select
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="mt-6 bg-white text-[#29ABE2]">
//             <CardHeader>
//               <CardTitle>Submit a Service Request</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleServiceSubmit}>
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="serviceDescription">
//                       Service Description
//                     </Label>
//                     <Textarea
//                       id="serviceDescription"
//                       placeholder="Describe the service or job you need..."
//                       value={serviceDescription}
//                       onChange={(e) => setServiceDescription(e.target.value)}
//                       className="h-32 text-[#29ABE2]"
//                       required
//                     />
//                   </div>
//                   <p className="text-sm text-gray-500">
//                     Provide details about your service requirements. Be as
//                     specific as possible to help freelancers understand your
//                     needs.
//                   </p>
//                 </div>
//                 <Button
//                   type="submit"
//                   className="mt-4 w-full bg-[#C3EFE8] text-[#29ABE2] hover:bg-[#A3DFD8]"
//                 >
//                   Submit Request
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="payment">
//           <Card className="bg-white text-[#29ABE2]">
//             <CardHeader>
//               <CardTitle>Payment & Escrow</CardTitle>
//               <CardDescription>
//                 Secure your transaction with escrow
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <p>Payment and escrow details will be implemented here.</p>
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="review">
//           <Card className="bg-white text-[#29ABE2]">
//             <CardHeader>
//               <CardTitle>Leave a Review</CardTitle>
//               <CardDescription>
//                 Share your experience with the service provider
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <p>Review submission form will be implemented here.</p>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
