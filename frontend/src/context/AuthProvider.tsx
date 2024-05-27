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
  token: null,
  setToken: () => {},
  loggedIn: false,
  setLoggedIn: () => {},
};

const AuthContext = createContext<IAuthContext>(initialValue);

const checkAuth = async (
  token: string | null,
  setLoggedIn: (loggedIn: boolean) => void,
  setToken: Dispatch<SetStateAction<string | null>>
) => {
  try {
    const response = await fetch(
      `/api/get-cookie${token ? `?token=${token}` : ""}`,
      {
        credentials: "include",
      }
    );
    if (response.ok) {
      const result = await response.json();
      if (result.cookie) {
        setLoggedIn(true);
        setToken(result.cookie);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const AuthProvider = ({ children }: Props) => {
  const [loggedIn, setLoggedIn] = useState(initialValue.loggedIn);
  const [token, setToken] = useState(initialValue.token);

  useEffect(() => {
    checkAuth(token, setLoggedIn, setToken);
  }, [token]);

  useEffect(() => {
    if (!loggedIn) {
      setToken(null);
    } else {
      checkAuth(token, setLoggedIn, setToken);
    }
  }, [loggedIn, token]);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
