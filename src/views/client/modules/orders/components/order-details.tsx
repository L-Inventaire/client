import { FormContext } from "@components/form/formcontext";
import { PageLoader } from "@components/page-loader";
import { Invoices } from "@features/invoices/types/types";
import { useReadDraftRest } from "@features/utils/rest/hooks/use-draft-rest";
import { PageColumns } from "@views/client/_layout/page";

export const OrdersDetailsPage = ({
  readonly,
  id,
}: {
  readonly?: boolean;
  id: string;
}) => {
  const { isPending, draft } = useReadDraftRest<Invoices>(
    "orders",
    id || "new",
    readonly
  );

  if (isPending || (id && draft.id !== id)) return <PageLoader />;

  return (
    <>
      <FormContext readonly={readonly} alwaysVisible>
        <PageColumns>
          <div className="grow"></div>
          <div className="grow lg:max-w-xl"></div>
        </PageColumns>
      </FormContext>
    </>
  );
};
