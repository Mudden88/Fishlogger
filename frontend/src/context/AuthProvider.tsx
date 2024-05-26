import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

type Props = {
  children?: ReactNode;
};

type IAuthContext = {
  loggedIn: boolean;
  setLoggedIn: (newState: boolean) => void;
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
};

const initialValue: IAuthContext = {
  loggedIn: !!localStorage.getItem("isUser"),
  setLoggedIn: () => {},
  token: null,
  setToken: () => {},
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: Props) => {
  const [loggedIn, setLoggedIn] = useState(initialValue.loggedIn);
  const [token, setToken] = useState(initialValue.token);
  const isUser = localStorage.getItem("isUser");
  useEffect(() => {
    if (!loggedIn) {
      localStorage.removeItem("isUser");
    } else if (isUser) {
      fetch("/api/get-cookie?token={token}", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.cookie) {
            setLoggedIn(true);
            setToken(result.cookie);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [isUser, loggedIn]);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
