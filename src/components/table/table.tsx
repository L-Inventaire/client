import { DropdownButton } from "@atoms/dropdown";
import { Checkbox } from "@atoms/input/input-checkbox";
import Select from "@atoms/input/input-select";
import { Loader } from "@atoms/loader";
import { Base, Info } from "@atoms/text";
import {
  ArrowSmDownIcon,
  ArrowSmUpIcon,
  CogIcon,
  DownloadIcon,
} from "@heroicons/react/outline";
import _ from "lodash";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TablePagination, TablePaginationSimple } from "./pagination";
import { Button } from "@atoms/button/button";
import { Modal } from "@atoms/modal/modal";
import { TableExportModal } from "./export-modal";
import { TableOptionsModal } from "./options-modal";

export type RenderOptions = {
  responsive?: boolean;
};

export type Column<T> = {
  title?: string | ReactNode;
  className?: string;
  thClassName?: string;
  headClassName?: string;
  cellClassName?: string;
  orderable?: boolean;
  render: (item: T, options: RenderOptions) => string | ReactNode;
};

export type Pagination = {
  total: number;
  page: number;
  perPage: number;
  orderBy?: number;
  order?: "ASC" | "DESC";
};

type PropsType<T> = {
  name?: string;
  grid?: boolean;
  useResponsiveMode?: boolean;
  columns: Column<T>[];
  data: T[];
  rowIndex?: string;
  cellClassName?: (row: T) => string;
  className?: string;
  showPagination?: false | "simple" | "full" | true;
  pagination?: Pagination;
  scrollable?: boolean;
  loading?: boolean;
  onSelect?:
    | {
        icon?: (props: any) => JSX.Element;
        label: string | ReactNode;
        callback: (items: T[]) => void;
      }[]
    | ((items: T[]) => void);
  onClick?: (item: T) => void;
  onChangeOrder?: (columnIndex: number, direction: "ASC" | "DESC") => void;
  onChangePage?: (page: number) => void;
  onChangePageSize?: (size: number) => void;
  onFetchExportData?: (pagination: Pagination) => Promise<T[]>;
};

