# MongoDB Local Installation (Windows)

## Steps:

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and run the installer

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool) if you want

3. **Start MongoDB Service:**
   ```powershell
   net start MongoDB
   ```

4. **Verify MongoDB is running:**
   ```powershell
   mongod --version
   ```

5. **Your .env file is already configured correctly:**
   ```
   MONGO_URI=mongodb://localhost:27017/sliit-got-talent
   ```

---

# MongoDB Atlas (Cloud - Recommended for easier setup)

## Steps:

1. Create free account at https://www.mongodb.com/cloud/atlas/register
2. Create a FREE M0 cluster
3. Setup Database User (Database Access → Add User)
4. Allow IP Access (Network Access → Allow 0.0.0.0/0 for development)
5. Get connection string (Database → Connect → Connect your application)
6. Update .env:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sliit-got-talent
   ```

**After setup, restart your server with `npm start`**
