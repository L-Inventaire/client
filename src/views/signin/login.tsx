import { Button } from "@atoms/button/button";
import InputCode from "@atoms/input/input-code";
import { InputLabel } from "@atoms/input/input-decoration-label";
import { Input } from "@atoms/input/input-text";
import Link from "@atoms/link";
import { Info, Section, Subtitle } from "@atoms/text";
import { PageLoader } from "@components/page-loader";
import environment from "@config/environment";
import { AuthApiClient } from "@features/auth/api-client/api-client";
import { useAuth } from "@features/auth/state/use-auth";
import { ROUTES } from "@features/routes";
import { useControlledEffect } from "@features/utils/hooks/use-controlled-effect";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

let tryAgainTimeout: any = null;

export const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading: authLoading, userCached, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allowTryAgain, setAllowTryAgain] = useState(false);

  const [methods, setMethods] = useState<
    ("email" | "password" | "app" | "phone")[]
  >([]);
  const [mode, setMode] = useState<"email" | "password" | null>(null);
  const challenge = useRef("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  useControlledEffect(() => {
    if (mode === "email" && email) {
      requestEmailMFA();
    }
  }, [mode]);

  const requestEmailMFA = async () => {
    setAllowTryAgain(false);
    clearTimeout(tryAgainTimeout);
    const grecaptcha = (window as any).grecaptcha.enterprise;
    grecaptcha.ready(async () => {
      const captchaValidation = await grecaptcha.execute(
        environment.reCaptchaSiteKey,
        {
          action: "captcha",
        }
      );
      const token = await AuthApiClient.requestEmailMFA(
        email,
        captchaValidation
      );
      challenge.current = token.token;
      if (!token) {
        setMode(null);
        toast.error("Failed to send authentication code");
      } else {
        toast.success(t("signin.login.code_info"));
      }
      tryAgainTimeout = setTimeout(() => setAllowTryAgain(true), 10000);
    });
  };

  const submit = async () => {
    setLoading(true);
    try {
      if (!mode) {
        const { methods } = await AuthApiClient.getAvailableMFAs(email);
        setMethods(methods.map((a) => a.method));
        setMode(
          methods.find((a) => a.method === "password") ? "password" : "email"
        );
      } else {
        let authSecret = null;
        if (mode === "email") {
          const res = await AuthApiClient.verifyEmailMFA(
            challenge.current,
            code
          );
          authSecret = res.validation_token;
        } else {
          const res = await AuthApiClient.verifyPasswordMFA(
            challenge.current,
            code
          );
          authSecret = res.validation_token;
        }
        if (!authSecret) {
          toast.error("This code is invalid");
          setAllowTryAgain(true);
        } else {
          if (await login(authSecret, email, false)) {
            toast.success("Logged in successfully");
          } else {
            if (mode === "email") {
              //Mfa validation was successful but login failed so it means that the user is not registered
              navigate(ROUTES.SignUp + "?token=" + authSecret);
            } else {
              toast.error("Failed to log in");
            }
          }
        }
      }
    } catch (e) {
      toast.error("An error occurred");
    }

    setLoading(false);
  };

  useControlledEffect(() => {
    if (code.length === 8) {
      submit();
    }
  }, [code]);

  return (
    <div>
      {authLoading && <PageLoader />}
      {!authLoading && (
        <>
          {userCached?.id && (
            <div className="text-left">
              <Section>
                {t("signin.login.title", [userCached?.fullName])}
              </Section>
              <Subtitle>{t("signin.login.subtitle")}</Subtitle>
            </div>
          )}
          {!userCached?.id && (
            <div className="text-left">
              <Section>{t("signin.login.welcome")}</Section>
              <Subtitle>{t("signin.login.welcome_subtitle")}</Subtitle>
            </div>
          )}
          <InputLabel
            label={t("signin.login.email")}
            className="mt-4"
            input={
              <div className="flex flex-row">
                <Input
                  size="lg"
                  value={email}
                  placeholder="jeff@books.com"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMode(null);
                  }}
                />
              </div>
            }
          />

          {mode === "password" && (
            <InputLabel
              label={t("signin.login.password")}
              className="mt-4"
              input={
                <div className="flex flex-row">
                  <Input
                    size="lg"
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              }
            />
          )}

          {mode === "email" && (
            <InputLabel
              label={t("signin.login.code")}
              className="mt-4"
              input={
                <>
                  <div className="flex flex-row">
                    <InputCode
                      onComplete={(e) => {
                        setCode(e);
                      }}
                    />
                  </div>
                  <Info noColor className="text-left w-full block mt-2">
                    {!allowTryAgain && (
                      <Info>{t("signin.login.code_info")}</Info>
                    )}
                    {allowTryAgain && (
                      <Link
                        onClick={async () => {
                          await requestEmailMFA();
                        }}
                      >
                        {t("signin.login.code_resend")}
                      </Link>
                    )}
                  </Info>
                </>
              }
            />
          )}

          <div className="flex flex-row">
            <div className="grow">
              {methods.length > 1 && (
                <Link
                  onClick={() =>
                    setMode(mode === "email" ? "password" : "email")
                  }
                >
                  {mode === "email" && t("signin.login.password_instead")}
                  {mode === "password" && t("signin.login.email_instead")}
                </Link>
              )}
            </div>
            <Button
              className="mt-6"
              size="lg"
              loading={loading}
              shortcut={["enter"]}
              disabled={
                !email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/) ||
                (!password && mode === "password") ||
                (!code && mode === "email")
              }
              onClick={async () => {
                submit();
              }}
            >
              {t("general.continue")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
