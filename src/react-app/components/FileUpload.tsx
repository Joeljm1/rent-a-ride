import { ChangeEvent, useRef } from "react";
import type { FileWithProgress } from "./FileUploader.tsx";

interface FileUploadProps {
  files: FileWithProgress[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithProgress[]>>;
  maxFiles?: number;
  maxSize?: number;
}

export default function FileUpload({ 
  files, 
  setFiles, 
  maxSize = 5 * 1024 * 1024 // 5MB
}: FileUploadProps) {
  const maxFiles = 5;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const selectedFiles = Array.from(e.target.files);
    const validFiles: FileWithProgress[] = [];
    
    for (const file of selectedFiles) {
      if (files.length + validFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        continue;
      }
      
      validFiles.push({
        file,
        progress: 0,
        uploaded: false,
        id: `${file.name}_${Date.now()}_${Math.random()}`,
        isCover: false,
      });
    }
    
    const newFiles = [...files, ...validFiles];
    
    // Set first image as cover if no cover is selected
    const hasCover = newFiles.some(f => f.isCover);
    if (!hasCover && newFiles.length > 0) {
      newFiles[0].isCover = true;
    }
    
    setFiles(newFiles);
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      const newFiles = prev.filter(f => f.id !== id);
      
      // If removing the cover image, set new cover to first image
      if (fileToRemove?.isCover && newFiles.length > 0) {
        newFiles[0].isCover = true;
      }
      
      return newFiles;
    });
  };

  const setCoverImage = (id: string) => {
    setFiles(prev => prev.map(file => ({
      ...file,
      isCover: file.id === id
    })));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Car Images (Max {maxFiles})
        </label>
        <FileInput
          inputRef={inputRef}
          onFileSelect={handleFileSelect}
          disabled={files.length >= maxFiles}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Max {maxFiles} files, {maxSize / (1024 * 1024)}MB each. Accepted formats: JPG, PNG, WebP
        </p>
        {files.length > 0 && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
            <span>⭐</span>
            <span>Click the star icon to set an image as the cover photo</span>
          </p>
        )}
      </div>
      
      <FileList 
        files={files} 
        onRemove={removeFile} 
        onSetCover={setCoverImage}
      />
    </div>
  );
}

interface FileInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

function FileInput({ inputRef, onFileSelect, disabled }: FileInputProps) {
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        multiple
        disabled={disabled}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-sm font-medium transition-all duration-200 ${
          disabled 
            ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        }`}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <div className="flex flex-col items-center">
          <span className="text-base font-semibold">
            {disabled ? "Maximum files reached" : "Click to upload images"}
          </span>
          {!disabled && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              or drag and drop
            </span>
          )}
        </div>
      </label>
    </>
  );
}

interface FileListProps {
  files: FileWithProgress[];
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
}

function FileList({ files, onRemove, onSetCover }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
        <span>📁</span>
        <span>Selected Files ({files.length}):</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {files.map((fileWithProgress) => (
          <FileItem 
            key={fileWithProgress.id} 
            fileWithProgress={fileWithProgress}
            onRemove={onRemove}
            isCover={fileWithProgress.isCover}
            onSetCover={onSetCover}
          />
        ))}
      </div>
    </div>
  );
}

interface FileItemProps {
  fileWithProgress: FileWithProgress;
  onRemove: (id: string) => void;
  isCover: boolean;
  onSetCover: (id: string) => void;
}

function FileItem({ fileWithProgress, onRemove, isCover, onSetCover }: FileItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
      isCover 
        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-300 dark:border-indigo-700 shadow-sm' 
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {fileWithProgress.file.name}
            </p>
            {isCover && (
              <span className="inline-flex items-center px-1 mt-3 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700">
                ⭐ Cover
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(fileWithProgress.file.size)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSetCover(fileWithProgress.id)}
          className={`flex-shrink-0 p-2 ml-2 rounded-lg transition-all duration-200 ${
            isCover
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50'
              : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
          }`}
          type="button"
          title={isCover ? "Cover image" : "Set as cover image"}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <button
          onClick={() => onRemove(fileWithProgress.id)}
          className="flex-shrink-0 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          type="button"
          title="Remove image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
