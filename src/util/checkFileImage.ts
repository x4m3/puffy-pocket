import mimeTypes from "mime-types";

/**
 * Checks if file is an image or not
 * @param   {string} fileName Name of the file to check
 * @returns {boolean} True if file is an image, false if not
 */
export function checkFileImage(fileName: string) : boolean {
  const mime = mimeTypes.lookup(fileName);

  switch (mime) {
    case "image/jpeg": return true; break;
    case "image/png": return true; break;
    case "image/webp": return true; break;
  }
  return false;
};
