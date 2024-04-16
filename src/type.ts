import type { EmojiList } from "./emoji";

export type TaskStatus = "done" | "in progress" | "not started" | null;

export interface Task {
  title: string;
  status: TaskStatus;
  details: string;
  dueDate?: {
    start: Date;
    end?: Date;
  };
  pageId: string;
  link: string | null;
  contentMarkdown: () => Promise<string | undefined>;
}

// biome-ignore format:
export type Emoji = (typeof EmojiList)[number];

export type TaskLists = Task[];

export interface TaskFormValue {
  emoji: Emoji | "" | undefined;
  title: string;
  details: string | undefined;
  link: string | undefined;
  deadline: Date | null;
  tags: string[];
}
