import { Button } from "@atoms/button/button";
import Select from "@atoms/select";
import { Info } from "@atoms/text";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/outline";

type PropsType = {
  dataLength: number;
  pagination: {
    total: number;
    page: number;
    perPage: number;
    orderBy?: number;
    order?: "ASC" | "DESC";
  };
  loading?: boolean;
  onChangePage?: (page: number) => void;
  onChangePageSize?: (size: number) => void;
};

export function TablePagination({
  dataLength,
  loading,
  pagination,
  onChangePage,
  onChangePageSize,
}: PropsType) {
  return (
    <>
      <div className="flex w-full">
        <div className="grow">
          <Info>
            Showing {dataLength} of {pagination.total} results
          </Info>
        </div>
        <div className="items-center flex flex-row">
          {!!onChangePageSize && (
            <>
              <Info className="whitespace-nowrap mr-2">Per page</Info>
              <Select
                disabled={loading}
                size="sm"
                value={pagination.perPage || "10"}
                onChange={(e) =>
                  onChangePageSize && onChangePageSize(+e.target.value)
                }
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </>
          )}
          {!!onChangePage && (
            <>
              <Button
                theme="default"
                size="sm"
                disabled={loading || pagination.page === 1}
                onClick={() => onChangePage && onChangePage(1)}
                className="!px-1.5 -mr-px ml-4 rounded-r-none shrink-0"
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                theme="default"
                size="sm"
                disabled={loading || pagination.page === 1}
                onClick={() =>
                  onChangePage && onChangePage(pagination.page - 1)
                }
                className="!px-1.5 -mr-px rounded-none shrink-0"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                theme="default"
                size="sm"
                disabled={loading}
                className="-mr-px rounded-none pointer-events-none shrink-0"
              >
                {pagination.page}
              </Button>
              <Button
                theme="default"
                size="sm"
                disabled={
                  loading ||
                  pagination.page ===
                    Math.ceil(pagination.total / pagination.perPage)
                }
                onClick={() =>
                  onChangePage && onChangePage(pagination.page + 1)
                }
                className="!px-1.5 -mr-px rounded-none shrink-0"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                theme="default"
                size="sm"
                disabled={
                  loading ||
                  pagination.page ===
                    Math.ceil(pagination.total / pagination.perPage)
                }
                onClick={() =>
                  onChangePage &&
                  onChangePage(Math.ceil(pagination.total / pagination.perPage))
                }
                className="!px-1.5 rounded-l-none shrink-0"
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
