import { Action, ActionPanel, Color, Detail, List } from "@raycast/api";
import { useTaskLists } from "./hooks/useTaskLists";
import type { Task } from "./type";
import { withNotionAccessToken } from "./utils/accessToken";
import { changeTaskStatus } from "./utils/changeTaskStatus";
import { useEffect, useState } from "react";

function taskElement(task: Task, revalidate: () => void) {
  const [detailMarkdown, setDetailMarkdown] = useState<string | undefined>();
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

  useEffect(() => {
    task.contentMarkdown?.().then((value) => {
      setDetailMarkdown(value ?? "");
    });
  }, [task]);

  return (
    <List.Item
      icon={icon}
      title={task.title}
      subtitle={task.dueDate?.toDateString() ?? ""}
      key={task.title}
      actions={
        <ActionPanel title="Notion Task">
          <Action.Push
            title={detailMarkdown ?? ""}
            target={((detailMarkdown) => {
              return (
                <Detail
                  isLoading={detailMarkdown === undefined}
                  markdown={detailMarkdown}
                  metadata={
                    <Detail.Metadata>
                      <Detail.Metadata.Label
                        icon={icon}
                        title="Title"
                        text={task.title}
                      />
                      <Detail.Metadata.Label
                        title="期限"
                        text={task.dueDate?.toDateString() ?? "No date"}
                      />
                    </Detail.Metadata>
                  }
                />
              );
            })(detailMarkdown)}
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
}

export function Search() {
  const { data, revalidate } = useTaskLists();

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
    <List>{filteredTask?.map((task) => taskElement(task, revalidate))}</List>
  );
}

export default withNotionAccessToken(Search);
