import { useContext, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import FileUploader from "../components/FileUploader.tsx";
import { useNavigate } from "react-router";
export default function FileUploaderPage() {
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

  return <>{session?.isPending ? <div>Loading ...</div> : <FileUploader />}</>;
}
