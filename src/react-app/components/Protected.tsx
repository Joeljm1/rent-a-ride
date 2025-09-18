import { JSX, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../AuthContext";

export default function Protected({ children }: { children: JSX.Element }) {
  const session = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(session?.data);
    if (session?.isPending) {
      return;
    }
    if (session?.error || session?.data === null || session === null) {
      navigate("/login", {
        replace: true,
        state: { message: "Please log in to upload files" },
      });
    }
  }, [navigate, session]);
  if (session?.isPending) {
    return <div>Loading ...</div>;
  } else {
    return children;
  }
}
