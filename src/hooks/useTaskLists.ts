import { useCachedPromise } from "@raycast/utils";
import getTaskLists from "../utils/getTaskLists";
import type { TaskLists } from "../type";

export function useTaskLists() {
  const { data, revalidate } = useCachedPromise(getTaskLists, []);
  return { data: data as TaskLists, revalidate };
}
