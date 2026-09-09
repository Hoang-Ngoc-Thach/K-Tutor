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
│   └── ...
│
├── backend/
│   └── ...
│
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

The platform is designed to support features such as:

* Korean language learning
* Korean text recognition from images
* Text-to-Speech
* User account management
* Learning content management
* AI-assisted learning features

Additional features will be added during development.

## Technology Stack

### Frontend

* React / React Native
* TypeScript

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

The database technology will be documented when the final database configuration is established.

## Development Setup

Clone the repository:

```bash
git clone <repository-url>
cd K-Tutor
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

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
