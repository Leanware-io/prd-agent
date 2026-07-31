import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth } from "@/shared/lib";
import { onAuthStateChanged, User } from "firebase/auth";

type UserContextValue = {
  clearUser: () => void;
  setUser: (user: User) => void;
  user: User | null;
};

const UserContext = createContext<UserContextValue>({
  clearUser: () => {},
  setUser: () => {},
  user: null,
});

export const useUser = () => useContext(UserContext);

interface IUserProvider {
  children: React.ReactNode;
  initialUser?: User | null;
}

export const UserProvider = (props: IUserProvider) => {
  const { children, initialUser } = props;
  const [user, setUser] = useState<User | null>(initialUser ?? null);

  const clearUser = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ clearUser, setUser, user }),
    [clearUser, user],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
