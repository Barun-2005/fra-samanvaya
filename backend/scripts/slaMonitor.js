/**
 * SLA Monitor - Automated Claim Processing Deadline Tracker
 * 
 * FRA 2006 legally requires claims to be processed within 60 days.
 * This cron job monitors claims at each stage and sends reminders
 * when deadlines approach or are breached.
 */

const cron = require('node-cron');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Claim = require('../src/models/Claim');
const User = require('../src/models/User');
const { sendSLAReminder, sendStatusUpdate } = require('../src/services/notificationService');

// SLA thresholds in days for each status
const SLA_THRESHOLDS = {
    'Submitted': { warnDays: 5, breachDays: 7 },          // GS should review within 7 days
    'GramSabhaApproved': { warnDays: 10, breachDays: 14 }, // Field verification within 14 days
    'FieldVerified': { warnDays: 15, breachDays: 21 },     // Joint verification within 21 days
    'JointVerified': { warnDays: 7, breachDays: 10 },      // SDLC scrutiny within 10 days
    'SDLC_Scrutiny': { warnDays: 5, breachDays: 8 },       // DLC approval within 8 days
    'Verified': { warnDays: 7, breachDays: 10 },           // Final approval within 10 days
    'Approved': { warnDays: 3, breachDays: 5 }             // Title deed within 5 days
};

// Role to notify for each status
const STATUS_RESPONSIBLE = {
    'Submitted': ['Data Entry', 'Secretary'],
    'GramSabhaApproved': ['Field Worker'],
    'FieldVerified': ['Field Worker', 'Verification Officer'],
    'JointVerified': ['Verification Officer'],
    'SDLC_Scrutiny': ['Verification Officer', 'Approving Authority'],
    'Verified': ['Approving Authority'],
    'Approved': ['Approving Authority', 'Super Admin']
};

/**
 * Calculate days since claim entered current status
 */
function getDaysInStatus(claim) {
    const lastStatusChange = claim.statusHistory?.length > 0
        ? new Date(claim.statusHistory[claim.statusHistory.length - 1].changedAt)
        : new Date(claim.createdAt);

    const now = new Date();
    const diffTime = Math.abs(now - lastStatusChange);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Find officers responsible for a claim based on status
 */
async function findResponsibleOfficers(claim, status) {
    const roles = STATUS_RESPONSIBLE[status] || [];

    // First check if claim has assigned officer
    if (claim.assignedTo) {
        const officer = await User.findById(claim.assignedTo);
        if (officer) return [officer];
    }

    // Otherwise find officers by role and district
    const officers = await User.find({
        role: { $in: roles },
        district: claim.district,
        status: 'Active'
    }).limit(3);

    return officers;
}

/**
 * Main SLA check function
 */
async function checkSLACompliance() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[SLA Monitor] Running compliance check at ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    const stats = {
        checked: 0,
        warnings: 0,
        breaches: 0,
        notificationsSent: 0
    };

    for (const [status, thresholds] of Object.entries(SLA_THRESHOLDS)) {
        // Find claims in this status
        const claims = await Claim.find({ status }).populate('claimant');

        for (const claim of claims) {
            stats.checked++;
            const daysInStatus = getDaysInStatus(claim);

            // Check for SLA breach
            if (daysInStatus >= thresholds.breachDays) {
                stats.breaches++;
                console.log(`🚨 BREACH: Claim ${claim._id.toString().slice(-6)} in ${status} for ${daysInStatus} days (limit: ${thresholds.breachDays})`);

                // Find and notify responsible officers
                const officers = await findResponsibleOfficers(claim, status);
                for (const officer of officers) {
                    await sendSLAReminder(officer._id, claim, thresholds.breachDays - daysInStatus);
                    stats.notificationsSent++;
                }

                // Also notify Super Admins for breaches
                const superAdmins = await User.find({ role: 'Super Admin', status: 'Active' });
                for (const admin of superAdmins) {
                    await sendSLAReminder(admin._id, claim, thresholds.breachDays - daysInStatus);
                    stats.notificationsSent++;
                }
            }
            // Check for SLA warning
            else if (daysInStatus >= thresholds.warnDays) {
                stats.warnings++;
                console.log(`⚠️ WARNING: Claim ${claim._id.toString().slice(-6)} in ${status} for ${daysInStatus} days (warning at: ${thresholds.warnDays})`);

                // Notify responsible officers
                const officers = await findResponsibleOfficers(claim, status);
                for (const officer of officers) {
                    await sendSLAReminder(officer._id, claim, thresholds.breachDays - daysInStatus);
                    stats.notificationsSent++;
                }
            }
        }
    }

    console.log(`\n[SLA Monitor] Summary:`);
    console.log(`  - Claims checked: ${stats.checked}`);
    console.log(`  - Warnings sent: ${stats.warnings}`);
    console.log(`  - Breaches detected: ${stats.breaches}`);
    console.log(`  - Notifications sent: ${stats.notificationsSent}`);
    console.log('='.repeat(60) + '\n');

    return stats;
}

