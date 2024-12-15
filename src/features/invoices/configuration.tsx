import { Base, BaseSmall, Info } from "@atoms/text";
import { TagsInput } from "@components/input-rest/tags";
import { UsersInput } from "@components/input-rest/users";
import { useCurrentClient } from "@features/clients/state/use-clients";
import { registerCtrlKRestEntity } from "@features/ctrlk";
import { ROUTES } from "@features/routes";
import { formatTime } from "@features/utils/format/dates";
import { formatAmount } from "@features/utils/format/strings";
import { Column } from "@molecules/table/table";
import { Badge } from "@radix-ui/themes";
import { ContactRestDocument } from "@views/client/modules/contacts/components/contact-input-rest-card";
import { CompletionTags } from "@views/client/modules/invoices/components/invoice-lines-input/components/completion-tags";
import { InvoiceRestDocument } from "@views/client/modules/invoices/components/invoice-lines-input/invoice-input-rest-card";
import { InvoiceStatus } from "@views/client/modules/invoices/components/invoice-status";
import { InvoicesDetailsPage } from "@views/client/modules/invoices/components/invoices-details";
import { TagPaymentCompletion } from "@views/client/modules/invoices/components/tag-payment-completion";
import {
  computePricesFromInvoice,
  isDeliveryLate,
  isPaymentLate,
} from "@views/client/modules/invoices/utils";
import { Invoices } from "./types/types";
import { format } from "date-fns";
import _ from "lodash";
import { Tag } from "@atoms/badge/tag";
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { frequencyOptions } from "@views/client/modules/articles/components/article-details";

export const useInvoiceDefaultModel: () => Partial<Invoices> = () => {
  const { client } = useCurrentClient();

  return {
    type: "quotes",
    state: "draft",
    language: client!.preferences?.language || "fr",
    currency: client!.preferences?.currency || "EUR",
    format: client!.invoices,
    payment_information: client!.payment,
  };
};

export const InvoicesColumns: Column<Invoices>[] = [
  {
    title: "Date",
    id: "emit_date",
    thClassName: "w-16",
    render: (invoice) => {
      return (
        <Base className="whitespace-nowrap">
          {invoice.emit_date
            ? formatTime(invoice.emit_date, { hideTime: true })
            : "-"}
        </Base>
      );
    },
  },
  {
    title: "Référence",
    id: "reference",
    render: (invoice) => (
      <Base className="whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
        <BaseSmall>
          {invoice.reference}{" "}
          {!!invoice.from_subscription?.from && (
            <span>
              {" "}
              • Du {format(
                invoice.from_subscription.from,
                "yyyy-MM-dd"
              )} au {format(invoice.from_subscription.to, "yyyy-MM-dd")}
            </span>
          )}
        </BaseSmall>
        <br />
        <div className="opacity-50 text-ellipsis overflow-hidden w-full">
          {[invoice.name, invoice.content?.map((a) => a.name).join(", ")]
            .filter(Boolean)
            .join(" • ")}
        </div>
      </Base>
    ),
  },
  {
    title: "Origine",
    id: "origin",
    render: (invoice) => (
      <Base className="whitespace-nowrap">
        <InvoiceRestDocument
          className="overflow-hidden"
          disabled
          value={invoice.from_rel_quote || invoice.from_rel_invoice}
        />
      </Base>
    ),
  },
  {
    title: "Client",
    id: "client",
    render: (invoice) => (
      <Base className="whitespace-nowrap">
        <ContactRestDocument disabled value={invoice.client} />
      </Base>
    ),
  },
  {
    title: "Fournisseur",
    id: "supplier",
    render: (invoice) => (
      <Base className="whitespace-nowrap">
        <ContactRestDocument disabled value={invoice.supplier} />
      </Base>
    ),
  },
  {
    title: "Étiquettes",
    thClassName: "w-1",
    cellClassName: "justify-end",
    headClassName: "justify-end",
    render: (invoice) => (
      <Base className="whitespace-nowrap space-x-2 flex flex-row items-center">
        <TagsInput size="md" value={invoice.tags} disabled />
        <UsersInput size="md" value={invoice.assigned} disabled />
        {["quotes"].includes(invoice.type) &&
          invoice.state === "purchase_order" &&
          isDeliveryLate(invoice) && (
            <Badge size="2" color={"red"}>
              Livraison en retard
            </Badge>
          )}
        {["invoices", "supplier_invoices"].includes(invoice.type) &&
          invoice.wait_for_completion_since &&
          invoice.state === "purchase_order" &&
          isPaymentLate(invoice) && (
            <Badge size="2" color={"red"}>
              Paiement en retard
            </Badge>
          )}
        {(invoice.type === "quotes" || invoice.type === "supplier_quotes") && (
          <CompletionTags invoice={invoice} size="sm" lines={invoice.content} />
        )}
        {invoice.type === "invoices" && (
          <TagPaymentCompletion invoice={invoice} />
        )}
      </Base>
    ),
  },
  {
    title: "Montant",
    thClassName: "w-1",
    cellClassName: "justify-end",
    headClassName: "justify-end",
    render: (invoice) => {
      return invoice.content?.some((a) => a.subscription) ? (
        <Base className="text-right whitespace-nowrap space-y-1 my-2">
          {Object.entries(
            _.groupBy(
              invoice.content?.filter((a) => a.article),
              "subscription"
            )
          ).map(([key, value]) => {
            const computed = computePricesFromInvoice({
              content: value,
              discount:
                invoice.discount?.mode === "percentage"
                  ? invoice.discount
                  : { mode: "percentage", value: 0 },
            });
            return (
              <div>
                <Tag
                  color="blue"
                  size={"xs"}
                  icon={
                    !!key ? (
                      <ArrowPathIcon
                        className={`w-3 h-3 mr-1 shrink-0 text-blue-500`}
                      />
                    ) : undefined
                  }
                >
                  {formatAmount(computed?.total_with_taxes || 0)}{" "}
                  <Info>({formatAmount(computed?.total || 0)} HT)</Info>{" "}
                  {frequencyOptions.find((a) => a.value === key)?.per_label ||
                    key}
                </Tag>
              </div>
            );
          })}
        </Base>
      ) : (
        <Base className="text-right whitespace-nowrap">
          {formatAmount(invoice.total?.total_with_taxes || 0)}
          <br />
          <Info>{formatAmount(invoice.total?.total || 0)} HT</Info>
        </Base>
      );
    },
  },
  {
    title: "Statut",
    thClassName: "w-1",
    cellClassName: "justify-end",
    headClassName: "justify-end",
    render: (invoice) => (
      <InvoiceStatus
        size="sm"
        readonly
        value={invoice.state}
        type={invoice.type}
      />
    ),
  },
];

registerCtrlKRestEntity<Invoices>("invoices", {
  renderEditor: (props) => (
    <InvoicesDetailsPage readonly={false} id={props.id} />
  ),
  renderResult: InvoicesColumns,
  useDefaultData: useInvoiceDefaultModel,
  viewRoute: ROUTES.InvoicesView,
  orderBy: "state_order,emit_date",
  orderDesc: true,
  groupBy: "state",
  groupByRender: (row) => (
    <div className="mt-px">
      <InvoiceStatus size="xs" readonly value={row.state} type={row.type} />
    </div>
  ),
});
