import { Ctx } from "#src/services/utils";
import { Router } from "express";
import { DateTime } from "luxon";
import { checkClientRoles, checkRole } from "../../common";
import { getDashboard } from "./services/dashboard";
import { getLatePayments } from "./services/late-payments";
import { getMatrix } from "./services/matrix";

export default (router: Router) => {
  router.get(
    "/:clientId/dashboard",
    checkRole("USER"),
    checkClientRoles(["ACCOUNTING_READ"]),
    async (req, res) => {
      const ctx = Ctx.get(req)?.context;
      res.json(
        await getDashboard(
          ctx,
          req.params.clientId,
          parseInt(req.query.year as string | undefined) || DateTime.now().year
        )
      );
    }
  );

  router.get(
    "/:clientId/dashboard/balances",
    checkRole("USER"),
    checkClientRoles(["ACCOUNTING_READ"]),
    async (req, res) => {
      const ctx = Ctx.get(req)?.context;
      res.json(
        await getLatePayments(
          ctx,
          req.params.clientId,
          req.query.type as "client" | "supplier" | undefined
        )
      );
    }
  );

  router.get(
    "/:clientId/dashboard/tags",
    checkRole("USER"),
    checkClientRoles(["ACCOUNTING_READ"]),
    async (req, res) => {
      const ctx = Ctx.get(req)?.context;
      if (((req.query.date || "") as string)?.split("-").length === 2) {
        res.json(
          await getMatrix(ctx, req.params.clientId, req.query.date as string)
        );
      } else {
        const year =
          parseInt(req.query.date as string | undefined) || DateTime.now().year;
        const all = await Promise.all(
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) =>
            getMatrix(
              ctx,
              req.params.clientId,
              `${year}-${month.toString().padStart(2, "0")}`
            )
          )
        );
        res.json(all);
      }
    }
  );
};
