import { PageLoader } from "@atoms/page-loader";
import { DocumentBar } from "@components/document-bar";
import { ROUTES, getRoute } from "@features/routes";
import { useServiceItem } from "@features/service/hooks/use-service-items";
import { Page } from "@views/client/_layout/page";
import { useParams } from "react-router-dom";
import { ServiceItemsDetailsPage } from "../components/service-items-details";

export const ServiceItemsViewPage = (_props: { readonly?: boolean }) => {
  const { id } = useParams();
  const { service_item: item, isPending } = useServiceItem(id || "");

  if (!item)
    return (
      <div className="flex justify-center items-center h-full w-full dark:bg-slate-990 bg-white">
        <PageLoader />
      </div>
    );

  return (
    <Page
      title={[
        { label: "Service", to: getRoute(ROUTES.ServiceItems) },
        { label: item.title || "" },
      ]}
      bar={
        <DocumentBar
          loading={isPending && !item}
          entity={"stock_items"}
          document={item || { id }}
          mode={"read"}
          backRoute={ROUTES.ServiceItems}
          editRoute={ROUTES.ServiceItemsEdit}
          prefix={<></>}
          suffix={<></>}
        />
      }
    >
      <ServiceItemsDetailsPage readonly={true} id={id || ""} />
    </Page>
  );
};
