import { CheckIcon } from "@heroicons/react/outline";
import { BaseSmall } from "../text";
import { twMerge } from "tailwind-merge";

export const Checkbox = (props: {
  label?: string;
  onChange?: (status: boolean, e: React.MouseEvent<HTMLInputElement>) => void;
  value?: boolean;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}) => {
  const renderSwitch = () => {
    const className = props.className || "";

    return (
      <div
        className={twMerge(
          " shrink-0 flex justify-center items-center border-2 rounded text-white " +
            (props.value
              ? "border-wood-400 bg-wood-400 hover:border-wood-500 hover:bg-wood-500"
              : "border-wood-300 " +
                (props.disabled ? "" : "hover:border-wood-200")) +
            " " +
            (props.disabled ? "opacity-50" : "cursor-pointer"),
          className,
          props.size === "sm" ? "w-4 h-4" : "w-5 h-5 "
        )}
        onClick={(e) =>
          !props.label &&
          !props.disabled &&
          props.onChange &&
          props.onChange(!props.value, e as React.MouseEvent<HTMLInputElement>)
        }
      >
        {props.value && <CheckIcon className="m-icon-small" />}
      </div>
    );
  };

  if (props.label) {
    return (
      <div
        className={"flex flex-row items-center"}
        onClick={(e) => {
          if (!props.disabled) {
            props.onChange &&
              props.onChange(
                !props.value,
                e as React.MouseEvent<HTMLInputElement>
              );
          }
        }}
      >
        {renderSwitch()}
        <BaseSmall
          className={
            "ml-2 shrink-0 " +
            (props.disabled ? "opacity-50" : "cursor-pointer")
          }
        >
          {props.label}
        </BaseSmall>
      </div>
    );
  } else {
    return renderSwitch();
  }
};
