# MongoDB Setup Guide

## Option 1: Local MongoDB Installation

### Windows Installation

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Download and run the installer

2. **Install MongoDB**
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**

   ```bash
   mongod --version
   ```

4. **Start MongoDB Service**
   - MongoDB should start automatically as a service
   - Or manually: `net start MongoDB`

5. **Default Connection String**
   ```
   mongodb://localhost:27017
   ```

### macOS Installation

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh
```

### Linux Installation

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Setup MongoDB Atlas

1. **Create Account**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0 Sandbox)
   - Select cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username and password
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `task_management`

   Example:

   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/task_management?retryWrites=true&w=majority
   ```

## Configure Environment Variables

1. **Open `.env.local` file**

2. **Add MongoDB Configuration**

   For Local MongoDB:

   ```env
   MONGODB_URI=mongodb://localhost:27017/task_management
   MONGODB_DB=task_management
   ```

   For MongoDB Atlas:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/task_management?retryWrites=true&w=majority
   MONGODB_DB=task_management
   ```

## Initialize Database

After configuring MongoDB, initialize the database:

1. **Start your development server**

   ```bash
   npm run dev
   ```

2. **Initialize database collections and indexes**
   - Open browser and navigate to:

   ```
   http://localhost:3000/api/init-db
   ```

   You should see:

   ```json
   {
     "success": true,
     "message": "Database initialized successfully",
     "collections": ["users", "tasks", "comments", "activity_logs"],
     "indexes": "Created successfully"
   }
   ```

## Database Structure

### Collections Created:

1. **users** - User accounts and roles
2. **tasks** - Task records
3. **comments** - Task comments
4. **activity_logs** - System activity tracking

### Indexes Created:

**Users Collection:**

- `uid` (unique)
- `email` (unique)
- `role`
- `isActive`

**Tasks Collection:**

- `assignee`
- `createdBy`
- `status`
- `priority`
- `dueDate`
- `createdAt`
- Compound: `assignee + status`
- Compound: `status + priority`

**Comments Collection:**

- `taskId`
- `userId`
- `createdAt`

**Activity Logs Collection:**

- `userId`
- `taskId`
- `actionType`
- `createdAt`
- Compound: `taskId + createdAt`

## Verify Database Setup

### Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect using your connection string
3. You should see `task_management` database
4. Verify collections: users, tasks, comments, activity_logs

### Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh

# Switch to database
use task_management

# Show collections
show collections

# Check indexes
db.users.getIndexes()
db.tasks.getIndexes()
db.comments.getIndexes()
db.activity_logs.getIndexes()
```

## Troubleshooting

### Error: "MongoServerError: Authentication failed"

- Check username and password in connection string
- Verify database user has correct permissions in Atlas

### Error: "MongooseServerSelectionError: connect ECONNREFUSED"

- Ensure MongoDB service is running
- Check connection string is correct
- For Atlas: Verify IP whitelist includes your IP

### Error: "MongoParseError: Invalid connection string"

- Check connection string format
- Ensure special characters in password are URL-encoded
- Verify database name is included

### Connection Timeout

- Check network connectivity
- For Atlas: Verify network access settings
- Check firewall settings

## Next Steps

After MongoDB is configured and initialized:

1. Test database connection
2. Verify collections are created
3. Check indexes are in place
4. Proceed to Step 6: Database Schemas Implementation

## Useful MongoDB Commands

```bash
# Show all databases
show dbs

# Use specific database
use task_management

# Show collections
show collections

# Count documents
db.users.countDocuments()
db.tasks.countDocuments()

# Find all documents
db.users.find().pretty()

# Drop collection (careful!)
db.collection_name.drop()

# Drop database (careful!)
db.dropDatabase()
```
fdkfddkdfk
fdfjdkfdk
fdfjdk