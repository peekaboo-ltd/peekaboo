// Payment providers. URUBUTO and KPAY are retired; the members stay so
// historical rows in the varchar provider column keep mapping to the enum.
export enum PaymentProvider {
  MVEND = 'MVEND',
  PAYPACK = 'PAYPACK',
  URUBUTO = 'URUBUTO',
  KPAY = 'KPAY',
}

// Mobile-money rails offered to payers. Both MVend and Paypack debit an MNO
// wallet from the payer's MSISDN and infer the network, so these are UX
// labels that map to the same provider call.
export enum PaymentChannel {
  MOMO = 'MOMO',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
}
