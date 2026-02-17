import { Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "react-hot-toast";

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoSelected: (file: File) => void;
  onPhotoCleared: () => void;
  onPhotoDeleted?: () => void;
  isLoading?: boolean;
  type?: "profile" | "post";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const PhotoUpload = ({
  currentPhotoUrl,
  onPhotoSelected,
  onPhotoCleared,
  onPhotoDeleted,
  isLoading = false,
  type = "profile",
}: PhotoUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentPhotoUrl,
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFileName(file.name);
    onPhotoSelected(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreviewUrl(currentPhotoUrl);
    setFileName(null);
    onPhotoCleared();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    if (onPhotoDeleted) {
      onPhotoDeleted();
      setPreviewUrl(undefined);
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const containerClasses =
    type === "profile" ? "w-32 h-32 mx-auto" : "w-full h-auto";
  const imageClasses =
    type === "profile"
      ? "rounded-full border-2 border-gray-200 object-cover"
      : "rounded-lg border border-gray-200 object-contain";

  return (
    <div className="space-y-4">
      <div className={`relative ${containerClasses}`}>
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className={`w-full h-full max-h-86 ${imageClasses}`}
            />
            {fileName ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600 transition-colors"
                aria-label="Clear selection"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              onPhotoDeleted && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label="Delete photo"
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )
            )}
          </>
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 ${type === "profile" ? "rounded-full" : "rounded-lg min-h-64"}`}
          >
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700">
            <Upload className="h-4 w-4" />
            <span className="text-sm">
              {fileName ? fileName : "Choose a photo"}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};
