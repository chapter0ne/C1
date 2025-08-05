
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Globe, Heart } from "lucide-react";

const About = () => {
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
              <Link to="/about" className="text-[#D01E1E] font-medium">About Us</Link>
              <Link to="/contact" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Contact Us</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                <img src="/lovable-uploads/f382762b-9b22-431d-bc7e-d0f45f6356f6.png" alt="User avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About ChapterOne Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About ChapterOne</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to make books accessible to everyone while protecting authors' 
            rights and fighting piracy across Africa.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Chapter One was born from a simple yet powerful idea: everyone deserves access to knowledge, but 
            authors deserve to be compensated for their work. We're building a platform that makes books affordable 
            and accessible while ensuring creators are fairly rewarded.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mt-4">
            By providing secure, in-browser reading experiences, we're eliminating the need for downloads and 
            reducing piracy, creating a sustainable ecosystem for both readers and authors.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            How Chapter One came to be
          </p>
          
          <div className="text-left max-w-3xl mx-auto space-y-6">
            <p className="text-gray-600 leading-relaxed">
              The idea for Chapter One was born when our founder, a passionate reader and tech entrepreneur, 
              witnessed firsthand the devastating impact of book piracy on African authors and publishers. Despite the 
              rich literary tradition across the continent, many talented writers struggled to make a living from their 
              due to widespread unauthorized distribution of their work.
            </p>
            
            <p className="text-gray-600 leading-relaxed">
              At the same time, we recognized that many readers turned to piracy not out of malice, but out of 
              necessity—books were often expensive, hard to find, or simply unavailable in their region. This created 
              a vicious cycle where authors couldn't afford to write, and readers couldn't afford to read.
            </p>
            
            <p className="text-gray-600 leading-relaxed">
              Chapter One represents our solution: a platform that makes books affordable and accessible while 
              ensuring they remain secure and authors are fairly compensated. By leveraging modern web technology, 
              we've created an experience that's better than piracy—more convenient, more secure, and more ethical.
            </p>
            
            <div className="bg-[#D01E1E] text-white p-6 rounded-lg mt-8">
              <p className="text-lg italic">
                "We believe that access to knowledge should not come at the expense of those who create it. Chapter 
                One is our commitment to building a sustainable future for African literature."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-[#D01E1E] rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-[#D01E1E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
              <p className="text-gray-600">
                We protect authors' intellectual property with 
                cutting-edge security measures, ensuring their 
                work remains safe from piracy while being 
                accessible to legitimate readers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-[#D01E1E] rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-[#D01E1E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Universal Access</h3>
              <p className="text-gray-600">
                Knowledge should be available to everyone, 
                regardless of location or economic status. We 
                work to make books affordable and accessible 
                across Africa and beyond.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-[#D01E1E] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#D01E1E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fair Compensation</h3>
              <p className="text-gray-600">
                Authors and publishers deserve to be fairly 
                rewarded for their creativity and hard work. Our 
                platform ensures they receive their due 
                compensation for every book read.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 bg-[#D01E1E] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="w-8 h-8 bg-[#D01E1E] rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-8">Our Vision</h2>
          <p className="text-xl leading-relaxed mb-12">
            We envision a world where every person has access to the books they need to learn, grow, and 
            succeed, while every author has the opportunity to make a living from their craft.
          </p>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Mobile App Coming Soon</h3>
              <p className="opacity-90">
                We're developing a mobile app that will 
                bring the Chapter One experience to 
                smartphones and tablets, making 
                reading even more convenient and 
                accessible.
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Expanding Across Africa</h3>
              <p className="opacity-90">
                Our goal is to partner with talented authors 
                across all African countries, supporting 
                local languages and currencies to make 
                books truly accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Leadership</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Founder's Vision</h3>
                <p className="text-gray-600 mb-4">
                  "I started Chapter One because I believe that access to knowledge should not be 
                  determined by geography or economic status. Every brilliant mind deserves the books they 
                  need to flourish, and every talented author deserves to make a living from their work."
                </p>
                <p className="text-sm text-[#D01E1E] font-medium">- ChapterOne Founding Team</p>
              </div>
            </div>
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

export default About;
