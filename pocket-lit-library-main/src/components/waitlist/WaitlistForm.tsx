
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const waitlistFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.string().min(1, { message: "Please select your role" }),
  platform: z.string().min(1, { message: "Please select a platform" }),
  bookSource: z.string().min(1, { message: "Please select how you access books" }),
  challenges: z.string().min(1, { message: "Please select a challenge" }),
  paymentPreference: z.string().min(1, { message: "Please select a payment preference" }),
  desiredFeature: z.string().min(1, { message: "Please select a desired feature" }),
  otherFeatures: z.string().optional(),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

interface WaitlistFormProps {
  onSuccess?: () => void;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      email: '',
      name: '',
      role: '',
      platform: '',
      bookSource: '',
      challenges: '',
      paymentPreference: '',
      desiredFeature: '',
      otherFeatures: '',
    },
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    try {
      console.log('Form data:', data);
      
      // Prepare data for Google Forms (this would normally connect to a serverless function)
      // This is where you'd integrate with your form submission process
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "You've joined the waitlist!",
        description: "Thank you for your feedback. We'll keep you updated.",
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      toast({
        title: "Submission failed",
        description: "There was an error joining the waitlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[60vh]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I'm interested as a: <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="reader" />
                    </FormControl>
                    <FormLabel className="font-normal">Reader</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="author" />
                    </FormControl>
                    <FormLabel className="font-normal">Author</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="publisher" />
                    </FormControl>
                    <FormLabel className="font-normal">Publisher</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Which platform do you prefer? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="web" />
                    </FormControl>
                    <FormLabel className="font-normal">Web (Browser)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mobile" />
                    </FormControl>
                    <FormLabel className="font-normal">Mobile App</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="both" />
                    </FormControl>
                    <FormLabel className="font-normal">Both</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bookSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How do you usually buy or access books? <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bookstore">Bookstore</SelectItem>
                  <SelectItem value="amazon">Amazon Kindle</SelectItem>
                  <SelectItem value="library">Local Libraries</SelectItem>
                  <SelectItem value="friends">Borrow from Friends</SelectItem>
                  <SelectItem value="dont-read">I Don't Read Often</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="challenges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is the biggest challenge you face when trying to access books? <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                  <SelectItem value="local-books">No Local Books</SelectItem>
                  <SelectItem value="payment">Payment Issues</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="paymentPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How much are you willing to pay for an ebook? <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-2">$0 - $2</SelectItem>
                  <SelectItem value="2-5">$2 - $5</SelectItem>
                  <SelectItem value="5-10">$5 - $10</SelectItem>
                  <SelectItem value="10+">$10+</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="desiredFeature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What feature would you like to see the most? <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="offline">Offline Reading</SelectItem>
                  <SelectItem value="audiobooks">Audiobooks</SelectItem>
                  <SelectItem value="recommendations">Personalized Recommendations</SelectItem>
                  <SelectItem value="annotations">Annotations & Highlights</SelectItem>
                  <SelectItem value="community">Reading Communities</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="otherFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Any other features you'd like to see?</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please share any other features you'd like to see..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-chapterRed-500 hover:bg-chapterRed-600"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Join the Waitlist"}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          By signing up, you agree to receive updates about ChapterOne.
          We'll never spam or share your information.
        </p>
      </form>
    </Form>
  );
};

export default WaitlistForm;
