# FRA-Samanvaya

This is a web application for managing land claims, built with a Next.js frontend and a Node.js/Express backend.

## Local Development

### Prerequisites

*   Docker
*   Docker Compose

### Running the Application

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd fra-samanvaya
    ```

2.  **Create a `.env` file:**

    Copy the contents of `.env.example` to a new file named `.env` and fill in the required values.

3.  **Run the application with Docker Compose:**

    ```bash
    docker-compose up -d --build
    ```

    This will start the following services:
    *   `mongo`: A MongoDB database instance.
    *   `backend`: The Node.js/Express API server.
    *   `frontend`: The Next.js development server.

4.  **Access the application:**

    *   Frontend: [http://localhost:3000](http://localhost:3000)
    *   Backend API: [http://localhost:4000/api](http://localhost:4000/api)

### Seeding the Database

To seed the database with initial data, run the following command:

```bash
docker-compose exec backend node scripts/seed.js
```

## TODOs

*   [ ] Add real Cloud Run URLs to the `.env` file.
*   [ ] Add a Gemini API key to the `.env` file.
*   [ ] Add a MongoDB Atlas URL to the `.env` file.
*   [ ] Set `USE_MOCKS=false` in the `.env` file to use real services.
