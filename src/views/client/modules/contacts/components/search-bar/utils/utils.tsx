import { RestSearchQueryOp } from "@features/utils/rest/hooks/use-rest";
import { MatchedStringFilter, OutputQuery, SearchField } from "./types";
import { flattenKeys } from "@features/utils/flatten";

export const schemaToSearchFields = (schema: any) => {
  return Object.entries(flattenKeys(schema)).map(([key, value]) => {
    key = key.replace(/\[0\]$/, "");
    return { key, label: key, type: value as SearchField["type"] };
  });
};

export const labelToVariable = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]/g, "_");

// Filters have this form: field:"value with spaces","value2","value3" or just field:value,value2
export const extractFilters = (str: string): MatchedStringFilter[] => {
  const filters =
    str.match(/(!?[^ :]+:~?([^" ]+|("[^"]*("|$),?)+[^" ]*)|[^ ]+)/gm) || [];
  return filters.map((filter) => {
    const parts = filter.match(
      /(([^ :]+):(~([^"]|$)|~?[^~" ]+|(~?"[^"]*("|$),?)+[^" ]*)?)/
    );
    if (!parts)
      return {
        key: "",
        not: false,
        regex: false,
        raw: filter,
        values: [],
        values_raw: "",
        values_raw_array: [],
      };
    const key = parts[2];
    const values =
      (parts[3] || "").match(/(~([^"]|$)|~?"[^"]*("|$)|[^,]+)/g) || [];
    return {
      key: key.replace(/^!/, ""),
      not: key.startsWith("!"),
      regex: (parts[3] || "").startsWith("~"),
      raw: filter,
      values_raw: parts[3] || "",
      values: values
        .map((value) => value.replace(/^~?"(.*?)("|$)$/g, "$1"))
        .filter(Boolean),
      values_raw_array: [
        ...values,
        ...((parts[3] || "").match(/,$/) ? [""] : []),
      ],
    };
  });
};

export const generateQuery = (
  fields: SearchField[],
  filters: MatchedStringFilter[],
  replacementsMap?: { [key: string]: string }
): OutputQuery => {
  const query = filters
    .filter((a) => !a.key)
    .map((a) => a.raw)
    .join(" ");

  let valid = true;
  const result = [
    {
      key: "query",
      not: false,
      regex: false,
      values: [{ op: "equals" as RestSearchQueryOp, value: query }],
    },
    ...filters
      .filter((a) => a.key)
      .map((a) => {
        const field = fields.find((b) => labelToVariable(b.label) === a.key);
        return {
          key: field?.key || a.key,
          not: a.not,
          regex: a.regex,
          values: a.values.map((value) => {
            value =
              replacementsMap?.[(field?.key || a.key) + ":" + value] || value;
            if (field?.type === "text" || field?.type?.indexOf("type:") === 0) {
              const isRegex = a.regex;
              value = value.replace(/(^~?"|"$)/g, "");
              return {
                op: (isRegex ? "regex" : "equals") as RestSearchQueryOp,
                value,
              };
            } else if (field?.type === "boolean") {
              return {
                op: "equals" as RestSearchQueryOp,
                value: value === "1",
              };
            } else if (field?.type === "number" || field?.type === "date") {
              let [min, max] = value.split("->") as [
                string | number | Date | null,
                string | number | Date | null
              ];

              if (field?.type === "date") {
                min = min ? new Date(min) : null;
                max = max ? new Date(max) : null;
              } else {
                min = min ? parseFloat(min as string) : null;
                max = max ? parseFloat(max as string) : null;

                if (isNaN(min as number)) min = null;
                if (isNaN(max as number)) max = null;
              }

              if (value.startsWith(">=")) {
                return {
                  op: "gte" as RestSearchQueryOp,
                  value: min,
                };
              }
              if (value.startsWith("<=")) {
                return {
                  op: "lte" as RestSearchQueryOp,
                  value: min,
                };
              }
              if (value.includes("->")) {
                return {
                  op: "range" as RestSearchQueryOp,
                  value: [min, max],
                };
              }
              return {
                op: "equals" as RestSearchQueryOp,
                value: min,
              };
            } else {
              valid = false;
            }
            return { op: "equals" as RestSearchQueryOp, value };
          }),
        };
      }),
  ];

  return {
    valid,
    fields: result,
  };
};
