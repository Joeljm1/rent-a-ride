import { ChangeEvent, useRef } from "react";
import type { FileWithProgress } from "./FileUploader.tsx";

export default function FileUpload({
  files,
  setFiles,
}: {
  files: FileWithProgress[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithProgress[]>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }
    const newFiles: FileWithProgress[] = Array.from(e.target.files).map(
      (file) => ({
        file: file,
        progress: 0,
        uploaded: false,
        id: file.name,
      }),
    );
    setFiles([...files, ...newFiles]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">File Upload</h2>
      <div className="flex gap-2">
        <FileInput
          inputRef={inputRef}
          disabled={false}
          onFileSelect={handleFileSelect}
        />
      </div>
      <FileList files={files} />
    </div>
  );
}

type FileInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
};

function FileInput({ inputRef, disabled, onFileSelect }: FileInputProps) {
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        multiple
        disabled={disabled}
        className="hidden"
        accept="image/*"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex cursor-pointer items-center gap-2 rounded-md gray-700 px-6 py-2 hover:opacity-75"
      >
        Upload
      </label>
    </>
  );
}

function FileList({ files }: { files: FileWithProgress[] }) {
  return <div>{files.map((file) => file.file.name)}</div>;
}
