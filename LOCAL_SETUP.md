# FRA Samanvay - Local Development Setup

This guide explains how to run the FRA Samanvay application locally while connecting to the **Production MongoDB Atlas** database.

> [!WARNING]
> **READ THIS BEFORE STARTING**
> You are connecting to the **LIVE PRODUCTION DATABASE**.
> Any changes you make to data (Users, Claims) will be visible to real users.
> **DO NOT** run any scripts that delete data (like `npm run seed`) without verifying the safety locks.

## Step 0: SAFETY BACKUP (CRITICAL)
Before you run any code, take a backup of the current production data.
1.  Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2.  Navigate to your Cluster -> **Collections**.
3.  Click the **Command Line Tools** tab (or use MongoDB Compass).
4.  Run `mongodump` or export the `Users` and `Claims` collections to JSON/CSV.
    *   *Why?* If you accidentally delete something, this is your only way back.

## Step 1: Whitelist Your IP
To connect to Atlas from your local machine, you must allow your IP address.
1.  Go to **MongoDB Atlas Dashboard**.
2.  Click **Network Access** in the left sidebar.
3.  Click **+ Add IP Address**.
4.  Select **Add Current IP Address**.
5.  Click **Confirm**.
    *   *Note:* If your IP changes (e.g., switching WiFi), you will need to do this again.

## Step 2: Configure Environment Variables
1.  Copy `.env.example` to `.env` in the root directory (if not already done).
    ```bash
    cp .env.example .env
    ```
2.  Edit `.env` and fill in the production values:
    *   `MONGO_URI`: Get this from Atlas (Connect -> Drivers -> Node.js). It should look like `mongodb+srv://<user>:<password>@cluster0.mongodb.net/...`
    *   `GEMINI_API_KEY`: Required for AI features.
    *   `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Use the production secrets (or ask the lead dev).

## Step 3: Run the Application
You need to run both the Backend and Frontend terminals.

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```
*   **Success:** You should see `✅ Backend server is running...` and `MongoDB connected`.
*   **Failure?** If you see a connection error, check Step 1 (IP Whitelist).

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
*   **Success:** The app should be running at `http://localhost:3000`.

## Step 4: Verify AI Features (Vector Search)
The `ragService.js` uses MongoDB Atlas Vector Search.
1.  Ensure your Atlas Cluster has a **Vector Search Index** defined.
2.  Index Name: `vector_index` (defined in `ragService.js`).
3.  Collection: `knowledgebases`.
4.  JSON Configuration (in Atlas Search tab):
    ```json
    {
      "fields": [
        {
          "numDimensions": 768,
          "path": "embedding",
          "similarity": "cosine",
          "type": "vector"
        }
      ]
    }
    ```
    *   *Note:* `text-embedding-004` output dimension is 768.

## Troubleshooting
*   **EPERM / Access Denied:** Try running your terminal as Administrator.
*   **Login Fails:** Check if your user exists in the Prod DB.
*   **AI Search Fails:** Check the `vector_index` in Atlas.
