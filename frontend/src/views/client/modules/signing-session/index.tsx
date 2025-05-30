import { Button } from "@atoms/button/button";
import { Checkbox } from "@atoms/input/input-checkbox";
import { Input } from "@atoms/input/input-text";
import { PageLoader } from "@atoms/page-loader";
import { Base, Section } from "@atoms/text";
import { useSigningSession } from "@features/documents/hooks";
import { InvoicesApiClient } from "@features/invoices/api-client/invoices-api-client";
import { InvoiceLine, Invoices } from "@features/invoices/types/types";
import { getRoute, ROUTES } from "@features/routes";
import { isErrorResponse } from "@features/utils/rest/types/types";
import { CheckIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { Page } from "@views/client/_layout/page";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { TitleBar } from "./components/title-bar";

export const SigningSessionPage = () => {
  const navigate = useNavigate();

  const { session: sessionID } = useParams();
  const {
    signingSession,
    viewSigningSession,
    signSigningSession,
    cancelSigningSession,
    refetchSigningSession,
  } = useSigningSession(sessionID ?? "");
  const { t } = useTranslation();

  const [options, setOptions] = useState<(InvoiceLine & { _index: number })[]>(
    []
  );

  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>("");

  useEffect(() => {
    viewSigningSession(sessionID ?? "");
  }, [signingSession]);

  const invoiceSnapshot =
    signingSession && !isErrorResponse(signingSession)
      ? (signingSession.invoice_snapshot as unknown as Invoices)
      : null;

  // const { invoice } = useInvoice(invoiceSnapshot?.id ?? "");

  useEffect(() => {
    setOptions(
      invoiceSnapshot?.content
        ?.map((line, i) => ({ ...line, _index: i }))
        ?.filter((line) => line.optional)
        .map((line) => ({ ...line })) ?? []
    );
  }, [invoiceSnapshot]);

  if (!signingSession) {
    return (
      <div className="flex justify-center items-center h-full w-full dark:bg-wood-990 bg-white">
        <PageLoader />
      </div>
    );
  }

  if (isErrorResponse(signingSession)) {
    return (
      <div
        className={twMerge(
          "sm:overflow-auto overflow-hidden relative flex w-full grow flex-row bg-slate-50 dark:bg-slate-950 h-screen intro-animated-root z-10"
        )}
      >
        <Page
          title={[
            {
              label: t("documents.index.title"),
            },
          ]}
        >
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-3/4 bg-white flex flex-col justify-between items-center rounded-md p-6">
              <Base>An error occurred</Base>
            </div>
          </div>
        </Page>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        "sm:overflow-auto overflow-hidden relative flex w-full grow flex-row dark:bg-slate-950 h-screen intro-animated-root z-10 bg-white"
      )}
    >
      <Page
        title={[
          {
            label: t("documents.index.title"),
          },
        ]}
      >
        <div className="w-full h-full flex flex-col items-center grow">
          <div className="w-full max-w-4xl flex flex-col justify-between items-center rounded-md grow">
            <div className="w-full">
              {/* Logo and title section */}
              <TitleBar
                signingSession={signingSession}
                invoice={invoiceSnapshot}
                alerts={true}
              />

              {/* Buttons section */}
              <div className="flex my-4 w-full flex flex-row justify-center">
                {/* <EmbedDirectTemplate
                  token={signingSession.recipient_token}
                  onDocumentError={(error) => {}}
                /> */}

                {signingSession.state === "signed" && false && (
                  // Too slow to appear right now, so we remove it until we improve the user exp
                  <Button
                    className="mt-2"
                    onClick={() => {
                      navigate(
                        getRoute(ROUTES.SignedDocumentView, {
                          session: sessionID,
                        })
                      );
                    }}
                  >
                    Voir le document signé
                  </Button>
                )}

                {signingSession.state === "sent" && (
                  <Button
                    className="mt-2"
                    onClick={() => {
                      window.open(signingSession.signing_url);
                    }}
                  >
                    Signer le document
                  </Button>
                )}

                {invoiceSnapshot?.type === "quotes" &&
                  invoiceSnapshot?.state === "sent" &&
                  signingSession.state !== "cancelled" &&
                  signingSession.state !== "signed" &&
                  signingSession.recipient_role === "signer" &&
                  !signingSession.expired &&
                  invoiceSnapshot.is_deleted === false && (
                    <>
                      <Button
                        className="mr-2"
                        onClick={async () => {
                          const signedSession = await signSigningSession(
                            options ?? []
                          );
                          if (!signedSession.signing_url) {
                            toast.error(
                              "An error occurred while signing the document"
                            );
                            return;
                          }
                          window.open(signedSession.signing_url);
                        }}
                      >
                        Accepter et signer
                      </Button>
                      {!cancelling && (
                        <Button
                          theme="danger"
                          onClick={async () => {
                            setCancelling(true);
                          }}
                        >
                          Refuser
                        </Button>
                      )}
                      {cancelling && (
                        <>
                          <Button
                            theme="default"
                            className="-mr-px rounded-r-none"
                            onClick={async () => {
                              setCancelling(false);
                            }}
                            icon={(p) => <XCircleIcon {...p} />}
                          ></Button>
                          <Input
                            className="-mr-px w-1/2 rounded-none"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Raison du refus"
                          />
                          <Button
                            theme="danger"
                            className="rounded-l-none"
                            onClick={async () => {
                              await cancelSigningSession(cancelReason);
                              await refetchSigningSession();

                              toast.success(
                                "La signature a été refusée avec succès"
                              );

                              setCancelling(false);
                            }}
                            icon={(p) => <CheckIcon {...p} />}
                          />
                        </>
                      )}
                    </>
                  )}
              </div>

              {options.length > 0 &&
                invoiceSnapshot?.type !== "invoices" &&
                signingSession.recipient_role === "signer" &&
                !signingSession.expired && (
                  <div className="mb-4">
                    <Section>Options</Section>
                    <div className="flex w-full mt-2">
                      {options.map((option) => (
                        <div className="flex">
                          <Checkbox
                            disabled={
                              signingSession.state === "signed" ||
                              signingSession.state === "sent"
                            }
                            onChange={(value) => {
                              setOptions((options) =>
                                options.map((o) =>
                                  o._id === option._id
                                    ? { ...o, optional_checked: value }
                                    : o
                                )
                              );
                            }}
                            label={option.name}
                            size={"md"}
                            value={option.optional_checked}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* IFrame section */}
            {invoiceSnapshot && (
              <iframe
                className="w-full grow flex rounded"
                src={InvoicesApiClient.getPdfRoute(
                  {
                    client_id: invoiceSnapshot?.client_id ?? "",
                    id: invoiceSnapshot.id ?? "",
                  },
                  { checked: options }
                )}
                title="Invoice PDF Preview"
              ></iframe>
            )}
          </div>
        </div>
      </Page>
    </div>
  );
};
