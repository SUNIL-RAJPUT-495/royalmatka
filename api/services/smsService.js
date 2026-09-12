import axios from "axios";

/**
 * Send OTP via BlackSMS (SMS or WhatsApp)
 * @param {Object} params
 * @param {string} params.mobile 10-digit mobile number
 * @param {string} params.otp 4-6 digit OTP string
 * @param {string} [params.channel='sms'] 'sms' or 'wasms' (WhatsApp)
 * @param {string} [params.senderId] Optional custom sender_id
 * @param {number} [params.route] Optional route (1 to 9)
 */
export const sendBlackSmsOtp = async ({ mobile, otp, channel = "sms", senderId, route }) => {
  try {
    const cleanMobile = mobile.toString().replace(/\D/g, "").slice(-10);
    const apiChannel = channel === "wasms" || channel === "whatsapp" ? "wasms" : "sms";
    const endpoint = `https://blacksms.in/${apiChannel}`;

    const apiKey = process.env.BLACK_SMS_API_KEY || "8511c140945e1385b98b3062e4c5becf";
    const targetSenderId = senderId || process.env.BLACK_SMS_SENDER_ID || "595";
    const targetRoute = route !== undefined ? Number(route) : Number(process.env.BLACK_SMS_ROUTE || 1);

    const payload = {
      sender_id: targetSenderId,
      variables_values: otp.toString(),
      numbers: cleanMobile,
      route: targetRoute
    };

    console.log(`📡 [BlackSMS] Dispatching ${apiChannel.toUpperCase()} OTP to ${cleanMobile}...`);

    const response = await axios.post(endpoint, payload, {
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    console.log(`✅ [BlackSMS] Provider Response:`, response.data);

    // Response structure from BlackSMS doc: { "status": 1, "message": "OTP Sent" }
    const isSuccess = response.data && (response.data.status === 1 || response.data.status === "1" || response.data.success === true);

    return {
      success: isSuccess,
      message: response.data?.message || (isSuccess ? "OTP Sent" : "Failed to send OTP"),
      data: response.data
    };
  } catch (error) {
    const errorMsg = error?.response?.data?.message || error?.response?.data || error.message;
    console.error(`❌ [BlackSMS] Failed to send OTP via provider:`, errorMsg);
    return {
      success: false,
      message: typeof errorMsg === "string" ? errorMsg : "SMS Provider Error",
      error: error?.response?.data || error.message
    };
  }
};

/**
 * Send Bulk SMS Campaign via BlackSMS
 * @param {Object} params
 * @param {string} params.title Campaign reference title
 * @param {string} params.message SMS message content
 * @param {Array<string>} params.contacts Array of valid 10-digit mobile numbers
 */
export const sendBlackBulkSms = async ({ title, message, contacts }) => {
  try {
    const endpoint = "https://blacksms.in/endpoints/v1/bulk-sms";
    const apiKey = process.env.BLACK_SMS_API_KEY || "8511c140945e1385b98b3062e4c5becf";

    const formattedContacts = Array.isArray(contacts) 
      ? contacts.map(c => c.toString().replace(/\D/g, "").slice(-10)).filter(c => c.length === 10)
      : [];

    if (formattedContacts.length === 0) {
      return { success: false, message: "No valid 10-digit mobile numbers provided." };
    }

    const payload = {
      title: title || "Bulk SMS",
      message: message,
      contacts: formattedContacts
    };

    console.log(`📡 [BlackSMS] Dispatching Bulk SMS to ${formattedContacts.length} recipient(s)...`);

    const response = await axios.post(endpoint, payload, {
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    console.log(`✅ [BlackSMS] Bulk SMS Provider Response:`, response.data);

    return {
      success: response.data?.success === true,
      message: response.data?.message || "Bulk SMS processing complete",
      data: response.data
    };
  } catch (error) {
    const errorMsg = error?.response?.data?.message || error?.response?.data || error.message;
    console.error(`❌ [BlackSMS] Bulk SMS failed:`, errorMsg);
    return {
      success: false,
      message: typeof errorMsg === "string" ? errorMsg : "Bulk SMS Provider Error",
      error: error?.response?.data || error.message
    };
  }
};

export default {
  sendBlackSmsOtp,
  sendBlackBulkSms
};
