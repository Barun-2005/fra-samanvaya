# FRA SAMANVAY: PRODUCTION RESURRECTION ROADMAP
**Lead Engineering Architect**  
**Date:** November 28, 2025  
**Mission:** Transform prototype into production-ready AI-powered GIS platform

---

## 🎯 OBJECTIVE

Convert the current 30% complete prototype into a fully functional Forest Rights Act monitoring platform with **real AI/GIS integration** using available cloud resources.

---

## 📋 EXECUTION STRATEGY: PLAN-THEN-EXECUTE

### PHASE 0: ENVIRONMENT VALIDATION ✅
**Status:** COMPLETED (resources verified)

**Available Resources:**
- ✅ MongoDB Atlas: `cluster0.g19x5gu.mongodb.net`
- ✅ Asset Service (U-Net Model): `asset-api-vgg16-202535323812.us-central1.run.app`
- ✅ Gemini API: `AIzaSyAjDlTU1OzTTiZQWVuZ_G9mTMutXKdWKGk`
- ❌ OCR Service (deprecated): Will use Gemini instead

---

## PHASE 1: THE "MOCK" PURGE & INFRASTRUCTURE
**Duration:** 1-2 hours  
**Goal:** Remove all mock/placeholder code and establish real API connections

### 1.1 Environment Configuration
**Files to Modify:**
- [`c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/.env`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/.env)

**Actions:**
```diff
- USE_MOCKS=true
+ USE_MOCKS=false
```

**Critical Changes:**
- Set `USE_MOCKS=false` globally
- Verify `MONGO_URI` connection string
- Deprecate `OCR_SERVICE_URL` (will use Gemini)
- Confirm `ASSET_SERVICE_URL` and `GEMINI_API_KEY` are active

---

### 1.2 Mock Code Deletion
**Files to Delete:**
- [`backend/src/mocks/ocrMock.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/backend/src/mocks/ocrMock.js) ❌ DELETE

**Controllers to Update:**
- [`backend/src/controllers/documentController.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/backend/src/controllers/documentController.js)
  - Remove `require('../mocks/ocrMock')`
  - Replace with Gemini API call (Phase 2)

