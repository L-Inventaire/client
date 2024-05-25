import { Badge } from "@atoms/badge";
import { Dot } from "@atoms/badge/dot";
import { Tag } from "@atoms/badge/tag";
import { InputLabel } from "@atoms/input/input-decoration-label";
import { Info, SectionSmall } from "@atoms/text";
import { AddressInput } from "@components/address-input";
import { CustomFieldsInput } from "@components/custom-fields-input";
import { EditorInput } from "@components/editor-input";
import { FormInput } from "@components/form/fields";
import { FormContext } from "@components/form/formcontext";
import { InvoiceFormatInput } from "@components/invoice-format-input";
import { PageLoader } from "@components/page-loader";
import { PaymentInput } from "@components/payment-input";
import { useClients } from "@features/clients/state/use-clients";
import { useContact } from "@features/contacts/hooks/use-contacts";
import { Invoices } from "@features/invoices/types/types";
import { currencyOptions, languageOptions } from "@features/utils/constants";
import { formatTime } from "@features/utils/format/dates";
import { formatAmount } from "@features/utils/format/strings";
import { useReadDraftRest } from "@features/utils/rest/hooks/use-draft-rest";
import {
  PageBlock,
  PageBlockHr,
  PageColumns,
} from "@views/client/_layout/page";
import _ from "lodash";
import { useEffect } from "react";

