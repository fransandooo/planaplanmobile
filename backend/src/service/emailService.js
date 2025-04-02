
const { Resend } = require('resend');


const RESEND_API_KEY = "re_M3e8GHKj_5tUvuH4VpU4YiFHo5ZQ2AA19"; // Resend API key

//IT DOESNT WORK, SINCE WE NEED OUR OWN CUSTOM DOMAIN TO SEND CONFIRMATION EMAILS

const resend = new Resend(RESEND_API_KEY);

const sendConfirmationEmail = async (userEmail) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Plan A Plan <onboarding@resend.dev>", // Use Resend's default domain
            to: [userEmail],
            subject: "Confirm your email",
            html: `
                <h2>Welcome to Plan A Plan!</h2>
                <p>Click the link below to confirm your email:</p>
                <a href="https://yourfrontend.com/verify?email=${userEmail}" target="_blank">
                    Confirm Email
                </a>
                <p>If you did not sign up, please ignore this email.</p>
            `,
        });

        if (error) {
            console.error("❌ Failed to send email:", error);
            throw new Error("Email sending failed.");
        }

        console.log("✅ Email sent successfully:", data);
        return data;
    } catch (err) {
        console.error("❌ Error in sendConfirmationEmail:", err);
        throw new Error("Failed to send confirmation email.");
    }
};

module.exports = { sendConfirmationEmail };
