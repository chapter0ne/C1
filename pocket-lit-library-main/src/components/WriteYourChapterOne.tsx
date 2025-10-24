import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const WriteYourChapterOne: React.FC = () => {
  return (
    <section id="writeyourchapterone" className="py-20 relative overflow-hidden" style={{ backgroundColor: '#F8E8E8' }}>
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating books */}
        <div className="absolute top-10 left-10 w-8 h-10 bg-competition-red transform rotate-12 animate-float opacity-60"></div>
        <div className="absolute top-20 right-20 w-6 h-8 bg-competition-teal transform -rotate-6 animate-float opacity-70" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-16 w-7 h-9 bg-yellow-400 transform rotate-45 animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-16 w-5 h-7 bg-competition-brown transform -rotate-12 animate-float opacity-70" style={{ animationDelay: '3s' }}></div>
        
        {/* Floating dots */}
        <div className="absolute top-32 left-1/4 w-3 h-3 bg-competition-teal rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-competition-red rounded-full animate-pulse opacity-60" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-8 w-2 h-2 bg-competition-teal rounded-full animate-pulse opacity-50" style={{ animationDelay: '2.5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16 intersect-trigger">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 break-words"
            style={{ color: '#D9304F' }}
          >
            ✍️ #WriteYourChapterOne
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-center text-gray-500 font-medium max-w-3xl mx-auto mb-6 font-archivo"
          >
            Your Story Deserves To Be Read
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto font-archivo"
          >
            <span className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-700 block mb-4">
              Do you have a story the world needs to read?
            </span>
            <span className="text-lg md:text-xl text-gray-500 font-medium">
              ChapterOne is calling for African writers to submit original prose (minimum 2,000 words) around themes like Crime, Adventure, Betrayal, Romance, Mystery, Culture, and more!
            </span>
          </motion.p>
        </div>

        {/* Main Circle Section */}
        <div className="flex justify-center mb-16 intersect-trigger">
          <motion.div 
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              borderRadius: [
                '50% 45% 55% 50% / 45% 50% 50% 55%',
                '45% 55% 50% 45% / 50% 45% 55% 50%',
                '55% 50% 45% 55% / 45% 55% 50% 45%',
                '50% 45% 55% 50% / 45% 50% 50% 55%'
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-80 h-80 md:w-96 md:h-96 bg-white shadow-2xl flex flex-col items-center justify-center p-8"
          >
            {/* Floating books around the circle */}
            <div className="absolute -top-4 -left-4 w-6 h-8 bg-competition-red transform rotate-12 animate-float-dramatic rounded-sm"></div>
            <div className="absolute -top-2 -right-6 w-5 h-7 bg-competition-teal transform -rotate-6 animate-float-dramatic rounded-sm" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-4 -left-6 w-7 h-9 bg-yellow-400 transform rotate-45 animate-float-dramatic rounded-sm" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-2 -right-4 w-6 h-8 bg-competition-brown transform -rotate-12 animate-float-dramatic rounded-sm" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-8 -right-8 w-5 h-6 bg-competition-teal transform rotate-20 animate-float-dramatic rounded-sm" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-8 -left-8 w-6 h-7 bg-competition-red transform -rotate-20 animate-float-dramatic rounded-sm" style={{ animationDelay: '5s' }}></div>
            
            {/* Circle content */}
            <div className="text-center z-10">
              <p className="text-sm md:text-base mb-1" style={{ color: '#6B2737' }}>PUBLISH YOUR</p>
              <p className="text-sm md:text-base mb-1" style={{ color: '#6B2737' }}>BOOK TO OVER</p>
              <p className="text-6xl md:text-7xl font-bold mb-2" style={{ color: '#D9304F' }}>10,000</p>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: '#D9304F' }}>READERS</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 intersect-trigger">
          {/* Prizes Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center mb-6">
              <Trophy className="w-8 h-8 mr-3" style={{ color: '#3ABDB1' }} />
              <h3 className="text-2xl font-bold" style={{ color: '#6B2737' }}>PRIZES</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="px-4 py-2 rounded-lg mr-4" style={{ backgroundColor: '#3ABDB1' }}>
                  <span className="text-white font-bold">$100 (winner)</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="px-4 py-2 rounded-lg mr-4" style={{ backgroundColor: '#3ABDB1' }}>
                  <span className="text-white font-bold">$50 EACH FOR TWO RUNNERS-UP</span>
                </div>
              </div>
              
              <p className="text-sm" style={{ color: '#6B2737' }}>*MINIMUM: 2,000 WORDS</p>
              
              <div className="px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: '#3ABDB1' }}>
                <span className="text-white font-bold">DEADLINE: NOVEMBER 30TH, 2025</span>
              </div>
            </div>
          </motion.div>

          {/* Publication Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: '#3ABDB1' }}>
                <span className="text-white font-bold">Publication:</span>
              </div>
              
              <p className="text-lg" style={{ color: '#6B2737' }}>
                Approved stories will be published on ChapterOne's reading platform, and winners will be selected based on the number of reads their stories receive.
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.a
            href="https://forms.zohopublic.com/chapterone1/form/WriteYourChapterOneSubmission/formperma/g5eAaCXl-mFX3fwUGp3JqIonUzntGgp3g90XVRKxtso"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-12 py-4 rounded-lg font-bold text-white text-xl shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: '#3ABDB1' }}
          >
            Submit Your Story
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default WriteYourChapterOne;
