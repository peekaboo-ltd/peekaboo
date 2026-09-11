// Generic payment status and currency values.
//
// Stored status codes ('01' / '02' / '03') predate the Paypack migration and
// are shared by historical Urubuto/KPay rows, so the values are frozen even
// though the enum no longer carries a provider name.
export enum PaymentStatus {
  PENDING = '03',
  SUCCESSFUL = '01',
  FAILED = '02',
}

export enum PaymentCurrency {
  RWF = 'RWF',
  USD = 'USD',
}
