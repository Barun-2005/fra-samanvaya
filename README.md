# FRA Samanvay

A digital platform for managing Forest Rights Act (FRA) 2006 claims in India, built for Smart India Hackathon 2025.

**Live Demo:** [fra-samanvay.vercel.app](https://fra-samanvay.vercel.app)

---

## About

FRA Samanvay digitizes the entire lifecycle of forest rights claims. The platform handles citizen applications, document verification, field worker visits, and final approval—all through role-specific interfaces backed by AI-powered analysis.

The system was built to address real bottlenecks in the FRA process: manual data entry, inconsistent verification, delayed approvals, and lack of transparency.

---

## Core Features

### Role-Based Dashboards

The platform supports 9 distinct user roles:

| Role | Function |
|------|----------|
| Citizen | Submit claims, track status, upload documents |
| Data Entry Officer | Digitize paper applications with AI-assisted OCR |
| Field Worker | Conduct site visits, capture geo-tagged photos |
| Verification Officer | Review evidence, compare satellite vs ground data |
| Approving Authority | Make final decisions, generate legal orders |
| Scheme Admin | Match claims to government welfare schemes |
| NGO Viewer | Monitor transparency, access impact analytics |
| Super Admin | System administration, anomaly detection |
| District Collector | Regional oversight, batch approvals |

### AI-Powered Document Processing

The document pipeline includes:

- Image normalization (auto-rotate, contrast enhancement, noise removal)
- SHA-256 duplicate detection to prevent resubmission
- Structural OCR that extracts JSON, not raw text
- Document type classification (Aadhaar, Land Record, Caste Certificate)
- Anomaly flagging (e.g., "Age does not match DOB")
- Per-document confidence scoring

### The Trinity Engine (AI Agents)

Three specialized AI agents handle different workflows:

**Mitra (Service Engine)**
- Assists citizens and data entry officers
- Powers form auto-fill from scanned documents
- Uses Gemini 2.5 Flash for fast OCR

**Satark (Vigilance Engine)**
- Assists field workers and verification officers
- Compares uploaded field photos against satellite imagery
- Uses Gemini 2.0 Flash (Vision) for image analysis

**Vidhi (Governance Engine)**
- Assists approving authorities
- Drafts legal orders (Patta) in English and vernacular
- Uses RAG with vector search to find similar precedents
- Uses Gemini 2.5 Pro for legal reasoning

### Risk Scoring

The risk engine evaluates claims based on:

- Land size violations (FRA caps claims at 4 hectares)
- Document count and quality
- AI veracity analysis from satellite data
- Historical patterns from similar claims

### Geospatial Analysis

- GeoJSON polygon storage for claim boundaries
- MongoDB `$geoIntersects` queries for overlap detection
- Leaflet integration for interactive mapping
- Automatic area calculation
- Protected zone boundary checking

### Fraud Detection

The anomaly detector runs system-wide checks:

- Velocity detection (officers approving too many claims too fast)
- Bulk rejection spikes by district
- Duplicate Aadhaar usage across multiple claims

### RAG and Vector Search

- Claims are embedded using Google's text-embedding-004 model
- MongoDB Atlas Vector Search indexes embeddings
- Officers can search for similar past cases based on claim description
- Knowledge base stores FRA legal text for contextual answers

### Statutory Compliance (FRA 2006)

The platform enforces legal workflow requirements:

| Feature | Description |
|---------|-------------|
| **Gram Sabha Resolution** | Record Form B resolution with quorum tracking before claim processing |
| **Joint Verification** | Requires dual signatures from Forest and Revenue officials |
| **Remand Workflow** | SDLC can remand claims back to Gram Sabha with AI-suggested reasons (Vidhi) |
| **Status Transitions** | Enforced legal workflow prevents illegal status jumps |
| **Form C Title Deed** | Auto-generates official Title Deed PDF per FRA Rules 2008 |

### DA-JGUA Convergence Schemes

When a claim reaches Title_Issued status, eligible welfare schemes are auto-recommended:

- PMAY-G (Housing - ₹1.20 Lakh)
- MGNREGA (Land Development - 100 days guaranteed)
- Jal Jeevan Mission (Tap water connection)
- Van Dhan Vikas Yojana (MFP value addition)
- PM-KISAN (₹6,000/year income support)
- Eklavya Schools (Residential education)
- Ayushman Bharat (₹5 Lakh health coverage)
- CFR Management Support (Community forest management)

---

## Technical Stack

### Frontend
- Next.js 15 with React 19
- TailwindCSS
- Leaflet for maps
- React-hot-toast for notifications

### Backend
- Node.js with Express
- MongoDB Atlas (with Vector Search)
- JWT authentication with role-based access
- 11 specialized services:
  - `documentProcessor.js` - OCR pipeline
  - `ragService.js` - Vector search and knowledge base
  - `riskEngine.js` - Claim risk scoring
  - `conflictDetector.js` - Geospatial overlap detection
  - `anomalyDetector.js` - Fraud pattern detection
  - `policyMatcher.js` - Scheme eligibility matching
  - `geminiOCR.js`, `geminiAtlas.js`, `geminiDSS.js`, `geminiAsset.js` - AI integrations

### AI Models
- Gemini 2.5 Flash (OCR, chat)
- Gemini 2.0 Flash (vision)
- Gemini 2.5 Pro (legal drafting)
- text-embedding-004 (vector embeddings)

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```
fra-samanvaya/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── AgentFactory.js    # Instantiates role-specific agents
│   │   │   ├── agents/            # Mitra, Satark, Vidhi definitions
│   │   │   └── tools/             # Agent tool implementations
│   │   ├── controllers/           # API endpoints
│   │   ├── models/                # MongoDB schemas (8 models)
│   │   ├── services/              # Business logic (12 services + pdfGenerator)
│   │   ├── middlewares/           # Auth, validation
│   │   └── routes/                # Route definitions
│   └── scripts/                   # Database seeding (including DA-JGUA schemes)
├── frontend/
│   ├── pages/
│   │   ├── dashboard/             # 8 role-specific dashboards
│   │   ├── claims/                # Claim detail and list
│   │   ├── create-claim.js        # Multi-step submission wizard
│   │   └── login.js               # Authentication
│   └── src/
│       ├── components/
│       │   ├── Claims/            # 21 claim components (including statutory forms)
│       │   ├── Dashboard/         # Dashboard widgets
│       │   ├── Atlas/             # GIS mapping
│       │   └── Assistant/         # AI chat interface
│       ├── context/               # Auth, theme providers
│       └── lib/                   # API client
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (with Vector Search enabled)
- Google Gemini API key

### Installation

1. Clone:
```bash
git clone https://github.com/Barun-2005/fra-samanvay.git
cd fra-samanvay
```

2. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Configure environment:

**Backend (.env):**
```
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

4. Seed database:
```bash
cd backend && npm run seed
```

5. Run development servers:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

6. Access:
- Frontend: http://localhost:3001
- API: http://localhost:4000/api

---

## Screenshots

| Dashboard | Claim Processing | AI Assistant |
|-----------|-----------------|--------------|
| ![Dashboard](screenshots/dashboard.png) | ![Claim](screenshots/claim.png) | ![AI](screenshots/ai.png) |

| Map Interface | Document OCR | Legal Drafting |
|--------------|--------------|----------------|
| ![Map](screenshots/map.png) | ![OCR](screenshots/ocr.png) | ![Draft](screenshots/draft.png) |

---

## Test Accounts

All accounts use password: `password`

| Role | Username |
|------|----------|
| Super Admin | superadmin |
| Citizen | ramesh |
| Citizen | sunita |
| Data Entry Officer | dataentry |
| Verification Officer | verifier |
| Approving Authority | approver |
| Field Worker | fieldworker |
| NGO Viewer | ngoviewer |
| Scheme Admin | schemeadmin |

---

## License

MIT License

---

Developed for Smart India Hackathon 2025
