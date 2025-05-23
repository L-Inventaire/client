import Link from "@atoms/link";
import { Info } from "@atoms/text";
import { FormInput } from "@components/form/fields";
import {
  FormControllerType,
  useFormController,
} from "@components/form/formcontext";
import { InvoiceLine } from "@features/invoices/types/types";

export const InvoiceDiscountInput = (props: {
  value?: InvoiceLine["discount"];
  onChange?: (v: InvoiceLine["discount"] | undefined) => void;
  ctrl?: FormControllerType<InvoiceLine["discount"]>;
}) => {
  const value =
    props.ctrl?.value || props.value || ({} as InvoiceLine["discount"]);
  const onChange = props.ctrl?.onChange || props.onChange;
  const { ctrl } = useFormController(value!, (e) => onChange!(e(value)));

  return (
    <div className="space-y-2">
      <FormInput
        autoFocus
        label={"Type de réduction"}
        value={ctrl("mode").value || "percentage"}
        onChange={ctrl("mode").onChange}
        type="select"
        options={[
          { value: "percentage", label: "Pourcentage" },
          { value: "amount", label: "Montant fixe" },
        ]}
      />

      {value && (
        <FormInput
          label="Réduction"
          value={value?.value}
          onChange={(e) => {
            if (e > 0) {
              onChange!({
                ...value,
                value: e,
                mode: ctrl("mode").value || "percentage",
              });
            } else {
              onChange!(undefined);
            }
          }}
          type="formatted"
          format={ctrl("mode").value === "amount" ? "price" : "percentage"}
        />
      )}

      <Info className="block mt-2">
        <Link
          onClick={() => {
            onChange!(undefined);
          }}
        >
          Ne pas appliquer de réduction
        </Link>
      </Info>
    </div>
  );
};
