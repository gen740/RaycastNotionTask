import { Action, ActionPanel, Detail, Form, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { EmojiList } from "./emoji";
import type { Emoji, TaskFormValue } from "./type";
import { withNotionAccessToken } from "./utils/accessToken";
import createTask from "./utils/createTask";
import { Client } from "@notionhq/client";

const { notion_token, task_database_id } = getPreferenceValues<Preferences>();

export function Create() {
  const [submittedValue, setSubmittedValue] = useState<TaskFormValue | null>(null);
  const [emojiError, setEmojiError] = useState<string | undefined>();
  const [titleError, setTitleError] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    new Client({ auth: notion_token }).databases
      .retrieve({
        database_id: task_database_id,
      })
      .then((value) => {
        if (value.properties.Tags.type === "multi_select") {
          setTags(value.properties.Tags.multi_select.options.map((v) => v.name));
        }
      });
  });

  function dropEmojiErrorIfNeeded() {
    if (emojiError && emojiError.length > 0) {
      setEmojiError(undefined);
    }
  }

  function validateTitle(title: string | undefined) {
    if (titleError === undefined && (title === undefined || title === "")) {
      setTitleError("Title should not be empty");
    } else {
      setTitleError(undefined);
    }
  }

  if (submittedValue !== null) {
    return (
      <Detail
        markdown={`
# ${submittedValue.emoji} ${submittedValue.title} has created!
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
      <Form.TextField
        id="title"
        title="Title"
        error={titleError}
        onChange={validateTitle}
        onBlur={(event) => validateTitle(event.target.value)}
      />
      <Form.DatePicker id="deadline" title="Due Date" />
      <Form.TextField
        id="emoji"
        title="Icon"
        error={emojiError}
        onChange={dropEmojiErrorIfNeeded}
        onBlur={(event) => {
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
      <Form.TextField id="details" title="Details" />
      <Form.TextField id="link" title="Link" />
      <Form.TagPicker id="tags" title="Tags">
        {tags.map((tag) => (
          <Form.TagPicker.Item value={tag} title={tag} key={tag} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}

export default withNotionAccessToken(Create);