- [`backend/src/controllers/schemeController.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/backend/src/controllers/schemeController.js)
  - Remove placeholder response
  - Implement real DSS logic (Phase 2)

---

### 1.3 MongoDB Connection Test
**File to Create:** `backend/scripts/test_mongo.js`

**Purpose:** Verify MongoDB Atlas connectivity before proceeding

**Test Script:**
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('Database:', mongoose.connection.name);
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

**Expected Output:**
```
✅ MongoDB Atlas connected successfully
Database: FraSamanvayaLocal
```

---

### 1.4 Asset Service API Integration Test
**File to Create:** `backend/scripts/test_asset_api.js`

**Purpose:** Understand the U-Net API response schema for land segmentation

**Test Script:**
```javascript
const axios = require('axios');
require('dotenv').config();

async function testAssetAPI() {
  const ASSET_SERVICE_URL = process.env.ASSET_SERVICE_URL;
  
  // Sample GeoJSON polygon (test area in Odisha)
  const testPayload = {
    polygon: {
      type: 'Polygon',
      coordinates: [
        [
          [85.8245, 20.2961], // Bhubaneswar test coordinates
          [85.8345, 20.2961],
          [85.8345, 20.3061],
          [85.8245, 20.3061],
          [85.8245, 20.2961]
        ]
      ]
    },
    zoom: 15,
    dateRequested: new Date().toISOString()
  };

  try {
    console.log('🔍 Testing Asset Service API...');
    console.log('URL:', ASSET_SERVICE_URL);
    
    const response = await axios.post(
      `${ASSET_SERVICE_URL}/analyze`,
      testPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('\n✅ API Response Received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Document the schema
    console.log('\n📊 Expected Schema Fields:');
    console.log('- waterAreasHa:', typeof response.data.waterAreasHa);
    console.log('- farmlandHa:', typeof response.data.farmlandHa);
    console.log('- forestHa:', typeof response.data.forestHa);
    console.log('- homesteadCount:', typeof response.data.homesteadCount);
    console.log('- modelVersion:', typeof response.data.modelVersion);
    
  } catch (error) {
    console.error('\n❌ Asset Service API Test Failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAssetAPI();
```

**Expected Response Schema:**
```json
{
  "waterAreasHa": 0.45,
  "farmlandHa": 1.2,
  "forestHa": 0.8,
  "homesteadCount": 3,
  "modelVersion": "unet-vgg16-v1.2",
  "snapshotImage": "gs://bucket/path/to/image.png"
}
```

---

### 1.5 Dependencies Installation
**New Packages Required:**

```bash
cd backend
npm install @google/generative-ai axios
```

**Purpose:**
- `@google/generative-ai`: Gemini SDK for OCR and DSS
- `axios`: Already installed, verify for API calls

---

### Phase 1 Acceptance Criteria ✅
- [ ] `.env` updated with `USE_MOCKS=false`
- [ ] All mock files deleted
- [ ] MongoDB connection test passes
- [ ] Asset Service API test returns valid schema
- [ ] Response schema documented
- [ ] Dependencies installed

**Blocker Resolution:** If Asset API returns errors, document exact error and pause for debugging before Phase 2.

---

## PHASE 2: THE "SMART" CORE (GEMINI INTEGRATION)
**Duration:** 4-6 hours  
**Goal:** Replace mock OCR and implement intelligent DSS using Gemini

### 2.1 Modern OCR with Gemini Document Understanding

**File to Create:** `backend/src/services/geminiOCR.js`

**Implementation Strategy:**
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function extractClaimData(imageBuffer, mimeType) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    Extract the following information from this Forest Rights Act claim form:
    - Claimant Name
    - Aadhaar Number (12 digits)
    - Village Name
    - Land Size Claimed (in hectares)
    - Survey Number (if present)
    
    Return ONLY valid JSON in this format:
    {
      "name": "string",
      "aadhaar": "string",
      "village": "string",
      "landSizeClaimed": number,
      "surveyNumber": "string"
    }
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType
      }
    }
  ]);

  const response = await result.response;
  const text = response.text();
  
  // Parse JSON from Gemini response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  
  return JSON.parse(jsonMatch[0]);
}

module.exports = { extractClaimData };
```

**Files to Update:**
- [`backend/src/controllers/documentController.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/backend/src/controllers/documentController.js)

**Changes:**
```diff
- const ocrMock = require('../mocks/ocrMock');
+ const { extractClaimData } = require('../services/geminiOCR');

  try {
-   let ocrResult = await ocrMock(file.path);
+   const fileBuffer = fs.readFileSync(file.path);
+   const ocrResult = await extractClaimData(fileBuffer, file.mimetype);
    
    const document = new Document({
      claim: claimId,
      uploader: req.user.id,
      fileRef: file.path,
-     ocrText: ocrResult.text,
-     ocrConfidence: ocrResult.confidence,
+     extractedData: ocrResult, // Store structured JSON
    });
```

---

### 2.2 DSS Engine (Scheme Recommendation)

**File to Create:** `backend/src/services/geminiDSS.js`

**Logic:**
```javascript
async function recommendSchemes(claimantData, assetData) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are a Forest Rights Act eligibility advisor for India.
    
    Claimant Profile:
    - Land Size Claimed: ${claimantData.landSizeClaimed} hectares
    - Actual Forest Area: ${assetData.forestHa} hectares
    - Actual Farmland: ${assetData.farmlandHa} hectares
    - Water Bodies: ${assetData.waterAreasHa} hectares
    
    Based on this data, recommend applicable Indian government schemes from:
    1. PM-KISAN (farmers with >2 ha land)
    2. MGNREGA (rural employment)
    3. Forest Rights Act Title Deed
    4. Kisan Credit Card
    5. Soil Health Card Scheme
    
    Return JSON array:
    [
      {
        "schemeName": "string",
        "eligibility": "Eligible" | "Partially Eligible" | "Not Eligible",
        "reason": "string",
        "estimatedBenefit": "string"
      }
    ]
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  
  return JSON.parse(jsonMatch[0]);
}

module.exports = { recommendSchemes };
```

**Controller Update:**
- [`backend/src/controllers/schemeController.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/backend/src/controllers/schemeController.js)

```javascript
const { recommendSchemes } = require('../services/geminiDSS');

exports.getRecommendations = async (req, res) => {
  const { claimId } = req.params;
  
  const claim = await Claim.findById(claimId)
    .populate('documents')
    .exec();
  
  const claimantData = claim.documents[0]?.extractedData;
  const assetData = claim.assetSummary;
  
  const schemes = await recommendSchemes(claimantData, assetData);
  res.json(schemes);
};
```

---

### Phase 2 Acceptance Criteria ✅
- [ ] Gemini OCR extracts structured data from claim forms
- [ ] Document model stores extracted JSON (not raw text)
- [ ] DSS recommends schemes based on land + asset data
- [ ] API endpoint `/api/schemes/:claimId/recommendations` works
- [ ] Error handling for Gemini API failures

---

## PHASE 3: THE WEBGIS (LEAFLET + U-NET)
**Duration:** 3-4 hours  
**Goal:** Visualize claimed boundaries vs. actual satellite-detected resources

### 3.1 Backend Asset Analysis Integration

**File to Update:** `backend/src/controllers/assetController.js`

**New Endpoint:** `POST /api/assets/analyze`

```javascript
const axios = require('axios');

exports.analyzeAsset = async (req, res) => {
  const { polygon, claimId } = req.body;
  
  try {
    // Call Google Cloud U-Net service
    const response = await axios.post(
      `${process.env.ASSET_SERVICE_URL}/analyze`,
      {
        polygon: polygon,
        zoom: 15,
        dateRequested: new Date().toISOString()
      },
      { timeout: 30000 }
    );

    // Save results to Asset model
    const asset = new Asset({
      claim: claimId,
      requester: req.user.id,
      polygon: polygon,
      status: 'Completed',
      result: {
        waterAreasHa: response.data.waterAreasHa,
        farmlandHa: response.data.farmlandHa,
        forestHa: response.data.forestHa,
        homesteadCount: response.data.homesteadCount,
        modelVersion: response.data.modelVersion,
      },
      snapshotImage: response.data.snapshotImage
    });

    await asset.save();

    // Update claim with asset summary
    await Claim.findByIdAndUpdate(claimId, {
      'assetSummary': asset.result
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ 
      message: 'Asset analysis failed', 
      error: error.message 
    });
  }
};
```

---

### 3.2 Frontend Map Enhancement

**File to Update:** [`frontend/src/components/Claims/LeafletMap.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/frontend/src/components/Claims/LeafletMap.js)

**New Features:**
1. **Dual Layer Visualization:**
   - Blue polygon: User-claimed boundary (from form)
   - Green overlay: Actual forest (from U-Net)
   - Orange overlay: Farmland (from U-Net)
   - Cyan overlay: Water bodies (from U-Net)

2. **Layer Toggle:**
   - Checkbox to show/hide satellite layers
   - Legend explaining color codes

**Implementation:**
```javascript
import { GeoJSON, LayersControl } from 'react-leaflet';

const LeafletMap = ({ claim, assetData }) => {
  // User claimed boundary
  const claimedStyle = { color: 'blue', weight: 3, fillOpacity: 0.1 };
  
  // U-Net detected layers (convert hectares to GeoJSON polygons)
  const forestLayer = assetData?.forestGeoJSON;
  const farmlandLayer = assetData?.farmlandGeoJSON;
  
  return (
    <MapContainer center={position} zoom={13}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer 
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* User Claimed Boundary */}
      <GeoJSON data={claim.geojson} style={claimedStyle} />
      
      {/* U-Net Detected Layers */}
      {forestLayer && (
        <GeoJSON 
          data={forestLayer} 
          style={{ color: 'green', fillOpacity: 0.4 }}
        />
      )}
      
      {farmlandLayer && (
        <GeoJSON 
          data={farmlandLayer} 
          style={{ color: 'orange', fillOpacity: 0.3 }}
        />
      )}
    </MapContainer>
  );
};
```

---

### 3.3 Atlas Page Rebuild

**File to Update:** [`frontend/pages/atlas.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/frontend/pages/atlas.js)

**Transform from:**
```javascript
export default function Atlas() {
  return <div><h1>Atlas</h1></div>; // ❌ Empty shell
}
```

**To:**
```javascript
import { useState, useEffect } from 'react';
import MapPreview from '../src/components/Dashboard/MapPreview';

export default function Atlas() {
  const [claims, setClaims] = useState([]);
  
  useEffect(() => {
    fetch('/api/claims')
      .then(res => res.json())
      .then(data => setClaims(data));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">FRA Claims Atlas</h1>
      <MapPreview claims={claims} />
    </div>
  );
}
```

---

### Phase 3 Acceptance Criteria ✅
- [ ] Asset analysis endpoint calls U-Net service
- [ ] Asset results stored in database
- [ ] Frontend displays claimed vs. actual boundaries
- [ ] Satellite imagery layer available
- [ ] Atlas page functional with all claims

---

## PHASE 4: THE "KILLER FEATURE" (CONFLICT HEATMAP)
**Duration:** 2-3 hours  
**Goal:** Detect overlapping claims and prevent boundary disputes

### 4.1 Backend Overlap Detection

**File to Create:** `backend/src/services/conflictDetector.js`

```javascript
const Claim = require('../models/Claim');

async function detectOverlaps(newClaimGeoJSON, excludeClaimId = null) {
  const query = {
    geojson: {
      $geoIntersects: {
        $geometry: newClaimGeoJSON
      }
    }
  };
  
  // Exclude current claim if updating
  if (excludeClaimId) {
    query._id = { $ne: excludeClaimId };
  }
  
  const overlappingClaims = await Claim.find(query)
    .select('_id claimant geojson status')
    .populate('claimant', 'name village');
  
  return overlappingClaims.map(claim => ({
    claimId: claim._id,
    claimantName: claim.claimant.name,
    village: claim.claimant.village,
    status: claim.status,
    overlapPercentage: calculateOverlapPercentage( // TODO: Implement
      newClaimGeoJSON,
      claim.geojson
    )
  }));
}

module.exports = { detectOverlaps };
```

---

### 4.2 Claim Submission Validation

**File to Update:** [`backend/src/controllers/claimController.js`](file:///c:/Users/Asus/Desktop/Fra-Samanvay/fra-samanvaya-main/backend/src/controllers/claimController.js)

**Add Validation Hook:**
```javascript
const { detectOverlaps } = require('../services/conflictDetector');

exports.createClaim = async (req, res) => {
  const { geojson, scheme } = req.body;
  
  // Conflict detection
  const conflicts = await detectOverlaps(geojson);
  
  if (conflicts.length > 0) {
    return res.status(409).json({
      message: 'Claim overlaps with existing claims',
      conflicts: conflicts,
      severity: conflicts.some(c => c.overlapPercentage > 10) 
        ? 'HIGH' 
        : 'LOW'
    });
  }
  
  // Proceed with claim creation...
};
```

---

### 4.3 Frontend Conflict Warning

**File to Create:** `frontend/src/components/Claims/ConflictWarning.js`

**UI Component:**
```javascript
export default function ConflictWarning({ conflicts }) {
  if (!conflicts || conflicts.length === 0) return null;
  
  const highSeverity = conflicts.some(c => c.overlapPercentage > 10);
  
  return (
    <div className={`p-4 rounded-lg border-2 ${
      highSeverity ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
    }`}>
      <h3 className="font-bold text-lg mb-2">
        ⚠️ Boundary Overlap Detected
      </h3>
      <p className="mb-4">
        Your claim overlaps with {conflicts.length} existing claim(s):
      </p>
      <ul className="space-y-2">
        {conflicts.map((conflict, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{conflict.claimantName} ({conflict.village})</span>
            <span className="font-semibold">{conflict.overlapPercentage}% overlap</span>
          </li>
        ))}
      </ul>
      {highSeverity && (
        <p className="mt-4 text-red-700 font-semibold">
          ⛔ High overlap (&gt;10%) detected. Please adjust boundaries.
        </p>
      )}
    </div>
  );
}
```

---

### Phase 4 Acceptance Criteria ✅
- [ ] MongoDB `$geoIntersects` query works
- [ ] Overlap percentage calculation accurate
- [ ] API returns conflict data on claim submission
- [ ] Frontend shows red warning for >10% overlap
- [ ] Users can see conflicting claim details

---

## PHASE 5: PRODUCTION HARDENING (Post-MVP)
**Duration:** 1 week  
**Status:** Deferred until Phases 1-4 complete

**Critical Items:**
- Encrypt Aadhaar numbers with `mongoose-encryption`
- Add comprehensive test suite (Jest + Supertest)
- Implement rate limiting on Gemini API calls
- Set up CI/CD pipeline
- Performance optimization (caching, indexes)
- Multilingual support (Hindi, Tamil)
- Offline PWA for field workers

---

## 🚦 EXECUTION GATES

### Gate 1: After Phase 1
**Stop and Verify:**
- Asset Service API returns valid data
- MongoDB connection stable
- No environment config errors

**Decision Point:** Proceed to Phase 2 only if all tests pass.

---

### Gate 2: After Phase 2
**Stop and Verify:**
- Gemini OCR extracts accurate data from sample forms
- DSS returns sensible scheme recommendations
- No API quota errors

**Decision Point:** Get user approval before proceeding to Phase 3.

---

### Gate 3: After Phase 3
**Stop and Verify:**
- Maps display correctly with U-Net overlay
- Atlas page loads without errors
- Frontend-backend integration stable

**Decision Point:** Get user approval before implementing conflict detection.

---

### Gate 4: After Phase 4
**Stop and Verify:**
- Conflict detection accurate
- No false positives
- Performance acceptable

**Decision Point:** Move to production hardening or iterate on features.

---

## 📊 SUCCESS METRICS

**Phase 1 Success:**
- ✅ 0 mock files remaining
- ✅ Asset API response time <5s
- ✅ MongoDB queries <100ms

**Phase 2 Success:**
- ✅ OCR accuracy >85% on test forms
- ✅ DSS returns 3-5 relevant schemes
- ✅ Gemini API uptime >99%

**Phase 3 Success:**
- ✅ Map renders in <2s
- ✅ U-Net data visually distinct from claimed boundaries
- ✅ Users can toggle layers

**Phase 4 Success:**
- ✅ Overlap detection runs in <1s
- ✅ 0 false negatives (all overlaps caught)
- ✅ <5% false positives

---

## ⚠️ RISK MITIGATION

| **Risk** | **Mitigation** |
|---|---|
| Asset Service timeout | Implement 30s timeout + retry logic |
| Gemini API quota exceeded | Add rate limiting + caching |
| MongoDB connection drops | Connection pooling + auto-reconnect |
| U-Net returns invalid GeoJSON | Validate response schema before saving |
| Conflict detection performance | Add geospatial index: `db.claims.createIndex({ geojson: "2dsphere" })` |

---

## 🎯 FINAL DELIVERABLE

**After All Phases Complete:**
- Production-ready FRA Samanvay platform
- 100% real AI/GIS integration (no mocks)
- Conflict prevention system operational
- Ready for field deployment

**Timeline:** 2-3 days of focused development

---

**CURRENT STATUS:** ⏳ Ready to execute Phase 1  
**NEXT ACTION:** Update `.env`, delete mocks, run connection tests
