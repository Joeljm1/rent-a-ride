import { useRef, useState } from "react";
import BaseURL from "../BaseURL";
import { useNavigate } from "react-router";
import FileUpload from "./FileUpload";

type status = "idle" | "uploading" | "loaded";

export type FileWithProgress = {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
};
export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<status>("idle");
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [error, setError] = useState<string[]>([]);
  const btn = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  async function handleUpload(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.stopPropagation();
    if (!btn.current || !file) {
      return;
    }

    btn.current.disabled = true;
    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("name", file.name);
    formData.append("file", file);
    try {
      const resp = await fetch(`${BaseURL}/api/carPics`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!resp.ok) {
        console.log(`Error resp is not ok`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log(`Error fetching : ${err}`);
    }
    console.log("Sent");
    btn.current.disabled = false;
    setUploadStatus("loaded");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files === null) {
      setFile(null);
      return;
    }
    if (e.target.files[0].size > 500 * 1000 * 1000) {
      setError([...error, "File to large"]);
      setFile(null);
      return;
    } else {
      setError(error.filter((elem) => elem != "File to large"));
    }
    setFile(e.target.files ? e.target.files[0] : null);
    setUploadStatus("loaded");
  }

  return (
    <>
      <div>
        <form className="flex flex-col gap-3 ml-3">
          <label>
            Brand:{" "}
            <input
              type="text"
              className="border-solid border-black border-2"
            ></input>
          </label>
          <label>
            Model:{" "}
            <input
              type="text"
              className="border-solid border-black border-2"
            ></input>
          </label>
          <label>
            Distance(in km):{" "}
            <input
              type="number"
              className="border-solid border-black border-2"
            ></input>
          </label>
          <label>
            Year:{" "}
            <input
              type="number"
              className="border-solid border-black border-2"
            ></input>
          </label>
          <label>
            Year:{" "}
            <input
              type="number"
              className="border-solid border-black border-2"
            ></input>
          </label>
          <label>
            Seat:{" "}
            <input
              type="number"
              className="border-solid border-black border-2"
            ></input>
          </label>
          <label>
            Description:{" "}
            <textarea className="border-solid border-black border-2"></textarea>
          </label>

          <label>
            Fuel Type:
            <select
              name="fuel_type"
              className="border-solid border-black border-2"
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <label>
            Transmission:
            <select
              name="transmission"
              className="border-solid border-black border-2"
            >
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </label>
          <FileUpload files={files} setFiles={setFiles} />
          {file && uploadStatus !== "idle" && (
            <button ref={btn} onClick={handleUpload} type="submit">
              Upload
            </button>
          )}
        </form>
        {error.length !== 0 && <div className="accent-red-600">{error}</div>}
      </div>
    </>
  );
}
