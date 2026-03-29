import { createContext } from "react";

export const AuthContext = createContext<{
  isLoggedIn: boolean;
  userId: bigint | null;
  accessToken: string;
  setUserId: (value: bigint | null) => void;
  setIsLoggedIn: (value: boolean) => void;

  setAccessToken: (value: string) => void;
}>({
  isLoggedIn: false,
  userId: null,
  accessToken: "",
  setUserId: () => {},
  setIsLoggedIn: () => {},
  setAccessToken: () => {},
});
