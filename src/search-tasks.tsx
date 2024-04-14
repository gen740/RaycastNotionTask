import { List, Color, Icon, ActionPanel, Action } from "@raycast/api";
import { withNotionAccessToken } from "./utils/oauth";
import { useTaskLists } from "./hooks/useTaskLists";

export function Search() {
  const { data, revalidate } = useTaskLists();

  return (
    <List>
      {data?.map((task) => {
        let icon = { source: Icon.Xmark, tintColor: Color.Red };
        switch (task.status) {
          case "done":
            icon = { source: Icon.Checkmark, tintColor: Color.Blue };
            break;
          case "in progress":
            icon = { source: Icon.CircleFilled, tintColor: Color.Green };
            break;
          case "not started":
            icon = { source: Icon.Circle, tintColor: Color.Orange };
            break;
        }
        return (
          <List.Item
            icon={icon}
            title={task.title}
            key={task.title}
            actions={
              <ActionPanel title="Foo">
                <Action.Push title="Open" target="Foo" onPush={() => {}} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

export default withNotionAccessToken(Search);
