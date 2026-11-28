const photoTypes = ["image/jpeg", "image/png", "image/webp"];

export const postPhotoAccept = photoTypes.join(",");
export const postPhotoMaxBytes = 2 * 1024 * 1024;
export const postPhotoHelp = "JPEG, PNG, or WebP up to 2 MB.";

export function validatePostPhoto(file: File) {
  if (file.size === 0) return "Choose a photo that isn’t empty.";
  if (file.size > postPhotoMaxBytes) return "Choose a photo up to 2 MB.";
  if (file.type && !photoTypes.includes(file.type)) return "Choose a JPEG, PNG, or WebP photo.";
  return "";
}
