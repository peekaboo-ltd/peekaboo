export interface OrderFormData {
  senderPhone: string;
  recipientPhone: string;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  distance: number;
  initialFee: number;
  distanceFee: number;
  finalFee: number;
  selectedRider: string | null;
}

export interface FormContextType {
  formData: OrderFormData;
  setFormData: (data: OrderFormData | ((prev: OrderFormData) => OrderFormData)) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isLoading: boolean;
  paymentPhone: string;
  setPaymentPhone: (phone: string) => void;
}

export interface StepProps {
  formData: OrderFormData;
  setFormData: (data: OrderFormData | ((prev: OrderFormData) => OrderFormData)) => void;
  errors: Record<string, string>;
  paymentPhone?: string;
  setPaymentPhone?: (phone: string) => void;
  createdOrderId?: string | null;
}
