import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  UpdateDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

import { getPreferenceValues } from "@raycast/api";
import parseRichTextItem from "./parseRichTextItem";

const { notion_token, task_database_id } = getPreferenceValues<Preferences>();

export default function createTask(task: TaskFormValue) {
  const client = new Client({ auth: notion_token });

  const response = client.pages.create({
    parent: {
      type: "database_id",
      database_id: task_database_id,
    },
    icon: {
      type: "emoji",
      emoji: task.emoji,
    },
    properties: {
      タイトル: {
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: task.title,
              link: null,
            },
          },
        ],
      },
      ステータス: {
        type: "status",
        status: { id: "1" },
      },
      期限: {
        type: "date",
        date: (() => {
          if (task.deadline === null) {
            return null;
          }
          return { start: task.deadline?.toISOString() };
        })(),
      },
    },
  });
  console.log(response);
}
