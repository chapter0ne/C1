
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WaitlistDialog: React.FC<WaitlistDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] p-0 overflow-hidden border-none">
        {/* Header matching the provided design */}
        <div className="bg-white p-6 relative">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
          
          <div className="text-left pr-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Join the <span className="text-chapterRed-500">ChapterOne</span> Waitlist
            </h2>
            <p className="text-gray-600 mt-2 text-base">
              Be among the first to experience Africa's largest digital library when we launch.
              <br />
              Your feedback will help us shape our platform.
            </p>
          </div>
        </div>
        
        {/* Google Form iframe */}
        <div className="h-[70vh] overflow-auto">
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSeqb2wK9MjLLhoPmB7WC4U8ff0eK_uUb-OJ5pdktlTpWeZ47A/viewform?embedded=true" 
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="min-h-[500px]"
          >
            Loading form...
          </iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;