export const InvoicesDetailsPage = ({
  type,
  readonly,
  id,
}: {
  type: "invoices" | "quotes" | "credit_notes";
  readonly?: boolean;
  id: string;
}) => {
  const { client: clientUser } = useClients();
  const client = clientUser?.client;

  const { isPending, ctrl, draft, setDraft } = useReadDraftRest<Invoices>(
    "invoices",
    id || "new",
    readonly
  );

  const { contact } = useContact(draft.contact);

  const quotesStatus: { [key: string]: [string, string] } = {
    draft: ["Brouillon", "bg-red-500"],
    sent: ["Envoyé", "bg-yellow-500"],
    accepted: ["Accepté", "bg-blue-500"],
    completed: ["Complété", "bg-green-500"],
    canceled: ["Annulé", "bg-slate-500"],
  };

  useEffect(() => {
    if (!draft.emit_date) setDraft({ ...draft, emit_date: new Date() });
  }, [draft]);

  if (isPending || (id && draft.id !== id) || !client) return <PageLoader />;

  return (
    <>
      <FormContext readonly={readonly} alwaysVisible>
        <PageColumns>
          <div className="grow lg:w-3/5">
            <PageBlock title={"Devis " + ctrl("reference").value}>
              <div className="space-y-2">
                <div className="mb-4">
                  <PageColumns>
                    <FormInput
                      ctrl={ctrl("name")}
                      label="Titre"
                      placeholder="Titre interne"
                    />
                  </PageColumns>
                </div>
                <PageColumns>
                  <FormInput
                    type="rest_documents"
                    rest={{ table: "invoices", column: "client" }}
                    label="Client"
                    ctrl={ctrl("client")}
                    max={1}
                  />
                  <FormInput
                    type="rest_documents"
                    rest={{ table: "invoices", column: "contact" }}
                    label="Contact (optionnel)"
                    ctrl={ctrl("contact")}
                    max={1}
                  />
                </PageColumns>
              </div>
            </PageBlock>
            {draft.client && (
              <>
                <PageBlock title="Prestation">
                  Lignes
                  <PageBlockHr />
                  <div className="space-y-2">
                    {!readonly && (
                      <FormInput
                        className="-mt-1"
                        type="boolean"
                        placeholder="Appliquer une remise globale"
                        value={!!draft.discount?.mode}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            discount: {
                              value: 0,
                              ...(draft.discount || {}),
                              mode: e ? "amount" : null,
                            },
                          })
                        }
                      />
                    )}
                    {!!draft.discount?.mode && (
                      <PageColumns>
                        <FormInput
                          className="w-max"
                          ctrl={ctrl("discount.mode")}
                          label="Type de remise"
                          type="select"
                          options={[
                            { label: "Montant", value: "amount" },
                            { label: "Pourcentage", value: "percentage" },
                          ]}
                        />
                        <FormInput
                          className="w-max"
                          ctrl={ctrl("discount.value")}
                          label="Valeur"
                          type="formatted"
                          format={
                            draft.discount?.mode === "amount"
                              ? "price"
                              : "percentage"
                          }
                        />
                        <div className="grow" />
                      </PageColumns>
                    )}
                  </div>
                </PageBlock>

                <div className="flex">
                  <div className="grow" />
                  <PageBlock>
                    <div className="space-y-2 min-w-64 block">
                      <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                        <span>Total HT</span>
                        {formatAmount(draft.total?.initial || 0)}
                      </div>
                      {!!(draft.total?.discount || 0) && (
                        <>
                          <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                            <span>Remise</span>
                            <span>
                              {formatAmount(draft.total?.discount || 0)}
                            </span>
                          </div>
                          <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                            <span>Total HT après remise</span>
                            <span>{formatAmount(draft.total?.total || 0)}</span>
                          </div>
                        </>
                      )}
                      <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                        <span>TVA</span>
                        {formatAmount(draft.total?.taxes || 0)}
                      </div>
                      <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                        <SectionSmall className="inline">
                          Total TTC
                        </SectionSmall>
                        <SectionSmall className="inline">
                          {formatAmount(draft.total?.total_with_taxes || 0)}
                        </SectionSmall>
                      </div>
                    </div>
                  </PageBlock>
                </div>

                <PageBlock closable title="Informations additionelles">
                  <div className="space-y-2">
                    <FormInput
                      type="date"
                      label="Date d'émission de la facture"
                      ctrl={ctrl("emit_date")}
                    />

                    <PageBlockHr />

                    <FormInput
                      type="files"
                      label="Documents partagés avec le client"
                      ctrl={ctrl("attachments")}
                    />
                  </div>
                  <div className="">
                    <PageBlockHr />

                    {!ctrl("delivery_date").value && !readonly && (
                      <FormInput
                        placeholder="Ajouter une date de livraison"
                        type="boolean"
                        value={ctrl("delivery_date").value}
                        onChange={(e) =>
                          ctrl("delivery_date").onChange(
                            e ? Date.now() + 1000 * 60 * 60 * 24 * 7 : 0
                          )
                        }
                      />
                    )}
                    {!!ctrl("delivery_date").value && (
                      <FormInput
                        type="date"
                        label="Date de livraison"
                        ctrl={ctrl("delivery_date")}
                      />
                    )}

                    {!readonly && (
                      <FormInput
                        placeholder="Ajouter une adresse de livraison"
                        type="boolean"
                        value={ctrl("delivery_address").value}
                        onChange={(e) =>
                          ctrl("delivery_address").onChange(
                            e
                              ? ({
                                  address_line_1:
                                    contact?.address.address_line_1 || "",
                                  address_line_2:
                                    contact?.address.address_line_2 || "",
                                  region: contact?.address.region || "",
                                  country: contact?.address.country || "",
                                  zip: contact?.address.zip || "",
                                  city: contact?.address.city || "",
                                } as Invoices["delivery_address"])
                              : null
                          )
                        }
                      />
                    )}
                    {ctrl("delivery_address").value && (
                      <>
                        <AddressInput ctrl={ctrl("delivery_address")} />
                      </>
                    )}
                  </div>
                </PageBlock>
                <PageBlock
                  closable
                  title="Paiement"
                  initOpen={
                    !!(
                      !_.isEqual(
                        ctrl("payment_information").value,
                        client.payment
                      ) ||
                      (client.preferences?.currency &&
                        ctrl("currency").value !== client.preferences?.currency)
                    )
                  }
                >
                  <FormInput
                    label="Devise"
                    className="w-max mb-4"
                    ctrl={ctrl("currency")}
                    type="select"
                    options={currencyOptions}
                  />
                  <PaymentInput
                    readonly={readonly}
                    ctrl={ctrl("payment_information")}
                  />
                </PageBlock>
                <PageBlock
                  closable
                  title="Format"
                  initOpen={
                    !!(
                      !_.isEqual(ctrl("format").value, client.invoices) ||
                      (client.preferences?.language &&
                        ctrl("language").value !== client.preferences?.language)
                    )
                  }
                >
                  <FormInput
                    label="Langue"
                    className="w-max mb-4"
                    ctrl={ctrl("language")}
                    type="select"
                    options={languageOptions}
                  />
                  <PageBlockHr />
                  <InvoiceFormatInput
                    readonly={readonly}
                    ctrl={ctrl("format")}
                  />
                </PageBlock>
                {draft.type === "invoices" && (
                  <PageBlock closable title="Rappels">
                    <Info>
                      Envoyez un rappel toutes les semaines lorsque votre
                      facture passe en attente de paiement tant que le paiement
                      n'est pas effectué.
                    </Info>
                    <FormInput
                      type="boolean"
                      placeholder="Activer les rappels"
                      ctrl={ctrl("reminders.enabled")}
                    />
                    {ctrl("reminders.enabled").value && (
                      <div className="space-y-2">
                        <FormInput
                          type="number"
                          label="Nombre de rappels"
                          ctrl={ctrl("reminders.repetitions")}
                        />
                        <FormInput
                          type="multiselect"
                          label="Destinataires"
                          onChange={(e) =>
                            ctrl("reminders.recipients").onChange(e)
                          }
                          value={ctrl("reminders.recipients").value}
                          options={async (query: string) => [
                            ...(ctrl("reminders.recipients").value || []).map(
                              (r: string) => ({
                                value: r as string,
                                label: r as string,
                              })
                            ),
                            ...(query
                              .toLocaleLowerCase()
                              .match(
                                /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g
                              )
                              ? [{ value: query, label: query }]
                              : []),
                          ]}
                        />
                      </div>
                    )}
                  </PageBlock>
                )}
                {draft.type === "invoices" && (
                  <PageBlock closable title="Récurrence">
                    <Info>
                      Activez la récurrence pour dupliquer cette facture
                      automatiquement.
                    </Info>
                    <FormInput
                      type="boolean"
                      placeholder="Activer la récurrence"
                      onChange={(e) => {
                        setDraft({
                          ...draft,
                          subscription: {
                            enabled: e,
                            frequency:
                              draft?.subscription?.frequency || "monthly",
                            start: draft?.subscription?.start || Date.now(),
                            end:
                              draft?.subscription?.end ||
                              Date.now() + 1000 * 60 * 60 * 24 * 365,
                            as_draft: true,
                          },
                        });
                      }}
                      value={ctrl("subscription.enabled").value}
                    />
                    {ctrl("subscription.enabled").value && (
                      <>
                        <PageColumns>
                          <FormInput
                            type="select"
                            label="Fréquence"
                            ctrl={ctrl("subscription.frequency")}
                            options={[
                              { value: "weekly", label: "Hebdomadaire" },
                              { value: "monthly", label: "Mensuelle" },
                              { value: "yearly", label: "Annuelle" },
                            ]}
                          />
                          <FormInput
                            type="date"
                            label="Début (inclus)"
                            ctrl={ctrl("subscription.start")}
                          />
                          <FormInput
                            type="date"
                            label="Fin (inclus)"
                            ctrl={ctrl("subscription.end")}
                          />
                        </PageColumns>

                        <div className="mt-2" />
                        <Info>
                          Prochaines factures:{" "}
                          {(() => {
                            let hasMore = false;
                            const dates = [];
                            let date = Math.max(
                              new Date(draft.emit_date).getTime(),
                              new Date(draft.subscription?.start || 0).getTime()
                            );
                            let end = Math.max(
                              new Date(draft.emit_date).getTime(),
                              new Date(draft.subscription?.end || 0).getTime() +
                                1000 * 60 * 60 * 24 // Add a day for time zones issues
                            );
                            while (date <= end) {
                              dates.push(date);
                              const nextDate = new Date(date);
                              if (draft.subscription?.frequency === "weekly")
                                nextDate.setDate(nextDate.getDate() + 7);
                              else if (
                                draft.subscription?.frequency === "monthly"
                              )
                                nextDate.setMonth(nextDate.getMonth() + 1);
                              else
                                nextDate.setFullYear(
                                  nextDate.getFullYear() + 1
                                );
                              if (dates.length > 25) {
                                hasMore = true;
                                break;
                              }
                              date = nextDate.getTime();
                              console.log(
                                new Date(date).toISOString().split("T")[0],
                                new Date(end).toISOString().split("T")[0],
                                new Date(end)
                              );
                            }
                            return [
                              ...dates.map((d) => (
                                <Tag
                                  icon={<></>}
                                  key={d}
                                  noColor
                                  className="bg-white mr-1 mb-1 text-slate-800"
                                >
                                  {formatTime(d, {
                                    keepDate: true,
                                    hideTime: true,
                                  })}
                                </Tag>
                              )),
                              ...(hasMore
                                ? [
                                    <Tag
                                      icon={<></>}
                                      key={"..."}
                                      noColor
                                      className="bg-white mr-1 mb-1 text-slate-800"
                                    >
                                      ...
                                    </Tag>,
                                  ]
                                : []),
                            ];
                          })()}
                        </Info>

                        <PageBlockHr />
                        <FormInput
                          type="boolean"
                          placeholder="Dupliquer en tant que brouillon"
                          ctrl={ctrl("subscription.as_draft")}
                        />
                        <Info>
                          Par défaut les factures son dupliquées et envoyées au
                          client pour paiement (tacite reconduction).
                        </Info>
                      </>
                    )}
                  </PageBlock>
                )}
                <PageBlock closable title="Notes et documents">
                  <div className="space-y-2 mt-4">
                    <InputLabel
                      label="Notes"
                      input={
                        <EditorInput
                          key={readonly ? ctrl("notes").value : undefined}
                          placeholder={
                            readonly
                              ? "Aucune note"
                              : "Cliquez pour ajouter des notes"
                          }
                          disabled={readonly}
                          value={ctrl("notes").value || ""}
                          onChange={(e) => ctrl("notes").onChange(e)}
                        />
                      }
                    />
                    <FormInput
                      type="files"
                      label="Documents"
                      ctrl={ctrl("documents")}
                      rest={{
                        table: "invoices",
                        id: draft.id || "",
                        column: "documents",
                      }}
                    />
                  </div>
                </PageBlock>
                <PageBlock closable title="Champs additionels">
                  <CustomFieldsInput
                    table={"invoices"}
                    ctrl={ctrl("fields")}
                    readonly={readonly}
                    entityId={draft.id || ""}
                  />
                </PageBlock>
              </>
            )}
          </div>
          {draft.client && (
            <div className="grow lg:w-2/5 shrink-0">
              <PageBlock title="Status">
                <div className="inline-flex items-center space-x-2 w-full">
                  <Dot className={quotesStatus[draft.state || "draft"][1]} />
                  <FormInput
                    className="grow"
                    ctrl={ctrl("state")}
                    type="select"
                    options={Object.keys(quotesStatus).map((k) => ({
                      value: k as string,
                      label: quotesStatus[k][0] as string,
                    }))}
                  />
                </div>

                <PageBlockHr />

                <Info>Aucun document n'est lié à ce devis.</Info>

                <PageBlockHr />
                <PageColumns>
                  <FormInput
                    ctrl={ctrl("tags")}
                    label="Étiquettes"
                    type="tags"
                  />
                  <FormInput
                    ctrl={ctrl("assigned")}
                    label="Assigné à"
                    type="users"
                  />
                </PageColumns>
              </PageBlock>
              <div className="p-8">
                <div className="w-full bg-white shadow-md h-80"></div>
              </div>
            </div>
          )}
        </PageColumns>
      </FormContext>
    </>
  );
};
