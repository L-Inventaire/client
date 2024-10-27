import { Unit } from "@atoms/input/input-unit";
import { SectionSmall } from "@atoms/text";
import { UsersInput } from "@components/deprecated-users-input";
import { RestDocumentsInput } from "@components/input-rest";
import { TagsInput } from "@components/input-rest/tags";
import { Articles } from "@features/articles/types/types";
import { getContactName } from "@features/contacts/types/types";
import { registerCtrlKRestEntity } from "@features/ctrlk";
import { ROUTES } from "@features/routes";
import { UserIcon } from "@heroicons/react/16/solid";
import { Column } from "@molecules/table/table";
import { getArticleIcon } from "@views/client/modules/articles/components/article-icon";
import { ServiceItemStatus } from "@views/client/modules/service/components/service-item-status";
import { ServiceItemsDetailsPage } from "@views/client/modules/service/components/service-items-details";
import { ServiceTimesDetailsPage } from "@views/client/modules/service/components/service-times-details";
import { ServiceItems, ServiceTimes } from "./types/types";

export const useServiceItemDefaultModel: () => Partial<ServiceItems> = () => {
  return {
    state: "todo",
  };
};

export const ServiceItemsColumns: Column<ServiceItems>[] = [
  {
    title: "Article",
    thClassName: "w-1",
    render: (item) => (
      <RestDocumentsInput
        disabled
        value={item.article}
        entity={"articles"}
        size="sm"
        icon={(p, article) => getArticleIcon((article as Articles)?.type)(p)}
      />
    ),
  },
  {
    title: "Titre",
    render: (item) => (
      <SectionSmall className="whitespace-nowrap">{item.title}</SectionSmall>
    ),
  },
  {
    title: "Client",
    thClassName: "w-1",
    cellClassName: "justify-end",
    headClassName: "justify-end",
    render: (item) => (
      <>
        <RestDocumentsInput
          label="Clients"
          placeholder="Aucun client"
          entity="contacts"
          value={item.client}
          icon={(p) => <UserIcon {...p} />}
          render={(c) => getContactName(c)}
          size="sm"
          disabled
        />
      </>
    ),
  },
  {
    title: "Étiquettes et assigné",
    thClassName: "w-1",
    cellClassName: "justify-end",
    headClassName: "justify-end",
    render: (item) => (
      <div className="space-x-2 whitespace-nowrap">
        <TagsInput value={item.tags} disabled />
        <UsersInput value={item.assigned} disabled />
      </div>
    ),
  },
  {
    title: "Statut",
    thClassName: "w-1",
    cellClassName: "justify-end",
    render: (item) => (
      <ServiceItemStatus size="sm" readonly value={item.state} />
    ),
  },
];

registerCtrlKRestEntity<ServiceItems>("service_items", {
  renderEditor: (props) => (
    <ServiceItemsDetailsPage readonly={false} id={props.id} />
  ),
  renderResult: ServiceItemsColumns,
  useDefaultData: useServiceItemDefaultModel,
  viewRoute: ROUTES.ServiceItemsView,
});

export const ServiceTimesColumns: Column<ServiceTimes>[] = [
  {
    title: "Assigné",
    render: (item) => <UsersInput value={item.assigned} disabled />,
  },
  {
    title: "Temps passé",
    render: (item) => (
      <>
        {item.quantity} <Unit unit={item.unit} />
      </>
    ),
  },
  {
    title: "Travail effectué",
    render: (item) => item.description,
  },
];

export const useServiceTimeDefaultModel: () => Partial<ServiceTimes> =
  () => ({});

registerCtrlKRestEntity<ServiceTimes>("service_times", {
  renderEditor: (props) => (
    <ServiceTimesDetailsPage readonly={false} id={props.id} />
  ),
  renderResult: ServiceTimesColumns,
  useDefaultData: useServiceTimeDefaultModel,
  viewRoute: ROUTES.ServiceItemsView,
});
