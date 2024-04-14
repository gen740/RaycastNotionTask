import { useCachedPromise } from "@raycast/utils";
import type { TaskLists } from "../type";
import getTaskLists from "../utils/getTaskLists";

export function useTaskLists() {
  const { data, revalidate } = useCachedPromise(getTaskLists, []);
  return { data: data as TaskLists, revalidate };
}
