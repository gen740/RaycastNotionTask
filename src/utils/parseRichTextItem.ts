import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

export default function parseRichTextItem(
  richText: RichTextItemResponse[],
): string {
  let ret = "";
  for (const item of richText) {
    ret = ret + item.plain_text;
  }
  return ret;
}
