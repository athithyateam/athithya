const brevo = require('@getbrevo/brevo');

// Create Brevo API client
let apiInstance = new brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
    try {
        let sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = "Email Verification - OTP";
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Your OTP for email verification is:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 5 minutes.</p>
                <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
        `;
        sendSmtpEmail.sender = { "name": "Athithya", "email": "teamsathithya@gmail.com" };
        sendSmtpEmail.to = [{ "email": email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true, data };
    } catch (error) {
        console.error('Brevo email error:', error);
        return { success: false, error };
    }
};

module.exports = { generateOTP, sendOTPEmail };
