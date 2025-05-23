import { Invoices } from "@features/invoices/types/types";

const computePaymentCompletion = (invoice: Invoices, total: number) => {
  if (!invoice.total?.total_with_taxes) return 0;
  return total / invoice.total?.total_with_taxes;
};

const renderPaymentCompletion = (
  invoice: Invoices,
  total: number
): [number, string] => {
  const value = computePaymentCompletion(invoice, total);
  const color =
    value < 0.5 ? "red" : Math.round(value * 100) < 100 ? "orange" : "green";
  return [Math.round(value * 100), color];
};

export const usePaymentCompletion = (invoice: Invoices) => {
  const paymentCompletion = renderPaymentCompletion(
    invoice,
    invoice?.transactions?.total || 0
  );
  return { value: paymentCompletion[0], color: paymentCompletion[1] };
};
