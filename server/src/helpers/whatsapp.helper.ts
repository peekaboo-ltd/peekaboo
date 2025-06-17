import axios from "axios";
import dotenv from "dotenv";

// LOAD ENVIRONMENT VARIABLES
dotenv.config();

// GET ENVIRONMENT VARIABLES
const {
  WHATSAPP_BUSINESS_API_URL,
  WHATSAPP_BUSINESS_API_VERSION,
  WHATSAPP_BUSINESS_PHONE_NUMBER_ID,
  WHATSAPP_BUSINESS_ACCESS_TOKEN,
} = process.env;

// SEND MESSAGE
export const sendMessage = async ({
  phoneNumber,
  message,
  type = "interactive",
}: {
  phoneNumber: string;
  message: string | Record<string, any>;
  type?: "text" | "interactive";
}) => {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      type,
      to: phoneNumber,
      ...(type === "text"
        ? {
            text: {
              preview_url: false,
              body: message as string,
            },
          }
        : {
            interactive: message as Record<string, any>,
          }),
    };

    const response = await axios.post(
      `${WHATSAPP_BUSINESS_API_URL}/${WHATSAPP_BUSINESS_API_VERSION}/${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WHATSAPP_BUSINESS_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
