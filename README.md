# Event Management Backend

A Node.js backend application for event management with Firebase integration.

## Features

- Event CRUD operations
- In-app notifications
- Firebase Admin SDK integration
- Input validation
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- Firebase Admin SDK credentials
- Firebase project setup

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

4. Get your Firebase Admin SDK credentials:
   - Go to Firebase Console
   - Navigate to Project Settings > Service Accounts
   - Generate a new private key
   - Copy the credentials to your `.env` file

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Events

- `POST /api/events` - Create a new event
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Notifications

- `GET /api/notifications/user/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/in-app` - Create in-app notification

## Request Examples

### Create Event
```json
POST /api/events
{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "date": "2024-06-15T09:00:00Z",
  "location": "Convention Center"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Security

- Input validation using express-validator
- Firebase Admin SDK authentication
- CORS enabled
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
