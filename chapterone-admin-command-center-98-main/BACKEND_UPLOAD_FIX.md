# 🔧 Backend File Upload Size Fix

## **Problem: 413 "Request Entity Too Large" Error**

Your backend server has file size limits that are too restrictive for book uploads.

## **Current Limits (Too Small):**
- **Express body parser**: Likely 1-10MB
- **Multer file uploads**: Likely 1-10MB
- **Nginx/Apache**: Likely 1-10MB

## **Recommended Limits for Books (More Generous):**
- **Text-only books**: 1-50MB
- **Books with images**: 50-500MB
- **Large illustrated books**: 500MB - 2GB
- **Epic novels with rich content**: Up to 5GB

## **🔧 Fixes Needed:**

### **1. Express.js Server Configuration**

```javascript
// In your main server file (server.js or app.js)
const express = require('express');
const app = express();

// Increase body parser limits - MUCH MORE GENEROUS
app.use(express.json({ 
  limit: '5gb'  // Increased to 5GB for epic books
}));
app.use(express.urlencoded({ 
  limit: '5gb', 
  extended: true 
}));

// For raw text uploads (book content)
app.use(express.text({ 
  limit: '5gb' 
}));

// For multipart form data
app.use(express.raw({ 
  limit: '5gb' 
}));
```

### **2. Multer File Upload Configuration**

```javascript
// For book cover images and file uploads
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit - VERY GENEROUS
    files: 50, // Allow many files
    fieldSize: 5 * 1024 * 1024 * 1024, // 5GB for form fields
    fieldNameSize: 1000, // Allow long field names
    fieldCount: 1000 // Allow many form fields
  },
  fileFilter: (req, file, cb) => {
    // Allow common image formats
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

### **3. Nginx Configuration (if using)**

```nginx
# In your nginx.conf or site configuration
http {
    client_max_body_size 5G;  # Increased to 5GB
    
    # For specific locations
    location /api/upload {
        client_max_body_size 5G;
    }
    
    # Increase timeouts for large uploads
    client_body_timeout 300s;  # 5 minutes
    client_header_timeout 300s;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
}
```

### **4. Apache Configuration (if using)**

```apache
# In your .htaccess or httpd.conf
LimitRequestBody 5368709120  # 5GB in bytes

# For specific directories
<Directory "/api/upload">
    LimitRequestBody 5368709120
</Directory>

# Increase timeouts
TimeOut 300
ProxyTimeout 300
```

### **5. Environment Variables**

```bash
# Add to your .env file
MAX_FILE_SIZE=5GB
MAX_BODY_SIZE=5GB
UPLOAD_TIMEOUT=300000  # 5 minutes in milliseconds
MAX_UPLOAD_SIZE=5368709120  # 5GB in bytes
```

### **6. Node.js Memory Limits**

```bash
# When starting your Node.js server, increase memory limits
node --max-old-space-size=8192 server.js  # 8GB heap size

# Or in package.json scripts
"start": "node --max-old-space-size=8192 server.js"
```

## **🚀 Implementation Steps:**

1. **Update Express limits** to 5GB in your main server file
2. **Update Multer configuration** for very large file uploads
3. **Check web server config** (Nginx/Apache) and increase to 5GB
4. **Increase Node.js memory limits** when starting server
5. **Test with very large book files** (100MB - 2GB)
6. **Monitor server performance** after changes

## **⚠️ Important Notes:**

- **Memory usage**: Very large files consume significant RAM
- **Upload timeouts**: Increase timeout values for large files
- **Storage costs**: Large files increase cloud storage expenses
- **Security**: Monitor for abuse of large file uploads
- **Performance**: Large uploads may slow down server

## **🔍 Testing:**

```bash
# Test with a very large text file
curl -X POST \
  -H "Content-Type: text/plain" \
  -d "$(head -c 1G /dev/zero | tr '\0' 'A')" \
  http://localhost:3000/api/books

# Test with a 2GB file
dd if=/dev/zero bs=1M count=2048 | tr '\0' 'A' > test_book.txt
curl -X POST \
  -H "Content-Type: text/plain" \
  --data-binary @test_book.txt \
  http://localhost:3000/api/books
```

## **📊 Monitoring:**

- Watch server memory usage during large uploads
- Monitor upload success rates
- Track storage usage growth
- Set up alerts for failed uploads
- Monitor server response times

## **🚨 Performance Considerations:**

- **Streaming uploads**: Consider implementing streaming for very large files
- **Chunked uploads**: Break large files into chunks
- **Background processing**: Process large files asynchronously
- **CDN integration**: Use CDN for large file storage

After implementing these changes, your book uploads should work with files up to 5GB without the 413 error!
