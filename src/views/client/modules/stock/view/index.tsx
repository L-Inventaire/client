import { DocumentBar } from "@components/document-bar";
import { PageLoader } from "@components/page-loader";
import { ROUTES, getRoute } from "@features/routes";
import { useStockItem } from "@features/stock/hooks/use-stock-items";
import { Page } from "@views/client/_layout/page";
import { useParams } from "react-router-dom";
import { StockItemsDetailsPage } from "../components/stock-item-details";
import { StockItemStatus } from "../components/stock-item-status";

export const StockItemsViewPage = ({ readonly }: { readonly?: boolean }) => {
  const { id } = useParams();
  const { stock_item: item, isPending, update } = useStockItem(id || "");

  if (!item)
    return (
      <div className="flex justify-center items-center h-full w-full dark:bg-wood-990 bg-white">
        <PageLoader />
      </div>
    );

  return (
    <Page
      title={[
        { label: "StockItems", to: getRoute(ROUTES.Stock) },
        { label: item.serial_number || "" },
      ]}
      bar={
        <DocumentBar
          loading={isPending && !item}
          document={item || { id }}
          mode={"read"}
          backRoute={ROUTES.Stock}
          editRoute={ROUTES.StockEdit}
          prefix={
            <>
              <StockItemStatus value={item.state} readonly size="lg" />
            </>
          }
          suffix={<></>}
        />
      }
    >
      <StockItemsDetailsPage readonly={true} id={id || ""} />
    </Page>
  );
};
