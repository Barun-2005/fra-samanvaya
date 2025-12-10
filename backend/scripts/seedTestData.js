/**
 * Comprehensive Test Data Seeder
 * Seeds users, claims at various statuses, and test data for all features
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

// Test users for all roles - matching User model schema
const TEST_USERS = [
    { username: 'citizen1', fullName: 'Ramesh Kumar Munda', email: 'ramesh@test.com', password: 'password123', roles: ['Citizen'], district: 'Sundargarh', employeeId: 'CIT001' },
    { username: 'citizen2', fullName: 'Lakshmi Devi Oram', email: 'lakshmi@test.com', password: 'password123', roles: ['Citizen'], district: 'Koraput', employeeId: 'CIT002' },
    { username: 'data_entry', fullName: 'Sunil Data Officer', email: 'dataentry@test.com', password: 'password123', roles: ['Data Entry Officer'], district: 'Sundargarh', employeeId: 'DEO001' },
    { username: 'field_worker', fullName: 'Mohan Field Worker', email: 'field@test.com', password: 'password123', roles: ['Field Worker'], district: 'Sundargarh', employeeId: 'FW001' },
    { username: 'verification_officer', fullName: 'Priya Verification', email: 'verify@test.com', password: 'password123', roles: ['Verification Officer'], district: 'Sundargarh', employeeId: 'VO001' },
    { username: 'approving_authority', fullName: 'Collector DLC', email: 'dlc@test.com', password: 'password123', roles: ['Approving Authority'], district: 'Sundargarh', employeeId: 'DLC001' },
    { username: 'scheme_admin', fullName: 'Scheme Manager', email: 'scheme@test.com', password: 'password123', roles: ['Scheme Admin'], district: 'Sundargarh', employeeId: 'SA001' },
    { username: 'ngo_viewer', fullName: 'NGO Transparency', email: 'ngo@test.com', password: 'password123', roles: ['NGO Viewer'], district: 'Sundargarh', employeeId: 'NGO001' },
    { username: 'super_admin', fullName: 'System Admin', email: 'admin@test.com', password: 'password123', roles: ['Super Admin'], district: 'All', employeeId: 'ADMIN001' },
    { username: 'secretary', fullName: 'Village Secretary', email: 'secretary@test.com', password: 'password123', roles: ['Data Entry Officer'], district: 'Sundargarh', employeeId: 'SEC001' }
];


// Claims at different statuses for testing workflows
const generateTestClaims = (users) => {
    const citizen1 = users.find(u => u.username === 'citizen1');
    const citizen2 = users.find(u => u.username === 'citizen2');
    const fieldWorker = users.find(u => u.username === 'field_worker');
    const verifyOfficer = users.find(u => u.username === 'verification_officer');

    return [
        // Status: Submitted (for GS approval testing)
        {
            claimantName: 'Birsa Munda',
            guardianName: 'Late Sugana Munda',
            village: 'Baradihi',
            district: 'Sundargarh',
            state: 'Odisha',
            surveyNumber: 'SN/BAR/2024/001',
            claimType: 'Individual',
            landSizeClaimed: 2.5,
            reasonForClaim: 'My ancestors have been cultivating this land for over 75 years. We have Pahan receipts and witness statements.',
            status: 'Submitted',
            polygon: SAMPLE_POLYGONS.baradihi,
            claimant: citizen1?._id,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago for SLA testing
            statusHistory: [{ status: 'Submitted', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), reason: 'Claim submitted by citizen' }]
        },
        // Status: GramSabhaApproved (for field verification testing)
        {
            claimantName: 'Sita Oram',
            guardianName: 'Mangal Oram',
            village: 'Jamira',
            district: 'Sundargarh',
            state: 'Odisha',
            surveyNumber: 'SN/JAM/2024/045',
            claimType: 'Individual',
            landSizeClaimed: 1.8,
            reasonForClaim: 'Our family has been collecting minor forest produce from this area for generations. We are dependent on this land.',
            status: 'GramSabhaApproved',
            polygon: SAMPLE_POLYGONS.jamira,
            claimant: citizen1?._id,
            gramSabhaResolution: {
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/JAM/2024/012',
                quorumMet: true,
                frcMemberCount: 15
            },
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            statusHistory: [
                { status: 'Submitted', changedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), reason: 'Claim submitted' },
                { status: 'GramSabhaApproved', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), reason: 'Gram Sabha Resolution GS/JAM/2024/012' }
            ]
        },
        // Status: Verified (for approval testing - Vidhi should work on this)
        {
            claimantName: 'Lakhan Ho',
            guardianName: 'Jaga Ho',
            village: 'Sundergarh',
            district: 'Sundargarh',
            state: 'Odisha',
            surveyNumber: 'SN/SUN/2024/089',
            claimType: 'Individual',
            landSizeClaimed: 3.2,
            reasonForClaim: 'This land was cleared by my grandfather. We have been living here and cultivating paddy. All evidence documents attached.',
            status: 'Verified',
            polygon: SAMPLE_POLYGONS.sundergarh,
            claimant: citizen1?._id,
            verifiedBy: verifyOfficer?._id,
            verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            verificationNotes: 'Site visit completed. Land use matches claim. Satellite imagery confirms cultivation patterns.',
            gramSabhaResolution: {
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/SUN/2024/056',
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
        // Status: Approved (for title deed generation testing)
        {
            claimantName: 'Champa Munda',
            guardianName: 'Dhananjay Munda',
            village: 'Koraput',
            district: 'Koraput',
            state: 'Odisha',
            surveyNumber: 'SN/KOR/2024/112',
            claimType: 'Individual',
            landSizeClaimed: 2.0,
            reasonForClaim: 'Ancestral land for three generations. All documents verified.',
            status: 'Approved',
            polygon: SAMPLE_POLYGONS.koraput,
            claimant: citizen2?._id,
            approvedBy: verifyOfficer?._id,
            approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            approvalNotes: 'All verifications complete. Claim approved under FRA Section 3(1)(a).',
            gramSabhaResolution: {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/KOR/2024/078',
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
            claimantName: 'Mangru Kishan',
            guardianName: 'Soma Kishan',
            village: 'Kalahandi',
            district: 'Kalahandi',
            state: 'Odisha',
            surveyNumber: 'SN/KAL/2024/067',
            claimType: 'Individual',
            landSizeClaimed: 4.5, // Exceeds 4ha limit - should trigger warning
            reasonForClaim: 'Family land used for generations.',
            status: 'Remanded',
            polygon: SAMPLE_POLYGONS.kalahandi,
            claimant: citizen1?._id,
            remandHistory: [{
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                reason: 'Land size exceeds 4 hectare limit under FRA. Please clarify actual extent with survey.',
                remandedBy: verifyOfficer?._id,
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
            surveyNumber: 'SN/BAR/CFR/2024/001',
            claimType: 'Community',
            landSizeClaimed: 150,
            reasonForClaim: 'Community Forest Rights claim for protection and management of traditional forest area used by all villagers.',
            status: 'GramSabhaApproved',
            polygon: {
                type: 'Polygon',
                coordinates: [[[84.1000, 22.5500], [84.1500, 22.5500], [84.1500, 22.6000], [84.1000, 22.6000], [84.1000, 22.5500]]]
            },
            gramSabhaResolution: {
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                resolutionNumber: 'GS/BAR/CFR/2024/001',
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

async function seedTestData() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        // Seed Users
        console.log('👤 Seeding test users...');
        const createdUsers = [];
        for (const userData of TEST_USERS) {
            const existing = await User.findOne({ username: userData.username });
            if (existing) {
                console.log(`  ⏭️ User ${userData.username} already exists`);
                createdUsers.push(existing);
            } else {
                const user = new User(userData);
                await user.save();
                console.log(`  ✅ Created user: ${userData.username} (${userData.role})`);
                createdUsers.push(user);
            }
        }

        // Seed Claims
        console.log('\n📋 Seeding test claims...');
        const testClaims = generateTestClaims(createdUsers);

        for (const claimData of testClaims) {
            const existing = await Claim.findOne({ surveyNumber: claimData.surveyNumber });
            if (existing) {
                console.log(`  ⏭️ Claim ${claimData.surveyNumber} already exists`);
            } else {
                const claim = new Claim(claimData);
                await claim.save();
                console.log(`  ✅ Created claim: ${claimData.claimantName} (${claimData.status})`);
            }
        }

        // Summary
        const claimCounts = await Claim.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        console.log('\n📊 Claim Distribution:');
        claimCounts.forEach(s => console.log(`  ${s._id}: ${s.count}`));

        console.log('\n🎉 Test data seeding complete!\n');
        console.log('📝 Login Credentials:');
        console.log('  citizen1 / password123 - Test citizen');
        console.log('  data_entry / password123 - Data entry officer');
        console.log('  field_worker / password123 - Field worker');
        console.log('  verification_officer / password123 - Verification officer');
        console.log('  approving_authority / password123 - Approving authority (DLC)');
        console.log('  super_admin / password123 - System admin');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedTestData();
