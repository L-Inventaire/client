import { Tag } from "@atoms/badge/tag";
import { CtrlKAtom } from "@features/ctrlk/store";
import { CtrlKPathType } from "@features/ctrlk/types";
import { Invoices } from "@features/invoices/types/types";
import { StockItems } from "@features/stock/types/types";
import { CubeIcon, TruckIcon } from "@heroicons/react/16/solid";
import { useSetRecoilState } from "recoil";
import { renderCompletion } from "../../invoices-details";
import { twMerge } from "tailwind-merge";

export const CompletionTags = (props: {
  invoice: Invoices;
  lines: Invoices["content"];
  size?: "xs" | "sm";
  short?: boolean;
  overflow?: boolean;
}) => {
  const readyCompletion = renderCompletion(
    props.lines,
    "ready",
    props.overflow
  );
  const deliveredCompletion = renderCompletion(
    props.lines,
    "delivered",
    props.overflow
  );

  const openCtrlK = useSetRecoilState(CtrlKAtom);

  const onClick = (query: string) => {
    openCtrlK((states) => [
      ...states,
      {
        path: [
          {
            mode: "search",
            options: {
              entity: "stock_items",
              query,
              internalQuery: {
                [props.invoice?.type === "supplier_quotes"
                  ? "from_rel_supplier_quote"
                  : "for_rel_quote"]: props.invoice?.id,
                article:
                  props.lines?.length === 1
                    ? props.lines[0].article
                    : undefined,
              },
            },
          } as CtrlKPathType<StockItems>,
        ],
        selection: { entity: "", items: [] },
      },
    ]);
  };

  const shortLeft =
    props.short && (readyCompletion[0] >= 100 || deliveredCompletion[0] >= 100);
  const shortRight = props.short && !shortLeft;

  return (
    <div className="-space-x-px flex">
      <Tag
        onClick={() => onClick('!state:"bought"')}
        className={twMerge("rounded-r-none", shortLeft && "w-5")}
        noColor
        size={props.size || "xs"}
        data-tooltip={"Reservé " + readyCompletion[0] + "%"}
        icon={
          <CubeIcon
            className={`w-3 h-3 mr-1 shrink-0 text-${readyCompletion[1]}-500`}
          />
        }
      >
        {!shortLeft && (
          <>
            {readyCompletion[0] > 100 && "⚠️"}
            {readyCompletion[0]}%{" "}
          </>
        )}
        {shortLeft && <div />}
      </Tag>
      <Tag
        onClick={() => onClick('state:"delivered","depleted"')}
        className={twMerge("rounded-l-none", shortRight && "w-5")}
        noColor
        size={props.size || "xs"}
        data-tooltip={"Livré " + deliveredCompletion[0] + "%"}
        icon={
          <TruckIcon
            className={`w-3 h-3 mr-1 shrink-0 text-${deliveredCompletion[1]}-500`}
          />
        }
      >
        {!shortRight && (
          <>
            {deliveredCompletion[0] > 100 && "⚠️"}
            {deliveredCompletion[0]}%{" "}
          </>
        )}
        {shortRight && <div />}
      </Tag>
    </div>
  );
};
