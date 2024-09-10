import { useQuery } from "@tanstack/react-query";
import { SigningSessionsApiClient } from "./api-client/api-client";
import { isErrorResponse } from "@features/utils/rest/types/types";

export const useSigningSession = (id: string) => {
  const {
    data: signingSession,
    isLoading: isLoadingDocument,
    refetch: refetchSigningSession,
  } = useQuery({
    queryKey: ["signing-session", id],
    queryFn: () => SigningSessionsApiClient.getSigningSession(id),
  });

  const {
    data: signedDocument,
    isLoading: isLoadingSignedDocument,
    refetch: refetchSignedDocument,
  } = useQuery({
    queryKey: ["signing-session", id, "document"],
    queryFn: async () =>
      await SigningSessionsApiClient.downloadSignedDocument(id),
    enabled:
      signingSession &&
      !isErrorResponse(signingSession) &&
      signingSession.state === "signed",
    retry: 50,
    retryDelay: 3000,
    retryOnMount: true,
  });

  const viewSigningSession = async (contactID: string) => {
    await SigningSessionsApiClient.viewSigningSessio(id, contactID);
  };

  const signSigningSession = () => {
    return SigningSessionsApiClient.signSigningSession(id);
  };

  const downloadSignedDocument = async () => {
    return await SigningSessionsApiClient.downloadSignedDocument(id);
  };

  return {
    signingSession,
    refetchSigningSession,
    isLoadingDocument,
    viewSigningSession,
    signSigningSession,
    downloadSignedDocument,
    signedDocument,
    isLoadingSignedDocument,
    refetchSignedDocument,
  };
};
