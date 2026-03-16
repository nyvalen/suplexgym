import { useRestApi } from "@/app/hooks/useRestApi";
import { UsersDTO } from "@/app/types";
import User from "./User";

export default function GreetingUser() {
  const { items } = useRestApi<UsersDTO>("/users");

  return <User name={items ?? []} />;
}
