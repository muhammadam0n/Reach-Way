# Facebook Integration Error Fix Guide

## 🚨 **Current Issue: "Error Accessing App"**

The error you're seeing occurs because:
1. **Facebook requires HTTPS** for OAuth integrations
2. **Redirect URI mismatch** between your app and Facebook Developer Console
3. **App configuration** needs to be updated

## 🔧 **Step-by-Step Fix**

### **Step 1: Update Facebook Developer Console**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app: **9099617093459439**
3. Go to **Settings > Basic**
4. Add these URLs to **App Domains**:
   ```
   localhost
   ```
5. Go to **Facebook Login > Settings**
6. Add these **Valid OAuth Redirect URIs**:
   ```
   https://localhost:3001/
   https://localhost:3001
   http://localhost:3001/
   http://localhost:3001
   ```

### **Step 2: Restart Your Development Server**

```bash
# Stop your current server (Ctrl+C)
# Then restart with HTTPS
npm run dev
```

Your app will now run on: `https://localhost:3001`

### **Step 3: Clear Browser Cache**

1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### **Step 4: Test Facebook Integration**

1. Go to your integrations page
2. Click on Facebook
3. You should now see the proper Facebook login dialog

## 🔒 **Why HTTPS is Required**

Facebook enforces HTTPS for security reasons:
- **OAuth tokens** contain sensitive user data
- **HTTPS prevents** man-in-the-middle attacks
- **Facebook policy** requires secure connections

## 🚀 **Alternative Solutions**

### **Option A: Use ngrok for HTTPS (Recommended for Development)**

If you prefer to keep HTTP locally:

1. Install ngrok: `npm install -g ngrok`
2. Start your app: `npm run dev` (on port 3001)
3. In another terminal: `ngrok http 3001`
4. Use the HTTPS URL from ngrok in Facebook Developer Console

### **Option B: Production Deployment**

For production, deploy to a service with HTTPS:
- Vercel
- Netlify
- Heroku
- AWS

## 📝 **Configuration Files Updated**

✅ **vite.config.js** - Added HTTPS support
✅ **socialConfig.js** - Updated redirect URIs to HTTPS
✅ **Port configuration** - Set to 3001

## 🔍 **Troubleshooting**

### **If you still get the error:**

1. **Check Facebook App Status**:
   - Ensure app is not in development mode
   - Add your Facebook account as a test user

2. **Verify Redirect URI**:
   - Must match exactly (including trailing slash)
   - Case sensitive

3. **Clear Local Storage**:
   ```javascript
   localStorage.clear();
   ```

4. **Check Browser Console**:
   - Look for CORS errors
   - Check for SSL certificate warnings

## 📞 **Need Help?**

If the issue persists:
1. Check Facebook Developer Console for app status
2. Verify all redirect URIs are added
3. Ensure you're using the correct Facebook account
4. Try in an incognito/private browser window

---

**Status**: ✅ **Configuration Updated**  
**Next Step**: Restart server and test integration
