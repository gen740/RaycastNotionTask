import { Action, ActionPanel, Color, Detail, List } from "@raycast/api";
import type { Task, TaskLists } from "./type";
import { changeTaskStatus } from "./utils/changeTaskStatus";
import getTaskLists from "./utils/getTaskLists";
import { useCachedPromise } from "@raycast/utils";
import { useEffect, useState } from "react";

const TaskMarkdown = ({
  icon,
  task,
}: {
  icon: {
    source: string;
    tintColor: Color;
  };
  task: Task;
}) => {
  const [md, setMd] = useState<string | undefined>(undefined);

  useEffect(() => {
    task.contentMarkdown?.().then(setMd);
  });
  return (
    <Detail
      isLoading={md === undefined}
      markdown={`${md}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label icon={icon} title="Title" text={task.title} />
          <Detail.Metadata.Label
            title="期限"
            text={task.dueDate?.toDateString() ?? "No date"}
          />
        </Detail.Metadata>
      }
    />
  );
};

const Items = ({
  items,
  revalidate,
}: { items: TaskLists | undefined; revalidate: () => void }) => {
  return items?.map((task) => {
    let icon = {
      source: "icon/kanban_status_backlog.png",
      tintColor: Color.Red,
    };
    switch (task.status) {
      case "done":
        icon = {
          source: "icon/kanban_status_completed.png",
          tintColor: Color.Blue,
        };
        break;
      case "in progress":
        icon = {
          source: "icon/kanban_status_started.png",
          tintColor: Color.Green,
        };
        break;
      case "not started":
        icon = {
          source: "icon/kanban_status_not_started.png",
          tintColor: Color.Orange,
        };
        break;
    }
    return (
      <List.Item
        title={`${task.title}`}
        key={task.title}
        icon={icon}
        actions={
          <ActionPanel>
            <Action.Push
              title="push"
              target={<TaskMarkdown icon={icon} task={task} />}
            />
            <Action.OpenInBrowser
              url={`https://notion.so/${task.pageId.replace(/-/g, "")}`}
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
            <Action
              title="Mark As Done"
              onAction={() => {
                changeTaskStatus(task.pageId, "done");
                setTimeout(revalidate, 200);
              }}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
            <Action
              title="Mark As In Progress"
              onAction={() => {
                changeTaskStatus(task.pageId, "in progress");
                setTimeout(revalidate, 200);
              }}
              shortcut={{ modifiers: ["cmd"], key: "i" }}
            />
            <Action
              title="Mark As Not Started"
              onAction={() => {
                changeTaskStatus(task.pageId, "not started");
                setTimeout(revalidate, 200);
              }}
              shortcut={{ modifiers: ["cmd"], key: "n" }}
            />
            <Action
              title="Reload"
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
    );
  });
};

export function Search() {
  const { data, revalidate } = useCachedPromise(getTaskLists, []);

  const today = new Date();
  const oneWeekAgo = new Date(today.setDate(today.getDate() - 3));

  const filteredTask = data
    ?.filter((task) => {
      return (
        task.status !== "done" ||
        task.dueDate === undefined ||
        oneWeekAgo.getTime() - task.dueDate.getTime() < 0
      );
    })
    .sort((a: Task, b: Task) => {
      const statusToNum = (status: typeof a.status) => {
        switch (status) {
          case "not started":
            return 1;
          case "in progress":
            return 2;
          case "done":
            return 3;
        }
        return 4;
      };
      return statusToNum(a.status) - statusToNum(b.status);
    });

  return (
    <List>
      <Items items={filteredTask} revalidate={revalidate} />
    </List>
  );
}

export default Search;
