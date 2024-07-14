import { AnimatedHeight } from "@atoms/animated-side/height";
import { Button } from "@atoms/button/button";
import { Card } from "@atoms/card";
import { Base, SectionSmall } from "@atoms/text";
import { FormControllerFuncType } from "@components/form/formcontext";
import { InputButton } from "@components/input-button";
import { formatAmount } from "@features/utils/format/strings";
import { PlusIcon, ReceiptPercentIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { Fragment } from "react";
import { DropInvoiceLine, InvoiceLineInput } from "./invoice-line-input";
import { Invoices } from "@features/invoices/types/types";

export const InvoiceLinesInput = ({
  onChange,
  value,
  ctrl,
  readonly,
}: {
  onChange: (v: Invoices) => void;
  value: Invoices;
  ctrl: FormControllerFuncType<Invoices>;
  readonly?: boolean;
}) => {
  const addLine = () => {
    onChange({
      ...value,
      content: [
        ...(value.content || []),
        {
          _id: _.uniqueId(),
          type: "product",
          name: "",
          description: "",
          unit: "",
          unit_price: 0,
          quantity: 1,
        },
      ],
    });
  };

  return (
    <>
      <Card
        show={!(value.content || []).length}
        className="text-center"
        title="Insérez une première ligne"
      >
        Votre facture ne contient aucune ligne, ajoutez-en une pour continuer.
        <br />
        <Button
          className="my-2"
          theme="outlined"
          size="md"
          icon={(p) => <PlusIcon {...p} />}
          onClick={addLine}
        >
          Ajouter une ligne
        </Button>
      </Card>

      <div className="mb-2">
        {value.content?.map((e, index) => (
          <Fragment key={e._id}>
            {index === 0 && (
              <DropInvoiceLine
                onMove={(item) =>
                  onChange({
                    ...value,
                    content: [
                      item,
                      ...(value.content || []).filter(
                        (a) => a._id !== item._id
                      ),
                    ],
                  })
                }
              />
            )}
            <InvoiceLineInput
              invoice={value}
              ctrl={ctrl(`content.${index}`)}
              onRemove={() => {
                onChange({
                  ...value,
                  content: value.content?.filter((a) => a._id !== e._id),
                });
              }}
              onDuplicate={() => {
                // Add item just after the current one
                const content = _.cloneDeep(value.content || []);
                const index = content.findIndex((a) => a._id === e._id);
                content.splice(index + 1, 0, {
                  ...e,
                  _id: _.uniqueId(),
                });
                onChange({
                  ...value,
                  content,
                });
              }}
              onMoveUp={
                index === 0
                  ? undefined
                  : () => {
                      // Swap with previous item
                      const content = _.cloneDeep(value.content || []);
                      const index = content.findIndex((a) => a._id === e._id);
                      if (index === 0) return;
                      const item = content[index];
                      content[index] = content[index - 1];
                      content[index - 1] = item;
                      onChange({
                        ...value,
                        content,
                      });
                    }
              }
              onMoveDown={
                index === (value.content || []).length - 1
                  ? undefined
                  : () => {
                      // Swap with next item
                      const content = _.cloneDeep(value.content || []);
                      const index = content.findIndex((a) => a._id === e._id);
                      if (index === content.length - 1) return;
                      const item = content[index];
                      content[index] = content[index + 1];
                      content[index + 1] = item;
                      onChange({
                        ...value,
                        content,
                      });
                    }
              }
            />
            <DropInvoiceLine
              onMove={(item) => {
                if (item._id === e._id) return;
                // Place item after e
                const content = _.cloneDeep(value.content || []).filter(
                  (a) => a._id !== item._id
                );
                const index = content.findIndex((a) => a._id === e._id);
                content.splice(index + 1, 0, item);
                onChange({
                  ...value,
                  content,
                });
              }}
            />
          </Fragment>
        ))}
      </div>
      <AnimatedHeight>
        {!!value?.content?.length && (
          <>
            <div className="space-x-2 text-right mb-4">
              <InputButton
                size="md"
                label="Réduction globale"
                empty="Pas de réduction globale"
                placeholder="Options"
                icon={(p) => <ReceiptPercentIcon {...p} />}
              />
              {!readonly && (
                <Button
                  theme="outlined"
                  size="md"
                  icon={(p) => <PlusIcon {...p} />}
                  onClick={addLine}
                >
                  Ajouter une ligne
                </Button>
              )}
            </div>
            <div className="flex">
              <div className="grow" />
              <Base>
                <div className="space-y-2 min-w-64 block">
                  <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                    <span>Total HT</span>
                    {formatAmount(value.total?.initial || 0)}
                  </div>
                  {!!(value.total?.discount || 0) && (
                    <>
                      <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                        <span>Remise</span>
                        <span>{formatAmount(value.total?.discount || 0)}</span>
                      </div>
                      <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                        <span>Total HT après remise</span>
                        <span>{formatAmount(value.total?.total || 0)}</span>
                      </div>
                    </>
                  )}
                  <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                    <span>TVA</span>
                    {formatAmount(value.total?.taxes || 0)}
                  </div>
                  <div className="whitespace-nowrap flex flex-row items-center justify-between w-full space-x-4">
                    <SectionSmall className="inline">Total TTC</SectionSmall>
                    <SectionSmall className="inline">
                      {formatAmount(value.total?.total_with_taxes || 0)}
                    </SectionSmall>
                  </div>
                </div>
              </Base>
            </div>
          </>
        )}
      </AnimatedHeight>
      <div className="mb-8" />
    </>
  );
};
