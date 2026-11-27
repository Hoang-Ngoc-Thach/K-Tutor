# K-Tutor

K-Tutor is a Korean language learning platform designed to support learners through interactive learning features and AI-powered tools.

The project consists of a frontend application, a backend server, and a dedicated AI service.

## Project Overview

K-Tutor aims to provide a convenient environment for learning Korean by combining traditional learning features with AI technologies.

The system is divided into three main components:

* Frontend: User interface and client-side application.
* Backend: Business logic, authentication, data management, and API services.
* AI Service: AI-powered features such as Optical Character Recognition (OCR) and Text-to-Speech (TTS).

## System Architecture

```text
                         K-Tutor
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
         Frontend        Backend      AI Service
                            |             |
                            |       +-----+-----+
                            |       |           |
                            |       v           v
                            |      OCR         TTS
                            |
                            v
                        Database
```

The frontend communicates with the backend through APIs.

The backend is responsible for application logic, authentication, data management, and communication with the AI service.

The AI service handles AI-related processing independently from the main backend.

## Project Structure

```text
K-Tutor/
├── frontend/
│   ├── public/
│   └── src/
├── backend/
│   ├── src/
│   └── test/
├── ai-service/
│   ├── ocr/
│   ├── tts/
│   └── README.md
│
├── .gitignore
└── README.md
```

## Components

### Frontend

The frontend provides the user interface for K-Tutor.

Responsibilities include:

* User interface
* Learning pages
* User interactions
* Communication with backend APIs
* Displaying OCR results
* Playing generated audio

The frontend is located in:

```text
frontend/
```

### Backend

The backend provides the main server-side functionality of K-Tutor.

Responsibilities include:

* Authentication and authorization
* User management
* Business logic
* Data management
* API endpoints
* Communication with the AI service

The backend is located in:

```text
backend/
```

### AI Service

The AI Service handles AI-related functionality separately from the main backend.

Current planned features include:

* OCR for extracting text from images
* Text-to-Speech for converting text into speech

The AI Service is located in:

```text
ai-service/
```

More information is available in:

```text
ai-service/README.md
```

## Main Features

### Implemented

* Level and topic browsing, vocabulary flashcards, and grammar reading.
* Browser Web Speech API pronunciation for Korean learning content.
* Vocabulary review games using vocabulary loaded from the backend API.
* TOPIK exam management for admins and published exam practice for learners.
* Admin TOPIK exam audio, question images, and listening audio ranges.
* Admin user management, content management, and statistics dashboards.
* User registration, login, and role-based admin access.

### Planned

* OCR for Korean text in uploaded images.
* AI text-to-speech; pronunciation currently uses the browser Web Speech API.
* AI feedback on learner-written Korean sentences.
* Persistent learned state and learner progress summaries.

## Technology Stack

### Frontend

* React 19
* Vite 8
* JavaScript (JSX)
* Tailwind CSS v4

### Backend

* NestJS
* TypeScript
* REST API

### AI Service

* Python
* OCR
* Text-to-Speech
* Machine Learning models

### Database

* MySQL with TypeORM

## Development Setup

Clone the repository:

```bash
git clone <repository-url>
cd K-Tutor
```

MySQL must be running before starting the backend. Ensure the database configured in the backend environment exists.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server uses `http://localhost:5173` by default.

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Configure these variable names in the local `backend/.env` file:

`NODE_ENV`, `PORT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `PUBLIC_BASE_URL`, `STORAGE_DRIVER`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

Replace the example values with your local settings before starting the backend.

`STORAGE_DRIVER` selects `local` (default, files under `backend/uploads`) or `cloudinary`. `PUBLIC_BASE_URL` defaults to `http://localhost:<PORT>`; set it when local file URLs must use a public host. For Cloudinary, configure all three Cloudinary variables in `backend/.env`.

Then start the backend:

```powershell
npm run start:dev
```

The backend uses port `3000` by default; the API base URL is `http://localhost:3000/api/v1`.

### AI Service

The installation and execution instructions for each AI component are available in:

```text
ai-service/README.md
```

## Environment Variables

Each component may require environment variables for configuration.

Sensitive information should not be committed to the repository.

Example:

```text
frontend/.env
backend/.env
ai-service/.env
```

Use `.env.example` files to document required environment variables without exposing sensitive information.

## Development

The project follows a modular architecture where each component can be developed independently.

```text
Frontend
    |
    v
Backend
    |
    +----> Database
    |
    +----> AI Service
              |
              +----> OCR
              |
              +----> TTS
```

## Project Status

K-Tutor is currently under development.

Features, technologies, APIs, and system architecture may be updated as development progresses.

## License

This project is developed for educational purposes.
