import { AuthState, AuthType } from "@features/auth/state/store";
import { CustomersApiClient } from "@features/customers/api-client/api-client";
import { useControlledEffect } from "@features/utils/hooks/use-controlled-effect";
import { useGlobalEffect } from "@features/utils/hooks/use-global-effect";
import { LoadingState } from "@features/utils/store/loading-state-atom";
import jwt_decode from "jwt-decode";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useRecoilCallback, useRecoilState } from "recoil";
import { AuthApiClient } from "../api-client/api-client";
import { AuthJWT } from "../jwt";
import { getFullName } from "../utils";

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(AuthState);
  const [loading, setLoading] = useRecoilState(LoadingState("useAuth"));
  const { i18n } = useTranslation();

  useGlobalEffect(
    "useAuth",
    () => {
      setLoading(true);
    },
    []
  );

  const getExtractedToken = () => {
    if (!AuthJWT.token) return null;
    return jwt_decode(AuthJWT.token) as {
      id: string;
      lang: string;
      role: string;
      mfa: {
        method: string;
        exp: number;
      }[];
      ip: string;
      created_at: number;
      req_id: string;
      sandbox: boolean;
      iat: number;
      exp: number;
    };
  };

  const extendsToken = async (
    validationToken?: string,
    email?: string,
    doLogout = true
  ) => {
    const { token } = await AuthApiClient.extendToken(validationToken, email);

    if (!token) {
      if (doLogout) logout();
      return false;
    }
    AuthJWT.token = token;

    const customer = await CustomersApiClient.getAccount();
    setAuth({
      ...auth,
      isLoggedIn: true,
      authorization: token,
      user: customer,
      userCached: {
        avatar: customer.preferences.avatar || "",
        fullName: getFullName(customer),
        email: customer.email,
        id: customer.id,
      },
    });

    return true;
  };

  const renewAuthorization = async () => extendsToken();
  const login = extendsToken;
  const getUser = renewAuthorization;

  const logout = useRecoilCallback(({ snapshot }) => () => {
    AuthJWT.token = "";
    const updated = {
      ...snapshot.getLoadable(AuthState).contents,
      isLoggedIn: false,
      authorization: "",
      user: null,
    };
    saveAuth(updated);
    document.location.replace("/");
  });

  const clearUserCached = useRecoilCallback(({ snapshot }) => () => {
    const updated = {
      ...snapshot.getLoadable(AuthState).contents,
      userCached: null,
    };
    setAuth(updated);
    saveAuth(updated);
  });

  const saveAuth = (updated?: AuthType) => {
    localStorage.setItem(
      "user_authorization",
      JSON.stringify((updated || auth).authorization)
    );
    localStorage.setItem(
      "cache_AuthState",
      JSON.stringify((updated || auth).userCached)
    );
  };

  useControlledEffect(() => {
    if (!auth.isLoggedIn && auth.authorization) {
      AuthJWT.token = auth.authorization;
      extendsToken().then(() => {
        setLoading(false);
      });
      return;
    }

    if (auth.isLoggedIn) {
      if (
        auth?.user?.preferences?.language &&
        i18n.language !== auth?.user?.preferences?.language
      ) {
        i18n.changeLanguage(auth?.user?.preferences?.language);
      }
    }

    saveAuth();
    setLoading(false);
  }, [auth.isLoggedIn, auth.authorization]);

  //Set defaults for user
  const user = _.cloneDeep(auth.user);
  if (user) {
    user.preferences ||= {};
    user.preferences.language ||= "en-US";
  }

  return {
    loading,
    user,
    language: user?.preferences?.language as string,
    userCached: auth.userCached,
    clearUserCached,
    logout,
    login,
    extendsToken,
    getUser,
    getExtractedToken,
  };
};
