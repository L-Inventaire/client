import { AnimatedHeight } from "@atoms/animated-side/height";
import { Button, ButtonProps } from "@atoms/button/button";
import { InputDecorationIcon } from "@atoms/input/input-decoration-icon";
import { Input } from "@atoms/input/input-text";
import { Modal, ModalContent } from "@atoms/modal/modal";
import { Info } from "@atoms/text";
import { FormContextContext } from "@components/form/formcontext";
import _ from "lodash";
import { ReactNode, useContext, useState } from "react";

export type InputButtonProps<T> = Omit<ButtonProps, "onChange" | "content"> & {
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  empty?: string;
  label?: string;
  content?: ReactNode | JSX.Element;
};

export const InputButton = <T,>(props: InputButtonProps<T>) => {
  const [open, setOpen] = useState(false);
  const formContext = useContext(FormContextContext);
  const disabled =
    props.disabled || formContext.disabled || formContext.readonly || false;
  return (
    <>
      {!disabled && (
        <Modal open={open} closable onClose={() => setOpen(false)}>
          <ModalContent title={props.label || props.placeholder}>
            {props.content || (
              <InputDecorationIcon
                prefix={props.icon as any}
                input={(p) => (
                  <Input
                    {...p}
                    placeholder={props.placeholder}
                    autoFocus
                    autoSelect
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value as any);
                    }}
                  />
                )}
              />
            )}
            <Button
              size="md"
              className="mt-4 float-right"
              onClick={() => setOpen(false)}
              shortcut={["esc", "enter"]}
            >
              Fermer
            </Button>
          </ModalContent>
        </Modal>
      )}
      <Button
        theme="outlined"
        {..._.omit(
          props,
          "value",
          "onChange",
          "placeholder",
          "onClick",
          "label",
          "content"
        )}
        onClick={() => {
          setOpen(true);
        }}
        className="h-max py-0.5"
      >
        <AnimatedHeight>
          {!props.value && (
            <Info>{props.empty || props.label || props.placeholder}</Info>
          )}
          {!!props.value && (props.children || props.value)}
        </AnimatedHeight>
      </Button>
    </>
  );
};
