import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";
import { NotionToMarkdown } from "notion-to-md";

const { notion_token } = getPreferenceValues<Preferences>();
const n2m = new NotionToMarkdown({
  notionClient: new Client({ auth: notion_token }),
});

export async function fetchNotionContentAsMarkdown(pageId: string) {
  try {
    return (
      n2m.toMarkdownString(await n2m.pageToMarkdown(pageId)).parent ??
      "No Content"
    );
  } catch (e) {
    console.error(`Cannot find id = ${pageId}`);
  }
}
