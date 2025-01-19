import { Address, Payment } from "@features/clients/types/clients";
import { RestEntity } from "@features/utils/rest/types/types";

export type InvoicesType =
  | "quotes"
  | "invoices"
  | "credit_notes"
  | "supplier_quotes"
  | "supplier_invoices"
  | "supplier_credit_notes";

export type InvoicesState =
  | "draft"
  | "sent"
  | "purchase_order"
  | "completed"
  | "recurring"
  | "closed";

export type Invoices = RestEntity & {
  client_id: string;
  id: string;

  assigned: string[];
  type: InvoicesType; // invoice, quote, credit_note

  // Quotes: “draft”, “sent”, "purchase_order", "completed", "recurring", "closed”
  // Invoices and Credit Notes: “draft”, “sent”, "closed"
  state: InvoicesState;

  // For credit notes or supplier credit note: invoices refunded by this credit note
  from_rel_invoice: string[]; // Nullable
  // For invoices or supplier invoice: quotes completed and transformed into this invoice
  from_rel_quote: string[]; // Nullable

  name: string;
  reference: string;
  alt_reference: string;

  supplier: string; // For supplier invoices/quotes/credit_notes
  client: string; // For client invoices/quotes/credit_notes

  contact: string; // Nullable, the person in the client we discuss with
  emit_date: number;
  language: string;
  currency: string;

  delivery_address: Address | null;
  delivery_date: number;
  delivery_delay: number;

  wait_for_completion_since: number | null;

  content?: InvoiceLine[];
  discount?: InvoiceDiscount;

  total?: InvoiceTotal; // Precomputed values (for search mainly, do not use for calculations preferably)

  // This is automatically generated from the content
  articles: {
    all: string[]; // List of all articles mentioned in the invoice
    accepted: string[]; // List of articles accepted by the client (in case of options)
  };

  // For partially paid invoices or credit notes, list of payments
  transactions: {
    percentage: number; // Between 0 and 100
    total: number; // This one is automatically generated from the transactions
    ids: string[]; // List of payments executed automatically generated from trigger
  };
  invoiced: {
    percentage: number; // Between 0 and 100
    ids: string[]; // List of invoices automatically generated from trigger
  };

  payment_information: Payment;
  format?: InvoiceFormat;

  recipients?: {
    email: string;
    role: "signer" | "viewer";
  }[];

  reminders?: InvoiceReminder;
  next_reminder?: number; // Automatically generated by the backend

  subscription?: InvoiceSubscription; // Available only for invoices
  has_subscription?: boolean; // Automatically generated from the content
  subscription_next_invoice_date?: number; // Automatically generated by the backend
  subscription_started_at?: number; // Automatically generated by the backend
  subscription_ends_at?: number; // Automatically generated by the backend
  from_subscription: {
    // Only the backend can set this field
    // When invoice was generated from a subscription, details goes there
    frequency: "daily" | "weekly" | "monthly" | "yearly" | string;
    from: number; // Invoiced period start
    to: number; // Invoiced period end
  };

  attachments: string[];

  notes: string;
  documents: string[];
  tags: string[];

  fields: any;
};

export type InvoiceTotal = {
  initial: number;
  discount: number;
  total: number;
  taxes: number;
  total_with_taxes: number;
};

export type InvoiceReminder = {
  enabled: boolean;
  repetition: number; // Number of weeks of repetitions
};

export type InvoiceSubscription = {
  invoice_date:
    | "first_day"
    | "first_workday"
    | "monday"
    | "last_workday"
    | "last_day";
  invoice_state: "draft" | "sent";
  start_type: "after_first_invoice" | "acceptance_start" | "date";
  start: number;
  end_type: "none" | "delay" | "date";
  end: number;
  end_delay?: "1y" | "2y" | "3y";
  renew_in_advance: number;
  renew_as: "draft" | "sent" | "closed";
};

export type InvoiceLine = {
  _id?: string;

  article?: string; // Nullable

  type: "product" | "service" | "consumable" | "separation" | "correction"; // product, service, consumable, separation
  name?: string;
  description?: string;

  reference?: string;
  unit?: string;
  quantity?: number;
  unit_price?: number;
  tva?: string;
  discount?: InvoiceDiscount;
  subscription?: "" | "daily" | "weekly" | "monthly" | "yearly" | string; // Monthly or yearly subscription
  subscription_duration?: number; // Number of months or years

  quantity_ready?: number; //Quantity received or sent to determine if the line is ready to be invoices
  quantity_delivered?: number; //Quantity delivered or received to determine if the line is ready to be invoices

  optional?: boolean;
  optional_checked?: boolean; // Checked by the client or by the agent (like a default checked option)
};

export type InvoiceDiscount = {
  mode: "percentage" | "amount" | null;
  value: number;
};

export type InvoiceFormat = {
  heading: string;
  footer: string;
  payment_terms: string;
  tva: string;

  branding: boolean;
  color: string;
  logo: string;
  footer_logo: string;
  template: string;

  attachments: string[];
};

export type PartialInvoiceOutType = {
  invoiced: Pick<Invoices, "content" | "discount" | "total">;
  partial_invoice: Pick<Invoices, "content" | "discount" | "type" | "total">;
  remaining: Pick<Invoices, "content" | "discount" | "total">;
};
