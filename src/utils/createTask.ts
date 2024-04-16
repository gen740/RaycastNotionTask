import { Client } from "@notionhq/client";

import { getPreferenceValues } from "@raycast/api";
import type { TaskFormValue } from "../type";

const { notion_token, task_database_id } = getPreferenceValues<Preferences>();

export default function createTask(task: TaskFormValue) {
  const client = new Client({ auth: notion_token });

  client.pages.create({
    parent: {
      type: "database_id",
      database_id: task_database_id,
    },
    icon: (() => {
      if (task.emoji === undefined || task.emoji === "") {
        return undefined;
      }
      return {
        type: "emoji",
        emoji: task.emoji,
      };
    })(),
    properties: {
      Title: {
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
      Status: {
        type: "status",
        status: { id: "1" },
      },
      "Due Date": {
        type: "date",
        date: (() => {
          if (task.deadline === null) {
            return null;
          }
          return { start: task.deadline?.toISOString() ?? "" };
        })(),
      },
      Details: {
        type: "rich_text",
        rich_text: [
          {
            text: {
              content: task.details ?? "",
            },
          },
        ],
      },
      Link: {
        type: "url",
        url: (() => {
          if (
            task.link === null ||
            task.link === undefined ||
            task.link === ""
          ) {
            return null;
          }
          return task.link;
        })(),
      },
      Tags: {
        type: "multi_select",
        multi_select: task.tags.map((v) => {
          return { name: v };
        }),
      },
    },
  });
}
