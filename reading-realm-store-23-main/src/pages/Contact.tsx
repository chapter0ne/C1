
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Mail, Phone } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#D01E1E] rounded flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ChapterOne</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Home</Link>
              <Link to="/browse" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Browse Books</Link>
              <Link to="/library" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Library</Link>
              <Link to="/about" className="text-gray-700 hover:text-[#D01E1E] transition-colors">About Us</Link>
              <Link to="/contact" className="text-[#D01E1E] font-medium">Contact Us</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                <img src="/lovable-uploads/f382762b-9b22-431d-bc7e-d0f45f6356f6.png" alt="User avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contact Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about Chapter One? We'd love to hear from you. Send us a message 
              and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#D01E1E] rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600">hello@chapterone.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+234 (0) 123 456 7890</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input placeholder="John" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input placeholder="John" className="w-full" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      className="w-full" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input 
                      placeholder="How can we help you?" 
                      className="w-full" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea 
                      placeholder="Tell us more about your inquiry..." 
                      rows={6}
                      className="w-full resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#D01E1E] hover:bg-[#B01818] py-3"
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-3">How do I add books to my library?</h3>
              <p className="text-gray-600">
                Simply browse our collection, find a book you like, and click "Add to Library" for 
                free books or "Buy Now" for premium titles.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-3">Can I download books for offline reading?</h3>
              <p className="text-gray-600">
                No, all books are read online through our secure browser-based reader to protect 
                authors' intellectual property.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major payment methods through Nomba, including cards, bank 
                transfers, and mobile money.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-3">Is there a mobile app available?</h3>
              <p className="text-gray-600">
                We're currently developing a mobile app that will be available soon. For now, you 
                can access Chapter One through your mobile browser.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[#D01E1E] rounded flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ChapterOne</span>
              </div>
              <p className="text-gray-600 mb-4">
                Making books accessible to everyone. Your library, online, anywhere, anytime.
              </p>
              <p className="text-gray-600">
                Fighting piracy through accessibility and affordability.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/browse" className="text-gray-600 hover:text-[#D01E1E] transition-colors">Browse Books</Link></li>
                <li><Link to="/about" className="text-gray-600 hover:text-[#D01E1E] transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors">Contact</Link></li>
                <li><Link to="/help" className="text-gray-600 hover:text-[#D01E1E] transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">2025 ChapterOne. all rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
