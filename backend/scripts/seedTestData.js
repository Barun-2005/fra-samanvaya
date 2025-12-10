/**
 * Test Claims Seeder - ONLY ADDS CLAIMS
 * Does NOT modify existing users
 * Uses generic fictional names to avoid any issues
 * 
 * Run: node scripts/seedTestData.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../src/models/User');
const Claim = require('../src/models/Claim');

// Sample GeoJSON polygons for different villages
const SAMPLE_POLYGONS = {
    baradihi: {
        type: 'Polygon',
        coordinates: [[[84.1234, 22.5678], [84.1334, 22.5678], [84.1334, 22.5778], [84.1234, 22.5778], [84.1234, 22.5678]]]
    },
    jamira: {
        type: 'Polygon',
        coordinates: [[[84.2000, 22.6000], [84.2150, 22.6000], [84.2150, 22.6150], [84.2000, 22.6150], [84.2000, 22.6000]]]
    },
    kalahandi: {
        type: 'Polygon',
        coordinates: [[[83.8500, 19.9000], [83.8700, 19.9000], [83.8700, 19.9200], [83.8500, 19.9200], [83.8500, 19.9000]]]
    },
    sundergarh: {
        type: 'Polygon',
        coordinates: [[[84.0300, 22.1200], [84.0500, 22.1200], [84.0500, 22.1400], [84.0300, 22.1400], [84.0300, 22.1200]]]
    },
    koraput: {
        type: 'Polygon',
        coordinates: [[[82.7100, 18.8100], [82.7300, 18.8100], [82.7300, 18.8300], [82.7100, 18.8300], [82.7100, 18.8100]]]
    }
};

// Claims at different statuses for testing workflows
// Uses GENERIC FICTIONAL names only
const generateTestClaims = (citizenId, officerId) => {
    return [
        // Status: Submitted (for GS approval testing)
        {
            claimantName: 'Raju Kumar',
            guardianName: 'Late Shyam Kumar',
            village: 'Baradihi',
            district: 'Sundargarh',
            state: 'Odisha',
            surveyNumber: 'SN/BAR/TEST/001',
            claimType: 'Individual',
            landSizeClaimed: 2.5,
            reasonForClaim: 'My ancestors have been cultivating this land for over 75 years. We have Pahan receipts and witness statements.',
            status: 'Submitted',
            geojson: SAMPLE_POLYGONS.baradihi,
            claimant: citizenId,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago for SLA testing
            statusHistory: [{ status: 'Submitted', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), reason: 'Claim submitted by citizen' }]
        },
        // Status: GramSabhaApproved (for field verification testing)
        {
            claimantName: 'Geeta Devi',
            guardianName: 'Mohan Singh',
            village: 'Jamira',
            district: 'Sundargarh',
            state: 'Odisha',
            surveyNumber: 'SN/JAM/TEST/045',
            claimType: 'Individual',
            landSizeClaimed: 1.8,
            reasonForClaim: 'Our family has been collecting minor forest produce from this area for generations. We are dependent on this land.',
            status: 'GramSabhaApproved',
            geojson: SAMPLE_POLYGONS.jamira,
            claimant: citizenId,
            gramSabhaResolution: {
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/JAM/TEST/012',
                quorumMet: true,
                frcMemberCount: 15
            },
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: 'Submitted', changedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), reason: 'Claim submitted' },
                { status: 'GramSabhaApproved', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), reason: 'Gram Sabha Resolution GS/JAM/TEST/012' }
            ]
        },
        // Status: Verified (for approval testing - Vidhi should work on this!)
        {
            claimantName: 'Suresh Yadav',
            guardianName: 'Ram Yadav',
            village: 'Sundergarh',
            district: 'Sundargarh',
            state: 'Odisha',
            surveyNumber: 'SN/SUN/TEST/089',
            claimType: 'Individual',
            landSizeClaimed: 3.2,
            reasonForClaim: 'This land was cleared by my grandfather. We have been living here and cultivating paddy. All evidence documents attached.',
            status: 'Verified',
            geojson: SAMPLE_POLYGONS.sundergarh,
            claimant: citizenId,
            verifiedBy: officerId,
            verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            verificationNotes: 'Site visit completed. Land use matches claim. Satellite imagery confirms cultivation patterns.',
            gramSabhaResolution: {
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/SUN/TEST/056',
                quorumMet: true,
                frcMemberCount: 22
            },
            jointVerification: {
                forestOfficer: { name: 'Forest Ranger Singh', signature: true, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
                revenueOfficer: { name: 'Revenue Inspector Patel', signature: true, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
                reportSummary: 'Land is not in protected zone. Claim appears genuine based on field inspection.'
            },
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: 'Submitted', changedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), reason: 'Claim submitted' },
                { status: 'GramSabhaApproved', changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), reason: 'GS Resolution 056' },
                { status: 'Verified', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), reason: 'Verified by officer' }
            ]
        },
        // Status: Approved (for title deed generation testing!)
        {
            claimantName: 'Kavita Sharma',
            guardianName: 'Dinesh Sharma',
            village: 'Koraput',
            district: 'Koraput',
            state: 'Odisha',
            surveyNumber: 'SN/KOR/TEST/112',
            claimType: 'Individual',
            landSizeClaimed: 2.0,
            reasonForClaim: 'Ancestral land for three generations. All documents verified.',
            status: 'Approved',
            geojson: SAMPLE_POLYGONS.koraput,
            claimant: citizenId,
            approvedBy: officerId,
            approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            approvalNotes: 'All verifications complete. Claim approved under FRA Section 3(1)(a).',
            gramSabhaResolution: {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/KOR/TEST/078',
                quorumMet: true,
                frcMemberCount: 18
            },
            createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: 'Submitted', changedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), reason: 'Submitted' },
                { status: 'GramSabhaApproved', changedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), reason: 'GS approved' },
                { status: 'Verified', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), reason: 'Field verified' },
                { status: 'Approved', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), reason: 'DLC approved' }
            ]
        },
        // Status: Remanded (for testing remand workflow)
        {
            claimantName: 'Prakash Singh',
            guardianName: 'Bhola Singh',
            village: 'Kalahandi',
            district: 'Kalahandi',
            state: 'Odisha',
            surveyNumber: 'SN/KAL/TEST/067',
            claimType: 'Individual',
            landSizeClaimed: 4.5, // Exceeds 4ha limit - should trigger warning
            reasonForClaim: 'Family land used for generations.',
            status: 'Remanded',
            geojson: SAMPLE_POLYGONS.kalahandi,
            claimant: citizenId,
            remandHistory: [{
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                reason: 'Land size exceeds 4 hectare limit under FRA. Please clarify actual extent with survey.',
                remandedBy: officerId,
                fromStage: 'Verified',
                toStage: 'GramSabhaApproved'
            }],
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: 'Submitted', changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), reason: 'Submitted' },
                { status: 'GramSabhaApproved', changedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), reason: 'GS approved' },
                { status: 'Verified', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), reason: 'Verified' },
                { status: 'Remanded', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), reason: 'Exceeds limit' }
            ]
        },
        // Community claim for testing CFR
        {
            claimantName: 'Baradihi Village Community',
            guardianName: 'Gram Sabha Baradihi',
            village: 'Baradihi',
            district: 'Sundargarh',
            state: 'Odisha',
            surveyNumber: 'SN/BAR/CFR/TEST/001',
            claimType: 'Community',
            landSizeClaimed: 150,
            reasonForClaim: 'Community Forest Rights claim for protection and management of traditional forest area used by all villagers.',
            status: 'GramSabhaApproved',
            geojson: {
                type: 'Polygon',
                coordinates: [[[84.1000, 22.5500], [84.1500, 22.5500], [84.1500, 22.6000], [84.1000, 22.6000], [84.1000, 22.5500]]]
            },
            gramSabhaResolution: {
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/BAR/CFR/TEST/001',
                quorumMet: true,
                frcMemberCount: 45
            },
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: 'Submitted', changedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), reason: 'CFR claim submitted' },
                { status: 'GramSabhaApproved', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), reason: 'GS Resolution passed' }
            ]
        }
    ];
};

async function seedTestClaims() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        // Find existing users - DON'T CREATE NEW ONES
        console.log('👤 Finding existing users...');
        let citizen = await User.findOne({ username: 'ramesh' });
        if (!citizen) {
            // Try sunita or any citizen
            citizen = await User.findOne({ username: 'sunita' });
        }
        if (!citizen) {
            // Find ANY user with Citizen role
            citizen = await User.findOne({ roles: { $in: ['Citizen'] } });
        }

        let verifier = await User.findOne({ username: 'verifier' });
        let approver = await User.findOne({ username: 'approver' });

        if (!verifier && !approver) {
            // Find anyone with Verification or Approving role
            verifier = await User.findOne({ roles: { $in: ['Verification Officer', 'Approving Authority'] } });
        }

        const citizenId = citizen?._id;
        const officerId = verifier?._id || approver?._id;

        console.log(`  Found citizen: ${citizen?.username || 'NONE - will skip claims'}`);
        console.log(`  Found officer: ${verifier?.username || approver?.username || 'none'}`);

        if (!citizenId) {
            console.log('\n⚠️ No citizen found! Cannot seed claims without a claimant.');
            console.log('Please ensure users are seeded first (run npm run seed)');
            await mongoose.disconnect();
            process.exit(1);
        }

        // Seed Claims - only adds new ones
        console.log('\n📋 Seeding test claims with polygons...');
        const testClaims = generateTestClaims(citizenId, officerId);

        let created = 0;
        let skipped = 0;

        for (const claimData of testClaims) {
            try {
                const existing = await Claim.findOne({ surveyNumber: claimData.surveyNumber });
                if (existing) {
                    console.log(`  ⏭️ Claim ${claimData.surveyNumber} already exists`);
                    skipped++;
                } else {
                    // Use insertOne to bypass some validations
                    await Claim.collection.insertOne(claimData);
                    console.log(`  ✅ Created: ${claimData.claimantName} (${claimData.status})`);
                    created++;
                }
            } catch (err) {
                console.log(`  ❌ Failed ${claimData.surveyNumber}: ${err.message}`);
            }
        }

        console.log(`\n  Created: ${created}, Skipped: ${skipped}`);

        // Summary
        const claimCounts = await Claim.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        console.log('\n📊 Claim Distribution:');
        claimCounts.forEach(s => console.log(`  ${s._id}: ${s.count}`));

        console.log('\n🎉 Test claims seeded successfully!');
        console.log('\n📝 Existing Login Credentials (from README):');
        console.log('  superadmin / password - Super Admin');
        console.log('  ramesh / password - Citizen');
        console.log('  sunita / password - Citizen');
        console.log('  dataentry / password - Data Entry Officer');
        console.log('  verifier / password - Verification Officer');
        console.log('  approver / password - Approving Authority');
        console.log('  fieldworker / password - Field Worker');
        console.log('  ngoviewer / password - NGO Viewer');
        console.log('  schemeadmin / password - Scheme Admin');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedTestClaims();
