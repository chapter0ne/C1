# 📚 Backend Upload Configuration

## **Overview**

This backend has been configured to handle large book uploads up to **5GB** with optimized performance and error handling.

## **🚀 New File Size Limits**

### **Express.js Body Parser**
- **JSON**: 5GB limit
- **URL Encoded**: 5GB limit  
- **Text**: 5GB limit
- **Raw**: 5GB limit

### **Multer File Uploads**
- **File Size**: 5GB per file
- **Files Count**: Up to 50 files
- **Field Size**: 5GB per form field
- **Field Count**: Up to 1000 fields

### **Book Content Limits**
- **Per Chapter**: 5GB maximum
- **Total Book**: 10GB maximum
- **Compression**: Enabled for large text

## **⚙️ Configuration Files**

### **`config/upload.js`**
Central configuration for all upload settings:
```javascript
const uploadConfig = require('../config/upload');
console.log('Max file size:', uploadConfig.maxFileSize);
```

### **`middleware/largeUploadHandler.js`**
Handles large uploads with progress tracking and validation.

## **🔧 Startup Commands**

### **Development (with memory limits)**
```bash
npm run dev          # 8GB heap, nodemon
npm start           # Standard nodemon
```

### **Production (with memory limits)**
```bash
npm run start:prod  # 8GB heap, production
npm run start:large # 16GB heap, for very large files
```

## **📊 Upload Progress Tracking**

Large uploads (>10MB) automatically show progress:
```
Large upload detected: 25.50MB
Upload progress: 10% (2.55MB / 25.50MB)
Upload progress: 20% (5.10MB / 25.50MB)
...
```

## **⚠️ Error Handling**

### **File Too Large (413)**
```json
{
  "error": "File too large",
  "message": "Maximum allowed size is 5.0GB. Your file is 6.2GB.",
  "maxSize": 5368709120,
  "actualSize": 6657191936
}
```

### **Timeout Handling**
- **Upload Timeout**: 5 minutes
- **Request Timeout**: 5 minutes
- **Keep-Alive**: 5 minutes

## **🌐 Web Server Configuration**

### **Nginx (if using)**
```nginx
client_max_body_size 5G;
client_body_timeout 300s;
proxy_read_timeout 300s;
```

### **Apache (if using)**
```apache
LimitRequestBody 5368709120
TimeOut 300
```

## **📱 Frontend Integration**

The frontend is already configured to:
- ✅ Handle large file uploads
- ✅ Show proper error messages
- ✅ Support books up to 5GB
- ✅ Preserve existing cover images when editing

## **🧪 Testing Large Uploads**

### **Test with Large Text File**
```bash
# Create a 1GB test file
dd if=/dev/zero bs=1M count=1024 | tr '\0' 'A' > test_book.txt

# Test upload
curl -X POST \
  -H "Content-Type: text/plain" \
  --data-binary @test_book.txt \
  http://localhost:5000/api/books
```

### **Test with Large JSON**
```bash
# Test large book data
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Large Book","content":"'$(printf 'A%.0s' {1..1000000})'"}'
  http://localhost:5000/api/books
```

## **📈 Performance Monitoring**

### **Memory Usage**
Monitor Node.js memory usage during large uploads:
```bash
# Check memory usage
ps aux | grep node
# or use PM2 monitoring
pm2 monit
```

### **Upload Speed**
Large uploads are logged with progress tracking for monitoring.

## **🔒 Security Considerations**

- **File Type Validation**: Only allowed image formats for covers
- **Size Limits**: Hard limits prevent abuse
- **Timeout Protection**: Prevents hanging uploads
- **Progress Tracking**: Monitor for suspicious activity

## **🚨 Troubleshooting**

### **Upload Still Failing?**
1. Check if backend server was restarted after config changes
2. Verify web server (Nginx/Apache) configuration
3. Check Node.js memory limits
4. Monitor server logs for detailed error messages

### **Memory Issues?**
1. Use `npm run start:large` for 16GB heap
2. Monitor memory usage during uploads
3. Consider streaming for very large files

## **📚 Supported Book Sizes**

- **Small Books**: < 100MB ✅
- **Medium Books**: 100MB - 1GB ✅
- **Large Books**: 1GB - 5GB ✅
- **Epic Books**: 5GB+ ✅ (with proper memory limits)

---

**Last Updated**: Backend now supports books up to 5GB with optimized performance! 🎉
