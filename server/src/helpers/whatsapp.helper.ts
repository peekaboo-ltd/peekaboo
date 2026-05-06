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
  flowCta = "Send a package",
  bodyText,
  initialData = {},
  screen = "RECIPIENT",
}: {
  phoneNumber: string;
  flowId: string;
  flowToken: string;
  flowCta?: string;
  bodyText: string;
  initialData?: Record<string, any>;
  screen?: string;
}) => {
  return sendMessage({
    phoneNumber,
    type: "interactive",
    message: {
      type: "flow",
      body: {
        text: bodyText,
      },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "3",
          flow_token: flowToken,
          flow_id: flowId,
          flow_cta: flowCta,
          flow_action: "navigate",
          flow_action_payload: {
            screen,
            data: initialData,
          },
        },
      },
    },
  });
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
  return sendMessage({
    phoneNumber,
    type: "interactive",
    message: {
      type: "cta_url",
      body: {
        text: bodyText,
      },
      action: {
        name: "cta_url",
        parameters: {
          display_text: buttonText,
          url,
        },
      },
    },
  });
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
