import { Action, ActionPanel, Color, Detail, Icon, List } from "@raycast/api";
import type { Task, TaskLists } from "./type";
import { changeTaskStatus } from "./utils/changeTaskStatus";
import getTaskLists from "./utils/getTaskLists";
import { useCachedPromise } from "@raycast/utils";
import { useEffect, useState } from "react";
import { fetchNotionContentAsMarkdown } from "./utils/fetchMarkdownContent";

const TaskMarkdown = ({
  icon,
  task,
  revalidate,
}: {
  icon: {
    source: string;
    tintColor: Color;
  };
  task: Task;
  revalidate: () => void;
}) => {
  const [mdContent, setMdContent] = useState<string | undefined>(undefined);
  useEffect(() => {
    fetchNotionContentAsMarkdown(task.pageId).then(setMdContent);
  }, [task]);
  return (
    <Detail
      isLoading={mdContent === undefined}
      markdown={`${mdContent ?? "Loading..."}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label icon={icon} title="Title" text={task.title} />
          {task.details === "" ? <></> : <Detail.Metadata.Label title="Details" text={task.details} />}
          <Detail.Metadata.Label title="Due Date" text={task.dueDate?.start.toDateString() ?? "No date"} />
          {task.link === null ? <></> : <Detail.Metadata.Link title="Link" text={task.link} target={task.link} />}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            url={`https://notion.so/${task.pageId.replace(/-/g, "")}`}
            shortcut={{ modifiers: ["cmd"], key: "o" }}
          />
          {task.link === null ? (
            <></>
          ) : (
            <Action.OpenInBrowser
              title="Open Attached Link"
              url={task.link}
              shortcut={{ modifiers: ["ctrl"], key: "o" }}
            />
          )}
          <Action
            title="Mark As Done"
            icon={TaskIcon.Done}
            onAction={() => {
              changeTaskStatus(task.pageId, "done");
              setTimeout(revalidate, 200);
            }}
            shortcut={{ modifiers: ["ctrl"], key: "d" }}
          />
          <Action
            title="Mark As In Progress"
            icon={TaskIcon.InProgress}
            onAction={() => {
              changeTaskStatus(task.pageId, "in progress");
              setTimeout(revalidate, 200);
            }}
            shortcut={{ modifiers: ["ctrl"], key: "i" }}
          />
          <Action
            title="Mark As Not Started"
            icon={TaskIcon.NotStarted}
            onAction={() => {
              changeTaskStatus(task.pageId, "not started");
              setTimeout(revalidate, 200);
            }}
            shortcut={{ modifiers: ["ctrl"], key: "x" }}
          />
          <Action title="Reload" onAction={revalidate} shortcut={{ modifiers: ["cmd"], key: "r" }} />
        </ActionPanel>
      }
    />
  );
};

const TaskIcon = {
  Done: {
    source: "icon/kanban_status_completed.png",
    tintColor: Color.Blue,
  },
  InProgress: {
    source: "icon/kanban_status_started.png",
    tintColor: Color.Green,
  },
  NotStarted: {
    source: "icon/kanban_status_not_started.png",
    tintColor: Color.Orange,
  },
};

const Items = ({ items, revalidate }: { items: TaskLists | undefined; revalidate: () => void }) => {
  return items?.map((task) => {
    let icon = {
      source: "icon/kanban_status_backlog.png",
      tintColor: Color.Red,
    };
    switch (task.status) {
      case "done":
        icon = TaskIcon.Done;
        break;
      case "in progress":
        icon = TaskIcon.InProgress;
        break;
      case "not started":
        icon = TaskIcon.NotStarted;
        break;
    }

    const accessories: {
      icon:
        | {
            source: string;
            tintColor?: Color;
          }
        | Icon;
      text: string;
    }[] = [];

    if (task.link !== null) {
      accessories.push({
        icon: Icon.Link,
        text: "",
      });
    }

    let dueDateStart: string | undefined = undefined;
    if (task.dueDate !== undefined) {
      const mm = String(task.dueDate.start.getMonth() + 1).padStart(2, "0");
      const dd = String(task.dueDate.start.getDate()).padStart(2, "0");
      dueDateStart = `${mm}/${dd}`;
      accessories.push({
        icon: {
          source: task.dueDate.end === undefined ? "icon/date_end.png" : "icon/date_start.png",
        },
        text: dueDateStart,
      });
    }

    let dueDateEnd: string | undefined = undefined;
    if (task.dueDate?.end !== undefined) {
      const mm = String(task.dueDate.end.getMonth() + 1).padStart(2, "0");
      const dd = String(task.dueDate.end.getDate()).padStart(2, "0");
      dueDateEnd = `${mm}/${dd}`;
      accessories.push({
        icon: {
          source: "icon/date_end.png",
        },
        text: dueDateEnd,
      });
    }

    return (
      <List.Item
        title={`${task.title}`}
        key={task.title}
        icon={icon}
        subtitle={task.details}
        accessories={accessories}
        actions={
          <ActionPanel>
            <Action.Push
              title="Show Detail"
              icon={Icon.AppWindowSidebarLeft}
              target={<TaskMarkdown icon={icon} task={task} revalidate={revalidate} />}
            />
            {task.link === null ? (
              <></>
            ) : (
              <Action.OpenInBrowser
                title="Open Attached Link"
                url={task.link}
                shortcut={{ modifiers: ["ctrl"], key: "o" }}
              />
            )}
            <Action.OpenInBrowser
              url={`https://notion.so/${task.pageId.replace(/-/g, "")}`}
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
            <Action
              title="Mark As Done"
              icon={TaskIcon.Done}
              onAction={() => {
                changeTaskStatus(task.pageId, "done");
                setTimeout(revalidate, 200);
              }}
              shortcut={{ modifiers: ["ctrl"], key: "d" }}
            />
            <Action
              title="Mark As In Progress"
              icon={TaskIcon.InProgress}
              onAction={() => {
                changeTaskStatus(task.pageId, "in progress");
                setTimeout(revalidate, 200);
              }}
              shortcut={{ modifiers: ["ctrl"], key: "i" }}
            />
            <Action
              title="Mark As Not Started"
              icon={TaskIcon.NotStarted}
              onAction={() => {
                changeTaskStatus(task.pageId, "not started");
                setTimeout(revalidate, 200);
              }}
              shortcut={{ modifiers: ["ctrl"], key: "x" }}
            />
            <Action title="Reload" onAction={revalidate} shortcut={{ modifiers: ["cmd"], key: "r" }} />
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
        task.status !== "done" || task.dueDate === undefined || oneWeekAgo.getTime() - task.dueDate.start.getTime() < 0
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
