import { Shortcut, useShortcuts } from "@features/utils/shortcuts";
import _ from "lodash";
import { Link as L, useNavigate } from "react-router-dom";

export default function Link(
  props: any & {
    href?: string;
    to?: string;
    onClick?: () => void;
    children: React.ReactNode;
    noColor?: boolean;
    shortcut?: Shortcut[];
  }
) {
  const navigate = useNavigate();

  useShortcuts(props.shortcut || [], () => {
    if (props.onClick) props.onClick();
    if (props.href || props.to) navigate(props.href || props.to);
  });

  const colors = props.noColor
    ? ""
    : "hover:text-wood-600 active:text-wood-800 text-wood-500 hover:underline underline-offset-2";

  if (
    (props.href || "")?.startsWith("http") ||
    (props.href || "")?.startsWith("mailto:")
  ) {
    return (
      <a
        href={props.href}
        className={colors + " " + (props.className || "")}
        {..._.omit(props, "children", "className", "noColor")}
      >
        {props.children}
      </a>
    );
  }

  return (
    <L
      to={(!props.onClick && props.href) || "#"}
      onClick={(e) => {
        e.stopPropagation();
        if (props.onClick) props.onClick();
      }}
      className={colors + " " + (props.className || "")}
      {..._.omit(props, "children", "className", "noColor")}
    >
      {props.children}
    </L>
  );
}
