
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FormData {
  title: string;
  author: string;
  description: string;
  genre: string;
  isbn: string;
  price: string;
  isFree: boolean;
  coverImage?: File;
  coverImageUrl?: string; // Add this field for existing cover images
}

interface PricingStepProps {
  formData: FormData;
  selectedTags: string[];
  onInputChange: (field: string, value: string | boolean) => void;
}

const PricingStep = ({ formData, selectedTags, onInputChange }: PricingStepProps) => {
  // Debug: Show current form data
  console.log('PricingStep render - formData:', formData);
  console.log('PricingStep render - selectedTags:', selectedTags);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Publication</CardTitle>
          <p className="text-sm text-gray-600">Set your book price and publish settings</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="price">Price (₦) <span className="text-red-500">*</span></Label>
            <div className="flex items-center space-x-4 mt-2">
              <Input 
                id="price" 
                placeholder="0.00"
                type="number"
                value={formData.price}
                onChange={(e) => onInputChange('price', e.target.value)}
                className="flex-1 focus:border-black focus:ring-0"
                disabled={formData.isFree}
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="free" 
                  checked={formData.isFree}
                  onCheckedChange={(checked) => onInputChange('isFree', checked)}
                />
                <Label htmlFor="free">Mark as free</Label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Book Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span>{formData.title || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Author:</span>
                <span>{formData.author || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Genre:</span>
                <span>{formData.genre || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span>{formData.isFree ? 'Free' : `₦${formData.price || '0.00'}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tags:</span>
                <span>{selectedTags.length > 0 ? selectedTags.join(', ') : 'None selected'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingStep;
