# 🟢 SlimeTube - Video Streaming Platform

<div align="center">
  <img src="Public/image/logo.jpeg" alt="SlimeTube Logo" width="120" height="120" style="border-radius: 15px;">
  <h3>A Modern Video Streaming Platform Built with React & TypeScript</h3>
  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#testing">Testing</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

SlimeTube is a modern, full-featured video streaming platform that provides YouTube-like functionality with a clean, responsive interface. Built with React 18, TypeScript, and modern web technologies, it offers video upload, playback, user management, and persistent storage capabilities.

### ✨ Key Highlights

- 🎬 **Video Streaming**: High-quality video playback with custom controls
- 💾 **Persistent Storage**: IndexedDB-based permanent video storage
- 🔐 **User Authentication**: Complete auth system with protected routes
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🎨 **Modern UI**: Smooth animations with Framer Motion
- 🔍 **Search & Discovery**: Advanced video search and filtering
- 👤 **User Profiles**: Personal dashboards and watchlists

## 🚀 Features

### Core Features
- ✅ **Video Upload & Management**
  - Multiple format support (MP4, AVI, MOV)
  - Automatic thumbnail generation
  - Real-time upload progress
  - File size validation (up to 100MB)
  
- ✅ **Video Playback**
  - Custom video player with full controls
  - Volume control and mute functionality
  - Fullscreen support
  - Keyboard shortcuts
  
- ✅ **User Authentication**
  - Login/Register system
  - Protected routes
  - User profiles
  - Session management
  
- ✅ **Content Management**
  - Personal video library
  - Wishlist/Favorites
  - Video categorization
  - Tag-based organization
  
- ✅ **Search & Discovery**
  - Real-time search
  - Category filtering
  - Advanced search options
  - Related videos

### Advanced Features
- 🔄 **Real-time Updates**: Global state management with context
- 💽 **Offline Storage**: IndexedDB for persistent video storage
- 🎯 **Smart Recommendations**: Algorithm-based video suggestions
- 📊 **Analytics**: View counts and engagement metrics
- 🌙 **Dark Theme**: Modern dark UI design
- 📱 **PWA Ready**: Progressive Web App capabilities

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI Library
- **TypeScript 5.5.3** - Type Safety
- **Vite 5.4.2** - Build Tool & Dev Server
- **Tailwind CSS 3.4.1** - Styling Framework
- **Framer Motion 12.23.12** - Animations
- **React Router Dom 7.7.1** - Client-side Routing

### UI Components & Icons
- **Lucide React 0.344.0** - Icon Library
- **React Hot Toast 2.5.2** - Notifications

### Storage & Data
- **IndexedDB** - Client-side Database
- **LocalStorage** - Session & Settings Storage
- **Blob URLs** - Video File Handling

### Development Tools
- **ESLint 9.9.1** - Code Linting
- **PostCSS 8.4.35** - CSS Processing
- **Autoprefixer 10.4.18** - CSS Vendor Prefixes

## 📦 Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- Modern web browser with IndexedDB support

### Clone Repository
```bash
git clone https://github.com/yourusername/SlimeTube.git
cd SlimeTube
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

## 🎯 Usage

### Getting Started

1. **Launch the Application**: Open `http://localhost:5173/` in your browser
2. **Create Account**: Click "Login" and register a new account
3. **Upload Videos**: Navigate to Dashboard → Upload Video
4. **Browse Content**: Explore videos on the Home page
5. **Manage Library**: Use your Dashboard to organize videos

### User Guide

#### Uploading Videos
1. Click the **Upload** button in the header
2. Select a video file (MP4, AVI, MOV format)
3. Add video details:
   - Title (required)
   - Description
   - Category
   - Tags
   - Quality setting
4. Optionally upload a custom thumbnail
5. Click **Upload Video**

#### Video Playback
- **Play/Pause**: Click video or spacebar
- **Volume**: Use volume slider or arrow keys
- **Fullscreen**: Click fullscreen button or press 'F'
- **Seek**: Click on progress bar

#### Managing Your Library
- **Dashboard**: View all uploaded videos
- **Wishlist**: Save favorite videos
- **Profile**: Update account settings
- **Storage Manager**: Manage uploaded files

### Demo Credentials
```
Email: demo@slimetube.com
Password: demo123
```

## 📁 Project Structure

```
SlimeTube/
├── public/
│   └── image/
│       └── logo.jpeg          # Application logo
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Auth/             # Authentication components
│   │   ├── Layout/           # Layout components (Header, etc.)
│   │   ├── Storage/          # Storage management
│   │   ├── VideoPlayer/      # Custom video player
│   │   └── VideoUpload/      # Video upload functionality
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── VideoContext.tsx  # Video state management
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx      # Landing page
│   │   ├── DashboardPage.tsx # User dashboard
│   │   ├── VideoDetailsPage.tsx # Video viewing page
│   │   └── ...
│   ├── services/             # Business logic & APIs
│   │   ├── VideoService.ts   # Video operations
│   │   ├── IndexedDBStorageService.ts # Storage service
│   │   └── ...
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── App.tsx               # Main application component
├── docs/                     # Documentation
├── tests/                    # Test files
└── ...
```

## 🔧 API Documentation

### VideoService

#### `uploadVideo(videoData: Partial<Video>): Promise<Video>`
Uploads a new video to the platform.

**Parameters:**
- `videoData`: Video metadata and file information

**Returns:** Promise resolving to uploaded video object

#### `getVideoById(id: string): Promise<Video | null>`
Retrieves a specific video by ID.

#### `searchVideos(query: string, filters?: VideoFilter): Promise<SearchResult>`
Searches videos with optional filtering.

### IndexedDBStorageService

#### `storeVideoFile(file: File, title: string, description: string, duration: number, thumbnail: string): Promise<string>`
Stores video file in IndexedDB.

**Parameters:**
- `file`: Video file object
- `title`: Video title
- `description`: Video description
- `duration`: Video duration in seconds
- `thumbnail`: Thumbnail data URL

**Returns:** Promise resolving to unique video ID

#### `getStoredVideoUrl(videoId: string): Promise<string | null>`
Retrieves blob URL for stored video.

#### `getAllStoredVideos(): Promise<StoredVideo[]>`
Gets all stored videos from IndexedDB.

## 🧪 Testing

### Running Tests
```bash
npm run test
# or
yarn test
```

### Test Coverage
```bash
npm run test:coverage
# or
yarn test:coverage
```

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Service and context testing
- **E2E Tests**: User journey testing
- **Visual Tests**: UI component testing

See [TESTING.md](./docs/TESTING.md) for detailed testing information.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **TypeScript**: All code must be typed
- **ESLint**: Follow linting rules
- **Prettier**: Code formatting
- **Commit Messages**: Use conventional commits

## 🐛 Issues & Support

- 🐞 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/SlimeTube/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/SlimeTube/discussions)
- 📧 **Email**: support@slimetube.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- React Team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for beautiful icons
- Framer Motion for smooth animations
- Vite for lightning-fast development

---

<div align="center">
  <p>Made with ❤️ by the SlimeTube Team</p>
  <p>
    <a href="https://github.com/Umairism/SlimeTube">⭐ Star us on GitHub</a> •
    <a href="https://twitter.com/slimetube">🐦 Follow on Twitter</a> •
    <a href="https://slimetube.com">🌐 Visit Website</a>
  </p>
</div>
