import { Button } from "@atoms/button/button";
import Tabs from "@atoms/tabs";
import { Base, Info } from "@atoms/text";
import { FormInput } from "@components/form/fields";
import { withSearchAsModel } from "@components/search-bar/utils/as-model";
import { Table } from "@components/table";
import { TagsInput } from "@components/tags-input";
import { useInvoices } from "@features/invoices/hooks/use-invoices";
import { Invoices } from "@features/invoices/types/types";
import { ROUTES, getRoute } from "@features/routes";
import { invoicesAlikeStatus } from "@features/utils/constants";
import {
  RestOptions,
  useRestSchema,
} from "@features/utils/rest/hooks/use-rest";
import { ArrowUturnLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Page } from "@views/client/_layout/page";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../../../components/search-bar";
import { schemaToSearchFields } from "../../../../components/search-bar/utils/utils";
import { useNavigateAlt } from "@features/utils/navigate";
import { formatAmount } from "@features/utils/format/strings";
import { Tag } from "@atoms/badge/tag";

export const InvoicesPage = () => {
  const [type, setType] = useState(
    new URLSearchParams(document.location.search).get("type") || ""
  );
  const [state, setState] = useState([]);
  const [options, setOptions] = useState<RestOptions<Invoices>>({
    limit: 10,
    offset: 0,
    query: [],
  });
  const { invoices } = useInvoices({
    ...options,
    // TODO maybe create a util function for that
    query: [
      ...((options?.query as any) || []),
      ...(type
        ? [
            {
              key: "type",
              values: [{ op: "equals", value: type }],
            },
          ]
        : []),
      ...(state.length
        ? [
            {
              key: "state",
              values: state.map((s) => ({ op: "equals", value: s })),
            },
          ]
        : []),
    ],
  });

  const schema = useRestSchema("invoices");
  const navigate = useNavigateAlt();

  useEffect(() => {
    setState([]);
  }, [type]);

  return (
    <Page
      title={[{ label: "Invoices" }]}
      bar={
        <SearchBar
          schema={{
            table: "invoices",
            fields: schemaToSearchFields(schema.data, {
              tags: {
                label: "Étiquettes",
                keywords: "tags étiquettes label",
              },
              updated_at: "Date de mise à jour",
              updated_by: {
                label: "Mis à jour par",
                keywords: "updated_by mis à jour par auteur utilisateur user",
              },
              type: {
                label: "Type",
                keywords: "type devis avoirs factures",
              },
            }),
          }}
          onChange={(q) =>
            q.valid && setOptions({ ...options, query: q.fields })
          }
          suffix={
            <>
              <Button
                size="xs"
                theme="outlined"
                to={withSearchAsModel(
                  getRoute(ROUTES.InvoicesEdit, { id: "new" }),
                  schema.data,
                  { type: "credit_notes" }
                )}
                icon={(p) => <ArrowUturnLeftIcon {...p} />}
              >
                Avoir
              </Button>
              <Button
                size="xs"
                to={withSearchAsModel(
                  getRoute(ROUTES.InvoicesEdit, { id: "new" }),
                  schema.data,
                  { type: "quotes" }
                )}
                icon={(p) => <PlusIcon {...p} />}
              >
                Devis
              </Button>
              <Button
                size="xs"
                to={withSearchAsModel(
                  getRoute(ROUTES.InvoicesEdit, { id: "new" }),
                  schema.data,
                  { type: "invoices" }
                )}
                icon={(p) => <PlusIcon {...p} />}
              >
                Facture
              </Button>
            </>
          }
        />
      }
    >
      <div className="-m-3">
        <div className="px-3 h-7 w-full bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <Info>{invoices?.data?.total || 0} documents trouvés</Info>
        </div>
        <Table
          onClick={({ id }, event) =>
            navigate(getRoute(ROUTES.InvoicesView, { id }), { event })
          }
          loading={invoices.isPending}
          data={invoices?.data?.list || []}
          total={invoices?.data?.total || 0}
          showPagination="simple"
          rowIndex="id"
          onSelect={(items) => false && console.log(items)}
          onRequestData={async (page) => {
            setOptions({
              ...options,
              limit: page.perPage,
              offset: (page.page - 1) * page.perPage,
              asc: page.order === "ASC",
            });
          }}
          columns={[
            {
              thClassName: "w-1",
              render: (invoice) => (
                <Base className="opacity-50 whitespace-nowrap">
                  {invoice.reference}
                </Base>
              ),
            },
            {
              render: (invoice) => invoice.name,
            },
            {
              thClassName: "w-1",
              cellClassName: "justify-end",
              render: (invoice) => (
                <TagsInput value={invoice.tags} disabled hideEmpty />
              ),
            },
            {
              thClassName: "w-1",
              cellClassName: "justify-end",
              render: (invoice) => (
                <Button size="xs" theme="outlined">
                  {formatAmount(invoice.total?.total || 0)} HT
                </Button>
              ),
            },
            {
              thClassName: "w-1",
              cellClassName: "justify-end",
              render: (invoice) => (
                <Button size="xs" theme="outlined">
                  {formatAmount(invoice.total?.total_with_taxes || 0)} TTC
                </Button>
              ),
            },
            {
              thClassName: "w-1",
              cellClassName: "justify-end",
              render: (invoice) => (
                <>
                  {invoice.state === "draft" && (
                    <Tag size="sm" color="gray">
                      Brouillon
                    </Tag>
                  )}
                  {invoice.state === "paid" && (
                    <Tag size="sm" color="green">
                      Payée
                    </Tag>
                  )}
                  {invoice.state === "accepted" && (
                    <Tag size="sm" color="green">
                      Acceptée
                    </Tag>
                  )}
                </>
              ),
            },
          ]}
        />
      </div>
    </Page>
  );
};
