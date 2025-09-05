// src/App.tsx

import { useContext, useState } from "react";
import { Link } from "react-router";
import { authClient } from "../lib/auth-client";
import "./App.css";
import { AuthContext } from "./AuthContext";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("unknown");
  const session = useContext(AuthContext);
  return (
    <>
      <div>
        {session?.data?.session ? (
          <>
            <button>Hello {session.data.user.name}</button>
            <button onClick={() => authClient.signOut()}>SignOut</button>
          </>
        ) : (
          <Link to={"/login"}>
            {" "}
            <button>Log in </button>
          </Link>
        )}
      </div>
      <div className="card">
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label="increment"
        >
          count is {count}
        </button>
        <Link to={"/register"}>Register</Link>
        <p></p>
      </div>
      <div className="card">
        <button
          onClick={() => {
            fetch("/api/")
              .then((res) => res.json() as Promise<{ name: string }>)
              .then((data) => setName(data.name));
          }}
          aria-label="get name"
        >
          Name from API is: {name}
        </button>
        <p></p>
      </div>
      <p className="read-the-docs">Click on the logos to learn more</p>
    </>
  );
}

export default App;
