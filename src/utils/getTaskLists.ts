import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import { getPreferenceValues } from "@raycast/api";
import type { Task, TaskLists } from "../type";
import parseRichTextItem from "./parseRichTextItem";
import { NotionToMarkdown } from "notion-to-md";

const { notion_token, task_database_id } = getPreferenceValues<Preferences>();

export default async function getTaskLists(): Promise<TaskLists> {
  const client = new Client({ auth: notion_token });
  const n2m = new NotionToMarkdown({ notionClient: client });

  const ret: TaskLists = [];

  const tasks = (
    await client.databases.query({
      database_id: task_database_id,
    })
  ).results;

  for (const task of tasks) {
    const t = task as PageObjectResponse;

    const taskInfo: Task = {
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
      taskInfo.title = `${emoji} ${parseRichTextItem(title.title)}`;
    }

    {
      // get status
      const status = t.properties.ステータス;
      if (status === undefined || status.type !== "status") {
        throw "Status has not been found";
      }
      switch (status.status?.id) {
        case "1":
          taskInfo.status = "not started";
          break;
        case "2":
          taskInfo.status = "in progress";
          break;
        case "3":
          taskInfo.status = "done";
          break;
        case null:
          taskInfo.status = null;
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
        taskInfo.dueDate = new Date(dueDate.date.start);
      }
    }

    taskInfo.contentMarkdown = async () => {
      let md = "";
      try {
        md = n2m.toMarkdownString(
          await n2m.pageToMarkdown(taskInfo.pageId),
        ).parent;
      } catch (e) {
        console.error(`Cannot find id = ${taskInfo.pageId}`);
      }
      return md;
    };

    ret.push(taskInfo);
  }

  return ret;
}
