import 'dotenv/config';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../data-source';
import { Order } from '../entities/order.entity';
import {
  buildUrubutoConfig,
  describeUrubutoEnvironment,
  urubutoCredentialFingerprint,
  validateUrubutoStartupConfig,
} from '../integrations/urubuto/urubuto.config';
import { UrubutoService } from '../integrations/urubuto/urubuto.service';
import { KpayCurrency } from '../types/kpay.types';
import { UUID } from '../types';
import logger from '../helpers/logger.helper';

async function main() {
  const payerCodeArg = process.argv[2];
  const config = buildUrubutoConfig();
  const issues = validateUrubutoStartupConfig(config);
  const apiEnvironment = describeUrubutoEnvironment(config.baseUrl);
  const checkoutEnvironment = describeUrubutoEnvironment(config.checkoutBaseUrl);

  logger.info('UrubutoPay smoke test starting');
  logger.info('Configuration snapshot', {
    baseUrl: config.baseUrl,
    checkoutBaseUrl: config.checkoutBaseUrl,
    apiEnvironment,
    checkoutEnvironment,
    merchantCode: urubutoCredentialFingerprint(config.merchantCode),
    serviceCode: urubutoCredentialFingerprint(config.serviceCode),
    serviceCodeSource: 'URUBUTO_SERVICE_CODE',
    hasApiKey: Boolean(config.apiKey),
    hasWebhookCredentials: Boolean(
      config.webhookUsername && config.webhookPassword,
    ),
  });

  if (config.merchantCode && config.serviceCode) {
    logger.info('Credential pairing preflight', {
      merchantCodeFingerprint: urubutoCredentialFingerprint(config.merchantCode),
      serviceCodeFingerprint: urubutoCredentialFingerprint(config.serviceCode),
      guidance:
        'URUBUTO_SERVICE_CODE must be the service explicitly linked to URUBUTO_MERCHANT_CODE in the same UrubutoPay environment.',
    });
  }

  if (issues.length) {
    logger.warning('Configuration issues detected:');
    issues.forEach((issue) => logger.warning(`- ${issue}`));
  }

  const publicApiBase = (process.env.PUBLIC_API_BASE_URL || '').replace(
    /\/$/,
    '',
  );
  if (publicApiBase) {
    logger.info('Webhook URLs to register with UrubutoPay', {
      auth: `${publicApiBase}/api/v1/webhooks/urubuto/auth`,
      validation: `${publicApiBase}/api/v1/webhooks/urubuto/validation`,
      callback: `${publicApiBase}/api/v1/webhooks/urubuto/callback`,
      notification: `${publicApiBase}/api/v1/webhooks/urubuto/notification`,
      reversal: `${publicApiBase}/api/v1/webhooks/urubuto/reversal`,
    });
  }

  const urubutoService = new UrubutoService(config);

  if (publicApiBase && config.webhookUsername && config.webhookPassword) {
    try {
      const authResponse = await axios.post(
        `${publicApiBase}/api/v1/webhooks/urubuto/auth`,
        {
          user_name: config.webhookUsername,
          password: config.webhookPassword,
        },
      );
      logger.success('Auth webhook OK', {
        status: authResponse.data?.status,
        hasToken: Boolean(authResponse.data?.data?.token),
      });

      const token = authResponse.data?.data?.token as string | undefined;
      if (token && payerCodeArg && config.merchantCode) {
        const validationResponse = await axios.post(
          `${publicApiBase}/api/v1/webhooks/urubuto/validation`,
          {
            merchant_code: config.merchantCode,
            payer_code: payerCodeArg,
          },
          {
            headers: { Authorization: token },
          },
        );
        logger.success('Payer validation webhook OK', {
          status: validationResponse.data?.status,
          payerCode: payerCodeArg,
          amount: validationResponse.data?.data?.amount,
        });
      } else if (payerCodeArg) {
        logger.warning(
          'Skipped payer validation webhook test — missing auth token or merchant code',
        );
      }
    } catch (error: any) {
      logger.error('Webhook smoke test failed', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
  } else {
    logger.warning(
      'Skipped webhook tests — set PUBLIC_API_BASE_URL and webhook credentials',
    );
  }

  let payerCode: string | undefined = payerCodeArg;
  if (!payerCode) {
    try {
      await AppDataSource.initialize();
      const latestOrder = await AppDataSource.getRepository(Order).findOne({
        where: {},
        order: { createdAt: 'DESC' },
      });
      payerCode = latestOrder?.referenceId ?? undefined;
      await AppDataSource.destroy();
    } catch (error: any) {
      logger.warning('Could not load payer_code from database', {
        message: error.message,
      });
    }

    if (payerCode) {
      logger.info(`Using latest order reference as payer_code: ${payerCode}`);
    }
  }

  if (!payerCode) {
    logger.warning(
      'No payer_code provided and no orders found — skipping initiate test. Usage: npm run urubuto:smoke-test P123456',
    );
    return;
  }

  if (!config.apiKey || !config.merchantCode || !config.serviceCode) {
    logger.error('Missing UrubutoPay API credentials — skipping initiate test');
    return;
  }

  const hostedCheckoutUrl = urubutoService.getHostedCheckoutUrl(payerCode);
  logger.info('Hosted checkout URL', { hostedCheckoutUrl });

  const initiateResult = await urubutoService.initiatePayment({
    amount: 5,
    currency: KpayCurrency.RWF,
    customerName: 'Peekaboo Smoke Test',
    customerPhone: '250780000000',
    refId: randomUUID() as UUID,
    payerCode,
    channelName: 'MOMO',
  });

  if (initiateResult.success) {
    logger.success('Initiate payment OK', {
      transactionId: initiateResult.data?.transactionId,
      paymentUrl: initiateResult.data?.paymentUrl,
      status: initiateResult.data?.status,
      message: initiateResult.data?.message,
    });

    if (initiateResult.data?.transactionId) {
      const statusResult = await urubutoService.verifyTransactionStatus(
        initiateResult.data.transactionId,
      );
      logger.info('Transaction status lookup', statusResult);
    }
  } else {
    logger.error('Initiate payment failed', initiateResult.error);
  }
}

main().catch((error) => {
  logger.error('UrubutoPay smoke test crashed', error);
  process.exit(1);
});
