import {
  ConversationStatus,
  ConversationStep,
} from "../constants/conversation.constants";
import { RoleTypes } from "../constants/role.constants";
import { Conversation } from "../entities/conversation.entity";
import {
  orderTypeSelectedTemplate,
  pendingLocationFromTemplate,
  pendingLocationToTemplate,
  pendingOrderAcceptanceTemplate,
  pendingOrderConfirmationTemplate,
  pendingOrderTypeTemplate,
} from "../templates/whatsapp.template";
import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";
import { UserService } from "./user.service";
import axios from "axios";
import { OrderService } from "./order.service";
import { OrderStatus, OrderType } from "../constants/order.constants";
import { formatPhoneNumber } from "../helpers/string.helper";
import { sendMessage } from "../helpers/whatsapp.helper";

const {
  WHATSAPP_BUSINESS_API_URL,
  WHATSAPP_BUSINESS_API_VERSION,
  WHATSAPP_BUSINESS_PHONE_NUMBER_ID,
  WHATSAPP_BUSINESS_ACCESS_TOKEN,
} = process.env;

export class WhatsappService {
  private readonly conversationService: ConversationService;
  private readonly messageService: MessageService;
  private readonly userService: UserService;
  private readonly orderService: OrderService;

  constructor() {
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
    this.userService = new UserService();
    this.orderService = new OrderService();
  }

