import type { EmojiList } from "./emoji";

type TaskStatus = "done" | "in progress" | "not started" | null;

export interface Task {
  title: string;
  status: TaskStatus;
  dueDate: Date;
  pageId: string;
}

// biome-ignore format:
export type Emoji = (typeof EmojiList)[number];

export type TaskLists = Task[];

export interface TaskFormValue {
  emoji: Emoji;
  title: string;
  deadline: Date;
}
