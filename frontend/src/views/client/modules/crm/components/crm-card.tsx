import { TagsInput } from "@components/input-rest/tags";
import { UsersInput } from "@components/input-rest/users";
import { generateQueryFromMap } from "@components/search-bar/utils/utils";
import { useContacts } from "@features/contacts/hooks/use-contacts";
import { CRMItem } from "@features/crm/types/types";
import { Card, Heading, Text } from "@radix-ui/themes";
import _ from "lodash";
import { useDrag, useDragLayer } from "react-dnd";
import { useSetRecoilState } from "recoil";
import { twMerge } from "tailwind-merge";
import { prettyContactName } from "../../contacts/utils";
import { CRMItemModalAtom } from "./crm-items-modal";
import DOMPurify from "dompurify";

const cleanHTML = (notes: string) =>
  DOMPurify.sanitize(notes || "", {
    ALLOWED_TAGS: ["b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li"], // à ajuster selon besoin
    ALLOWED_ATTR: [], // aucune attribut autorisé
  });

type CRMCardProps = {
  title?: string;
  readonly?: boolean;
  crmItem: CRMItem;
  onMove?: (value: CRMItem) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const CRMCard = ({ crmItem, readonly, ...props }: CRMCardProps) => {
  const setCRMModal = useSetRecoilState(CRMItemModalAtom);

  const [__, dragRef] = useDrag(
    () => ({
      canDrag: !readonly,
      type: "crm-item",
      item: crmItem,
      collect: (monitor) => ({
        dragging: monitor.isDragging() ? true : false,
      }),
    }),
    [crmItem, readonly]
  );

  useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  const { contacts: contacts_raw } = useContacts({
    query: generateQueryFromMap({ id: crmItem.contacts }),
    key: "contacts_id",
  });

  const contacts = contacts_raw?.data?.list || [];

  return (
    <Card
      ref={dragRef as any}
      className={twMerge(props.className)}
      {..._.omit(props, "className")}
      onClick={() => {
        setCRMModal({
          open: true,
          id: crmItem.id,
          type: crmItem.state,
          readonly,
        });
      }}
    >
      <Heading size="4">
        <div className="relative editor-input">
          <div
            className={twMerge("ql-editor is-disabled")}
            dangerouslySetInnerHTML={{ __html: cleanHTML(crmItem.notes) || "" }}
          ></div>
        </div>
      </Heading>
      <Text size="2">
        {(crmItem.contacts ?? [])
          .map((id) => {
            const contact = contacts.find((c) => c.id === id);
            if (!contact) return false;
            return prettyContactName(contact);
          })
          .filter(Boolean)
          .join(", ")}
      </Text>
      <div className="mt-2">
        <div className="float-right">
          <div className="space-x-2">
            <TagsInput value={crmItem.tags} disabled size="sm" />
            <UsersInput value={crmItem.assigned} disabled size="sm" />
          </div>
        </div>
        <UsersInput value={[crmItem.seller]} disabled={true} />
      </div>
    </Card>
  );
};
