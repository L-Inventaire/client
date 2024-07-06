import SingleCenterCard from "@atoms/single-center-card/single-center-card";
import { useAuth } from "@features/auth/state/use-auth";
import { ROUTES, getRoute } from "@features/routes";
import { ReactNode, useCallback, useEffect } from "react";
import { Route, useNavigate } from "react-router-dom";
import { Login } from "./login";
import { SignUp } from "./signup";
import { AnimatedBackground } from "@atoms/animated-background";
import { useClients } from "@features/clients/state/use-clients";

export const LoginRoutes = () => {
  return (
    <Route path={ROUTES.Login}>
      <Route
        path={ROUTES.SignUp}
        element={
          <PublicPage>
            <SignUp />
          </PublicPage>
        }
      />
      <Route
        path={""}
        element={
          <PublicPage>
            <Login />
          </PublicPage>
        }
      />
    </Route>
  );
};

const useRedirectToApp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients, loading } = useClients();

  const redirectToApp = useCallback(() => {
    navigate(
      decodeURIComponent(
        new URL((window as any).document.location).searchParams.get("r") || ""
      ) || clients?.[0]?.client?.id
        ? getRoute(ROUTES.Home, { client: clients?.[0]?.client?.id })
        : ROUTES.JoinCompany
    );
  }, [navigate, clients, loading]);

  useEffect(() => {
    if (user?.id && !loading) redirectToApp();
  }, [user?.id, loading]);

  return { user };
};

const PublicPage = (props: { children: ReactNode }) => {
  const { user } = useRedirectToApp();

  useEffect(() => {
    if (user?.id) {
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/enterprise.js?render=6Lf5LxopAAAAALXErlTeGxlWy_x6M8RlKlJzZ4RB";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (user?.id) {
    return <></>;
  }

  return (
    <div className="h-full w-full absolute sm:bg-transparent">
      <SingleCenterCard insetLogo>{props.children}</SingleCenterCard>
      <AnimatedBackground />
    </div>
  );
};
