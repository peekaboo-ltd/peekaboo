import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { emailStyles } from '../components/styles';
import { InvoiceGeneratedEmailData } from '../../types/email.types';

export const InvoiceGeneratedEmail = ({
  organizationName,
  invoiceNumber,
  periodStart,
  periodEnd,
  totalAmount,
  currency,
  totalOrders,
  tierBreakdown,
}: InvoiceGeneratedEmailData) => {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <EmailLayout preview={`Invoice ${invoiceNumber} generated for ${organizationName}`}>
      <Text style={emailStyles.heading}>Invoice generated</Text>
      <Text style={emailStyles.text}>Hi,</Text>
      <Text style={emailStyles.text}>
        A new invoice has been generated for {organizationName}.
      </Text>
      <Section style={emailStyles.framedCard}>
        <Text style={emailStyles.detailRow}>
          Invoice number: {invoiceNumber}
        </Text>
        <Text style={emailStyles.detailRow}>
          Billing period: {formatDate(periodStart)} -{' '}
          {formatDate(periodEnd)}
        </Text>
        <Text style={emailStyles.detailRow}>
          Total orders: {totalOrders}
        </Text>
        <Text style={emailStyles.amountRow}>
          Total amount: {currency}{' '}
          {totalAmount?.toLocaleString()}
        </Text>
      </Section>
      {tierBreakdown && tierBreakdown.length > 0 && (
        <Section style={emailStyles.breakdownBox}>
          <Text style={emailStyles.breakdownHeading}>Cost breakdown</Text>
          <table style={emailStyles.table}>
            <thead>
              <tr>
                <th style={emailStyles.tableHeader}>Tier</th>
                <th style={emailStyles.tableHeader}>Deliveries</th>
                <th style={emailStyles.tableHeaderRight}>Unit price</th>
                <th style={emailStyles.tableHeaderRight}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {tierBreakdown.map((tier, index) => (
                <tr key={index} style={index % 2 === 1 ? emailStyles.tableRowEven : undefined}>
                  <td style={emailStyles.tableCell}>{tier.tierLabel}</td>
                  <td style={emailStyles.tableCell}>{tier.quantity}</td>
                  <td style={emailStyles.tableCellRight}>
                    {currency} {tier.unitPrice?.toLocaleString()}
                  </td>
                  <td style={emailStyles.tableCellRight}>
                    {currency} {tier.subtotal?.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={emailStyles.tableCellBold}>Total</td>
                <td style={emailStyles.tableCell}>{totalOrders}</td>
                <td style={emailStyles.tableCell}></td>
                <td style={{ ...emailStyles.tableCellRight, fontWeight: '500' }}>
                  {currency} {totalAmount?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      )}
      <Text style={emailStyles.text}>
        Please review the invoice and process the payment at your earliest
        convenience.
      </Text>
    </EmailLayout>
  );
};

export default InvoiceGeneratedEmail;
