import { Base, Info } from "@atoms/text";
import { TagsInput } from "@components/input-rest/tags";
import { UsersInput } from "@components/input-rest/users";
import { registerCtrlKRestEntity } from "@features/ctrlk";
import { ROUTES } from "@features/routes";
import { formatAmount } from "@features/utils/format/strings";
import { RestFieldsNames } from "@features/utils/rest/configuration";
import { Column } from "@molecules/table/table";
import { Badge } from "@radix-ui/themes";
import {
  ArticlesDetailsPage,
  frequencyOptions,
} from "@views/client/modules/articles/components/article-details";
import { getArticleIcon } from "@views/client/modules/articles/components/article-icon";
import { getTvaValue } from "@views/client/modules/invoices/utils";
import { Articles } from "./types/types";
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { Tag } from "@atoms/badge/tag";

export const useArticleDefaultModel: () => Partial<Articles> = () => ({
  type: "product",
  unit: "unit",
  tva: "20",
});

export const ArticlesColumns: Column<Articles>[] = [
  {
    id: "type",
    title: "Type",
    thClassName: "w-1",
    cellClassName: "justify-start",
    render: (article) => (
      <Badge color="gray">
        {getArticleIcon(article?.type)({ className: "w-4 h-4" })}
        {article.type === "consumable" && "Consommable"}
        {article.type === "service" && "Service"}
        {article.type === "product" && "Stockable"}
      </Badge>
    ),
  },
  {
    title: "Nom",
    render: (article) => (
      <>
        {!!article.internal_reference && (
          <span className="font-mono mr-2 text-slate-800 dark:text-slate-500">
            {article.internal_reference}
          </span>
        )}
        {article.name}
      </>
    ),
  },
  {
    title: "Étiquettes",
    thClassName: "w-1",
    cellClassName: "justify-end whitespace-nowrap",
    headClassName: "justify-end",
    render: (article) => (
      <div className="space-x-2 items-center flex">
        {!!article.subscription && (
          <Tag
            color="blue"
            size={"sm"}
            icon={
              <ArrowPathIcon
                className={`w-3 h-3 mr-1 shrink-0 text-blue-500`}
              />
            }
          >
            {frequencyOptions.find((a) => a.value === article.subscription)
              ?.label || article.subscription}
          </Tag>
        )}
        <TagsInput size="md" value={article.tags} disabled />
        <UsersInput size="md" value={article.assigned} disabled />
      </div>
    ),
  },
  {
    title: "Prix d'achat",
    thClassName: "w-1",
    cellClassName: "justify-end",
    headClassName: "justify-end",
    render: (article) =>
      Object.values(article.suppliers_details || {})?.filter((a) => a.price)
        ?.length ? (
        <Base className="whitespace-nowrap text-right">
          {Object.values(article.suppliers_details || {})
            .filter((a) => a.price)
            .map((a) => formatAmount(a.price * (1 + getTvaValue(article.tva))))
            // Keep only min and max
            .sort()
            .filter((_, i, arr) => i === 0 || i === arr.length - 1)
            .join("-")}
          <br />
          <Info>
            {Object.values(article.suppliers_details || {})
              .filter((a) => a.price)
              .map((a) => formatAmount(a.price))
              // Keep only min and max
              .sort()
              .filter((_, i, arr) => i === 0 || i === arr.length - 1)
              .join("-")}{" "}
            HT
          </Info>
        </Base>
      ) : (
        ""
      ),
  },
  {
    title: "Prix de vente",
    thClassName: "w-1",
    cellClassName: "justify-end",
    headClassName: "justify-end",
    render: (article) => (
      <Base className="whitespace-nowrap text-right">
        {formatAmount(article.price * (1 + getTvaValue(article.tva)))}
        <br />
        <Info>{formatAmount(article.price)} HT</Info>
      </Base>
    ),
  },
];

registerCtrlKRestEntity<Articles>("articles", {
  renderEditor: (props) => (
    <ArticlesDetailsPage readonly={false} id={props.id} />
  ),
  groupBy: "type",
  orderBy: "type,name",
  renderResult: ArticlesColumns,
  useDefaultData: useArticleDefaultModel,
  viewRoute: ROUTES.ProductsView,
});

export const ArticlesFieldsNames = () => ({
  favorite: {
    label: "Favori",
    keywords: "préféré aimé favori",
  },
  assigned: {
    label: "Assignés",
    keywords: "utilisateurs assignés distribution",
  },
  type: {
    label: "Type de produit",
    keywords: "produit service consommable catégorie",
    values: {
      product: "Stockable",
      service: "Service",
      consumable: "Consommable",
    },
  },
  name: {
    label: "Nom",
    keywords: "nom titre désignation",
  },
  description: {
    label: "Description",
    keywords: "détails explication description",
  },
  internal_reference: {
    label: "Référence interne",
    keywords: "référence interne identifiant unique",
  },
  suppliers: {
    label: "Fournisseurs",
    keywords: "partenaires fournisseurs",
  },
  suppliers_details: {
    label: "Détails fournisseurs",
  },
  "suppliers_details.any.reference": {
    label: "Référence fournisseur",
    keywords: "numéro identifiant fournisseur",
  },
  "suppliers_details.any.price": {
    label: "Prix fournisseur",
    keywords: "coût prix fournisseur tarif",
  },
  "suppliers_details.any.delivery_time": {
    label: "Délai de livraison",
    keywords: "temps livraison délai expédition",
  },
  "suppliers_details.any.delivery_quantity": {
    label: "Quantité de livraison",
    keywords: "quantité expédition livraison",
  },
  price: {
    label: "Prix",
    keywords: "coût tarif prix",
  },
  unit: {
    label: "Unité",
    keywords: "unité mesure quantification",
  },
  tva: {
    label: "TVA",
    keywords: "taxe tva impôt",
  },
  subscription: {
    label: "Abonnement",
    keywords:
      "mensuel annuel hebdomadaire souscription récurrent renouvellement",
    values: {
      "": "Aucun",
      monthly: "Mensuel",
      yearly: "Annuel",
      weekly: "Hebdomadaire",
    },
  },
  documents: {
    label: "Documents",
    keywords: "fichiers pièces documents",
  },
  fields: {
    label: "Champs supplémentaires",
    keywords: "données personnalisées informations supplémentaires",
  },
  ...RestFieldsNames(),
});
