# Cloudinary Setup for Book Cover Uploads

## Environment Variables Required

Add the following environment variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## How to Get Cloudinary Credentials

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

## Features

- **Automatic Image Optimization**: Images are automatically resized to 400x600 pixels
- **Multiple Format Support**: Supports JPG, JPEG, PNG, GIF, and WebP formats
- **Secure URLs**: Returns HTTPS URLs for better security
- **Organized Storage**: Images are stored in a 'book-covers' folder
- **Delete Functionality**: Includes endpoint to delete images from Cloudinary

## API Endpoints

### Upload Book Cover
```
POST /api/upload/book-cover
Content-Type: multipart/form-data

Form data:
- cover: image file
```

Response:
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book-covers/filename.jpg",
  "public_id": "book-covers/filename",
  "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book-covers/filename.jpg"
}
```

### Delete Book Cover
```
DELETE /api/upload/book-cover/:public_id
```

Response:
```json
{
  "message": "Image deleted successfully"
}
```

### Update Book Cover (with old image deletion)
```
PUT /api/upload/book-cover/update
Content-Type: multipart/form-data

Form data:
- cover: new image file
- oldCoverUrl: URL of the old cover image to delete
```

Response:
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book-covers/new-filename.jpg",
  "public_id": "book-covers/new-filename",
  "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book-covers/new-filename.jpg"
}
```

## Usage in Frontend

When creating or updating a book, use the returned `secure_url` as the `coverImageUrl` field in your book object. 