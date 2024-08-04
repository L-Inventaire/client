import { Button } from "@atoms/button/button";
import { Base, Info } from "@atoms/text";
import { RestTable } from "@components/table-rest";
import { useAccountingTransactions } from "@features/accounting/hooks/use-accounting-transactions";
import { AccountingTransactions } from "@features/accounting/types/types";
import { ROUTES, getRoute } from "@features/routes";
import { useNavigateAlt } from "@features/utils/navigate";
import {
  RestOptions,
  useRestSchema,
} from "@features/utils/rest/hooks/use-rest";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Page } from "@views/client/_layout/page";
import { useState } from "react";
import { SearchBar } from "../../../../components/search-bar";
import { schemaToSearchFields } from "../../../../components/search-bar/utils/utils";

export const AccountingPage = () => {
  const [options, setOptions] = useState<RestOptions<AccountingTransactions>>({
    limit: 10,
    offset: 0,
    query: [],
  });
  const { accounting_transactions } = useAccountingTransactions({
    ...options,
    query: [...((options?.query as any) || [])],
  });

  const schema = useRestSchema("accounting_transactions");
  const navigate = useNavigateAlt();

  return (
    <Page
      title={[{ label: "Accounting" }]}
      bar={
        <SearchBar
          schema={{
            table: "Accounting",
            fields: schemaToSearchFields(schema.data, {}),
          }}
          onChange={(q) =>
            q.valid && setOptions({ ...options, query: q.fields })
          }
          suffix={
            <>
              <Button
                size="sm"
                onClick={() =>
                  navigate(getRoute(ROUTES.AccountingEdit, { id: "new" }))
                }
                icon={(p) => <PlusIcon {...p} />}
              >
                Ajouter
              </Button>
            </>
          }
        />
      }
    >
      <div className="-m-3">
        <div className="px-3 h-7 w-full bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <Info>
            {accounting_transactions?.data?.total || 0} documents trouvés
          </Info>
        </div>
        <RestTable
          entity="accounting_transactions"
          onClick={({ id }, event) =>
            navigate(getRoute(ROUTES.AccountingView, { id }), { event })
          }
          data={accounting_transactions}
          showPagination="full"
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
              render: (item) => (
                <Base className="opacity-50 whitespace-nowrap">
                  {item.reference}
                </Base>
              ),
            },
            {
              render: () => <></>,
            },
            {
              thClassName: "w-1",
              cellClassName: "justify-end",
              render: () => <></>,
            },
            {
              thClassName: "w-1",
              cellClassName: "justify-end",
              render: () => <></>,
            },
          ]}
        />
      </div>
    </Page>
  );
};
