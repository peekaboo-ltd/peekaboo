import axios from "axios";
import dotenv from "dotenv";
import { formatPhoneForProvider } from "./phone.helper";
import { ValidationError } from "./errors.helper";

// LOAD ENVIRONMENT VARIABLES
dotenv.config();

// GET ENVIRONMENT VARIABLES
const {
  WHATSAPP_BUSINESS_API_URL,
  WHATSAPP_BUSINESS_API_VERSION,
  WHATSAPP_BUSINESS_PHONE_NUMBER_ID,
  WHATSAPP_BUSINESS_ACCESS_TOKEN,
} = process.env;

type WhatsAppInteractivePayload = Record<string, any>;

const sendWhatsAppPayload = async (payload: Record<string, any>) => {
  return axios.post(
    `${WHATSAPP_BUSINESS_API_URL}/${WHATSAPP_BUSINESS_API_VERSION}/${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_BUSINESS_ACCESS_TOKEN}`,
      },
    }
  );
};

// SEND MESSAGE
export const sendMessage = async ({
  phoneNumber,
  message,
  type = "interactive",
}: {
  phoneNumber: string;
  message: string | WhatsAppInteractivePayload;
  type?: "text" | "interactive";
}) => {
  try {
    const providerPhone = formatPhoneForProvider(phoneNumber);
    if (!providerPhone) {
      throw new ValidationError("Enter a valid Rwandan phone number");
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      type,
      to: providerPhone,
      ...(type === "text"
        ? {
            text: {
              preview_url: false,
              body: message as string,
            },
          }
        : {
            interactive: message as WhatsAppInteractivePayload,
          }),
    };

    return sendWhatsAppPayload(payload);
  } catch (error) {
    throw error;
  }
};

export const sendFlowMessage = async ({
  phoneNumber,
  flowId,
  flowToken,
  bodyText,
}: {
  phoneNumber: string;
  flowId: string;
  flowToken: string;
  bodyText: string;
}) => {
  const message = {
    type: "flow",
    header: { type: "text", text: "Peekaboo Delivery" },
    body: { text: bodyText },
    footer: { text: "Tap to place your order" },
    action: {
      name: "flow",
      parameters: {
        flow_message_version: "3",
        flow_token: flowToken,
        flow_id: flowId,
        flow_cta: "Place Order",
        flow_action: "navigate",
        flow_action_payload: { screen: "RECIPIENT" },
      },
    },
  };

  return sendMessage({ phoneNumber, message, type: "interactive" });
};

export const sendCtaUrlButton = async ({
  phoneNumber,
  displayText,
  url,
  bodyText,
  footerText,
}: {
  phoneNumber: string;
  displayText: string;
  url: string;
  bodyText: string;
  footerText?: string;
}) => {
  const message = {
    type: "cta_url",
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: {
      name: "cta_url",
      parameters: { display_text: displayText, url },
    },
  };

  return sendMessage({ phoneNumber, message, type: "interactive" });
};

export const sendCtaUrlMessage = async ({
  phoneNumber,
  bodyText,
  buttonText,
  url,
}: {
  phoneNumber: string;
  bodyText: string;
  buttonText: string;
  url: string;
}) => {
  return sendCtaUrlButton({
    phoneNumber,
    bodyText,
    displayText: buttonText,
    url,
  });
};

export const sendLocationRequestMessage = async ({
  phoneNumber,
  bodyText,
}: {
  phoneNumber: string;
  bodyText: string;
}) => {
  const message = {
    type: "location_request_message",
    body: { text: bodyText },
    action: { name: "send_location" },
  };

  return sendMessage({ phoneNumber, message, type: "interactive" });
};

export const sendUtilityTemplate = async ({
  phoneNumber,
  templateName,
  languageCode = "en_US",
  components = [],
}: {
  phoneNumber: string;
  templateName: string;
  languageCode?: string;
  components?: Record<string, any>[];
}) => {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    type: "template",
    to: phoneNumber,
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      ...(components.length ? { components } : {}),
    },
  };

  return sendWhatsAppPayload(payload);
};
