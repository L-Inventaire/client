import { fetchServer } from "@features/utils/fetch-server";
import { SigningSession } from "../types";
import { StandardOrErrorResponse } from "@features/utils/rest/types/types";

export class SigningSessionsApiClient {
  static getSigningSession = async (
    id: string
  ): Promise<StandardOrErrorResponse<SigningSession>> => {
    const response = await fetchServer("/api/signing-sessions/v1/" + id, {
      method: "GET",
    });

    const data = await response.json();
    return data as SigningSession;
  };

  static async sendInvoice(clientId: string, id: string, recipients: string[]) {
    const response = await fetchServer(
      `/api/signing-sessions/v1/${clientId}/send-invoice/${id}`,
      {
        method: "POST",
        body: JSON.stringify({ recipients }),
      }
    );

    const data = await response.json();
    return data as SigningSession;
  }

  static viewSigningSessio = async (id: string, contactID: string) => {
    const response = await fetchServer(
      "/api/signing-sessions/v1/" + id + "/view",
      {
        method: "POST",
        body: JSON.stringify({ contact_id: contactID }),
      }
    );

    const data = await response.json();
    return data as SigningSession;
  };

  static signSigningSession = async (id: string) => {
    const response = await fetchServer(
      "/api/signing-sessions/v1/" + id + "/sign",
      {
        method: "POST",
      }
    );

    const data = await response.json();
    return data as SigningSession;
  };

  static confirmSignSigningSession = async (id: string) => {
    const response = await fetchServer(
      "/api/signing-sessions/v1/" + id + "/confirm-signed",
      {
        method: "POST",
      }
    );

    const data = await response.json();
    return data as SigningSession;
  };

  static cancelSigningSession = async (id: string) => {
    const response = await fetchServer(
      "/api/signing-sessions/v1/" + id + "/cancel",
      {
        method: "POST",
      }
    );

    const data = await response.json();
    return data as SigningSession;
  };

  static downloadSignedDocument = async (id: string): Promise<Blob> => {
    const response = await fetchServer(
      "/api/signing-sessions/v1/" + id + "/download",
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download signed document");
    }

    const data = await response.blob();
    return data as Blob;
  };
}
