import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import { getPreferenceValues } from "@raycast/api";
import type { Task, TaskLists } from "../type";
import parseRichTextItem from "./parseRichTextItem";

const { notion_token, task_database_id } = getPreferenceValues<Preferences>();

export default async function getTaskLists(): Promise<TaskLists> {
  const client = new Client({ auth: notion_token });

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
      details: "",
      pageId: task.id,
      link: null,
    };

    {
      // get title with emoji
      let emoji = "";
      if (t.icon?.type === "emoji") {
        emoji = t.icon.emoji;
      }
      const title = t.properties.Title;
      if (title === undefined || title.type !== "title") {
        throw "Title has not been found";
      }
      taskInfo.title = `${emoji} ${parseRichTextItem(title.title)}`;
    }

    {
      // get details
      const details = t.properties.Details;
      if (details === undefined || details.type !== "rich_text") {
        throw "Details has not been found";
      }
      taskInfo.details = parseRichTextItem(details.rich_text);
    }

    {
      // get status
      const status = t.properties.Status;
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
      const dueDate = t.properties["Due Date"];
      if (dueDate === undefined || dueDate.type !== "date") {
        throw "Due Date has not been found";
      }
      if (dueDate.date === null) {
        taskInfo.dueDate = undefined;
      } else {
        taskInfo.dueDate = {
          start: new Date(dueDate.date.start),
          end: dueDate.date.end === null ? undefined : new Date(dueDate.date.end),
        };
      }
    }

    {
      // get Link
      const link = t.properties.Link;
      if (link === undefined || link.type !== "url") {
        throw "Link has not been found";
      }
      taskInfo.link = link.url;
    }

    ret.push(taskInfo);
  }

  return ret;
}
