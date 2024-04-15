import type { EmojiList } from "./emoji";

export type TaskStatus = "done" | "in progress" | "not started" | null;

export interface Task {
  title: string;
  status: TaskStatus;
  dueDate?: Date;
  pageId: string;
  contentMarkdown?: () => Promise<string|undefined>;
}

// biome-ignore format:
export type Emoji = (typeof EmojiList)[number];

export type TaskLists = Task[];

export interface TaskFormValue {
  emoji: Emoji;
  title: string;
  deadline: Date;
}
