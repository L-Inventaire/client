import { Button } from "@atoms/button/button";
import { DropDownAtom } from "@atoms/dropdown";
import { Page } from "@views/client/_layout/page";
import { useTranslation } from "react-i18next";
import { useSetRecoilState } from "recoil";

export const DemoPage = () => {
  const { t } = useTranslation();
  const setState = useSetRecoilState(DropDownAtom);

  return (
    <Page
      actions={
        <>
          <Button size="sm">Créer une facture</Button>
          <Button size="sm" theme="secondary">
            Créer un devis
          </Button>
        </>
      }
      title={[
        {
          label: "Factures",
        },
      ]}
    >
      <Button
        onClick={(e) => {
          setState({
            target: e.currentTarget,
            position: "bottom",
            menu: [
              {
                label: "Créer une facture",
                shortcut: ["shift+F"],
              },
            ],
          });
        }}
      >
        Test 1
      </Button>
      <br />
      <br />
      <br />
      <Button
        onClick={(e) => {
          setState({
            target: e.currentTarget,
            position: "right",
            menu: [
              {
                label: "Créer une facture",
                shortcut: ["shift+F"],
              },
              {
                type: "divider",
              },
              {
                label: "Factures",
                shortcut: ["F"],
              },
              {
                label: "Devis",
                shortcut: ["D"],
              },
              {
                label: "Archives",
              },
              {
                type: "divider",
              },
              {
                type: "danger",
                label: "Logout",
                shortcut: ["cmd+del", "ctrl+del"],
              },
            ],
          });
        }}
      >
        {t("demo.button")}
      </Button>
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
      <br />
      HEY
    </Page>
  );
};
