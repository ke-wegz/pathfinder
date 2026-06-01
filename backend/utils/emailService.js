const axios = require('axios');

/**
 * Sends a premium OTP email using Brevo's HTTPS REST API.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} otpCode - The 6-digit verification code.
 * @returns {Promise<boolean>}
 */
exports.sendOTPEmail = async (toEmail, otpCode) => {
  const apiKey = process.env.BREVO_API_KEY;
  const emailUser = 'mmm04opensooq@gmail.com'; // Your verified Brevo sender email

  // Fallback to console logs bypass if API key is missing
  if (!apiKey) {
    console.warn('[Brevo Debug] Warning: BREVO_API_KEY is not defined in environment variables.');
    return triggerBypass(toEmail, otpCode, 'BREVO_API_KEY is missing');
  }

  // Create a stunning HTML email template matching PathFinder AI styling.
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your PathFinder AI Account</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f3f4f6;
          color: #1f2937;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
          border: 1px border-solid #e5e7eb;
        }
        .header-gradient {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo-text {
          font-size: 26px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .logo-symbol {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 6px;
          display: inline-block;
          vertical-align: middle;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        h1 {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin-top: 0;
          margin-bottom: 12px;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
          margin-top: 0;
          margin-bottom: 24px;
        }
        .otp-container {
          background-color: #f5f3ff;
          border: 1px dashed #c084fc;
          border-radius: 16px;
          padding: 20px;
          margin: 28px 0;
          display: inline-block;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #7c3aed;
          margin: 0;
          padding-left: 8px; /* Offset the letter-spacing on the last character */
        }
        .expiry-alert {
          font-size: 13px;
          font-weight: 500;
          color: #dc2626;
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 10px;
          padding: 8px 16px;
          display: inline-flex;
          align-items: center;
          margin-bottom: 24px;
        }
        .divider {
          border: 0;
          border-top: 1px solid #e5e7eb;
          margin: 28px 0;
        }
        .footer {
          padding: 0 30px 40px 30px;
          text-align: center;
        }
        .footer-text {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.5;
          margin: 0;
        }
        .footer-link {
          color: #6366f1;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <!-- Premium Gradient Header -->
          <div class="header-gradient">
            <h2 class="logo-text">
              <span class="logo-symbol">🧭</span> PathFinder AI
            </h2>
          </div>

          <!-- Content Body -->
          <div class="content">
            <h1>Verify Your Email Address</h1>
            <p>Welcome to PathFinder AI! You are just one step away from launching your personalized career journey. Please use the verification code below to complete your registration:</p>
            
            <!-- OTP Box -->
            <div class="otp-container">
              <h2 class="otp-code">${otpCode}</h2>
            </div>
            
            <br />
            <!-- Expiration Note -->
            <div class="expiry-alert">
              ⏳ This code is temporary and will expire in 15 minutes.
            </div>
            
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
              If you didn't request this email, you can safely ignore it. Your account will not be created without verification.
            </p>
          </div>

          <!-- Divider -->
          <hr class="divider" />

          <!-- Footer Area -->
          <div class="footer">
            <p class="footer-text">
              Designed with premium aesthetics by the <strong>PathFinder AI Team</strong>.<br />
              Need help? Reach out at <a href="mailto:support@pathfinder-ai.dev" class="footer-link">support@pathfinder-ai.dev</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log(`[Brevo Debug] Attempting to dispatch OTP email to ${toEmail} via HTTPS API...`);
    
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'PathFinder AI',
          email: emailUser,
        },
        to: [
          {
            email: toEmail,
          },
        ],
        subject: `${otpCode} is your PathFinder AI verification code`,
        htmlContent: htmlContent,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      }
    );

    if (response.status === 200 || response.status === 201 || response.status === 202) {
      console.log(`[Brevo Debug] Successfully sent verification OTP email to ${toEmail} via HTTPS (ID: ${response.data.messageId})`);
      return true;
    } else {
      console.error('[Brevo Debug] Unexpected response status from Brevo API:', response.status, response.data);
      throw new Error('Brevo API returned unexpected status.');
    }
  } catch (error) {
    const errorDetails = error.response?.data?.message || error.message || '';
    console.error('[Brevo Debug] Error sending email through Brevo API:', errorDetails);
    
    // Check if we want to allow testing bypass (enabled by default on sending failure)
    const allowBypass = process.env.ALLOW_OTP_BYPASS !== 'false';
    
    if (allowBypass) {
      return triggerBypass(toEmail, otpCode, errorDetails);
    }
    
    throw new Error(errorDetails || 'Failed to dispatch email via Brevo API.');
  }
};

// Helper function to show a beautiful console log for testing bypass
function triggerBypass(toEmail, otpCode, reason) {
  console.warn('\n==================================================');
  console.warn('⚠️  BREVO API SENDING FAILED / BYPASS ACTIVE');
  console.warn(`Could not deliver email to: ${toEmail}`);
  console.warn(`Reason: ${reason}`);
  console.warn('\n🔑 [TESTING BYPASS ACTIVE]');
  console.warn(`Copy this verification OTP code: ${otpCode}`);
  console.warn('Paste it in the signup screen to complete the registration.');
  console.warn('==================================================\n');
  return true;
}
