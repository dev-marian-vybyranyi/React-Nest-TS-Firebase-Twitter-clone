import { auth, storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface UseUploadPhotoReturn {
  uploadPhoto: (file: File, path: string) => Promise<string | null>;
  isUploading: boolean;
  uploadProgress: number;
  resetUpload: () => void;
}

export const useUploadPhoto = (): UseUploadPhotoReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhoto = async (
    file: File,
    path: string,
  ): Promise<string | null> => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to upload photos");
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            toast.error("Failed to upload photo");
            setIsUploading(false);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setIsUploading(false);
              setUploadProgress(0);
              resolve(downloadURL);
            } catch (error) {
              console.error("Error getting download URL:", error);
              setIsUploading(false);
              reject(error);
            }
          },
        );
      });
    } catch (error) {
      console.error("Upload setup error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("Failed to upload photo");
      return null;
    }
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  return {
    uploadPhoto,
    isUploading,
    uploadProgress,
    resetUpload,
  };
};
