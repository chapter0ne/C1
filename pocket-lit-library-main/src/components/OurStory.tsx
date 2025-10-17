
import React from 'react';
import { Book, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const OurStory: React.FC = () => {
  return (
    <section id="our-story" className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-chapterRed-300" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-chapterRed-200" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-12 intersect-trigger">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center tracking-tight">
            Our <span className="text-gradient">Story</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl text-center mb-12">
            How ChapterOne is transforming access to African literature and why it matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center intersect-trigger">
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-chapterRed-50 rounded-lg">
                  <Book className="w-6 h-6 text-chapterRed-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Bridging the Access Gap</h3>
                  <p className="text-muted-foreground">
                    Across Africa, access to quality literature remains a challenge. Physical books 
                    are expensive to produce and distribute, and many communities have limited 
                    access to libraries. ChapterOne is changing that by bringing thousands of 
                    African stories directly to mobile devices.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-chapterRed-50 rounded-lg">
                  <Globe className="w-6 h-6 text-chapterRed-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Amplifying African Voices</h3>
                  <p className="text-muted-foreground">
                    For too long, African stories have been underrepresented in global literature. 
                    We're creating a platform where African authors can reach audiences worldwide, 
                    sharing unique perspectives and rich cultural heritage that deserve 
                    to be celebrated.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-chapterRed-50 rounded-lg">
                  <Users className="w-6 h-6 text-chapterRed-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Building a Global Reading Community</h3>
                  <p className="text-muted-foreground">
                    ChapterOne is more than just a reading app—it's a vibrant community connecting 
                    readers and writers across borders. We're creating spaces for discussion, 
                    discovery, and cultural exchange that brings people together through the power 
                    of stories and shared reading experiences.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="order-1 md:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative aspect-square max-w-md mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-chapterRed-100 to-chapterRed-50 rounded-2xl transform rotate-3"></div>
              <img
                src="https://res.cloudinary.com/dvab101hh/image/upload/w_300,h_450,c_fill,q_auto,f_auto/v1760722380/Screenshot_2025-09-25_at_6.39.25_PM_pssmh2.png"
                alt="ChapterOne reading platform showcasing African literature"
                className="relative z-10 rounded-2xl shadow-lg object-cover w-full h-full transform -rotate-3 transition-transform hover:rotate-0 duration-500"
              />
              <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-chapterRed-500 rounded-full opacity-20"></div>
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-chapterRed-300 rounded-full opacity-20"></div>
            </motion.div>
          </div>
        </div>

        <div className="mt-20 text-center max-w-3xl mx-auto intersect-trigger">
          <blockquote className="text-2xl font-light italic text-foreground/80 mb-6">
            "Stories can change the world. When we share our stories, we share our humanity."
          </blockquote>
          <p className="text-chapterRed-500 font-medium">— ChapterOne Founding Team</p>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
