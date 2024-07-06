import Link from "@atoms/link";
import { InputOutlinedDefault } from "@atoms/styles/inputs";
import {
  Shortcut,
  showShortCut,
  useShortcuts,
} from "@features/utils/shortcuts";
import _ from "lodash";
import { ReactNode, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  btnRef?: any;
  theme?:
    | "primary"
    | "secondary"
    | "danger"
    | "default"
    | "outlined"
    | "invisible";
  size?: "md" | "lg" | "xl" | "md" | "sm" | "xs";
  loading?: boolean;
  disabled?: boolean;
  shortcut?: Shortcut[];
  children?: React.ReactNode;
  to?: string;
  target?: string;
  icon?: (props: { className: string }) => ReactNode | JSX.Element;
  "data-tooltip"?: string;
}

export const Button = (props: ButtonProps) => {
  const disabled = props.disabled || props.loading;
  const internalRef = useRef<HTMLButtonElement>(null);
  const btnRef = props.btnRef || internalRef;

  // Used to show a loader depending on the onClick promise function
  const asyncTimoutRef = useRef<any>(null);
  const [asyncLoading, setAsyncLoading] = useState(false);

  useShortcuts(
    !props.to && !disabled && props.shortcut?.length ? [...props.shortcut] : [],
    (e) => {
      if (props.onClick)
        props.onClick({
          ...e,
          currentTarget: btnRef.current,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as any);
    }
  );

  if (props.to) {
    return (
      <Link
        to={props.to}
        target={props.target}
        noColor
        shortcut={props.shortcut}
      >
        <Button {..._.omit(props, "to", "shortcut")} />
      </Link>
    );
  }

  let colors =
    "shadow-sm text-white bg-wood-500 hover:bg-wood-600 active:bg-wood-700 border-[0.5px] border-wood-600 hover:border-wood-700 ";

  if (props.theme === "secondary")
    colors =
      "shadow-sm text-wood-500 bg-wood-100 hover:bg-wood-200 active:bg-wood-300 dark:bg-wood-900 dark:active:bg-wood-900 dark:hover:bg-wood-900 dark:text-slate-200 dark:hover:bg-opacity-75 dark:active:bg-opacity-10 border-[0.5px] border-wood-200 hover:border-wood-300 dark:border-wood-900 dark:hover:border-wood-800";

  if (props.theme === "danger")
    colors =
      "shadow-sm text-white bg-rose-500 hover:bg-rose-600 active:bg-rose-700 border-[0.5px] border-red-600 hover:border-red-700";

  if (props.theme === "outlined" || props.theme === "default")
    colors =
      "text-black dark:text-white text-opacity-80 " + InputOutlinedDefault;

  if (props.theme === "invisible")
    colors =
      "shadow-none text-black dark:text-white text-opacity-80 bg-transparent dark:hover:bg-white dark:hover:bg-opacity-5 dark:active:bg-opacity-10 hover:bg-black hover:bg-opacity-5 active:bg-opacity-10 border-none";

  if (disabled) colors += " opacity-50 pointer-events-none";

  let className = colors;

  // We wont use the md / lg sizes
  const size =
    props.size === "lg" || props.size === "md"
      ? "md"
      : props.size || ("md" as ButtonProps["size"]);

  if (size === "xl") className = className + " text-base h-14 px-14 ";
  else if (size === "lg") className = className + " text-base h-11 px-8 ";
  else if (size === "md") className = className + " px-3 text-base h-7 min-h-7";
  else if (size === "sm") className = className + " px-2 text-base h-6 min-h-6";
  else if (size === "xs") className = className + " px-2 text-base h-5 min-h-5";
  else className = className + " px-4 text-base h-9 min-h-9";

  if (!props.children) {
    if (size === "lg") className = className + " w-11 !p-0 justify-center";
    else if (size === "md") className = className + " w-7 !p-0 justify-center";
    else if (size === "sm") className = className + " w-6 !p-0 justify-center";
    else if (size === "xs") className = className + " w-5 !p-0 justify-center";
    else className = className + " w-12 !p-0 justify-center";
  }

  const tooltip = [
    props["data-tooltip"] || "",
    props.shortcut &&
      !props["data-tooltip"] &&
      typeof props.children === "string" &&
      props.children,
    props.shortcut ? `\`${showShortCut(props.shortcut)}\`` : "",
  ]
    .filter((a) => a)
    .join(" ");

  return (
    <button
      ref={btnRef}
      data-tooltip={tooltip.length ? tooltip : undefined}
      type="button"
      className={twMerge(
        "print:hidden align-top whitespace-nowrap overflow-hidden text-ellipsis inline-flex items-center justify-center py-2 border text-sm font-medium rounded-md outline-none hover:outline-none focus:outline-none active:outline-none",
        className,
        props.className
      )}
      onClick={
        props.onClick
          ? async (e) => {
              asyncTimoutRef.current = setTimeout(() => {
                setAsyncLoading(true);
              }, 500);
              await props.onClick!(e);
              setAsyncLoading(false);
              asyncTimoutRef.current && clearTimeout(asyncTimoutRef.current);
            }
          : undefined
      }
      disabled={disabled}
      {..._.omit(
        props,
        "btnRef",
        "onClick",
        "loading",
        "children",
        "className",
        "icon",
        "data-tooltip"
      )}
    >
      {
        <>
          <svg
            className={twMerge(
              "animate-spin",
              "overflow-hidden opacity-1 transition-all",
              size === "sm" ? "-ml-1 mr-1 h-4 w-4" : "-ml-1.5 mr-1.5 h-4 w-4",
              !(props.loading || asyncLoading) && "w-0 opacity-0"
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-10"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>{" "}
        </>
      }
      {props.icon &&
        props.icon({
          className: twMerge(
            "overflow-hidden opacity-1 transition-all",
            "h-4 w-4",
            (props.loading || asyncLoading) && "w-0 opacity-0",
            props.children
              ? size === "sm"
                ? "-ml-1 mr-1"
                : size === "md"
                ? "-ml-1 mr-1"
                : "-ml-1 mr-2"
              : "-mx-2"
          ),
        })}
      <span>{props.children}</span>
    </button>
  );
};
