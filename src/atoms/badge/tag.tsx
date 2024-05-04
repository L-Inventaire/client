import { TagIcon } from "@heroicons/react/solid";
import { CSSProperties, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const Tag = ({
  color,
  className,
  noColor,
  children,
  size,
  icon,
  style,
  onClick,
  dataTooltip,
}: {
  color?: string;
  className?: string;
  noColor?: boolean;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  dataTooltip?: string;
}) => {
  if (!children) return <></>;

  if (color) {
    noColor = true;
    style = { ...style, backgroundColor: color };
    className = (className || "") + " text-white";
  }

  return (
    <div
      data-tooltip={
        dataTooltip || (typeof children === "string" ? children : "")
      }
      onClick={onClick}
      style={{ ...(style || {}), minWidth: "21px" }}
      className={twMerge(
        size === "sm"
          ? "h-5 px-1"
          : size === "lg"
          ? "h-9 pl-2 pr-3"
          : "h-7 px-2",
        "text-left rounded inline-block inline-flex items-center text-sm text-center border border-opacity-10 dark:border-opacity-10 dark:border-slate-500 border-box border-black border-inside " +
          (!noColor
            ? "bg-wood-300 text-wood-800 dark:bg-wood-600 dark:text-wood-100 "
            : ""),
        "align-top text-ellipsis whitespace-nowrap overflow-hidden min-w-0 max-w-full shrink-0",
        className
      )}
    >
      {icon || <TagIcon className="w-3 h-3 mr-1 shrink-0" />}
      <span className="grow text-ellipsis whitespace-nowrap overflow-hidden min-w-0 shrink-0">
        {children}
      </span>
    </div>
  );
};
