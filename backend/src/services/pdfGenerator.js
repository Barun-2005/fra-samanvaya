/**
 * PDF Generator Service for FRA Title Deeds
 * Generates Form C (Title Deed) as per FRA Rules 2008
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate Title Deed PDF (Form C)
 * @param {Object} claim - The approved claim object
 * @returns {Object} { pdfUrl, serialNumber }
 */
async function generateTitleDeedPDF(claim) {
    // Generate unique serial number
    const serialNumber = `FRA/${claim.district || 'DIST'}/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;

    // For now, we'll generate HTML that can be printed as PDF
    // In production, use puppeteer or pdfkit for proper PDF generation

    const titleDeedHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Title Deed - ${serialNumber}</title>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 40px;
            line-height: 1.6;
        }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; }
        .header h2 { font-size: 16px; font-weight: normal; }
        .form-title { 
            text-align: center; 
            font-weight: bold; 
            font-size: 16px; 
            margin: 20px 0;
            text-decoration: underline;
        }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td, th { border: 1px solid #000; padding: 8px; text-align: left; }
        .signature-block { 
            margin-top: 60px; 
            display: flex; 
            justify-content: space-between; 
        }
        .signature-box { 
            width: 200px; 
            text-align: center; 
            border-top: 1px solid #000; 
            padding-top: 10px;
        }
        .seal-placeholder {
            width: 120px;
            height: 120px;
            border: 2px dashed #999;
            border-radius: 50%;
            margin: 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 12px;
        }
        .vernacular { font-family: 'Noto Sans Devanagari', sans-serif; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>GOVERNMENT OF ${(claim.state || 'INDIA').toUpperCase()}</h1>
        <h2>District Level Committee (DLC) - ${claim.district || 'District'}</h2>
        <h2>The Scheduled Tribes and Other Traditional Forest Dwellers<br>(Recognition of Forest Rights) Act, 2006</h2>
    </div>
    
    <div class="form-title">
        FORM C<br>
        [Rule 8(h)]<br>
        TITLE DEED
    </div>
    
    <div class="section">
        <p><strong>Serial No:</strong> ${serialNumber}</p>
        <p><strong>Date of Issue:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    
    <div class="section">
        <p>This is to certify that the following forest right(s) over the forest land specified below is/are hereby recognized and vested in the right holder(s) under the provisions of the Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006.</p>
    </div>
    
    <div class="section">
        <div class="section-title">1. PARTICULARS OF THE RIGHT HOLDER(S)</div>
        <table>
            <tr>
                <td width="40%">Name of Right Holder</td>
                <td><strong>${claim.claimantName || 'N/A'}</strong></td>
            </tr>
            <tr>
                <td>Father's/Husband's Name</td>
                <td>${claim.fatherName || 'As per records'}</td>
            </tr>
            <tr>
                <td>Village</td>
                <td>${claim.village || 'N/A'}</td>
            </tr>
            <tr>
                <td>Gram Panchayat</td>
                <td>${claim.gramPanchayat || claim.village || 'N/A'}</td>
            </tr>
            <tr>
                <td>Tehsil/Block</td>
                <td>${claim.tehsil || 'N/A'}</td>
            </tr>
            <tr>
                <td>District</td>
                <td>${claim.district || 'N/A'}</td>
            </tr>
            <tr>
                <td>State</td>
                <td>${claim.state || 'N/A'}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <div class="section-title">2. DESCRIPTION OF FOREST LAND</div>
        <table>
            <tr>
                <td width="40%">Survey/Compartment Number</td>
                <td>${claim.surveyNumber || 'As surveyed'}</td>
            </tr>
            <tr>
                <td>Area</td>
                <td><strong>${claim.landSizeClaimed || 0} Hectares</strong></td>
            </tr>
            <tr>
                <td>Boundaries</td>
                <td>North: As per map, South: As per map, East: As per map, West: As per map</td>
            </tr>
            <tr>
                <td>Type of Right</td>
                <td>${claim.claimType === 'Community' ? 'Community Forest Resource Right' : 'Individual Forest Right'}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <div class="section-title">3. NATURE OF FOREST RIGHTS RECOGNIZED</div>
        <p>${claim.claimType === 'Individual' ?
            'Right to hold and live in the forest land for habitation or for self-cultivation for livelihood [Section 3(1)(a)]' :
            'Community rights such as nistar, by whatever name called, including those used in erstwhile Princely States, Zamindari or such intermediary regimes [Section 3(1)(c)]'
        }</p>
    </div>
    
    <div class="section">
        <div class="section-title">4. GRAM SABHA RESOLUTION</div>
        <p>Resolution No: ${claim.gramSabhaResolution?.resolutionNumber || 'As per records'}</p>
        <p>Date: ${claim.gramSabhaResolution?.date ? new Date(claim.gramSabhaResolution.date).toLocaleDateString('en-IN') : 'As per records'}</p>
    </div>
    
    <div class="section">
        <div class="section-title">5. CONDITIONS</div>
        <ol>
            <li>The right holder shall not transfer or alienate the forest land recognized under this title.</li>
            <li>The right holder shall protect the wildlife, forest and biodiversity of the area.</li>
            <li>This title is heritable but not alienable or transferable.</li>
        </ol>
    </div>
    
    <div class="seal-placeholder">
        [DLC SEAL]
    </div>
    
    <div class="signature-block">
        <div class="signature-box">
            <p>District Forest Officer</p>
        </div>
        <div class="signature-box">
            <p>Sub-Divisional Officer</p>
        </div>
        <div class="signature-box">
            <p><strong>District Collector</strong><br>Chairperson, DLC</p>
        </div>
    </div>
    
    <div class="footer">
        <p>Generated by FRA Samanvay Digital Platform | Verified by Vidhi AI</p>
        <p>This is a computer-generated document. Physical copy with official seal is the legal document.</p>
    </div>
</body>
</html>
    `;

    // Save HTML file (in production, convert to PDF)
    const fileName = `title-deed-${claim._id}-${Date.now()}.html`;
    const uploadsDir = path.join(__dirname, '../../uploads/title-deeds');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadsDir, fileName), titleDeedHTML);

    return {
        pdfUrl: `/uploads/title-deeds/${fileName}`,
        serialNumber: serialNumber,
        html: titleDeedHTML
    };
}

/**
 * Generate vernacular version of Title Deed
 */
async function generateVernacularTitleDeed(claim, language = 'hi') {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Translate the following Title Deed content to ${language === 'hi' ? 'Hindi' : 'Odia'}.
    Keep the legal terminology accurate. Use formal government document style.
    
    Content to translate:
    - Title: TITLE DEED (FORM C)
    - Right Holder: ${claim.claimantName}
    - Village: ${claim.village}
    - District: ${claim.district}
    - Area: ${claim.landSizeClaimed} Hectares
    - Type: ${claim.claimType === 'Individual' ? 'Individual Forest Right' : 'Community Forest Resource Right'}
    
    Return the translation in proper ${language === 'hi' ? 'Devanagari' : 'Odia'} script.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

module.exports = {
    generateTitleDeedPDF,
    generateVernacularTitleDeed
};