export function RenderedTable<T>({
  name,
  columns,
  data,
  rowIndex,
  showPagination,
  pagination,
  loading,
  scrollable,
  onSelect,
  onClick,
  onChangeOrder,
  onChangePage,
  onChangePageSize,
  grid,
  useResponsiveMode,
  cellClassName,
  className,
  onFetchExportData,
}: PropsType<T>) {
  const [selected, setSelected] = useState<T[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(0);
  const [exportModal, setExportModal] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);

  const { t } = useTranslation();

  const onClickCheckbox = (row: T, a: boolean, e: any) => {
    //Code to manage shift click range
    if ((e.shiftKey || e.ctrlKey) && selected.length > 0) {
      let anchor = selected[selected.length - 1];
      let start = false;
      let newSelection: T[] = [];
      for (const d of data) {
        if (
          (d as any)[rowIndex || "id"] === (anchor as any)[rowIndex || "id"] ||
          (d as any)[rowIndex || "id"] === (row as any)[rowIndex || "id"]
        ) {
          if (start) {
            newSelection.push(d);
            break;
          }
          if (!start) start = true;
        }
        if (start) {
          newSelection.push(d);
        }
      }
      setSelected(
        _.uniqBy(
          [
            ...selected.filter((s) => !newSelection.includes(s)),
            ...(a ? newSelection : []),
            anchor,
          ],
          (s) => (s as any)[rowIndex || "id"]
        )
      );
    } else {
      if (a) {
        setSelected(
          _.uniqBy([...selected, row], (s) => (s as any)[rowIndex || "id"])
        );
      } else {
        setSelected(selected.filter((s) => s !== row));
      }
    }
  };

  useEffect(() => {
    setSelected([]);
  }, [data.length, pagination?.page, pagination?.perPage]);

  useEffect(() => {
    if (onSelect && typeof onSelect === "function") onSelect(selected);
  }, [selected, onSelect]);

  const resizeEvent = useCallback(() => {
    const { offsetWidth } = parentRef.current!.parentNode! as any;
    setParentWidth(offsetWidth);
  }, [setParentWidth]);

  useEffect(() => {
    window.addEventListener("resize", resizeEvent);
    resizeEvent();
    return () => window.removeEventListener("resize", resizeEvent);
  }, [resizeEvent]);

  scrollable = true;

  const responsiveMode = useResponsiveMode && parentWidth < 600; //Work in progress for responsive mode

  return (
    <div
      ref={parentRef}
      className={
        "not-prose text-left border-slate-200 dark:border-slate-700 relative overflow-auto " +
        (className || "")
      }
    >
      <Modal open={exportModal} onClose={() => setExportModal(false)}>
        <TableExportModal
          tableName={name}
          fetchData={async (pagination: Pagination) =>
            await onFetchExportData!(pagination)
          }
          pagination={pagination}
          onClose={() => setExportModal(false)}
        />
      </Modal>

      <Modal open={optionsModal} onClose={() => setOptionsModal(false)}>
        <TableOptionsModal />
      </Modal>

      <div
        className={
          "relative print:overflow-none " + (scrollable ? "h-full " : "")
        }
        style={{
          minHeight: 100,
        }}
      >
        {loading && (
          <div className="absolute m-auto left-0 top-0 right-0 bottom-0 w-6 h-6 text-center z-10">
            <Loader color="text-blue-500" />
          </div>
        )}

        {(responsiveMode || grid) && columns.find((c) => c.orderable) && (
          <div
            className={
              "float-left flex flex-row " +
              (responsiveMode ? "w-full" : "max-w-sm")
            }
          >
            <Select
              size="sm"
              className="grow w-full my-2"
              onChange={(e) => {
                if (onChangeOrder) {
                  onChangeOrder(parseInt(e.target.value), "ASC");

                  // go back to first selection in select
                  e.target.selectedIndex = 0;
                }
              }}
            >
              <option value="">
                {"Trier par "}
                {columns[pagination?.orderBy as number]?.title ?? "..."}
              </option>
              {columns.map((c, i) => (
                <option key={i} value={i}>
                  {c.title}
                </option>
              ))}
            </Select>
            <Select
              size="sm"
              className="shrink-0 !w-auto -ml-px my-2"
              onChange={(e) => {
                if (onChangeOrder)
                  onChangeOrder(
                    pagination?.orderBy || 0,
                    e.target.value as "ASC" | "DESC"
                  );
              }}
            >
              <option value={"ASC"}>Croissant</option>
              <option value={"DESC"}>Décroissant</option>
            </Select>
          </div>
        )}

        {onFetchExportData && (
          <div className="float-right ml-2">
            <Button
              className="my-2"
              theme="default"
              size="sm"
              icon={(p) => <DownloadIcon {...p} />}
              onClick={() => setExportModal(true)}
            >
              Export
            </Button>
          </div>
        )}

        {
          // TODO add options to change columns order
          false && !grid && !responsiveMode && (
            <div className="float-right ml-2">
              <Button
                className="my-2"
                theme="default"
                size="sm"
                icon={(p) => <CogIcon {...p} />}
                onClick={() => setOptionsModal(true)}
              >
                Options
              </Button>
            </div>
          )
        }

        <table
          className={
            "relative z-0 border-collapse table-fixed w-auto min-w-full " +
            (loading ? " opacity-75 animate-pulse " : "") +
            (scrollable ? " scrollable h-full " : "") +
            (responsiveMode ? " w-full " : "")
          }
        >
          {!responsiveMode &&
            !grid &&
            columns.map((c) => c.title || "").join("") && (
              <thead>
                <tr>
                  {onSelect && (
                    <th
                      className={
                        "w-8 shrink-0 relative " +
                        (scrollable
                          ? " sticky top-0 bg-slate-50 dark:bg-slate-800 "
                          : "")
                      }
                    >
                      <div
                        className="absolute z-10 mt-1 top-0 left-0 "
                        style={{
                          boxShadow: "40px 0 20px #F8FAFC",
                        }}
                      >
                        {selected.length > 0 &&
                          typeof onSelect !== "function" && (
                            <DropdownButton
                              theme="primary"
                              size="sm"
                              /* placeholder={`${selected.length || 0} item${
                                selected.length > 1 ? "s" : ""
                              }`} */
                              options={onSelect.map((a) => ({
                                value: "customer",
                                label: (
                                  <span
                                    onClick={() => a.callback(selected)}
                                    className="flex items-center p-2 font-normal"
                                  >
                                    {a.icon && (
                                      <a.icon className="h-4 w-4 mr-2" />
                                    )}
                                    {a.label}
                                  </span>
                                ),
                              }))}
                            />
                          )}
                      </div>
                    </th>
                  )}
                  {columns.map((column, i) => (
                    <th
                      key={i}
                      className={
                        "font-medium p-2 py-1  " +
                        (column.orderable
                          ? "cursor-pointer hover:bg-opacity-75 "
                          : "") +
                        (scrollable
                          ? " sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 "
                          : "") +
                        (column.thClassName || "")
                      }
                      onClick={() => {
                        if (column.orderable) {
                          onChangeOrder &&
                            onChangeOrder(
                              i,
                              pagination?.order === "ASC" ? "DESC" : "ASC"
                            );
                        }
                      }}
                    >
                      <div
                        className={
                          "items-center flex text-blue-500 table-hover-sort-container  " +
                          (column.headClassName || "")
                        }
                      >
                        <Info
                          className="uppercase"
                          noColor={pagination?.orderBy === i}
                        >
                          {column.title}
                        </Info>
                        {column.orderable && (
                          <div className="w-8 flex items-center ml-1">
                            {pagination?.orderBy === i &&
                              pagination.order === "DESC" && (
                                <ArrowSmUpIcon className="h-4 w-4 text-blue-500 inline" />
                              )}
                            {pagination?.orderBy === i &&
                              pagination.order !== "DESC" && (
                                <ArrowSmDownIcon className="h-4 w-4 text-blue-500 inline" />
                              )}
                            {pagination?.orderBy !== i && column.orderable && (
                              <ArrowSmDownIcon className="table-hover-sort h-4 w-4 text-slate-500 opacity-50 inline" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            )}
          <tbody className="overflow-hidden ">
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={columns.length + (onSelect ? 1 : 0)}>
                  <div
                    className={
                      " p-4 text-center" +
                      (scrollable
                        ? ""
                        : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600")
                    }
                  >
                    <Info>{t("general.tables.empty")}</Info>
                  </div>
                </td>
              </tr>
            )}
            {!!grid && (
              <tr>
                <td className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {data.map((row, i) => {
                    if (onSelect && !rowIndex)
                      throw new Error(
                        "rowIndex is required when onSelect is defined"
                      );
                    const isSelected = selected
                      .map((a) => (a as any)[rowIndex || "id"])
                      .includes((row as any)[rowIndex || "id"]);
                    return (
                      <div
                        key={i}
                        className={
                          "flex flex-row items-center " +
                          (columns[0].className || "")
                        }
                      >
                        {onSelect && (
                          <Checkbox
                            className="mr-2"
                            value={isSelected}
                            onChange={(a, e) => onClickCheckbox(row, a, e)}
                          />
                        )}
                        <div
                          className={
                            "w-full " +
                            (isSelected
                              ? " bg-blue-200 dark:bg-blue-800 "
                              : " bg-slate-200 dark:bg-slate-700 ") +
                            (onClick
                              ? "cursor-pointer hover:bg-opacity-75 "
                              : "") +
                            (cellClassName?.(row) || "")
                          }
                          onClick={() => onClick && onClick(row)}
                        >
                          {columns[0].render(row, { responsive: false })}
                        </div>
                      </div>
                    );
                  })}
                </td>
              </tr>
            )}
            {!grid &&
              data.map((row, i) => {
                if (onSelect && !rowIndex)
                  throw new Error(
                    "rowIndex is required when onSelect is defined"
                  );
                const isSelected = selected
                  .map((a) => (a as any)[rowIndex || "id"])
                  .includes((row as any)[rowIndex || "id"]);
                return (
                  <tr
                    key={i}
                    onClick={() => onClick && onClick(row)}
                    className={onClick ? "cursor-pointer hover:opacity-75" : ""}
                  >
                    {onSelect && (
                      <td className="w-8">
                        <Checkbox
                          className="mr-2"
                          value={isSelected}
                          onChange={(a, e) => onClickCheckbox(row, a, e)}
                        />
                      </td>
                    )}
                    {responsiveMode && (
                      <td className="m-0 p-0 height-table-hack">
                        <div
                          className={
                            "mb-2 m-0 p-0 border rounded-md p-2 " +
                            (i % 2
                              ? isSelected
                                ? "dark:bg-opacity-90 bg-opacity-90 "
                                : "dark:bg-opacity-25 bg-opacity-25 "
                              : "") +
                            (isSelected
                              ? " bg-blue-200 dark:bg-blue-800 "
                              : " bg-white dark:bg-slate-700 ")
                          }
                        >
                          {columns.map((cell, j) => (
                            <div
                              className={
                                "flex flex-row items-center space-x-2 " +
                                (j !== 0 ? "mt-2" : "")
                              }
                              key={j}
                            >
                              {columns.some((a) => a.title) && (
                                <div className="grow">
                                  {cell.title && (
                                    <Info className="uppercase">
                                      {cell.title}
                                    </Info>
                                  )}
                                </div>
                              )}
                              <div className="overflow-hidden">
                                {cell.render(row, { responsive: true })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    )}
                    {!responsiveMode &&
                      columns.map((cell, j) => {
                        const jFirst = j === 0;
                        const jLast = j === columns.length - 1;
                        const iFirst = i === 0;
                        const iLast = i === data.length - 1;
                        return (
                          <td
                            key={j}
                            className="m-0 p-0 height-table-hack overflow-hidden"
                          >
                            <div
                              className={
                                "h-full w-full flex items-center border-t border-slate-200 dark:border-slate-600 " +
                                (i % 2
                                  ? isSelected
                                    ? "dark:bg-opacity-90 bg-opacity-90 "
                                    : "dark:bg-opacity-25 bg-opacity-25 "
                                  : "") +
                                ((jFirst && " border-l ") || "") +
                                ((jLast && " border-r ") || "") +
                                ((iLast && " border-b ") || "") +
                                ((iFirst && jFirst && " rounded-tl ") || "") +
                                ((iFirst && jLast && " rounded-tr ") || "") +
                                ((iLast && jFirst && " rounded-bl ") || "") +
                                ((iLast && jLast && " rounded-br ") || "") +
                                (isSelected
                                  ? " bg-blue-200 dark:bg-blue-800 "
                                  : " bg-white dark:bg-slate-700 ") +
                                (cell.className || "")
                              }
                            >
                              <Base
                                className={
                                  (jFirst ? "pl-2 " : "") +
                                  (jLast ? "pr-2 " : "") +
                                  "w-full py-2 px-1 inline-flex items-center h-full " +
                                  (cell.cellClassName || "") +
                                  " " +
                                  (cellClassName?.(row) || "")
                                }
                              >
                                {cell.render(row, { responsive: false })}
                              </Base>
                            </div>
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
          </tbody>
          {!!pagination && showPagination && (!loading || !!data.length) && (
            <tfoot>
              <tr>
                <td
                  colSpan={columns.length + (onSelect ? 1 : 0)}
                  className={
                    "items-center pl-2 py-2 pr-0 text-slate-500 dark:text-slate-400 " +
                    (scrollable
                      ? " sticky bottom-0 bg-slate-50 dark:bg-slate-800 z-10 "
                      : "")
                  }
                >
                  {showPagination === "full" ? (
                    <TablePagination
                      pagination={pagination}
                      dataLength={data.length}
                      onChangePage={onChangePage}
                      onChangePageSize={
                        scrollable ? undefined : onChangePageSize
                      }
                      loading={loading}
                    />
                  ) : (
                    <TablePaginationSimple
                      pagination={pagination}
                      dataLength={data.length}
                      onChangePage={onChangePage}
                      loading={loading}
                    />
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
