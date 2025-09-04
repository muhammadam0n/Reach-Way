# Facebook Integration Solution - Using ngrok for HTTPS

## 🚨 **Problem Solved**

The SSL certificate error you encountered is common with Vite's built-in HTTPS. Here's the **best solution** for local development:

## 🔧 **Solution: Use ngrok for HTTPS**

### **Step 1: Install ngrok**

```bash
# Install ngrok globally
npm install -g ngrok

# Or download from: https://ngrok.com/download
```

### **Step 2: Start Your App (HTTP)**

```bash
# Start your development server (HTTP)
npm run dev
```

Your app will run on: `http://localhost:3001`

### **Step 3: Create HTTPS Tunnel with ngrok**

Open a **new terminal** and run:

```bash
ngrok http 3001
```

You'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3001
```

### **Step 4: Update Facebook Developer Console**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app: **9099617093459439**
3. Go to **Facebook Login > Settings**
4. Add these **Valid OAuth Redirect URIs**:
   ```
   https://abc123.ngrok.io/
   https://abc123.ngrok.io
   http://localhost:3001/
   http://localhost:3001
   ```
   *(Replace `abc123.ngrok.io` with your actual ngrok URL)*

### **Step 5: Update Your Configuration**

Update your `socialConfig.js` with the ngrok URL:

```javascript
// Social Media Integration Configuration
export const socialConfig = {
  // Facebook Configuration
  facebook: {
    appId: "9099617093459439",
    version: "v18.0",
    redirectUri: "https://abc123.ngrok.io", // Use your ngrok URL
    scope: "pages_show_list,pages_manage_posts,pages_read_engagement,pages_read_user_content,instagram_basic,instagram_content_publish"
  },
  
  // LinkedIn Configuration
  linkedin: {
    clientId: "77q0wyhcsxoutt",
    redirectUri: "https://abc123.ngrok.io/linkedin", // Use your ngrok URL
    scope: "r_events rw_events email w_member_social profile openid"
  }
};
```

### **Step 6: Test Facebook Integration**

1. Access your app via the ngrok URL: `https://abc123.ngrok.io`
2. Go to integrations page
3. Click on Facebook
4. You should now see the proper Facebook login dialog

## 🎯 **Why This Works**

- **ngrok provides real HTTPS** with valid SSL certificates
- **Facebook accepts ngrok URLs** for OAuth
- **No SSL certificate issues** like with Vite's built-in HTTPS
- **Works reliably** for local development

## 📝 **Alternative: Production Deployment**

For production, deploy to a service with HTTPS:

### **Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### **Option B: Netlify**
```bash
# Build your app
npm run build

# Deploy to Netlify
# Upload the 'dist' folder to Netlify
```

## 🔄 **Quick Setup Script**

Create a file called `start-dev.bat`:

```batch
@echo off
echo Starting Facebook Integration Development...
echo.
echo 1. Starting development server...
start "Dev Server" cmd /k "npm run dev"
echo.
echo 2. Starting ngrok tunnel...
start "ngrok" cmd /k "ngrok http 3001"
echo.
echo 3. Update Facebook Developer Console with the ngrok URL
echo 4. Update socialConfig.js with the ngrok URL
echo.
pause
```

## 🚀 **Benefits of This Approach**

✅ **Real HTTPS** - Valid SSL certificates  
✅ **Facebook Compatible** - OAuth works properly  
✅ **No SSL Errors** - No certificate warnings  
✅ **Easy Setup** - One command to start  
✅ **Production Ready** - Same setup as production  

## 📞 **Need Help?**

If you still encounter issues:

1. **Check ngrok status**: Ensure the tunnel is active
2. **Verify Facebook settings**: Double-check redirect URIs
3. **Clear browser cache**: Hard refresh the page
4. **Check console errors**: Look for any JavaScript errors

---

**Status**: ✅ **Solution Ready**  
**Next Step**: Install ngrok and follow the steps above
