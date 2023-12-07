import { useRecoilState } from "recoil";
import { CustomersMfasApiClient } from "../api-client/mfa-api-client";
import { CustomerMfaState, PublicCustomerAtom } from "./store";
import { CustomersApiClient } from "../api-client/api-client";
import { useGlobalEffect } from "@features/utils/hooks/use-global-effect";

export const usePublicCustomer = (id: string) => {
  const [customer, setCustomer] = useRecoilState(PublicCustomerAtom(id));

  const getCustomer = async () => {
    if (id) {
      const data = await CustomersApiClient.searchUser(id, "id");
      setCustomer(data);
    }
  };

  useGlobalEffect(
    "usePublicCustomer+" + id,
    () => {
      getCustomer();
    },
    []
  );

  return {
    customer,
    refresh: getCustomer,
  };
};

export const useCustomerMfa = () => {
  const [mfas, setMfas] = useRecoilState(CustomerMfaState);

  const getMfas = async () => {
    const data = await CustomersMfasApiClient.getMFAs();
    setMfas(data.methods);
  };

  const setMfa = async (mfa: {
    type: "email" | "phone" | "app" | "password";
    value: string;
    validation_token: string;
  }) => {
    await CustomersMfasApiClient.setMFA(mfa);
    await getMfas();
  };

  const deleteMfa = async (id: string) => {
    await CustomersMfasApiClient.deleteMFA(id);
    await getMfas();
  };

  useGlobalEffect(
    "useCustomerMfa",
    () => {
      getMfas();
    },
    []
  );

  return {
    mfas,
    getMfas,
    setMfa,
    deleteMfa,
  };
};
