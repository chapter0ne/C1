# Netlify Setup Guide for ChapterOne Admin Panel

## 🚀 Required Environment Variables

Set these in your Netlify dashboard under **Site settings > Environment variables**:

### **API Configuration**
```
VITE_API_BASE_URL=https://backend-8zug.onrender.com
```

### **Authentication**
```
VITE_AUTH_ENABLED=true
VITE_MAX_AUTH_RETRIES=3
```

### **Feature Flags**
```
VITE_ENABLE_HEALTH_CHECKS=true
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_OFFLINE_MODE=false
```

## 🔧 Netlify Configuration

### **Build Settings**
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: `18` or higher

### **Deploy Settings**
- **Auto deploy**: Enabled
- **Branch deploy**: `main` or `master`
- **Preview deploy**: Enabled for pull requests

## 📁 Required Files

Ensure these files exist in your repository:

### **`public/_redirects`**
```
# SPA fallback - all routes go to index.html
/*    /index.html   200

# API routes should not be redirected
/api/*    /api/*   200

# Health check endpoint
/health    /health   200
```

### **`public/_headers`**
```
/*
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/static/*
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
```

## 🚨 Common Issues & Solutions

### **Page Reload Returns 404**
- ✅ Ensure `_redirects` file exists in `public/` directory
- ✅ Verify build is successful
- ✅ Check that `dist` folder contains the built files

### **Authentication Fails on Reload**
- ✅ Set `VITE_API_BASE_URL` environment variable
- ✅ Verify backend is accessible
- ✅ Check CORS configuration on backend

### **Build Fails**
- ✅ Ensure Node.js version is 18+
- ✅ Check all dependencies are installed
- ✅ Verify TypeScript compilation

### **API Calls Fail**
- ✅ Verify backend URL is correct
- ✅ Check backend is running and accessible
- ✅ Verify CORS headers are set on backend

## 🔍 Debugging

### **Check Build Logs**
1. Go to Netlify dashboard
2. Click on your site
3. Go to **Deploys** tab
4. Click on latest deploy
5. Check build logs for errors

### **Check Environment Variables**
1. Go to **Site settings > Environment variables**
2. Verify all required variables are set
3. Check variable names match exactly (case-sensitive)

### **Test Backend Connectivity**
1. Open browser console
2. Check for API error messages
3. Verify backend health check endpoint works

## 📱 Performance Optimization

### **Build Optimization**
- Enable **Asset optimization** in Netlify
- Use **Image optimization** for better loading
- Enable **Minification** for CSS/JS

### **Caching Strategy**
- Static assets: Long-term caching
- HTML files: No caching
- API responses: No caching

## 🆘 Support

If you continue to experience issues:

1. Check Netlify status page
2. Verify backend service status
3. Review browser console for errors
4. Check network tab for failed requests
5. Verify all environment variables are set correctly
