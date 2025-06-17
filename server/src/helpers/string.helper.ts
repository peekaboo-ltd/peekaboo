import { COUNTRIES } from "../constants/countries.constants";
import { ValidationError } from "./errors.helper";

// FORMAT PHONE NUMBER
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: string = "RW"
) => {
  const formattedPhoneNumber = phoneNumber.replace(/\D/g, "");
  const country = COUNTRIES.find((c) => c?.code === countryCode);

  if (!country) {
    throw new ValidationError(
      "Invalid country code. Could not format phone number"
    );
  }

  const countryDialCode = country?.dial_code?.replace("+", "");

  if (formattedPhoneNumber?.startsWith("0") && country?.code === "RW") {
    return `${countryDialCode}${formattedPhoneNumber?.slice(1)}`;
  }

  return `${countryDialCode}${formattedPhoneNumber}`;
};

// GENERATE REFERENCE NUMBER
export const generateReferenceNumber = ({
  prefix = "REF",
  length = 6,
}: {
  prefix?: string;
  length?: number;
}): string => {
  const digits = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  return `${prefix}-${digits}`;
};
