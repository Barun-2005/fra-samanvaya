/**
 * UPGRADE 3: THE ALERT - Notification Service
 * Sends status updates via Email (Nodemailer) with SMS simulation for demo
 */

const nodemailer = require('nodemailer');
const User = require('../models/User');
const Claim = require('../models/Claim');
const fs = require('fs');
const path = require('path');

// SMS Simulation Log File (for demo purposes)
const SMS_LOG_PATH = path.join(__dirname, '../../logs/sms-simulation.log');

// Email transporter (configure with real SMTP in production)
let transporter = null;

try {
    // For demo/development, use Ethereal fake SMTP
    // In production, use real SMTP like Gmail, SendGrid, etc.
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'demo@ethereal.email',
            pass: process.env.SMTP_PASS || 'demo123'
        }
    });
} catch (e) {
    console.warn('Email transporter not configured:', e.message);
}

/**
 * Log directory setup
 */
function ensureLogDir() {
    const logDir = path.dirname(SMS_LOG_PATH);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
}

/**
 * Status messages for different claim statuses
 */
const STATUS_MESSAGES = {
    'Submitted': {
        subject: 'FRA Claim Submitted Successfully',
        body: 'Your forest rights claim has been submitted and is pending verification.',
        sms: 'FRA: Your claim #{claimId} has been submitted. Track at fra-samanvay.vercel.app'
    },
    'GramSabhaApproved': {
        subject: 'Gram Sabha Approved Your Claim',
        body: 'Good news! The Gram Sabha has passed a resolution approving your forest rights claim. It will now proceed to field verification.',
        sms: 'FRA: Gram Sabha approved claim #{claimId}. Field verification next.'
    },
    'FieldVerified': {
        subject: 'Field Verification Complete',
        body: 'Your claim has been verified by field officers. It is now under SDLC scrutiny.',
        sms: 'FRA: Field verification complete for #{claimId}. Under SDLC review.'
    },
    'SDLC_Scrutiny': {
        subject: 'Claim Under SDLC Review',
        body: 'Your forest rights claim is being reviewed by the Sub-Divisional Level Committee.',
        sms: 'FRA: Claim #{claimId} under SDLC review.'
    },
    'Verified': {
        subject: 'Claim Verified - Pending Final Approval',
        body: 'Your claim has been verified and is pending final approval from the District Level Committee.',
        sms: 'FRA: Claim #{claimId} verified! Awaiting DLC approval.'
    },
    'Approved': {
        subject: '🎉 Congratulations! Your Forest Rights Claim is APPROVED',
        body: 'Your forest rights claim has been APPROVED by the District Level Committee. Your Title Deed (Form C) is being generated.',
        sms: 'FRA: CONGRATULATIONS! Claim #{claimId} APPROVED! Title Deed ready.'
    },
    'Title_Issued': {
        subject: 'Title Deed Issued - Download Now',
        body: 'Your official Title Deed (Form C) has been issued. Please download it from the portal.',
        sms: 'FRA: Title Deed issued for #{claimId}. Download from portal.'
    },
    'Rejected': {
        subject: 'Claim Status Update: Rejected',
        body: 'We regret to inform you that your claim has been rejected. Please check the portal for reasons and next steps.',
        sms: 'FRA: Claim #{claimId} rejected. Check portal for details and appeal options.'
    },
    'Remanded': {
        subject: 'Claim Sent Back for Review',
        body: 'Your claim has been sent back to the Gram Sabha for additional information or corrections. Please check the portal for specific requirements.',
        sms: 'FRA: Claim #{claimId} remanded to Gram Sabha. Additional info needed.'
    }
};

/**
 * Send email notification
 */
