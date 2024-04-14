import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import { getPreferenceValues } from "@raycast/api";
import parseRichTextItem from "./parseRichTextItem";
import type { Task, TaskLists } from "../type";

const { notion_token, task_database_id } = getPreferenceValues<Preferences>();

export default async function getTaskLists(): Promise<TaskLists> {
  const client = new Client({ auth: notion_token });

  return (
    await client.databases.query({
      database_id: task_database_id,
    })
  ).results.map((task) => {
    const t = task as PageObjectResponse;

    const ret: Task = {
      title: "",
      status: "not started",
      pageId: task.id,
    };

    {
      let emoji = "";
      if (t.icon?.type === "emoji") {
        emoji = t.icon.emoji;
      }
      // get title
      const title = t.properties.タイトル;
      if (title === undefined || title.type !== "title") {
        throw "Title has not been found";
      }
      ret.title = `${emoji} ${parseRichTextItem(title.title)}`;
    }

    {
      // get status
      const status = t.properties.ステータス;
      if (status === undefined || status.type !== "status") {
        throw "Status has not been found";
      }
      switch (status.status?.id) {
        case "1":
          ret.status = "not started";
          break;
        case "2":
          ret.status = "in progress";
          break;
        case "3":
          ret.status = "done";
          break;
        case null:
          ret.status = null;
      }
    }

    {
      // get date
      const dueDate = t.properties.期限;
      if (
        dueDate !== undefined &&
        dueDate.type === "date" &&
        dueDate.date !== undefined &&
        dueDate.date !== null
      ) {
        ret.dueDate = new Date(dueDate.date.start);
      }
    }

    return ret;
  });
}
