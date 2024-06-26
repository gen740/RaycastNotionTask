import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";
import type { TaskStatus } from "../type";

const { notion_token } = getPreferenceValues<Preferences>();

export function changeTaskStatus(pageId: string, status: TaskStatus) {
  const client = new Client({ auth: notion_token });

  client.pages.update({
    page_id: pageId,
    properties: {
      Status: {
        status: {
          id: (() => {
            switch (status) {
              case "done":
                return "3";
              case "in progress":
                return "2";
              case "not started":
                return "1";
              default:
                return "1";
            }
          })(),
        },
      },
    },
  });
}
