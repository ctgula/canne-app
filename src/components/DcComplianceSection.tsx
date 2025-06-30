'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Gift, Home, Shield } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

interface ComplianceItemProps {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  value: string;
}

const complianceItems: ComplianceItemProps[] = [
  {
    title: "Who Can Participate?",
    content: (
      <ul className="space-y-2">
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>Must be 21+. Photo ID required.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>Possess ≤ 2 oz (56 g) at any time.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>Under-21 possession is still illegal.</span>
        </li>
      </ul>
    ),
    icon: <UserCheck className="h-5 w-5 text-[#D4AF37]"/>,
    value: "item-1"
  },
  {
    title: "Gifting Limits – The I-71 Loop",
    content: (
      <ul className="space-y-2">
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>We sell <strong>art; cannabis is a FREE gift.</strong></span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>No cash may be exchanged for cannabis itself.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>Max gift = 1 oz per adult per day.</span>
        </li>
      </ul>
    ),
    icon: <Gift className="h-5 w-5 text-[#D4AF37]"/>,
    value: "item-2"
  },
  {
    title: "Where Can I Enjoy My Gift?",
    content: (
      <ul className="space-y-2">
        <li className="flex items-start space-x-2">
          <span className="text-green-500">✅</span>
          <span>Private residences or private venues with owner OK.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-green-500">✅</span>
          <span>420-friendly events held on non-federal property.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-red-500">🚫</span>
          <span>No public space (sidewalks, parks, bars, restaurants).</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-red-500">🚫</span>
          <span>No federal land (National Mall, Rock Creek Park, etc.).</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-red-500">🚫</span>
          <span>No cars, buses, or ride-shares.</span>
        </li>
      </ul>
    ),
    icon: <Home className="h-5 w-5 text-[#D4AF37]"/>,
    value: "item-3"
  },
  {
    title: "Stay Safe & Legal",
    content: (
      <ul className="space-y-2">
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>Don't drive high; DUIs apply.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>Keep gifts inside D.C.—cross-state transport is federal crime.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-lg">‣</span>
          <span>Purchase only from compliant establishments like Cannè Art Collective.</span>
        </li>
      </ul>
    ),
    icon: <Shield className="h-5 w-5 text-[#D4AF37]"/>,
    value: "item-4"
  },
];

const DcComplianceSection = () => {
  return (
    <section className="bg-[#FFCEB5]/20 py-12 md:py-16" data-compliance="true">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left side - Cannè mural image */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src="/images/canne-mural.svg" 
              alt="Cannè Art Mural" 
              className="w-full h-full object-cover min-h-[350px]" 
            />
          </div>
          
          {/* Right side - Accordion */}
          <div>
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Know the Rules – Stay I-71 Compliant</h2>
            <p className="text-lg text-gray-600 mb-6">Cannè gifts cannabis legally under Washington, D.C. Initiative 71.</p>
            
            <Accordion type="single" collapsible className="w-full">
              {complianceItems.map((item, index) => (
                <AccordionItem key={item.value} value={item.value} className="border-b border-gray-200">
                  <AccordionTrigger className="flex items-center py-4">
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DcComplianceSection;
