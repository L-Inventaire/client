export type Statistics = {
  totalRevenue: number;
  revenue: number;
  revenueStats: {
    date: string;
    net_amount: number;
  }[];
  totalRevenueTable: {
    sum: number;
    year: string;
    month: string;
    tag: string[];
  }[];
  expenses: number;
  totalExpenses: number | null;
  benefits: number | null;
  totalBenefits: number | null;
  stockEntries: number | null;
  totalStockEntries: number | null;
  stockExits: number | null;
  totalStockExits: number | null;
  signedQuotes: number | null;
  totalSignedQuotes: number | null;
  sentQuotes: number | null;
  totalSentQuotes: number | null;
  paidInvoices: number | null;
  totalPaidInvoices: number | null;
  sentInvoices: number | null;
  totalSentInvoices: number | null;
  sentPurchaseOrders: number | null;
  totalSentPurchaseOrders: number | null;
  almostLateDeliveries: string[] | null;
  almostLatePayments: string[] | null;
  almostLatePaymentsNoDelay: string[] | null;
  almostLatePayments30Delay: string[] | null;
  almostLatePayments60Delay: string[] | null;
  almostLatePayments90Delay: string[] | null;
  almostLatePayments120Delay: string[] | null;
};