  // HANDLE MESSAGE
  async handleMessage(message: Record<string, any>) {
    try {
      // EXTRACT DATA
      const { entry } = message;
      const { value } = entry[0].changes[0];

      // EXTRACT DATA
      const { contacts, messages } = value;

      // EXTRACT DATA
      if (!contacts || !messages) {
        return false;
      }
      const { profile, wa_id } = contacts[0];

      if (
        !messages[0]?.text &&
        !messages[0]?.interactive &&
        !messages[0]?.location
      ) {
        return false;
      }

      let id = null;

      // TEXT MESSAGE
      if (messages[0]?.text) {
        const { body } = messages[0]?.text;
        id = body;
      }

      // INTERACTIVE MESSAGE
      if (messages[0]?.interactive) {
        id = messages[0].interactive?.button_reply?.id;
      }

      // LOCATION MESSAGE
      if (messages[0]?.location) {
        id = messages[0].location;
      }

      // EXTRACT DATA
      const { name } = profile;

      // CREATE USER
      const conversationRecipientExists = await this.userService.createUser(
        {
          phoneNumber: wa_id,
        },
        [RoleTypes.CUSTOMER]
      );

      // GET CONVERSATIONS BY RECIPIENT ID
      const recipientConversations =
        await this.conversationService.getConversationsByRecipientId(
          conversationRecipientExists?.id,
          ConversationStatus.ACTIVE
        );

      let conversation: Conversation;

      // IF NO CONVERSATION EXISTS, CREATE ONE
      if (!recipientConversations || recipientConversations?.length === 0) {
        conversation = await this.conversationService.createConversation({
          recipientId: conversationRecipientExists?.id,
        });
      } else {
        conversation = recipientConversations?.[0];
      }

      // CREATE MESSAGE
      await this.messageService.createMessage({
        conversationId: conversation?.id,
        content: entry,
      });

      /**
       * GET ORDER
       */
      let orderExists = await this.orderService.getOrderByConversationId(
        conversation?.id
      );

      /**
       * HANDLE CONVERSATION
       *
       * - INITIATION
       * - PENDING ORDER TYPE
       * - ORDER TYPE SELECTED
       * - PENDING LOCATION FROM
       * - LOCATION FROM ENTERED
       * - PENDING LOCATION TO
       * - LOCATION TO ENTERED
       * - RECIPIENT PHONE NUMBER ENTERED
       * - ORDER CREATED
       * - ORDER ACCEPTED
       * - PENDING LOCATION TO
       * - ORDER IN_TRANSIT
       */
      switch (conversation?.step) {
        /**
         * 1. INITIATION
         */
        case ConversationStep.INITIATION:
          // SEND MESSAGE
          await sendMessage({
            phoneNumber: wa_id,
            message: pendingOrderTypeTemplate(
              conversationRecipientExists?.name
            ),
          });

          // UPDATE CONVERSATION
          await this.conversationService.updateConversation(conversation?.id, {
            step: ConversationStep.PENDING_ORDER_TYPE,
          });
          break;

        /**
         * 2. PENDING ORDER TYPE
         */
        case ConversationStep.PENDING_ORDER_TYPE:
          // CREATE ORDER
          await this.orderService.createOrder({
            createdById: conversationRecipientExists?.id,
            initialFee: 1500,
            type: OrderType.SEND,
            conversationId: conversation?.id,
          });

          // SEND MESSAGE
          await sendMessage({
            phoneNumber: wa_id,
            type: "text",
            message: orderTypeSelectedTemplate(
              conversationRecipientExists?.name,
              1500
            ),
          });

          // UPDATE CONVERSATION
          await this.conversationService.updateConversation(conversation?.id, {
            step: ConversationStep.ORDER_TYPE,
          });
          break;

        /**
         * 3. ORDER TYPE
         */
        case ConversationStep.ORDER_TYPE:
          /**
           * HANDLE ORDER RECIPIENT
           */

          let orderRecipientPhoneNumber = null;

          if (messages[0]?.text) {
            const { body } = messages[0].text;
            orderRecipientPhoneNumber = body;
          }

          if (orderRecipientPhoneNumber) {
            orderRecipientPhoneNumber = formatPhoneNumber(
              orderRecipientPhoneNumber
            );
          }

          // CREATE ORDER RECIPIENT
          const orderRecipientExists = await this.userService.createUser(
            {
              phoneNumber: orderRecipientPhoneNumber,
            },
            [RoleTypes.CUSTOMER]
          );


          // SEND MESSAGE
          await sendMessage({
            phoneNumber: wa_id,
            type: "text",
            message: pendingLocationFromTemplate(
              conversationRecipientExists?.name
            ),
          });

          // UPDATE CONVERSATION
          await this.conversationService.updateConversation(conversation?.id, {
            step: ConversationStep.LOCATION_FROM,
          });
          break;

        /**
         * 4. LOCATION FROM
         */
        case ConversationStep.LOCATION_FROM:
          // UPDATE ORDER TO ADD LOCATION
          if (orderExists && messages[0]?.location) {
            await this.orderService.updateOrder(
              orderExists?.id,
              {
                locationFrom: {
                  latitude: messages[0]?.location?.latitude,
                  longitude: messages[0]?.location?.longitude,
                },
              },
              { createdById: conversationRecipientExists?.id }
            );
          }

          // SEND MESSAGE
          await sendMessage({
            phoneNumber: wa_id,
            message: pendingOrderConfirmationTemplate(
              conversationRecipientExists?.name
            ),
          });

          // UPDATE CONVERSATION
          await this.conversationService.updateConversation(conversation?.id, {
            step: ConversationStep.ORDER_CONFIRMATION,
          });
          break;

        /**
         * 5. PENDING ORDER CONFIRMATION
         */
        case ConversationStep.ORDER_CONFIRMATION:
          if (orderExists) {

            // SEND MESSAGE TO THE ORDER RECIPIENT
            await sendMessage({
              phoneNumber: orderExists?.recipient?.phoneNumber,
              message: pendingOrderAcceptanceTemplate(
                conversationRecipientExists?.name,
                orderExists?.id
              ),
            });

            // SEND MESSAGE TO THE CONVERSATION RECIPIENT
            await sendMessage({
              phoneNumber: wa_id,
              type: "text",
              message: `Great! You may remind the recipient to check the notification to accept the order.`,
            });

            // UPDATE CONVERSATION
            await this.conversationService.updateConversation(
              conversation?.id,
              {
                step: ConversationStep.ORDER_ACCEPTANCE,
              }
            );
          }
          break;

        /**
         * 6. ORDER ACCEPTANCE
         */
        case ConversationStep.ORDER_ACCEPTANCE:
          // UPDATE ORDER EXISTS
          orderExists = await this.orderService.getOrderById(id);

          // SEND MESSAGE
          await sendMessage({
            phoneNumber: wa_id,
            message: pendingLocationToTemplate(
              conversationRecipientExists?.name
            ),
            type: "text",
          });

          // UPDATE CONVERSATION
          await this.conversationService.updateConversation(conversation?.id, {
            step: ConversationStep.LOCATION_TO,
          });

          break;

        /**
         * 7. LOCATION TO
         */
        case ConversationStep.LOCATION_TO:
          // UPDATE ORDER TO ADD LOCATION
          if (orderExists && messages[0]?.location) {
            await this.orderService.updateOrder(
              orderExists?.id,
              {
                locationTo: {
                  latitude: messages[0]?.location?.latitude,
                  longitude: messages[0]?.location?.longitude,
                },
              },
              { createdById: conversationRecipientExists?.id }
            );
          }

          // SEND MESSAGE
          await sendMessage({
            phoneNumber: wa_id,
            message: `Thank you for sharing your location. We will send the rider to you shortly.`,
            type: "text",
          });
          break;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}
