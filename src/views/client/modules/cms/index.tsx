import { Info } from "@atoms/text";
import { useCMSItems } from "@features/cms/state/use-cms";
import { CMSItem } from "@features/cms/types/types";
import {
  RestOptions,
  useRestSchema,
} from "@features/utils/rest/hooks/use-rest";
import { Page } from "@views/client/_layout/page";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { SearchBar } from "../../../../components/search-bar";
import {
  generateQueryFromMap,
  schemaToSearchFields,
} from "../../../../components/search-bar/utils/utils";
import { CMSColumn } from "./components/cms-column";

export const CMSPage = () => {
  const [options, setOptions] = useState<RestOptions<CMSItem>>({
    query: [],
    asc: false,
  });
  const { cms_items: cms_items_raw, update } = useCMSItems({
    ...options,
    query: generateQueryFromMap({ id: [] }),
  });

  const schema = useRestSchema("cms");
  const cms_items = cms_items_raw?.data?.list || [];

  return (
    <Page
      title={[{ label: "CMS" }]}
      bar={
        <SearchBar
          schema={{
            table: "CMS",
            fields: schemaToSearchFields(schema.data, {}),
          }}
          onChange={(q) =>
            q.valid && setOptions({ ...options, query: q.fields })
          }
        />
      }
    >
      <div className="-m-3 overflow-auto max-w-[100vw] h-full flex flex-col">
        <div className="px-3 h-7 w-full bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <Info>{cms_items_raw?.data?.total || 0} documents trouvés</Info>
        </div>

        <div
          className={twMerge(
            "grid grid-cols-4 w-full flex-1 grow rounded-none"
          )}
        >
          <CMSColumn
            type="new"
            items={cms_items.filter((item) => item.state === "new")}
            title="Nouveau"
            onMove={(item) => {
              update.mutate({ id: item.id, state: "new" });
            }}
          />
          <CMSColumn
            type="qualified"
            items={cms_items.filter((item) => item.state === "qualified")}
            title="Qualifié"
            onMove={(item) => {
              update.mutate({ id: item.id, state: "qualified" });
            }}
          />
          <CMSColumn
            type="proposal"
            items={cms_items.filter((item) => item.state === "proposal")}
            title="Proposition"
            onMove={(item) => {
              update.mutate({ id: item.id, state: "proposal" });
            }}
          />
          <CMSColumn
            type="won"
            items={cms_items.filter((item) => item.state === "won")}
            title="Gagné"
            onMove={(item) => {
              update.mutate({ id: item.id, state: "won" });
            }}
          />
        </div>
      </div>
    </Page>
  );
};
