import { Button } from "@atoms/button/button";
import { Title } from "@atoms/text";
import { Articles } from "@features/articles/types/types";
import { ROUTES, getRoute } from "@features/routes";
import { useDraftRest } from "@features/utils/rest/hooks/use-draft-rest";
import { Page } from "@views/client/_layout/page";
import { useNavigate, useParams } from "react-router-dom";
import { ArticlesDetailsPage } from "../components/article-details";
import { PageLoader } from "@components/page-loader";

export const ArticlesEditPage = ({ readonly }: { readonly?: boolean }) => {
  let { id } = useParams();
  id = id === "new" ? "" : id || "";
  const navigate = useNavigate();

  const {
    draft: article,
    save,
    isPending,
    isInitiating,
  } = useDraftRest<Articles>("articles", id || "new", async (item) => {
    navigate(getRoute(ROUTES.ProductsView, { id: item.id }));
  });

  if (isInitiating) return <PageLoader />;

  return (
    <Page
      title={[
        { label: "Articles", to: getRoute(ROUTES.Products) },
        { label: id ? "Modifier" : "Créer" },
      ]}
    >
      {article && (
        <>
          <div className="float-right space-x-2">
            <Button
              theme="outlined"
              onClick={async () =>
                navigate(
                  !id
                    ? getRoute(ROUTES.Products)
                    : getRoute(ROUTES.ProductsView, { id })
                )
              }
            >
              Annuler
            </Button>
            <Button
              disabled={!article.name}
              loading={isPending}
              onClick={async () => await save()}
            >
              Sauvegarder
            </Button>
          </div>
          {!id && <Title>Création de {article.name || "<nouveau>"}</Title>}
          {id && <Title>Modification de {article.name || ""}</Title>}
        </>
      )}
      <div className="mt-4" />
      <ArticlesDetailsPage readonly={false} id={id} />
    </Page>
  );
};
