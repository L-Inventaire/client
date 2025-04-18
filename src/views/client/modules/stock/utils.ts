import { Invoices } from "@features/invoices/types/types";
import { getTvaValue } from "../invoices/utils";

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
        (itemsPrice + itemsPrice * getTvaValue(item.tva || "")) *
        (parseFloat(item.discount.value as any) / 100);
    } else if (item.discount?.mode === "amount") {
      itemsDiscount = parseFloat(item.discount.value as any);
    }
    initial += itemsPrice;
    discount += itemsDiscount;
    taxes += itemsPrice * getTvaValue(item.tva || "");
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
