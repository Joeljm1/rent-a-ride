import FileUploader from "../components/FileUploader.tsx";
import Protected from "../components/Protected.tsx";
export default function FileUploaderPage() {
  return (
    <Protected>
      <FileUploader />
    </Protected>
  );
}
