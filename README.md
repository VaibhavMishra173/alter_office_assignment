# alter_office_assignment

Advanced URL Shortener API
==========================

Overview
--------

The Advanced URL Shortener API is a scalable, containerized application for creating, managing, and analyzing short URLs. It includes features like Google Sign-In for authentication, detailed analytics, custom aliases, and rate limiting.

The API enables users to:

-   Create short URLs with custom aliases and categorize them into topics.
-   Track detailed analytics such as total clicks, unique users, and device/OS-based stats.
-   Group links under specific topics and analyze their performance.
-   Access overall performance metrics for all URLs created by a user.
-   Redirect short URLs to their original long URLs.

The app is designed for scalability, performance, and ease of deployment, using modern web technologies.

* * * * *

Features
--------

-   **User Authentication**: Secure authentication via Google Sign-In.
-   **Custom Aliases**: Optional custom aliases for short URLs.
-   **Detailed Analytics**: Insights into total clicks, unique users, OS/device breakdown, and more.
-   **Topic-based Grouping**: Group URLs under topics for easier management.
-   **Rate Limiting**: Prevent abuse of API endpoints.
-   **Caching**: Redis caching for faster access and reduced database load.
-   **Dockerized**: Easily deployable using Docker.

* * * * *

Technologies Used
-----------------

### Backend:

-   **Node.js** (with TypeScript for type safety)
-   **Express.js** (framework for building REST APIs)

### Database:

-   **MongoDB** (scalable, NoSQL database)
    -   Chosen for its flexibility in storing JSON-like documents and scalability for handling analytics data.

### Caching:

-   **Redis** (in-memory data structure store)
-   Used for caching URLs and analytics data to reduce latency and database load.

### Authentication:

-   **Google Sign-In** (secure and easy login mechanism)

### Deployment:

-   **Docker** (containerization for consistent environments)
-   **Railway.app** (cloud hosting for the deployed app)

* * * * *

Installation and Setup
----------------------

### Prerequisites:

-   Node.js (v16 or above)
-   Docker
-   MongoDB (local or cloud instance)
-   Redis (local or cloud instance)

### Steps to Run Locally:

1.  Clone the repository:

    `git clone https://github.com/VaibhavMishra173/alter_office_assignment
    cd alter_office_assignment`

2.  Install dependencies:

    `npm install`

3.  Set up environment variables: Create a `.env` file in the project root with the following:

    `PORT=3000
    MONGO_URI=mongodb://localhost:27017/urlshortener
    REDIS_HOST=localhost
    REDIS_PORT=6379
    GOOGLE_CLIENT_ID=<Your Google Client ID>
    GOOGLE_CLIENT_SECRET=<Your Google Client Secret>
    JWT_SECRET=<A strong secret>`

4.  Start Redis and MongoDB:

    `docker-compose up`

5.  Start the server:

    `npm run dev`

6.  Access the API:

    -   Swagger documentation: `http://localhost:3000/api-docs`

* * * * *

API Endpoints
-------------

### Authentication

#### Google Sign-In

-   **POST** `/api/auth/google`
-   **Description**: Authenticate a user using Google Sign-In.

* * * * *

### URL Management

#### Create Short URL

-   **POST** `/api/shorten`
-   **Request Body**:

    json

    CopyEdit

    `{
      "longUrl": "https://example.com",
      "customAlias": "example",
      "topic": "activation"
    }`

-   **Response**:

    json

    CopyEdit

    `{
      "shortUrl": "http://localhost:3000/example",
      "createdAt": "2025-01-17T10:00:00.000Z"
    }`

#### Redirect Short URL

-   **GET** `/api/shorten/{alias}`
-   **Description**: Redirects to the original URL.

* * * * *

### Analytics

#### Get URL Analytics

-   **GET** `/api/analytics/{alias}`
-   **Response**:

    json

    CopyEdit

    `{
      "totalClicks": 150,
      "uniqueUsers": 120,
      "clicksByDate": [
        { "date": "2025-01-10", "clicks": 25 },
        { "date": "2025-01-11", "clicks": 30 }
      ],
      "osType": [
        { "osName": "Windows", "uniqueClicks": 70, "uniqueUsers": 60 }
      ],
      "deviceType": [
        { "deviceName": "mobile", "uniqueClicks": 90, "uniqueUsers": 80 }
      ]
    }`

#### Get Topic-Based Analytics

-   **GET** `/api/analytics/topic/{topic}`

#### Get Overall Analytics

-   **GET** `/api/analytics/overall`

* * * * *

### Documentation

API documentation is available at `/api-docs` via Swagger.

* * * * *

Deployment
----------

### Docker Deployment

1.  Build Docker image:

    `docker build -t url-shortener .`

2.  Run Docker container:

    `docker run -d -p 3000:3000 --name url-shortener url-shortener`

### Railway Deployment

1.  Push the repository to GitHub.
2.  Link your GitHub repository to Railway.app.
3.  Configure environment variables in Railway.
4.  Deploy the app and retrieve the live URL.

* * * * *

Testing
-------

Run tests with:

bash

CopyEdit

`npm run test`

* * * * *

Challenges and Solutions
------------------------

-   **Rate Limiting**: Implemented using the `express-rate-limit` middleware.
-   **Analytics Data Size**: Used aggregation pipelines in MongoDB for efficient analytics computation.
-   **Performance Optimization**: Leveraged Redis for caching frequent data.

* * * * *

Live Demo
---------
<!-- TODO: -->
The application is hosted at: 

* * * * *

Contributing
------------

Contributions are welcome! Please fork the repository and submit a pull request.