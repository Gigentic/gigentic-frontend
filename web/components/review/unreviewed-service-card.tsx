// 'use client';

// import { useState } from 'react';
// import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
// import { Briefcase, User } from 'lucide-react';
// import ReviewPopup from './review-popup';
// // import { UnreviewedChainService } from '@/hooks/blockchain/use-reviews';

// interface UnreviewedServiceCardProps {
//   service: UnreviewedChainService;
//   type: 'given' | 'received';
//   onReview: (rating: number, review: string) => void;
// }

// export function UnreviewedServiceCard({
//   service,
//   type,
//   onReview,
// }: UnreviewedServiceCardProps) {
//   const [showReviewPopup, setShowReviewPopup] = useState(false);
//   const isProvider = service.role === 'provider';
//   const Icon = isProvider ? Briefcase : User;
//   const colorClass = isProvider ? 'blue' : 'green';

//   const handleReviewSubmit = (rating: number, review: string) => {
//     onReview(rating, review);
//     setShowReviewPopup(false);
//   };

//   return (
//     <>
//       <Card
//         className={`border-${colorClass}-200/50 hover:border-opacity-100 transition-colors`}
//       >
//         <CardContent className="p-6">
//           <div className="space-y-2">
//             <div className="flex justify-between items-start">
//               <div>
//                 <div className="flex items-center gap-2">
//                   <h3 className="font-semibold">{service.serviceTitle}</h3>
//                   <Icon className={`w-4 h-4 text-${colorClass}-500`} />
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   {type === 'received'
//                     ? `${isProvider ? 'From Provider' : 'From Customer'}: ${
//                         service.providerName
//                       }`
//                     : `${isProvider ? 'Customer' : 'Provider'}: ${
//                         service.providerName
//                       }`}
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   Completed on: {service.date}
//                 </p>
//                 <p className="text-sm mt-2">
//                   <span className={`text-${colorClass}-600`}>
//                     {type === 'received'
//                       ? `Review ${isProvider ? 'From Provider' : 'From Customer'}`
//                       : `Review ${isProvider ? 'As Provider' : 'As Customer'}`}
//                   </span>
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowReviewPopup(true)}
//                 className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
//               >
//                 Leave Review
//               </button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <ReviewPopup
//         escrowId={service.id}
//         serviceTitle={service.serviceTitle}
//         providerName={service.providerName}
//         amount="0.1" // TODO: Get actual amount from escrow
//         onSubmitReview={handleReviewSubmit}
//       />
//     </>
//   );
// }
