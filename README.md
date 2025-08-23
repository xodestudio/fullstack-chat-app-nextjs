# Chat App - Real-time Messaging Application

A modern, production-grade chat application built with Next.js, featuring real-time messaging, file sharing, and comprehensive authentication.

## Features

- 🚀 **Real-time Messaging** - Instant message delivery with Socket.io
- 🔐 **Secure Authentication** - Email/password and Google OAuth with NextAuth.js
- 📁 **File Sharing** - Support for images, videos, documents, and all file types
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ✉️ **Email Verification** - OTP-based email verification with Resend
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS and shadcn/ui
- 🔄 **State Management** - Redux Toolkit for efficient state management
- 📊 **Type Safety** - Full TypeScript support with Zod validation

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Socket.io Client** - Real-time communication

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication solution
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **Cloudinary** - File upload and storage
- **Resend** - Email delivery service
- **Zod** - Schema validation

## Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Cloudinary account
- Resend account
- Google OAuth credentials (optional)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/xodestudio/fullstack-chat-app-nextjs
   cd chat-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/chat-app
   MONGODB_DB=chat-app

   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Resend
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   # JWT
   JWT_SECRET=your-jwt-secret-key

   # Socket.io
   SOCKET_PORT=3001
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at:

   - Main app: http://localhost:3000
   - Socket.io server: http://localhost:3001

## Project Structure

```
chat-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── chat/              # Chat application
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── chat/              # Chat-related components
│   │   ├── layout/            # Layout components
│   │   ├── providers/         # Context providers
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── auth/              # Authentication configuration
│   │   ├── db/                # Database connection
│   │   ├── socket/            # Socket.io configuration
│   │   └── utils/             # Utility functions
│   ├── models/                # MongoDB models
│   ├── store/                 # Redux store and slices
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── server.js                  # Custom server with Socket.io
└── package.json              # Dependencies and scripts
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-otp` - Resend verification code
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Chat

- `GET /api/chat` - Get user's chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/[chatId]/messages` - Get chat messages
- `POST /api/chat/messages` - Send message

### File Upload

- `POST /api/upload` - Upload file to Cloudinary
- `DELETE /api/upload` - Delete file from Cloudinary

## Features in Detail

### Authentication System

- Email/password registration with verification
- Google OAuth integration
- JWT-based session management
- Email verification with OTP
- Password reset functionality

### Real-time Messaging

- Instant message delivery
- Typing indicators
- User presence (online/offline)
- Message read receipts
- Group chat support

### File Sharing

- Drag and drop file upload
- Support for all file types (images, videos, documents, etc.)
- File preview in chat
- Cloudinary integration for storage
- File size limits and validation

### Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts
- Cross-browser compatibility

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

The project includes:

- TypeScript for type safety
- ESLint for code linting
- Zod for runtime validation
- Proper error handling
- Responsive design patterns

## Deployment

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:

1. **Database**: Set up MongoDB Atlas or your preferred MongoDB hosting
2. **Cloudinary**: Configure your Cloudinary account for file storage
3. **Resend**: Set up Resend for email delivery
4. **Google OAuth**: Configure Google OAuth credentials
5. **Secrets**: Generate secure secrets for JWT and NextAuth

### Build and Deploy

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

The application can be deployed to platforms like Vercel, Netlify, or any Node.js hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

Built with ❤️ using Next.js and modern web technologies.
