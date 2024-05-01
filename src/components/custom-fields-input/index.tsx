import InputDate from "@atoms/input/input-date";
import { InputLabel } from "@atoms/input/input-decoration-label";
import { FormInput } from "@components/form/fields";
import { FormControllerType } from "@components/form/formcontext";
import { TagsInput } from "@components/tags-input";
import { UsersInput } from "@components/users-input";
import { useTableFields } from "@features/fields/hooks/use-fields";
import _ from "lodash";

export const CustomFieldsInput = ({
  table,
  ctrl,
  readonly,
}: {
  table: string;
  ctrl: FormControllerType;
  readonly?: boolean;
}) => {
  const { fields } = useTableFields(table);
  const { value: _value, onChange } = ctrl;
  const value = _value || {};
  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const type = f.type.replace(/(^\[|\]$)/gm, "");
        const isArray = type.length !== f.type.length;
        return (
          <>
            {!["type:tags", "type:users"].includes(type) && (
              <FormInput
                label={f.name}
                type={type as any}
                value={value[f.code]}
                onChange={(e) =>
                  onChange({
                    ...value,
                    [f.code]: e,
                  })
                }
              />
            )}
            {["type:tags", "type:users"].includes(type) && (
              <InputLabel
                label={f.name}
                labelClassName={readonly ? "opacity-50" : ""}
                input={
                  <>
                    {type === "type:tags" && (
                      <TagsInput
                        disabled={readonly}
                        max={isArray ? undefined : 1}
                        value={value[f.code] || []}
                        onChange={(tags) =>
                          onChange({
                            ...value,
                            [f.code]: tags,
                          })
                        }
                      />
                    )}
                    {type === "type:users" && (
                      <UsersInput
                        disabled={readonly}
                        max={isArray ? undefined : 1}
                        value={value[f.code] || []}
                        onChange={(users) =>
                          onChange({
                            ...value,
                            [f.code]: users,
                          })
                        }
                      />
                    )}
                  </>
                }
              />
            )}
          </>
        );
      })}
    </div>
  );
};
