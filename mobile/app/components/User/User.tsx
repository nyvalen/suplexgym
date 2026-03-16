import { UsersDTO } from "@/app/types";
import { Text } from "react-native";

interface UserProps {
  name: UsersDTO[];
  renderItem?: (info: UsersDTO) => React.ReactNode;
}

export default function User({ name, renderItem }: UserProps) {
  return (
    <>
      {name.length > 0 ? (
        <>
          {name.map((n) => {
            return <>{renderItem?.(n) ?? <Text key={n.id}>{n.name}</Text>}</>;
          })}
        </>
      ) : (
        ""
      )}
    </>
  );
}
