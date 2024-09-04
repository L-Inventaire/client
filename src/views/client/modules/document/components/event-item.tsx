import { Base } from "@atoms/text";
import { DocumentEntity, DocumentEvents } from "@features/documents/types";
import { formatTime } from "@features/utils/format/dates";

export type EventItemProps = {
  document: DocumentEntity;
  event: DocumentEvents;
};

export const EventItem = ({ document, event }: EventItemProps) => {
  return (
    <div className="w-full grid grid-cols-3">
      <Base>
        {formatTime(event.created_at, {
          keepDate: true,
        })}
      </Base>
      <Base>
        {event?.event === "create" && "Created"}
        {event?.event === "view" && "Viewed"}
        {event?.event === "sign" && "Signed"}
        {event?.event === "veto" && "Vetoed"}
        {event?.event === "approve" && "Approved"}
      </Base>
      <Base>
        {event.contact &&
          event?.contact?.person_last_name?.toLocaleUpperCase() +
            " " +
            event?.contact?.person_first_name?.toLocaleUpperCase()}
        {event?.user && event?.user?.full_name?.toLocaleUpperCase()}
      </Base>
    </div>
  );
};
