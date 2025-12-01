const path = require('path');
const dotenv = require('dotenv');

// Try loading from multiple possible locations
const envPath1 = path.resolve(__dirname, '../.env');
const envPath2 = path.resolve(__dirname, '.env');

dotenv.config({ path: envPath1 });
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.log(`Failed to load from ${envPath1}, trying ${envPath2}`);
    dotenv.config({ path: envPath2 });
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
console.log('Using MongoDB URI:', mongoUri ? 'Found' : 'Not Found');

if (!mongoUri) {
    console.error('CRITICAL: MongoDB URI not found in environment variables.');
    process.exit(1);
}
const mongoose = require('mongoose');
const ragService = require('./src/services/ragService');

// Sample content from FRA Act 2006 (Simplified for demo)
const fraActContent = `
THE SCHEDULED TRIBES AND OTHER TRADITIONAL FOREST DWELLERS (RECOGNITION OF FOREST RIGHTS) ACT, 2006

CHAPTER II
FOREST RIGHTS

3. (1) For the purposes of this Act, the following rights, which secure individual or community tenure or both, shall be the forest rights of forest dwelling Scheduled Tribes and other traditional forest dwellers on all forest lands, namely:—
(a) right to hold and live in the forest land under the individual or common occupation for habitation or for self-cultivation for livelihood by a member or members of a forest dwelling Scheduled Tribe or other traditional forest dwellers;
(b) community rights such as nistar, by whatever name known, including those used in erstwhile Princely States, Zamindari or such intermediary regimes;
(c) right of ownership, access to collect, use, and dispose of minor forest produce which has been traditionally collected within or outside village boundaries;
(d) other community rights of uses or entitlements such as fish and other products of water bodies, grazing (both settled or transhumant) and traditional seasonal resource access of nomadic or pastoralist communities;
(e) rights including community tenures of habitat and habitation for primitive tribal groups and pre-agricultural communities;
(f) rights in or over disputed lands under any nomenclature in any State where claims are disputed;
(g) rights for conversion of Pattas or leases or grants issued by any local authority or any State Government on forest lands to titles;
(h) rights of settlement and conversion of all forest villages, old habitation, unsurveyed villages and other villages in forests, whether recorded, notified or not into revenue villages;
(i) right to protect, regenerate or conserve or manage any community forest resource which they have been traditionally protecting and conserving for sustainable use;
(j) rights which are recognised under any State law or laws of any Autonomous District Council or accepted as rights of tribals under any traditional or customary law of the concerned tribes of any State;
(k) right of access to biodiversity and community right to intellectual property and traditional knowledge related to biodiversity and cultural diversity;
(l) any other traditional right customarily enjoyed by the forest dwelling Scheduled Tribes or other traditional forest dwellers, as the case may be, which are not mentioned in clauses (a) to (k) but excluding the traditional right of hunting or trapping or extracting a part of the body of any species of wild animal;
(m) right to in situ rehabilitation including alternative land in cases where the Scheduled Tribes and other traditional forest dwellers have been illegally evicted or displaced from forest land without receiving their legal entitlement to rehabilitation prior to the 13th day of December, 2005.

4. (6) Where the forest rights recognised and vested by sub-section (1) are in respect of land mentioned in clause (a) of sub-section (1) of section 3, such land shall be under the occupation of an individual or family or community on the date of commencement of this Act and shall be restricted to the area under actual occupation and shall in no case exceed four hectares.
`;

const seedKnowledgeBase = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        console.log('Ingesting FRA Act 2006...');
        await ragService.ingestDocument(
            'FRA Act 2006',
            fraActContent,
            'The Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006',
            'Legal'
        );

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedKnowledgeBase();
