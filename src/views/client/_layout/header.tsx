import Link from "@atoms/link";
import { BaseSmall, Info, Title } from "@atoms/text";
import { useTranslation } from "react-i18next";
import { Search } from "./search";
import { Button } from "@atoms/button/button";
import { PlusIcon } from "@heroicons/react/outline";
import { atom, useRecoilValue } from "recoil";
import { ROUTES } from "@features/routes";

export const LayoutTitleAtom = atom<
  {
    label?: string;
    href?: string;
    to?: string;
  }[]
>({
  key: "LayoutTitleAtom",
  default: [{}],
});

export const LayoutActionsAtom = atom<React.ReactNode>({
  key: "LayoutActionsAtom",
  default: <></>,
});

export const Header = () => {
  const title = useRecoilValue(LayoutTitleAtom);
  const actions = useRecoilValue(LayoutActionsAtom);

  return (
    <div className="bg-wood-25 dark:bg-wood-990 border-b border-opacity-10 border-slate-500 lg:pt-4 flex flex-row justify-center lg:items-center px-2 sm:px-4 min-h-0 shrink-0 z-60">
      <div className="lg:mr-4 text-center mt-4 lg:text-left lg:mt-0 min-h-11">
        <div className="my-2 inline text-center lg:mr-4 relative -bottom-1">
          <Link to={ROUTES.Home} noColor>
            <Info className="inline">
              L'inventaire{title.length ? " / " : ""}
            </Info>
          </Link>
          {title.map((t, i) => (
            <Link to={t.to} href={t.href} noColor>
              {i === title.length - 1 ? (
                <Title className="inline">{t.label}</Title>
              ) : (
                <Info className="inline">
                  {t.label || "L'inventaire"}
                  {title.length > 1 ? " / " : ""}
                </Info>
              )}
            </Link>
          ))}
        </div>
        <div className="flex my-2 lg:inline-flex space-x-2 justify-center">
          {actions}
        </div>
      </div>

      <div className="hidden lg:inline-flex grow flex items-start justify-center"></div>

      <div className="hidden lg:inline-flex flex flex-row items-center justify-center ml-4">
        <Links />
      </div>

      <div className="hidden lg:inline max-w-md w-full">
        <Search />
      </div>
    </div>
  );
};

const Links = () => {
  const { t } = useTranslation();
  return (
    <>
      <Link target="_BLANK" href="https://google.com" className="flex-row">
        <BaseSmall noColor>{t("header.guides")}</BaseSmall>
      </Link>
      <Separator />
      <Link target="_BLANK" href="mailto:" className="flex-row">
        <BaseSmall noColor>{t("header.support")}</BaseSmall>
      </Link>
      <Separator />
    </>
  );
};

const Separator = () => (
  <div className="hidden md:inline h-5 mx-4 border-solid border-r border-slate-500 opacity-25 inline-block"></div>
);
