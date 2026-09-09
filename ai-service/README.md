# AI Service

AI Service is a dedicated service responsible for handling Artificial Intelligence features of the K-Tutor system.

The service is separated from the main backend to keep AI-related processing independent, maintainable, and easier to scale.

## Features

### OCR

The OCR service is responsible for:

* Receiving images containing text.
* Detecting and extracting text from images.
* Returning the extracted text to the backend.
* Supporting Korean language learning features.

### Text-to-Speech

The TTS service is responsible for:

* Receiving text as input.
* Converting text into speech.
* Returning generated audio.
* Supporting listening and pronunciation practice.

## Project Structure

```text
ai-service/
├── ocr/
│   └── ...
│
├── tts/
│   └── ...
│
└── README.md
```

### OCR

The `ocr` directory contains all components related to optical character recognition.

```text
ocr/
├── ...
```

### TTS

The `tts` directory contains all components related to text-to-speech processing.

```text
tts/
├── ...
```

## System Architecture

```text
                    Frontend
                       |
                       v
                    Backend
                    NestJS
                       |
              +--------+--------+
              |                 |
              v                 v
          OCR Service      TTS Service
```

The frontend communicates with the main backend.

The backend handles business logic and communicates with the appropriate AI service when an AI operation is required.

## Processing Flow

### OCR Flow

```text
Image
  |
  v
OCR Service
  |
  v
Extracted Text
  |
  v
Backend
  |
  v
Frontend
```

### TTS Flow

```text
Text
  |
  v
TTS Service
  |
  v
Generated Audio
  |
  v
Backend
  |
  v
Frontend
```

## Requirements

* Python 3.x
* pip
* Required AI and processing libraries

Each AI service may have additional requirements depending on the selected models and frameworks.

## Installation

### OCR Service

```bash
cd ocr
pip install -r requirements.txt
```

### TTS Service

```bash
cd tts
pip install -r requirements.txt
```

## Running the Services

Each AI service is designed to run independently.

Example:

```bash
cd ocr
python main.py
```

For the TTS service:

```bash
cd tts
python main.py
```

The actual commands may be updated when the service implementation is finalized.

## Environment Variables

Sensitive configuration should not be committed to the repository.

Environment variables can be stored in a `.env` file.

Example:

```env
PORT=
MODEL_PATH=
```

A `.env.example` file should be provided to document the required environment variables without exposing sensitive values.

## API

The API specification will be updated as the OCR and TTS services are implemented.

### OCR

```http
POST /ocr
```

Request:

```text
Image
```

Response:

```json
{
  "text": "..."
}
```

### Text-to-Speech

```http
POST /tts
```

Request:

```json
{
  "text": "안녕하세요"
}
```

Response:

```text
Audio
```

## Technologies

The following technologies are expected to be used:

* Python
* OCR
* Text-to-Speech
* Machine Learning models
* REST API

Specific frameworks and models will be documented after implementation.

## Development

AI services are developed independently from the main backend and frontend.

When adding a new AI feature, create a separate directory:

```text
ai-service/
├── ocr/
├── tts/
├── new-feature/
└── README.md
```

Each service should maintain its own:

* Source code
* Dependencies
* Configuration
* Model files or model configuration
* API documentation

## License

This project is developed for educational purposes as part of the K-Tutor project.
