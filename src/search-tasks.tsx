import { Action, ActionPanel, Color, List } from "@raycast/api";
import { useTaskLists } from "./hooks/useTaskLists";
import type { Task } from "./type";
import { withNotionAccessToken } from "./utils/accessToken";
import { changeTaskStatus } from "./utils/changeTaskStatus";

export function Search() {
  const { data, revalidate } = useTaskLists();

  const today = new Date();
  const oneWeekAgo = new Date(today.setDate(today.getDate() - 3));

  const filteredTask = data
    ?.filter((task) => {
      if (task.dueDate !== undefined) {
        console.log(oneWeekAgo);
        console.log(oneWeekAgo.getTime() - task.dueDate.getTime() > 0);
      }
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
      {filteredTask?.map((task) => {
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
            icon={icon}
            title={task.title}
            subtitle={task.dueDate?.toDateString() ?? ""}
            key={task.title}
            actions={
              <ActionPanel title="Foo">
                <Action
                  title="Reload"
                  onAction={revalidate}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
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
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

export default withNotionAccessToken(Search);
