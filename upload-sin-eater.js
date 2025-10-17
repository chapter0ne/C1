const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dvab101hh',
  api_key: '474763276597539',
  api_secret: 'PhUkLSOcT4Aph8rAlegUvVp2mKA'
});

// Upload the SIN EATER book cover
async function uploadSinEaterCover() {
  try {
    // Since we don't have the actual image file, we'll create a placeholder URL
    // In a real scenario, you would upload the actual image file
    const result = await cloudinary.uploader.upload(
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&crop=center', // Placeholder for SIN EATER cover
      {
        folder: 'pocket-library/our-story',
        public_id: 'sin-eater-book-cover',
        transformation: [
          { width: 400, height: 600, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );
    
    console.log('✅ SIN EATER cover uploaded successfully!');
    console.log('📸 Public URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
}

// Run the upload
uploadSinEaterCover()
  .then(url => {
    console.log('\n🎉 Upload complete! Use this URL in your component:');
    console.log(url);
  })
  .catch(console.error);
