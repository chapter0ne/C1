# ChapterOne (C1) - Complete Digital Reading Platform

A comprehensive digital reading platform with admin dashboard, reader application, and backend API. Built with modern web technologies and integrated with Cloudinary for image management.

## 🏗️ Project Structure

```
C1/
├── backend/                           # Node.js/Express API server
├── chapterone-admin-command-center-98-main/  # Admin dashboard (React/TypeScript)
├── reading-realm-store-23-main 2/     # Reader application (React/TypeScript)
└── README.md                          # This file
```

## 🚀 Features

### Backend API
- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** for secure access
- **Cloudinary Integration** for book cover management
- **File Upload** with automatic image optimization
- **User Management** with role-based access control

### Admin Dashboard
- **Book Management** - Create, edit, delete books
- **Chapter Management** - Rich text editor for chapter content
- **User Management** - Admin user controls
- **Analytics** - Reading statistics and insights
- **Cloudinary Integration** - Automatic book cover optimization

### Reader Application
- **Book Discovery** - Browse and search books
- **Reading Interface** - Clean, distraction-free reading experience
- **User Library** - Personal book collection
- **Wishlist** - Save books for later
- **Reading Progress** - Track reading progress
- **Responsive Design** - Works on all devices

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Cloudinary** - Image management
- **Multer** - File upload handling

### Frontend (Both Apps)
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **React Query** - Data fetching

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Admin Dashboard Setup
```bash
cd chapterone-admin-command-center-98-main
npm install
npm run dev
```

### Reader Application Setup
```bash
cd "reading-realm-store-23-main 2"
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Upload
- `POST /api/upload/book-cover` - Upload book cover
- `PUT /api/upload/book-cover/update` - Update book cover
- `DELETE /api/upload/book-cover/:public_id` - Delete book cover

### User Library
- `GET /api/user-library` - Get user's library
- `POST /api/user-library` - Add book to library
- `DELETE /api/user-library/:bookId` - Remove book from library

## 🎨 Features

### Book Management
- ✅ Create and edit books with rich content
- ✅ Upload and optimize book covers via Cloudinary
- ✅ Manage chapters with rich text editor
- ✅ Set pricing (free/paid books)
- ✅ Book status management (draft/published)

### User Experience
- ✅ Responsive design for all devices
- ✅ Clean, modern UI with Tailwind CSS
- ✅ Reading progress tracking
- ✅ Wishlist functionality
- ✅ Search and filter books

### Technical Features
- ✅ TypeScript for type safety
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Image optimization
- ✅ Error handling and validation

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Deploy to your preferred hosting service
3. Configure MongoDB connection
4. Set up Cloudinary credentials

### Frontend Deployment
1. Build the applications: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure API endpoints

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or support, please contact the development team.

## 📞 Support

For technical support or questions, please reach out to the development team.

---

**ChapterOne (C1)** - Empowering digital reading experiences. 