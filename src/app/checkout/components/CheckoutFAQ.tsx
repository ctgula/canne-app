'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export default function CheckoutFAQ({ className = '' }) {
  return (
    <Accordion type="single" collapsible className={`rounded-lg shadow-sm bg-zinc-50 dark:bg-zinc-900 p-4 ${className}`}>
      {[
        {
          q: 'Why do I have to use a DC ZIP?',
          a: 'We operate under DC\'s Initiative 71. Gifts can only be delivered inside Washington, DC. If you\'re visiting, choose a hotel/airbnb ZIP that starts with "200".'
        },
        {
          q: 'What is Initiative 71?',
          a: 'I-71 lets adults (21+) gift up to 1 oz of cannabis in DC. You\'re buying the art/merch; the cannabis is a FREE 21+ gift that comes with it.'
        },
        {
          q: 'Do I need cash at delivery?',
          a: 'Nope! You pre-pay online. Our driver only needs a quick 21+ ID check at the door.'
        }
      ].map(({ q, a }, i) => (
        <AccordionItem key={i} value={`item-${i}`} className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
          <AccordionTrigger className="py-3 text-left font-medium text-zinc-900 dark:text-zinc-100 hover:no-underline">
            {q}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
