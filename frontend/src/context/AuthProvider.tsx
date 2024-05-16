import { createContext, ReactNode, useState } from "react";

type Props = {
  children?: ReactNode;
};

type IAuthContext = {
  loggedIn: boolean;
  setLoggedIn: (newState: boolean) => void;
};

const initialValue = {
  loggedIn: false,
  setLoggedIn: () => {},
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: Props) => {
  const [loggedIn, setLoggedIn] = useState(initialValue.loggedIn);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
