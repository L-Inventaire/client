import { Alert } from "@atoms/alert";
import { Loader } from "@atoms/loader";
import * as Text from "@atoms/text";
import { MFAVerificationModal } from "@components/auth/mfa-verification-modal";
import { MethodType } from "@features/customers/api-client/mfa-api-client";
import { useCustomerMfa } from "@features/customers/state/hooks";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { TOTP } from "totp-generator";
import { Modal, ModalContent } from "@atoms/modal/modal";
import { Button } from "@atoms/button/button";
import { Input } from "@atoms/input/input-text";
import { InputLabel } from "@atoms/input/input-decoration-label";
import { ButtonConfirm } from "@atoms/button/confirm";
import { useAuth } from "@features/auth/state/use-auth";

export const SecurityApp = (props: { mfa?: MethodType }) => {
  const { user } = useAuth();
  const { setMfa, deleteMfa } = useCustomerMfa();

  const [edited, setEdited] = useState(false);
  const [step, setStep] = useState(0);
  const [code, setCode] = useState({ qr: "", secret: "" });
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [hasError, setHasError] = useState(false);
  const [inMfaVerification, setInMfaVerification] = useState(false);
  const [newMfa, setNewMfa] = useState<{
    type: string;
    value: string;
    validation_token: string;
  } | null>(null);

  const generateTOTP = () => {
    const issuer = "L'inventaire";
    const secret = Array(64)
      .fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567")
      .map(function (x) {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join("");
    const qr =
      "otpauth://totp/" +
      issuer +
      ":" +
      encodeURIComponent(user?.email || "User") +
      "?secret=" +
      secret +
      "&issuer=" +
      issuer +
      "&algorithm=SHA512&digits=6&period=30";
    return { qr, secret };
  };

  const validate = async () => {
    const secret = code.secret;
    const now = new Date().getTime();
    const op = {
      period: 30,
      algorithm: "SHA-512" as any,
      digits: 6,
    };

    const valid0 = TOTP.generate(secret, {
      ...op,
      timestamp: now - 2 * 30 * 1000,
    }).otp;
    const valid1 = TOTP.generate(secret, {
      ...op,
      timestamp: now - 30 * 1000,
    }).otp;
    const valid2 = TOTP.generate(secret, { ...op, timestamp: now }).otp;

    if (
      (valid0 === code1 && valid1 === code2) ||
      (valid1 === code1 && valid2 === code2)
    ) {
      setHasError(false);

      await setNewMfa({
        type: "app",
        value: secret,
        validation_token: "",
      });

      setStep(2);
      setInMfaVerification(true);
    } else {
      setHasError(true);
    }
  };

  return (
    <>
      <Modal
        open={edited}
        onClose={() => {
          setEdited(false);
        }}
      >
        <ModalContent
          title="Setup TOTP"
          text="(You need to install Google Authenticator or any TOTP app on your phone to use this feature.)"
        >
          {step === 0 && (
            <>
              <Text.Base className="mt-4 block">
                1. Open your TOTP app
              </Text.Base>
              <Text.Base className="mt-4 block">2. Scan this QR code</Text.Base>
              <div className="text-center mt-2">
                <QRCodeCanvas className="m-auto" value={code.qr} size={200} />
              </div>

              <Text.Base className="mt-4 block">3. Press continue</Text.Base>
              <br />
              <div className="text-center">
                <Button className="mx-2 my-2" onClick={() => setStep(1)}>
                  Continue
                </Button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <br />

              <Text.Base>
                Enter two consecutive codes generated by your app.
              </Text.Base>

              <InputLabel
                className="mt-4"
                label="Enter code 1"
                input={
                  <Input
                    placeholder="123456"
                    type="number"
                    onChange={(e) => setCode1(e.target.value)}
                  />
                }
              />

              <InputLabel
                className="mt-4"
                label="Enter code 2"
                input={
                  <Input
                    placeholder="123456"
                    type="number"
                    onChange={(e) => setCode2(e.target.value)}
                  />
                }
              />

              {hasError && (
                <Text.Info className="block text-red-500 mt-4">
                  Invalid codes.
                </Text.Info>
              )}

              <div className="text-center mt-6">
                <Button
                  className="mx-2 my-2"
                  theme="default"
                  onClick={() => setStep(0)}
                >
                  Go back
                </Button>
                <Button className="mx-2 my-2" onClick={() => validate()}>
                  Validate
                </Button>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="text-center my-8">
              <Loader />
            </div>
          )}
        </ModalContent>
      </Modal>

      <MFAVerificationModal
        text="Action: Update account TOTP app token"
        excludeMfas={["app"]}
        open={inMfaVerification}
        onClose={() => {
          setInMfaVerification(false);
          setEdited(false);
          setNewMfa(null);
        }}
        onTokenExtended={async () => {
          if (newMfa) {
            if (newMfa.value) {
              await setMfa({
                type: newMfa.type as MethodType["type"],
                value: newMfa.value,
                validation_token: newMfa.validation_token,
              });
            } else if (props.mfa?.id) {
              await deleteMfa(props.mfa.id);
            }
          }
          setInMfaVerification(false);
          setEdited(false);
        }}
      />

      {props.mfa && (
        <div className="max-w-md">
          <Button
            className="mr-4 my-2"
            theme="default"
            onClick={() => {
              setEdited(true);
              setCode(generateTOTP());
              setStep(0);
              setHasError(false);
            }}
          >
            Replace TOTP
          </Button>
          <ButtonConfirm
            className="my-2"
            theme="danger"
            onClick={() => {
              setNewMfa({
                type: "app",
                value: "",
                validation_token: "",
              });
              setInMfaVerification(true);
            }}
          >
            Remove TOTP access
          </ButtonConfirm>
        </div>
      )}
      {!props.mfa && (
        <>
          <Alert
            theme="gray"
            title="You have not set a TOTP app"
            icon={InformationCircleIcon}
            bullets={[
              "You can use a TOTP app instead of using your phone number for authentication.",
            ]}
          >
            <Button
              className="mt-4"
              theme="default"
              onClick={() => {
                setEdited(true);
                setCode(generateTOTP());
                setStep(0);
                setHasError(false);
              }}
            >
              Setup TOTP
            </Button>
          </Alert>
        </>
      )}
    </>
  );
};
