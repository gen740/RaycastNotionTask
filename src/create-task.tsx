import { ActionPanel, Detail, Action, Form } from "@raycast/api";
import { useState } from "react";
import createTask from "./utils/createTask";
import { EmojiList } from "./emoji";
import type { Emoji, TaskFormValue } from "./type";
import { withNotionAccessToken } from "./utils/accessToken";

export function Create() {
  const [submittedValue, setSubmittedValue] = useState<TaskFormValue | null>(
    null,
  );

  const [emojiError, setEmojiError] = useState<string | undefined>();

  function dropEmojiErrorIfNeeded() {
    if (emojiError && emojiError.length > 0) {
      setEmojiError(undefined);
    }
  }

  if (submittedValue !== null) {
    return (
      <Detail
        markdown={`
# ${submittedValue.emoji} ${submittedValue.title}has created!
`}
      />
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit Favorite"
            onSubmit={(values: TaskFormValue) => {
              createTask(values);
              setSubmittedValue(values);
              return false;
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="タイトル" />
      <Form.DatePicker id="deadline" title="期限" />
      <Form.TextField
        id="emoji"
        title="アイコン"
        error={emojiError}
        onChange={dropEmojiErrorIfNeeded}
        onBlur={(event) => {
          console.log(event);
          if (
            event.target?.value === undefined ||
            event.target.value === "" ||
            EmojiList.includes(event.target?.value as Emoji)
          ) {
            dropEmojiErrorIfNeeded();
          } else {
            setEmojiError("Not valid emoji");
          }
        }}
      />
    </Form>
  );
}

export default withNotionAccessToken(Create);
