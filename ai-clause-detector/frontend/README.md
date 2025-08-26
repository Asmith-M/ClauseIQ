# ClauseIQ Frontend 🎨

**React-based Legal Document Analysis Interface**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

The ClauseIQ frontend is a modern React application that provides an intuitive interface for uploading legal documents, viewing extracted clauses, and analyzing legal risks using AI-powered insights.

## ✨ Features

### 🎯 User Interface
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Drag & Drop Upload**: Intuitive PDF upload interface with file validation
- **Real-time Feedback**: Live progress indicators and status updates

### 📊 Dashboard Components
- **Document Upload**: File upload component with size validation (10MB max)
- **Clause Cards**: Individual cards displaying extracted legal clauses
- **Risk Visualization**: Color-coded risk levels (Low/Medium/High) with visual indicators
- **AI Explanations**: Interactive "Smart Explain" feature for plain-English analysis
- **Document History**: Persistent sidebar with analysis history and quick access

### 🛠️ Technical Features
- **Modern React**: Built with React 19.1.0 using hooks and functional components
- **Vite Build System**: Fast development server and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **Lucide Icons**: Beautiful, consistent iconography throughout the interface
- **API Integration**: Seamless communication with FastAPI backend

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, Badge)
│   │   ├── Sidebar.jsx     # Document history sidebar
│   │   └── Navbar.jsx      # Navigation header
│   ├── pages/              # Main page components
│   │   ├── page.jsx        # Main application page
│   │   └── Home.jsx        # Home dashboard
│   ├── App.jsx             # Root application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles and Tailwind imports
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.cjs     # PostCSS configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend server running (see backend README)

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:5173

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Styling & Theming

### Tailwind Configuration
The project uses Tailwind CSS with custom configurations:
- **Color Palette**: Custom blue/purple gradient theme
- **Dark Mode**: Full dark theme support with system preference detection
- **Animations**: Custom CSS animations for smooth interactions
- **Responsive**: Mobile-first responsive design approach

### Component Structure
- **Base Components**: Reusable Button, Card, and Badge components
- **Layout Components**: Sidebar, Navbar, and main content areas
- **Page Components**: Home page with upload and analysis features

## 🔌 API Integration

### Endpoints Used
- `POST /api/documents/upload` - Upload PDF and extract clauses
- `GET /api/documents/` - List analyzed documents
- `GET /api/documents/{id}/clauses` - Get clauses for specific document
- `POST /api/analyze-clause/` - AI analysis of individual clause

### Data Flow
1. User uploads PDF via drag-and-drop interface
2. File is sent to backend for clause extraction
3. Extracted clauses are displayed in the UI
4. User can trigger AI analysis for each clause
5. Results are displayed with risk assessment and explanations

## 🧪 Development

### Adding New Components
1. Create component in `src/components/` directory
2. Export from appropriate index files
3. Follow existing patterns for styling and state management

### Styling Guidelines
- Use Tailwind utility classes for styling
- Follow the established color palette and design system
- Ensure dark mode compatibility for all components
- Maintain responsive design principles

### State Management
- Use React hooks for local state management
- Implement proper loading and error states
- Follow React best practices for component lifecycle

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Options
- **Vercel**: Zero-config deployment with `vercel --prod`
- **Netlify**: Drag-and-drop deployment from `dist/` folder
- **GitHub Pages**: Deploy using GitHub Actions
- **Traditional Hosting**: Upload `dist/` contents to any web server

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Vite Configuration
- **Base URL**: Configured for proper asset paths
- **Proxy**: Development server proxies API requests to backend
- **Build Optimization**: Production builds are optimized and minified

## 🤝 Contributing

When contributing to the frontend:
1. Follow the existing code style and patterns
2. Ensure all components are responsive and accessible
3. Test across different browsers and devices
4. Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the excellent framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon library

---

**ClauseIQ Frontend** - Beautiful interfaces for complex legal analysis. ⚖️🎨
