import { buildQueryFromMap } from "@components/search-bar/utils/utils";
import { useContacts } from "@features/contacts/hooks/use-contacts";
import { InvoicesColumns } from "@features/invoices/configuration";
import { Invoices } from "@features/invoices/types/types";
import { useStatistics } from "@features/statistics/hooks";
import { formatAmount } from "@features/utils/format/strings";
import { Table } from "@molecules/table";
import { Column } from "@molecules/table/table";
import { TableCell, TableCellValue } from "@molecules/table/table-cell";
import { TableRow } from "@molecules/table/table-row";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { prettyContactName } from "../contacts/utils";
import { getRoute, ROUTES } from "@features/routes";

export const ClientBalancePage = () => {
  const { client: clientId } = useParams();

  const statistics = useStatistics(clientId, "year");
  const data = statistics.clientBalanceTable;
  const tableData = Object.values(data).flatMap((item) => item);
  const clientsIDs = _.uniq(tableData.map((item) => item.client));
  const clientsData = useContacts({
    query: buildQueryFromMap({ id: clientsIDs }),
  });
  const clients = clientsData.contacts.data?.list ?? [];

  const columns: Column<Invoices>[] = [
    {
      title: "Client",
      id: "client",
      render: (__) => {
        return <></>;
      },
    },
    ...InvoicesColumns.filter((col) =>
      ["emit_date", "reference"].includes(col?.id ?? "")
    ),
    {
      title: "1-30 jours",
      id: "0",
      render: (invoice) => {
        const invoices = data[0];
        const found = invoices?.find((inv) => inv.id === invoice.id)?.total;
        if (!found) return <></>;

        return formatAmount(found?.total_with_taxes);
      },
    },
    {
      title: "31-60 jours",
      id: "30",
      render: (invoice) => {
        const invoices = data[30];
        const found = invoices?.find((inv) => inv.id === invoice.id)?.total;
        if (!found) return <></>;

        return formatAmount(found?.total_with_taxes);
      },
    },
    {
      title: "61-90 jours",
      id: "60",
      render: (invoice) => {
        const invoices = data[60];
        const found = invoices?.find((inv) => inv.id === invoice.id)?.total;
        if (!found) return <></>;

        return formatAmount(found?.total_with_taxes);
      },
    },
    {
      title: "91-120 jours",
      id: "90",
      render: (invoice) => {
        const invoices = data[90];
        const found = invoices?.find((inv) => inv.id === invoice.id)?.total;
        if (!found) return <></>;

        return formatAmount(found?.total_with_taxes);
      },
    },
    {
      title: ">120",
      id: ">120",
      render: (invoice) => {
        // Pick invoices with more than 120 days of payment delay
        const invoicesData = _.pickBy(
          data,
          (_, key) => !["0", "30", "60", "90"].includes(key)
        ) as { [key: string]: Invoices[] };

        const found = (Object.values(invoicesData) || [])
          .flat()
          .find((inv) => inv.id === invoice.id);

        if (!found || !found?.total) return <></>;

        return formatAmount(found.total?.total_with_taxes);
      },
    },
  ];

  const navigate = useNavigate();

  return (
    <>
      <Table
        border
        data={tableData}
        columns={columns}
        groupBy={(invoice) => {
          return invoice.client;
        }}
        groupByRenderBlank
        groupByClosable
        onClick={(invoice) => {
          navigate(getRoute(ROUTES.InvoicesView, { id: invoice.id }));
        }}
        groupByRender={(invoice, i, renderClosable, toggleGroup) => {
          const foundClient = clients.find(
            (client) => client.id === invoice.client
          );

          return (
            <>
              <TableRow
                data={data}
                className=""
                onClick={() => toggleGroup?.()}
              >
                {renderClosable?.()}
                <TableCellValue<Invoices>
                  key={i}
                  i={i}
                  j={0}
                  data={tableData}
                  row={invoice}
                  cell={{
                    title: "Client",
                    id: "client",
                    render: (__: any) => {
                      if (!foundClient) return <>Autres</>;
                      return prettyContactName(foundClient);
                    },
                  }}
                  columns={columns}
                />
                {columns
                  .filter((a) => !a.hidden)
                  .filter(
                    (a) =>
                      ![
                        "client",
                        "emit_date",
                        "reference",
                        "closable",
                        "0",
                        "30",
                        "60",
                        "90",
                        ">120",
                      ].includes(a.id ?? "")
                  )
                  .map((column, j) => (
                    <TableCell
                      odd={!!(i % 2)}
                      last={j === columns.length - 1}
                      key={j}
                    >
                      {column.render(invoice, { responsive: false })}
                    </TableCell>
                  ))}
                <TableCell odd={!!(i % 2)}></TableCell>
                <TableCell odd={!!(i % 2)}></TableCell>
                {columns
                  .filter((a) => !a.hidden)
                  .filter((a) =>
                    ["0", "30", "60", "90", ">120"].includes(a.id ?? "")
                  )
                  .map((column, j) => (
                    <TableCell
                      odd={!!(i % 2)}
                      last={j === columns.length - 1}
                      key={j}
                    >
                      {formatAmount(
                        (data[column.id ?? "0"] ?? [])
                          .filter(
                            (invoices) => invoices.client === foundClient?.id
                          )
                          .reduce((acc, inv) => {
                            return acc + (inv.total?.total_with_taxes ?? 0);
                          }, 0)
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            </>
          );
        }}
      />
    </>
  );
};
