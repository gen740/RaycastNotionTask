import { Detail, getPreferenceValues } from "@raycast/api";

const { notion_token } = getPreferenceValues<Preferences>();

// TODO(gen740): More Message
export function withNotionAccessToken(
  callback: () => JSX.Element,
): () => JSX.Element {
  return (): JSX.Element => {
    if (notion_token === undefined || notion_token === "") {
      return <Detail markdown="Please set the private_token in preference" />;
    }
    return callback();
  };
}
