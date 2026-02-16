import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "react-hot-toast";

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoSelected: (file: File) => void;
  onPhotoCleared: () => void;
  isLoading?: boolean;
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
  isLoading = false,
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

  return (
    <div className="space-y-4">
      {/* Preview */}
      {previewUrl && (
        <div className="relative w-32 h-32 mx-auto">
          <img
            src={previewUrl}
            alt="Profile preview"
            className="w-full h-full object-cover rounded-full border-2 border-gray-200"
          />
          {fileName && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* File Input */}
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
