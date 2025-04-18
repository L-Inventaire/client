import { Heading } from "@radix-ui/themes";
import _ from "lodash";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type TextProps = {
  type:
    | "title"
    | "subtitle"
    | "section"
    | "section-small"
    | "menu"
    | "value-main"
    | "value-secondary"
    | "base"
    | "base-small"
    | "info"
    | "info-small";
  children: ReactNode | ReactNode[];
  className?: string;
  noColor?: boolean;
} & Omit<
  React.ButtonHTMLAttributes<HTMLSpanElement>,
  "children" | "className" | "type" | "noColor"
>;

type TypedTextProps = Omit<TextProps, "type">;

export const Title = (props: TypedTextProps) =>
  Text({ type: "title", ...props });

export const Subtitle = (props: TypedTextProps) =>
  Text({ type: "subtitle", ...props });

export const Section = (props: TypedTextProps) => (
  <Heading size="4" {..._.pick(props, "className", "onClick", "style")}>
    {props.children}
  </Heading>
);

export const SectionSmall = (props: TypedTextProps) => (
  <Heading size="2" {..._.pick(props, "className", "onClick", "style")}>
    {props.children}
  </Heading>
);

export const Menu = (props: TypedTextProps) => Text({ type: "menu", ...props });

export const ValueMain = (props: TypedTextProps) =>
  Text({ type: "value-main", ...props });

export const ValueSecondary = (props: TypedTextProps) =>
  Text({ type: "value-secondary", ...props });

export const Base = (props: TypedTextProps) => Text({ type: "base", ...props });

export const BaseSmall = (props: TypedTextProps) =>
  Text({ type: "base-small", ...props });

export const Info = (props: TypedTextProps) => Text({ type: "info", ...props });

export const InfoSmall = (props: TypedTextProps) =>
  Text({ type: "info-small", ...props });

const Text = (props: TextProps) => {
  let defaultClassName = "";

  switch (props.type) {
    case "title":
      defaultClassName =
        "text-xl font-semibold block " +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "subtitle":
      defaultClassName =
        "text-base font-regular block " +
        " " +
        (props.noColor ? "" : "text-slate-500 dark:text-white dark:opacity-75");
      break;
    case "section":
      defaultClassName =
        "text-lg font-semibold block mb-2 " +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "section-small":
      defaultClassName =
        "text-base font-medium block " +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "menu":
      defaultClassName =
        "text-base font-semibold" +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "value-main":
      defaultClassName =
        "text-3xl font-semibold" +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "value-secondary":
      defaultClassName =
        "text-xl font-semibold" +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "base":
      defaultClassName =
        "text-base font-normal" +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "base-small":
      defaultClassName =
        "text-sm font-normal" +
        " " +
        (props.noColor ? "" : "text-black dark:text-white");
      break;
    case "info":
      defaultClassName =
        "text-sm font-normal" +
        " " +
        (props.noColor ? "" : "text-slate-300 dark:text-slate-600");
      break;
    case "info-small":
      defaultClassName =
        "text-xs font-normal" +
        " " +
        (props.noColor ? "" : "text-slate-300 dark:text-slate-600");
      break;
  }

  return (
    <span
      className={twMerge(defaultClassName, props.className)}
      {..._.omit(props, "type", "className", "children", "noColor")}
    >
      {props.children}
    </span>
  );
};

export default Text;
