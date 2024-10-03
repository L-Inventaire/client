import { Invoices } from "@features/invoices/types/types";
import { DateTime } from "luxon";

export const getTvaValue = (tva: string): number => {
  tva = tva || "";
  if (tva.match(/^[0-9.]+.*/)) {
    return parseFloat(tva) / 100;
  }
  return 0;
};

export const computePricesFromInvoice = (
  invoice: Invoices
): Invoices["total"] => {
  let initial = 0;
  let discount = 0;
  let taxes = 0;

  (invoice.content || []).forEach((item) => {
    const itemsPrice =
      (parseFloat(item.unit_price as any) || 0) *
      (parseFloat(item.quantity as any) || 0);
    let itemsDiscount = 0;
    if (item.discount?.mode === "percentage") {
      itemsDiscount =
        itemsPrice * (parseFloat(item.discount.value as any) / 100);
    } else if (item.discount?.mode === "amount") {
      itemsDiscount = parseFloat(item.discount.value as any);
    }
    initial += itemsPrice;
    discount += itemsDiscount;
    taxes += (itemsPrice - itemsDiscount) * getTvaValue(item.tva || "");
  });

  if (invoice.discount?.mode === "percentage") {
    discount +=
      (initial - discount) * (parseFloat(invoice.discount.value as any) / 100);
  } else if (invoice.discount?.mode === "amount") {
    discount += parseFloat(invoice.discount.value as any);
  }
  const total = initial - discount;
  const total_with_taxes = total + taxes;

  return {
    initial,
    discount,
    total,
    taxes,
    total_with_taxes,
  };
};

export const computeDeliveryDelayDate = (invoice: Invoices): DateTime => {
  const delayType = invoice?.delivery_date
    ? "delivery_date"
    : invoice?.delivery_delay
    ? "delivery_delay"
    : "no_delivery";

  let date = DateTime.fromMillis(invoice.signature_date ?? Date.now());

  if (delayType === "delivery_date") {
    date = DateTime.fromMillis(invoice.delivery_date ?? Date.now());
  }
  if (delayType === "delivery_delay") {
    date = date.plus({ days: invoice.delivery_delay });
  }

  return date;
};

export const isDeliveryLate = (invoice: Invoices): boolean => {
  return DateTime.now() > computeDeliveryDelayDate(invoice);
};

export const computePaymentDelayDate = (invoice: Invoices): DateTime => {
  const payment = invoice.payment_information;
  const delayType = payment?.delay_type ?? "direct";
  let date = DateTime.fromMillis(invoice.signature_date ?? Date.now());

  if (delayType === "direct") {
    date = date.plus({ days: payment.delay });
  }
  if (delayType === "month_end_delay_first") {
    date = date.plus({ days: payment.delay });
    date = date.endOf("month");
  }
  if (delayType === "month_end_delay_last") {
    date = date.endOf("month");
    date = date.plus({ days: payment.delay });
  }

  return date;
};

export const isPaymentLate = (invoice: Invoices): boolean => {
  return DateTime.now() > computePaymentDelayDate(invoice);
};
