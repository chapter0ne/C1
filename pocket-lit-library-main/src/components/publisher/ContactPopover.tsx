import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactPopoverProps {
  children: React.ReactNode;
  className?: string;
}

const ContactPopover: React.FC<ContactPopoverProps> = ({ children, className }) => {
  const handleEmailContact = () => {
    const subject = encodeURIComponent('Request for Publishing with ChapterOne');
    const body = encodeURIComponent(
      'Hello ChapterOne Team,\n\nI am interested in publishing my content on your platform. Please provide me with more information about the partnership process.\n\nThank you.'
    );
    window.location.href = `mailto:authors@chapterone.dev?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      'Hello ChapterOne Team, I am interested in publishing my content on your platform. Could you please provide more information about the partnership process?'
    );
    window.open(`https://wa.me/2347065291872?text=${message}`, '_blank');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={cn('cursor-pointer', className)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-center">Contact Us</h3>
          <p className="text-muted-foreground text-sm text-center">
            Get in touch to discuss publishing opportunities with ChapterOne
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={handleEmailContact}
              className="flex items-center justify-start gap-3"
              variant="outline"
            >
              <Mail className="h-5 w-5 text-blue-600" />
              <span>Email Us</span>
            </Button>
            <Button 
              onClick={handleWhatsAppContact}
              className="flex items-center justify-start gap-3"
              variant="outline"
            >
              {/* Custom WhatsApp icon using SVG */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-5 w-5 text-green-600"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2 0 2.5-1" />
              </svg>
              <span>WhatsApp</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ContactPopover;
