import { DocumentBar } from "@components/document-bar";
import { ROUTES, getRoute } from "@features/routes";
import { Page } from "@views/client/_layout/page";
import { StockItemsCreateFromOrder } from "../components/stock-item-create-from-order";
import { useNavigate, useParams } from "react-router-dom";
import { StockItemsCreateFromSupplier } from "../components/stock-item-create-from-supplier";
import { StockItems } from "@features/stock/types/types";
import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { useStockItems } from "@features/stock/hooks/use-stock-items";
import toast from "react-hot-toast";

export const StockItemsFromPage = (_props: { readonly?: boolean }) => {
  const { from, id } = useParams();
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState<StockItems[]>([]);
  const { upsert } = useStockItems();
  const [loading, setLoading] = useState(false);
  return (
    <Page
      title={[
        { label: "Stock", to: getRoute(ROUTES.Stock) },
        { label: "Créer" },
      ]}
      bar={
        <DocumentBar
          entity={"stock_items"}
          document={{}}
          mode={"write"}
          backRoute={getRoute(ROUTES.StockEdit, { id: "new" })}
        />
      }
    >
      <div className="w-full max-w-4xl mx-auto space-y-6 mt-4">
        <div className={loading ? "opacity-50 pointer-events-none" : ""}>
          {from === "order" && (
            <StockItemsCreateFromOrder
              loading={loading}
              order={id!}
              onBack={() => navigate(getRoute(ROUTES.StockEdit, { id: "new" }))}
              onChange={setStockItems}
            />
          )}
          {from === "supplier" && (
            <StockItemsCreateFromSupplier
              loading={loading}
              supplier={id!}
              onBack={() => navigate(getRoute(ROUTES.StockEdit, { id: "new" }))}
              onChange={setStockItems}
            />
          )}
        </div>

        <Button
          loading={loading}
          className="float-right"
          disabled={!stockItems.length}
          onClick={async () => {
            setLoading(true);
            for (const item of stockItems) {
              await upsert.mutateAsync(item);
            }
            toast.success("Les éléments ont été ajoutés dans le stock");
            setLoading(false);
            if (from === "order") {
              navigate(getRoute(ROUTES.Invoices, { type: "supplier_quotes" }));
            } else {
              navigate(getRoute(ROUTES.Stock));
            }
          }}
        >
          Ajouter {stockItems.length} éléments dans le stock
        </Button>
      </div>
    </Page>
  );
};
