import { registerCtrlKRestEntity } from "@features/ctrlk";
import { ROUTES } from "@features/routes";
import { ContactsDetailsPage } from "@views/client/modules/contacts/components/contact-details";
import { Contacts, getContactName } from "./types/types";

export const useContactDefaultModel: () => Partial<Contacts> = () => ({
  type: "company",
  delivery_address: null,
});

registerCtrlKRestEntity<Contacts>("contacts", {
  renderEditor: (props) => (
    <ContactsDetailsPage readonly={false} id={props.id} />
  ),
  renderResult: (contact) => <>{getContactName(contact)}</>,
  useDefaultData: useContactDefaultModel,
  viewRoute: ROUTES.ContactsView,
});
