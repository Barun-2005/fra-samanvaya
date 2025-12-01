# 🌲 FRA Samanvay

**AI-Powered Forest Rights Management Platform**

A next-generation government platform for managing Forest Rights Act (FRA) claims in India, featuring advanced AI integration, geospatial analysis, and role-based workflows.

🔗 **Live Demo:** https://fra-samanvay.vercel.app

---

## 🎯 Key Features

### 🤖 AI & Intelligence
- **Gemini 2.5 Pro OCR** - Automated document extraction (Aadhaar, land records)
- **Veracity Scoring** - AI analyzes land claims for authenticity (0-100 score)
- **FraBot RAG Assistant** - Intelligent chatbot with policy knowledge
- **Conflict Detection** - Automatic detection of overlapping land claims
- **Anomaly Detection** - Identifies suspicious approval patterns

### 🗺️ GIS & Mapping
- **Interactive GIS Atlas** - Regional analysis with drawing tools
- **Real-time Conflict Visualization** - See overlapping boundaries instantly
- **Leaflet Integration** - Professional map rendering with area calculations

### 👥 8+ User Roles
1. **Citizen** - Submit & track claims
2. **Data Entry Officer** - Create claims for citizens
3. **Verification Officer** - Field visits, AI-powered verification
4. **Approving Authority** - Final claim approval
5. **District Collector** - District-level oversight
6. **SDLC** - Sub-divisional authority
7. **Scheme Admin** - Policy matching & recommendations
8. **NGO Viewer** - Transparency & watchdog access
9. **Super Admin** - System management

### 📊 Smart Dashboards
- Role-specific views for each user type
- Real-time statistics & analytics
- Customized action buttons based on permissions

### 🛡️ Security & Compliance
- JWT-based authentication
- Role-based access control (RBAC)
- Audit trail for all actions
- MongoDB Atlas (cloud database)

---

## 🚀 Tech Stack

**Frontend:** Next.js 15 + React 19 + TailwindCSS  
**Backend:** Node.js + Express + MongoDB  
**AI:** Google Gemini 2.5 Pro API  
**Maps:** Leaflet + React-Leaflet  
**Hosting:** Vercel (Frontend) + Render (Backend)

---

## 🧪 Beta Testing

**Test the app:** https://fra-samanvay.vercel.app

### Sample Credentials
| Role | Username | Password |
|:-----|:---------|:---------|
| Super Admin | `barun` | `password123` |
| Citizen | `ramesh` | `password` |
| Verification Officer | `verifier` | `password` |

[📖 Full Testing Guide](./BETA_TESTING_GUIDE.md)

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Barun-2005/fra-samanvay.git
   cd fra-samanvay
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Fill in your MongoDB URI & API keys
   npm run seed          # Seed the database
   npm run dev           # Start on port 4000
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev           # Start on port 3001
   ```

4. **Access locally:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:4000/api

---

## 📁 Project Structure

```
fra-samanvaya/
├── backend/
│   ├── src/
│   │   ├── controllers/   # API logic
│   │   ├── models/        # MongoDB schemas
│   │   ├── services/      # AI & business logic
│   │   └── middlewares/   # Auth, validation
│   └── scripts/seed.js    # Database seeding
├── frontend/
│   ├── pages/             # Next.js routes
│   ├── src/
│   │   ├── components/    # Reusable UI
│   │   └── lib/           # API client
│   └── public/            # Static assets
└── README.md
```

---

## 🌟 Highlights

✅ **Production-Ready** - Deployed on Vercel + Render  
✅ **AI-First** - Gemini 2.5 Pro integration throughout  
✅ **Gov-Tech Design** - Professional, accessible UI  
✅ **Scalable** - MongoDB Atlas + cloud hosting  
✅ **Open Source** - MIT License

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

**Barun Pattanaik**  
GitHub: [@Barun-2005](https://github.com/Barun-2005)

---

**Built with ❤️ for rural India**
