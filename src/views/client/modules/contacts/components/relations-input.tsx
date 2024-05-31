import { Button } from "@atoms/button/button";
import { Info, SectionSmall } from "@atoms/text";
import { FormInput } from "@components/form/fields";
import { RestDocumentsInput } from "@components/rest-documents-input";
import { Table } from "@components/table";
import { useContacts } from "@features/contacts/hooks/use-contacts";
import { Contacts, getContactName } from "@features/contacts/types/types";
import { ROUTES, getRoute } from "@features/routes";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import _ from "lodash";
import { useEffect } from "react";

export const RelationsInput = ({
  id,
  readonly,
  value,
  onChange,
}: {
  id: string;
  readonly?: boolean;
  value: [string[], Contacts["parents_roles"]]; // parents, parents_roles
  onChange: (parents: string[], roles: Contacts["parents_roles"]) => void;
}) => {
  const { contacts: children } = useContacts({
    query: [
      {
        key: "parents",
        values: [{ op: "equals", value: id }],
      },
    ],
    key: "children_" + id,
  });

  const { contacts: parents, refresh } = useContacts({
    query: [
      {
        key: "id",
        values: value[0].map((id) => ({ op: "equals", value: id })),
      },
    ],
    key: "parents_" + id,
    limit: value[0].length,
  });

  useEffect(() => {
    refresh();
  }, [id]);

  return (
    <div className="space-y-4">
      <div>
        {!!parents?.data?.list?.length && readonly && (
          <SectionSmall>Parents</SectionSmall>
        )}
        <Info>
          Les contacts parents sont les contacts qui sont responsables,
          employeurs ou encore sociétés de ce contact.
        </Info>
        {(!!parents.data?.list?.length || !readonly) && (
          <div className="space-y-4 mt-2">
            {!readonly &&
              (parents?.data?.list || []).map((contact) => (
                <div className="rounded border p-4" key={contact.id}>
                  <Button
                    icon={(p) => <TrashIcon {...p} />}
                    size="sm"
                    theme="danger"
                    className="float-right"
                    onClick={() => {
                      const details = { ...value[1] };
                      delete details[contact.id];
                      onChange(
                        value[0].filter((id) => id !== contact.id),
                        details
                      );
                    }}
                  />
                  <SectionSmall>{getContactName(contact)}</SectionSmall>
                  <FormInput
                    label="Rôle"
                    type="text"
                    value={value[1][contact.id]?.role || ""}
                    onChange={(role: string) => {
                      onChange(value[0], {
                        ...value[1],
                        [contact.id]: {
                          role,
                        },
                      });
                    }}
                    placeholder="Rôle"
                  />
                </div>
              ))}
            {!readonly && (
              <div className="mt-2">
                <RestDocumentsInput
                  table="contacts"
                  column="parents"
                  theme="primary"
                  label="+ Ajouter un contact parent"
                  placeholder="Rechercher un contact"
                  max={1}
                  value={""}
                  onChange={(parent) => {
                    if (parent && typeof parent === "string") {
                      onChange(_.uniq([...value[0], parent]), {
                        ...value[1],
                        [parent]: {
                          role: "",
                        },
                      });
                    }
                  }}
                />
              </div>
            )}

            {!!parents?.data?.list?.length && readonly && (
              <>
                <Table
                  data={parents.data?.list || []}
                  columns={[
                    {
                      render: (contact) => <>{getContactName(contact)}</>,
                    },
                    {
                      render: (contact) => <>{value[1][contact.id]?.role}</>,
                    },
                    {
                      cellClassName: "flex justify-end",
                      render: (contact) => (
                        <>
                          <Button
                            icon={(p) => <EyeIcon {...p} />}
                            size="sm"
                            to={getRoute(ROUTES.ContactsView, {
                              id: contact.id,
                            })}
                          />
                        </>
                      ),
                    },
                  ]}
                />
              </>
            )}
          </div>
        )}
      </div>

      {!!children?.data?.total && readonly && (
        <div>
          <SectionSmall>Autre contacts</SectionSmall>
          <Table
            data={children.data?.list || []}
            columns={[
              {
                render: (contact) => <>{getContactName(contact)}</>,
              },
              {
                render: (contact) => <>{value[1][contact.id]?.role}</>,
              },
              {
                cellClassName: "flex justify-end",
                render: (contact) => (
                  <>
                    <Button
                      icon={(p) => <EyeIcon {...p} />}
                      size="sm"
                      to={getRoute(ROUTES.ContactsView, { id: contact.id })}
                    />
                  </>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};
