import { useArticle } from "@features/articles/hooks/use-articles";
import { ROUTES, getRoute } from "@features/routes";
import { Page } from "@views/client/_layout/page";
import { useNavigate, useParams } from "react-router-dom";
import { ArticlesDetailsPage } from "../components/article-details";
import { Button } from "@atoms/button/button";
import { Title } from "@atoms/text";

export const ArticlesViewPage = ({ readonly }: { readonly?: boolean }) => {
  const { id } = useParams();
  const { article } = useArticle(id || "");
  const navigate = useNavigate();

  return (
    <Page
      title={[
        { label: "Articles", to: getRoute(ROUTES.Products) },
        { label: article?.name || "Article" },
      ]}
    >
      <div className="float-right space-x-2">
        <Button
          size="sm"
          onClick={async () => navigate(getRoute(ROUTES.ProductsEdit, { id }))}
        >
          Modifier
        </Button>
      </div>
      <Title>{article?.name || ""}</Title>
      <div className="mt-4" />
      <ArticlesDetailsPage readonly={true} id={id || ""} />
    </Page>
  );
};
