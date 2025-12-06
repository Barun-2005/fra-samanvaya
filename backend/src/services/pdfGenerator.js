/**
 * PDF Generator Service for FRA Title Deeds
 * Generates Form C (Title Deed) as per FRA Rules 2008
 * UPGRADE 2: THE LEGAL - Now with proper PDF generation via Puppeteer
 */

const fs = require('fs');
const path = require('path');

// Try to import puppeteer, fallback to HTML-only if not available
let puppeteer = null;
try {
    puppeteer = require('puppeteer-core');
} catch (e) {
    console.warn('Puppeteer not available, using HTML generation only');
}

/**
 * Generate the HTML template for Title Deed
 */
function generateTitleDeedHTML(claim, serialNumber) {
    // Format date nicely
    const issueDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Title Deed - ${serialNumber}</title>
    <style>
        @page { size: A4; margin: 20mm; }
        * { box-sizing: border-box; }
        body { 
            font-family: 'Georgia', 'Times New Roman', serif; 
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            line-height: 1.5;
            font-size: 11pt;
            color: #1a1a1a;
            background: #fff;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0,0,0,0.03);
            white-space: nowrap;
            z-index: -1;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px double #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header .emblem {
            width: 60px;
            height: 60px;
            margin: 0 auto 10px;
            border: 2px solid #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #666;
        }
        .header h1 { 
            font-size: 16pt; 
            margin: 5px 0;
            letter-spacing: 2px;
        }
        .header h2 { 
            font-size: 12pt; 
            font-weight: normal;
            margin: 3px 0;
        }
        .form-title { 
            text-align: center; 
            font-weight: bold; 
            font-size: 14pt; 
            margin: 25px 0;
            padding: 10px;
            background: linear-gradient(to right, transparent, #f0f0f0, transparent);
        }
        .form-title span { 
            display: block;
            font-size: 10pt;
            font-weight: normal;
            color: #666;
        }
        .meta-row {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            padding: 10px;
            background: #fafafa;
            border-left: 4px solid #2563eb;
        }
        .section { margin: 20px 0; }
        .section-title { 
            font-weight: bold; 
            font-size: 12pt;
            margin-bottom: 10px;
            color: #1e3a5f;
            border-bottom: 1px solid #1e3a5f;
            padding-bottom: 3px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
        }
        td, th { 
            border: 1px solid #333; 
            padding: 10px 12px; 
            text-align: left; 
            vertical-align: top;
        }
        td:first-child {
            width: 40%;
            background: #f8f8f8;
            font-weight: 500;
        }
        .highlight {
            background: #fffde7;
            font-weight: bold;
            color: #1e3a5f;
        }
        .conditions ol {
            padding-left: 20px;
        }
        .conditions li {
            margin: 8px 0;
            text-align: justify;
        }
        .seal-area {
            display: flex;
            justify-content: center;
            margin: 30px 0;
        }
        .seal-placeholder {
            width: 100px;
            height: 100px;
            border: 2px dashed #666;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 9pt;
            text-align: center;
        }
        .signature-block { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 50px;
            padding-top: 20px;
        }
        .signature-box { 
            width: 160px; 
            text-align: center; 
        }
        .signature-line {
            border-top: 1px solid #333;
            padding-top: 8px;
            margin-top: 40px;
        }
        .signature-box p {
            margin: 0;
            font-size: 10pt;
        }
        .signature-box .name {
            font-weight: bold;
        }
        .footer { 
            margin-top: 50px; 
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 9pt; 
            color: #666;
            text-align: center;
        }
        .vernacular {
            font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
            direction: ltr;
        }
        .photo-box {
            width: 100px;
            height: 120px;
            border: 1px solid #333;
            float: right;
            margin-left: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9pt;
            color: #666;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div class="watermark">FRA SAMANVAY</div>
    
    <div class="header">
        <div class="emblem">[EMBLEM]</div>
        <h1>GOVERNMENT OF ${(claim.state || 'INDIA').toUpperCase()}</h1>
        <h2>District Level Committee (DLC) - ${claim.district || 'District'}</h2>
        <h2 style="font-size: 10pt; margin-top: 8px;">The Scheduled Tribes and Other Traditional Forest Dwellers<br>(Recognition of Forest Rights) Act, 2006</h2>
    </div>
    
    <div class="form-title">
        FORM C<br>
        <span>[Rule 8(h)]</span>
        TITLE DEED
    </div>
    
    <div class="meta-row">
        <div><strong>Serial No:</strong> ${serialNumber}</div>
        <div><strong>Date of Issue:</strong> ${issueDate}</div>
    </div>
    
    <div class="section">
        <div class="photo-box">[PHOTO]</div>
        <p>This is to certify that the following forest right(s) over the forest land specified below is/are hereby recognized and vested in the right holder(s) under the provisions of <strong>The Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006</strong> and Rules thereunder.</p>
    </div>
    
    <div class="section">
        <div class="section-title">1. PARTICULARS OF THE RIGHT HOLDER(S)</div>
        <table>
            <tr>
                <td>Name of Right Holder</td>
                <td class="highlight">${claim.claimantName || 'N/A'}</td>
            </tr>
            <tr>
                <td>Father's/Husband's Name</td>
                <td>${claim.fatherName || claim.guardianName || 'As per records'}</td>
            </tr>
            <tr>
                <td>Aadhaar Number</td>
                <td>${claim.aadhaarNumber ? `XXXX-XXXX-${claim.aadhaarNumber.slice(-4)}` : 'As per records'}</td>
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
                <td>${claim.tehsil || claim.block || 'N/A'}</td>
            </tr>
            <tr>
                <td>District / State</td>
                <td>${claim.district || 'N/A'} / ${claim.state || 'N/A'}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <div class="section-title">2. DESCRIPTION OF FOREST LAND</div>
        <table>
            <tr>
                <td>Survey/Compartment Number</td>
                <td>${claim.surveyNumber || claim.khasraNumber || 'As surveyed'}</td>
            </tr>
            <tr>
                <td>Area Recognized</td>
                <td class="highlight">${claim.landSizeClaimed || 0} Hectares</td>
            </tr>
            <tr>
                <td>Boundaries</td>
                <td>As per attached map and GPS coordinates</td>
            </tr>
            <tr>
                <td>Type of Right</td>
                <td class="highlight">${claim.claimType === 'Community' ? 'Community Forest Resource Right (CFR)' : 'Individual Forest Right (IFR)'}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <div class="section-title">3. NATURE OF FOREST RIGHTS RECOGNIZED</div>
        <p>${claim.claimType === 'Individual' ?
            'Right to hold and live in the forest land for habitation or for self-cultivation for livelihood under <strong>Section 3(1)(a)</strong> of the Act.' :
            'Community rights such as nistar, by whatever name called, including those used in erstwhile Princely States, Zamindari or such intermediary regimes under <strong>Section 3(1)(c)</strong> of the Act.'
        }</p>
    </div>
    
    <div class="section">
        <div class="section-title">4. VERIFICATION DETAILS</div>
        <table>
            <tr>
                <td>Gram Sabha Resolution</td>
                <td>No: ${claim.gramSabhaResolution?.resolutionNumber || 'As per records'}, Dated: ${claim.gramSabhaResolution?.date ? new Date(claim.gramSabhaResolution.date).toLocaleDateString('en-IN') : 'As per records'}</td>
            </tr>
            <tr>
                <td>SDLC Recommendation</td>
                <td>Approved vide order dated ${claim.sdlcApprovalDate ? new Date(claim.sdlcApprovalDate).toLocaleDateString('en-IN') : 'As per records'}</td>
            </tr>
            <tr>
                <td>DLC Approval</td>
                <td>Approved on ${new Date().toLocaleDateString('en-IN')}</td>
            </tr>
        </table>
    </div>
    
    <div class="section conditions">
        <div class="section-title">5. CONDITIONS</div>
        <ol>
            <li>The right holder shall not transfer, alienate, or mortgage the forest land recognized under this title.</li>
            <li>The right holder shall protect the wildlife, forest, and biodiversity of the area as per Section 5 of the Act.</li>
            <li>This title is <strong>heritable but not alienable or transferable</strong> except by way of inheritance.</li>
            <li>Any construction/development on the land must comply with existing environmental laws.</li>
        </ol>
    </div>
    
    <div class="seal-area">
        <div class="seal-placeholder">DLC<br>OFFICIAL<br>SEAL</div>
    </div>
    
    <div class="signature-block">
        <div class="signature-box">
            <div class="signature-line">
                <p>District Forest Officer</p>
                <p class="name">Member, DLC</p>
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-line">
                <p>Sub-Divisional Officer</p>
                <p class="name">Member, DLC</p>
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-line">
                <p><strong>District Collector</strong></p>
                <p class="name">Chairperson, DLC</p>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>FRA Samanvay Digital Platform</strong> | Processed by Vidhi AI Legal Engine</p>
        <p>This is a digitally generated document. Physical copy with official seal and signatures is the legal record of title.</p>
        <p style="font-size: 8pt; margin-top: 5px;">Document ID: ${claim._id || 'N/A'} | Generated: ${new Date().toISOString()}</p>
    </div>
</body>
</html>
    `;
}

/**
 * Generate Title Deed PDF (Form C)
 * @param {Object} claim - The approved claim object
 * @returns {Object} { pdfUrl, serialNumber }
 */
async function generateTitleDeedPDF(claim) {
    // Generate unique serial number following government format
    const year = new Date().getFullYear();
    const serialNumber = `FRA/${(claim.district || 'DIST').slice(0, 4).toUpperCase()}/${year}/${Date.now().toString().slice(-6)}`;

    // Generate HTML
    const titleDeedHTML = generateTitleDeedHTML(claim, serialNumber);

    // Setup directories
    const uploadsDir = path.join(__dirname, '../../uploads/title-deeds');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const baseFileName = `title-deed-${claim._id}-${Date.now()}`;
    const htmlPath = path.join(uploadsDir, `${baseFileName}.html`);
    const pdfPath = path.join(uploadsDir, `${baseFileName}.pdf`);

    // Always save HTML as backup
    fs.writeFileSync(htmlPath, titleDeedHTML);

    // Try to generate PDF with Puppeteer
    let pdfGenerated = false;
    if (puppeteer) {
        try {
            // Look for Chrome/Edge executable
            const executablePaths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser'
            ];

            let executablePath = null;
            for (const p of executablePaths) {
                if (fs.existsSync(p)) {
                    executablePath = p;
                    break;
                }
            }

            if (executablePath) {
                const browser = await puppeteer.launch({
                    executablePath,
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });

                const page = await browser.newPage();
                await page.setContent(titleDeedHTML, { waitUntil: 'networkidle0' });
                await page.pdf({
                    path: pdfPath,
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
                });

                await browser.close();
                pdfGenerated = true;
                console.log(`PDF generated: ${pdfPath}`);
            }
        } catch (error) {
            console.warn('Puppeteer PDF generation failed:', error.message);
        }
    }

    return {
        pdfUrl: pdfGenerated ? `/uploads/title-deeds/${baseFileName}.pdf` : `/uploads/title-deeds/${baseFileName}.html`,
        htmlUrl: `/uploads/title-deeds/${baseFileName}.html`,
        serialNumber,
        isPdf: pdfGenerated,
        generatedAt: new Date()
    };
}

/**
 * Generate vernacular version of Title Deed using Vidhi AI
 */
async function generateVernacularTitleDeed(claim, language = 'hi') {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const langNames = { hi: 'Hindi', or: 'Odia', bn: 'Bengali', te: 'Telugu', mr: 'Marathi' };

    const prompt = `
    You are Vidhi, the Legal AI for the Forest Rights Act.
    Translate the following Title Deed content to ${langNames[language] || 'Hindi'}.
    
    IMPORTANT:
    - Keep legal terminology accurate
    - Use formal government document style
    - Maintain the official tone
    
    Content to translate:
    - Document Title: TITLE DEED (FORM C) / पट्टा (प्रपत्र ग)
    - Right Holder: ${claim.claimantName}
    - Father/Guardian: ${claim.fatherName || claim.guardianName || 'N/A'}
    - Village: ${claim.village}
    - District: ${claim.district}
    - Area: ${claim.landSizeClaimed} Hectares
    - Type: ${claim.claimType === 'Individual' ? 'Individual Forest Right (व्यक्तिगत वन अधिकार)' : 'Community Forest Resource Right (सामुदायिक वन संसाधन अधिकार)'}
    
    Also translate these standard clauses:
    1. "This title is heritable but not alienable or transferable"
    2. "The right holder shall protect the wildlife and forest"
    3. "Under the Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006"
    
    Return the full translated content in ${langNames[language] || 'Hindi'} (Devanagari script).
    `;

    try {
        const result = await model.generateContent(prompt);
        return {
            success: true,
            language: langNames[language] || 'Hindi',
            content: result.response.text()
        };
    } catch (error) {
        console.error('Vernacular translation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    generateTitleDeedPDF,
    generateVernacularTitleDeed,
    generateTitleDeedHTML
};