/**
 * Generate SLA compliance report
 */
async function generateSLAReport() {
    const report = {
        generatedAt: new Date(),
        byStatus: {},
        summary: { onTrack: 0, atRisk: 0, breached: 0 }
    };

    for (const [status, thresholds] of Object.entries(SLA_THRESHOLDS)) {
        const claims = await Claim.find({ status });

        report.byStatus[status] = {
            total: claims.length,
            onTrack: 0,
            atRisk: 0,
            breached: 0,
            claims: []
        };

        for (const claim of claims) {
            const daysInStatus = getDaysInStatus(claim);
            const claimInfo = {
                id: claim._id.toString().slice(-6),
                village: claim.village,
                daysInStatus,
                limit: thresholds.breachDays
            };

            if (daysInStatus >= thresholds.breachDays) {
                report.byStatus[status].breached++;
                report.summary.breached++;
                claimInfo.status = 'BREACHED';
            } else if (daysInStatus >= thresholds.warnDays) {
                report.byStatus[status].atRisk++;
                report.summary.atRisk++;
                claimInfo.status = 'AT_RISK';
            } else {
                report.byStatus[status].onTrack++;
                report.summary.onTrack++;
                claimInfo.status = 'ON_TRACK';
            }

            report.byStatus[status].claims.push(claimInfo);
        }
    }

    return report;
}

/**
 * Initialize and start cron job
 */
function startSLAMonitor() {
    console.log('[SLA Monitor] Initializing...');

    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('[SLA Monitor] Daily check triggered');
        try {
            await checkSLACompliance();
        } catch (error) {
            console.error('[SLA Monitor] Error during check:', error);
        }
    });

    // Also run every 4 hours for critical claims
    cron.schedule('0 */4 * * *', async () => {
        console.log('[SLA Monitor] Periodic check triggered');
        try {
            await checkSLACompliance();
        } catch (error) {
            console.error('[SLA Monitor] Error during periodic check:', error);
        }
    });

    console.log('[SLA Monitor] Started successfully');
    console.log('  - Daily full check: 9:00 AM');
    console.log('  - Periodic check: Every 4 hours');
}

// If run directly (for testing)
if (require.main === module) {
    (async () => {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('Connected to MongoDB');

            // Run immediate check
            await checkSLACompliance();

            // Generate report
            const report = await generateSLAReport();
            console.log('\n📊 SLA Compliance Report:');
            console.log(JSON.stringify(report.summary, null, 2));

            await mongoose.disconnect();
        } catch (error) {
            console.error('SLA Monitor Error:', error);
            process.exit(1);
        }
    })();
}

module.exports = {
    checkSLACompliance,
    generateSLAReport,
    startSLAMonitor,
    SLA_THRESHOLDS
};
