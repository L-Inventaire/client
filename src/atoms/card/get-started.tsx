import { ReactNode } from "react";
import * as Text from "@atoms/text";
import Card from ".";
import { InformationCircleIcon } from "@heroicons/react/outline";

export const GetStartedCard = (props: {
  show?: boolean;
  className?: string;
  title?: ReactNode | string;
  text: ReactNode | string;
}) => {
  if (props.show === false) {
    return <></>;
  }

  return (
    <Card
      className={
        (props.className || "") +
        " !bg-blue-200 border border-blue-400 dark:bg-blue-900"
      }
      prefix={<InformationCircleIcon className="h-6 w-6 mx-2 mr-3 shrink-0" />}
      title={
        <Text.Base noColor className="">
          {props.title}
        </Text.Base>
      }
      text={<Text.BaseSmall>{props.text}</Text.BaseSmall>}
    />
  );
};