async function sendEmail(to, subject, body, claimData = {}) {
    if (!transporter) {
        console.log('[EMAIL SIMULATION]', { to, subject });
        return { success: true, simulated: true };
    }

    // Replace placeholders
    const personalizedSubject = subject.replace('{claimantName}', claimData.claimantName || 'Applicant');
    const personalizedBody = `
Dear ${claimData.claimantName || 'Applicant'},

${body}

Claim Details:
- Claim ID: ${claimData._id ? claimData._id.toString().slice(-8) : 'N/A'}
- Village: ${claimData.village || 'N/A'}
- Status: ${claimData.status || 'Updated'}

For more details, visit: https://fra-samanvay.vercel.app

This is an automated message from FRA Samanvay.
Do not reply to this email.

---
Forest Rights Act Digital Platform
Government of India
    `;

    try {
        const info = await transporter.sendMail({
            from: '"FRA Samanvay" <noreply@fra-samanvay.gov.in>',
            to: to,
            subject: personalizedSubject,
            text: personalizedBody,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">FRA Samanvay</h1>
                        <p style="margin: 5px 0 0;">Forest Rights Act Digital Platform</p>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <p>Dear <strong>${claimData.claimantName || 'Applicant'}</strong>,</p>
                        <p>${body}</p>
                        <div style="background: white; border-left: 4px solid #1e3a5f; padding: 15px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Claim ID:</strong> ${claimData._id ? claimData._id.toString().slice(-8).toUpperCase() : 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Village:</strong> ${claimData.village || 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${claimData.status === 'Approved' ? 'green' : claimData.status === 'Rejected' ? 'red' : '#1e3a5f'};">${claimData.status || 'Updated'}</span></p>
                        </div>
                        <a href="https://fra-samanvay.vercel.app/claims/${claimData._id}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">View Claim Details</a>
                    </div>
                    <div style="background: #333; color: #aaa; padding: 15px; text-align: center; font-size: 12px;">
                        <p>This is an automated message. Please do not reply.</p>
                        <p>© ${new Date().getFullYear()} FRA Samanvay - Government of India</p>
                    </div>
                </div>
            `
        });

        console.log('[EMAIL SENT]', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL ERROR]', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Simulate SMS notification (logs to file for demo)
 */
function simulateSMS(phoneNumber, message, claimId) {
    ensureLogDir();

    const timestamp = new Date().toISOString();
    const formattedMessage = message.replace('{claimId}', claimId);

    const logEntry = `
[${timestamp}] SMS SIMULATION
To: ${phoneNumber}
Message: ${formattedMessage}
Status: DELIVERED (Simulated)
---
`;

    fs.appendFileSync(SMS_LOG_PATH, logEntry);
    console.log('[SMS SIMULATION]', { to: phoneNumber, message: formattedMessage });

    return {
        success: true,
        simulated: true,
        message: formattedMessage,
        logPath: SMS_LOG_PATH
    };
}

/**
 * Main function: Send status update notification
 * @param {String} userId - User ID to notify
 * @param {String} claimId - Claim ID
 * @param {String} newStatus - New status of the claim
 */
async function sendStatusUpdate(userId, claimId, newStatus) {
    try {
        // Fetch user and claim
        const user = await User.findById(userId);
        const claim = await Claim.findById(claimId);

        if (!user || !claim) {
            console.warn('[NOTIFICATION] User or Claim not found');
            return { success: false, reason: 'User or Claim not found' };
        }

        const statusConfig = STATUS_MESSAGES[newStatus] || {
            subject: 'Claim Status Updated',
            body: `Your claim status has been updated to: ${newStatus}`,
            sms: `FRA: Claim #{claimId} status: ${newStatus}`
        };

        const results = {
            email: null,
            sms: null,
            status: newStatus,
            timestamp: new Date()
        };

        // Send Email (if user has email)
        if (user.email) {
            results.email = await sendEmail(
                user.email,
                statusConfig.subject,
                statusConfig.body,
                claim
            );
        }

        // Simulate SMS (if user has phone)
        const phoneNumber = user.phoneNumber || user.mobile || '+91XXXXXXXXXX';
        const claimIdShort = claimId.toString().slice(-6).toUpperCase();
        results.sms = simulateSMS(phoneNumber, statusConfig.sms, claimIdShort);

        console.log('[NOTIFICATION SENT]', { userId, claimId, status: newStatus });
        return results;

    } catch (error) {
        console.error('[NOTIFICATION ERROR]', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send notification to assigned officer when new claim arrives
 */
async function notifyOfficerNewClaim(officerId, claim) {
    try {
        const officer = await User.findById(officerId);
        if (!officer) return { success: false };

        const subject = `New Claim Assigned: ${claim.village} - ${claim.claimantName}`;
        const body = `A new forest rights claim has been assigned to you for verification.

Claimant: ${claim.claimantName}
Village: ${claim.village}
Type: ${claim.claimType}
Land Size: ${claim.landSizeClaimed} hectares

Please review and process at your earliest convenience.`;

        return await sendEmail(officer.email, subject, body, claim);
    } catch (error) {
        console.error('[OFFICER NOTIFICATION ERROR]', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send reminder for claims approaching SLA deadline
 */
async function sendSLAReminder(officerId, claim, daysRemaining) {
    try {
        const officer = await User.findById(officerId);
        if (!officer) return { success: false };

        const subject = `⚠️ SLA Alert: ${daysRemaining} days remaining for Claim #${claim._id.toString().slice(-6)}`;
        const body = `This is a reminder that the following claim is approaching its SLA deadline.

Claim: ${claim.claimantName} - ${claim.village}
Days Remaining: ${daysRemaining}
Current Status: ${claim.status}

Please take action to avoid SLA breach.`;

        return await sendEmail(officer.email, subject, body, claim);
    } catch (error) {
        console.error('[SLA REMINDER ERROR]', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get SMS simulation log for demo purposes
 */
function getSmsLog() {
    try {
        if (fs.existsSync(SMS_LOG_PATH)) {
            return fs.readFileSync(SMS_LOG_PATH, 'utf8');
        }
        return 'No SMS logs yet.';
    } catch (error) {
        return 'Error reading SMS log: ' + error.message;
    }
}

module.exports = {
    sendStatusUpdate,
    sendEmail,
    simulateSMS,
    notifyOfficerNewClaim,
    sendSLAReminder,
    getSmsLog,
    STATUS_MESSAGES
};
