import { UUID } from "../types";

// PENDING ORDER TYPE TEMPLATE
export const pendingOrderTypeTemplate = (name?: string) => {
  return {
    type: "button",
    header: {
      type: "text",
      text: name ? `Hello ${name}` : "Welcome to peekaboo",
    },
    body: {
      text: "Please select the type of order you want to place:",
    },
    footer: {
      text: "Choose an option to proceed with your order.",
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: "SEND",
            title: "Send",
          },
        },
        {
          type: "reply",
          reply: {
            id: "CANCEL",
            title: "Nevermind",
          },
        },
      ],
    },
  };
};

// ORDER TYPE SELECTED TEMPLATE
export const orderTypeSelectedTemplate = (
  name?: string,
  initialFee?: number
) => {
  return `Thank you for trusting us with your order. Please enter the phone number of the recipient.`;
};

// PENDING ORDER CONFIRMATION TEMPLATE
export const pendingOrderConfirmationTemplate = (name?: string) => {
  return {
    type: "button",
    header: {
      type: "text",
      text: name ? `Hello ${name}` : "Confirmation",
    },
    body: {
      text: "We are going to send a confirmation to the recipient. Once they confirm, you will be connected to the rider. Thank you for your patience.",
    },
    footer: {
      text: "Choose an option to proceed with your order.",
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: "OK",
            title: "Ok",
          },
        },
        {
          type: "reply",
          reply: {
            id: "CANCEL",
            title: "Cancel",
          },
        },
      ],
    },
  };
};

// PENDING ORDER ACCEPTANCE TEMPLATE
export const pendingOrderAcceptanceTemplate = (name?: string, orderId?: UUID) => {
  return {
    type: "button",
    header: {
      type: "text",
      text: name ? `Hello ${name}` : "Acceptance",
    },
    body: {
      text: "The recipient has accepted the order. You will be connected to the rider shortly.",
    },
    footer: {
      text: "Choose an option to proceed with your order.",
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: orderId,
            title: "Ok",
          },
        },
        {
          type: "reply",
          reply: {
            id: "DECLINE",
            title: "Decline",
          },
        },
      ],
    },
  };
};

// PENDING LOCATION FROM TEMPLATE
export const pendingLocationFromTemplate = (name?: string) => {
  return `Please share your current location with us so we can send the rider to you. You may refer to this link to learn more: https://faq.whatsapp.com/453914586839706`
}

// PENDING LOCATION TO TEMPLATE
export const pendingLocationToTemplate = (name?: string) => {
  return `Please share your current location with us so that the rider can reach you easily. You may refer to this link to learn more: https://faq.whatsapp.com/453914586839706`;
}