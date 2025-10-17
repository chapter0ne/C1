# Render Deployment Guide

## Environment Variables Required

Set these environment variables in your Render dashboard:

### Required Variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Optional Variables (Render sets these automatically):
- `PORT`: Server port (Render sets this automatically)
- `HOST`: Server host (defaults to 0.0.0.0)

## Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Render
2. **Set Environment Variables**: Add all required environment variables in Render dashboard
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Health Check**: The app includes a health check at `/api/health`

## Backend Features

- ✅ Health check endpoint at `/api/health`
- ✅ CORS enabled for frontend communication
- ✅ Large file upload support (up to 5GB)
- ✅ MongoDB connection with error handling
- ✅ Cloudinary integration for image storage
- ✅ JWT authentication
- ✅ All API routes properly configured

## API Endpoints

- `GET /` - Basic status check
- `GET /api/health` - Health check for Render
- `POST /api/auth/login` - User authentication
- `GET /api/books` - Get all books
- `POST /api/upload` - File upload endpoint
- And many more...

## Notes

- The backend is configured to listen on `0.0.0.0` for Render compatibility
- Memory is optimized for large file uploads (8GB heap)
- All routes are prefixed with `/api`
- Static files are served from `/uploads` directory
