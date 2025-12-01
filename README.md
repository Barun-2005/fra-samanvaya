# FRA Samanvay

An AI-powered platform for managing Forest Rights Act (FRA) claims in India, developed as part of Smart India Hackathon 2025.

**Live Demo:** https://fra-samanvay.vercel.app

## Overview

FRA Samanvay streamlines the forest rights claim process by integrating AI-powered document processing, geospatial analysis, and role-based workflows. The platform serves citizens, government officials, and NGOs involved in the FRA claim lifecycle.

## Key Features

### AI Integration
- **Automated OCR**: Document extraction using Google Gemini 2.5 Pro (Aadhaar, land records, etc.)
- **Veracity Analysis**: AI-powered authenticity scoring for land claims
- **Conflict Detection**: Automatic identification of overlapping land boundaries
- **FraBot Assistant**: RAG-powered chatbot for policy guidance and support
- **Anomaly Detection**: Pattern recognition for suspicious approval behaviors

### Geospatial Tools
- **Interactive GIS Atlas**: Regional analysis with drawing and measurement tools
- **Real-time Visualization**: Instant conflict detection on map interface
- **Area Calculations**: Automated land measurement with Leaflet integration

### Role-Based Access
The platform supports 8+ distinct user roles with customized dashboards:
- Citizens (claim submission and tracking)
- Data Entry Officers (assisted claim creation)
- Verification Officers (field verification with AI support)
- Approving Authorities (final claim decisions)
- District Collectors & SDLC (administrative oversight)
- Scheme Admins (policy matching and recommendations)
- NGO Viewers (transparency and monitoring)
- Super Admins (system management)

## Technology Stack

**Frontend:** Next.js 15, React 19, TailwindCSS  
**Backend:** Node.js, Express, MongoDB Atlas  
**AI/ML:** Google Gemini 2.5 Pro API  
**Maps:** Leaflet, React-Leaflet  
**Deployment:** Vercel (Frontend), Render (Backend)

## Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB (local instance or Atlas account)
- Google Gemini API key

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Barun-2005/fra-samanvay.git
   cd fra-samanvay
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run seed          # Initialize database with sample data
   npm run dev           # Start backend server (port 4000)
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev           # Start development server (port 3001)
   ```

4. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:4000/api

### Environment Variables

**Backend (.env):**
```
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api  # For local development
```

## Project Structure

```
fra-samanvaya/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API endpoint handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── services/         # Business logic & AI integration
│   │   ├── middlewares/      # Authentication & validation
│   │   └── routes/           # API routes
│   └── scripts/
│       └── seed.js           # Database initialization
├── frontend/
│   ├── pages/                # Next.js routes
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities & API client
│   │   └── context/          # React context providers
│   └── public/               # Static assets
└── README.md
```

## Contributing

This project was developed as part of Smart India Hackathon 2025. While it's currently maintained by the team, we welcome feedback and suggestions.

## Team

**SIH 2025 Team:**
- Team Lead & Full-Stack Development
- Additional team member contributions
- (Add your team members' names and roles here)

**Institution:** [Your College/University Name]  
**Hackathon:** Smart India Hackathon 2025

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- Smart India Hackathon organizing committee
- Google Gemini API team
- Open source community

---

**Contact:** For queries or support, please open an issue on GitHub.
