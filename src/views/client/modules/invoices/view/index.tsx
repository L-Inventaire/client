import { Button } from "@atoms/button/button";
import { PageLoader } from "@atoms/page-loader";
import { DocumentBar } from "@components/document-bar";
import { withModel } from "@components/search-bar/utils/as-model";
import { useInvoice } from "@features/invoices/hooks/use-invoices";
import { getDocumentNamePlurial } from "@features/invoices/utils";
import { ROUTES, getRoute } from "@features/routes";
import { Page } from "@views/client/_layout/page";
import { useParams } from "react-router-dom";
import { InvoicesDetailsPage } from "../components/invoices-details";
import { getPdfPreview } from "../components/invoices-preview/invoices-preview";

export const InvoicesViewPage = (_props: { readonly?: boolean }) => {
  const { id } = useParams();
  const { invoice, isPending } = useInvoice(id || "");

  if (!invoice)
    return (
      <div className="flex justify-center items-center h-full w-full dark:bg-wood-990 bg-white">
        <PageLoader />
      </div>
    );

  return (
    <Page
      title={[
        {
          label: getDocumentNamePlurial(invoice.type),
          to: getRoute(ROUTES.Invoices, { type: invoice.type }),
        },
        { label: invoice.reference || "" },
      ]}
      bar={
        <DocumentBar
          loading={isPending && !invoice}
          entity={"invoices"}
          document={invoice || { id }}
          mode={"read"}
          backRoute={getRoute(ROUTES.Invoices, { type: invoice.type })}
          editRoute={ROUTES.InvoicesEdit}
          onPrint={async () => getPdfPreview()}
          suffix={
            <>
              {invoice.type === "quotes" && (
                <>
                  <Button
                    theme="outlined"
                    size="sm"
                    shortcut={["c"]}
                    to={withModel(
                      getRoute(ROUTES.InvoicesEdit, { id: "new" }),
                      {
                        ...invoice,
                        type: "supplier_quotes",
                        state: "draft",
                        id: "",
                      }
                    )}
                  >
                    Créer une commande
                  </Button>
                  <Button
                    size="sm"
                    shortcut={["f"]}
                    to={withModel(
                      getRoute(ROUTES.InvoicesEdit, { id: "new" }),
                      {
                        ...invoice,
                        type: "invoices",
                        state: "draft",
                        id: "",
                      }
                    )}
                  >
                    Facturer
                  </Button>
                </>
              )}
              {invoice.type === "invoices" && (
                <Button
                  size="sm"
                  theme="outlined"
                  shortcut={["shift+a"]}
                  to={withModel(getRoute(ROUTES.InvoicesEdit, { id: "new" }), {
                    ...invoice,
                    type: "credit_notes",
                    state: "draft",
                    id: "",
                  })}
                >
                  Créer un avoir
                </Button>
              )}
            </>
          }
        />
      }
    >
      <InvoicesDetailsPage readonly={true} id={id || ""} />
    </Page>
  );
};
