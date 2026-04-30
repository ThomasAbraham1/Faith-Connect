import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dataURLtoFile(dataurl: string, filename: string) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)?.[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Handles the logic for downloading an Excel file from an API response.
 * Extracts the filename from headers if available.
 */
export const handleExcelDownload = (response: any, defaultFilename: string = 'report.xlsx') => {
  const contentDisposition = response.headers['content-disposition'];
  let fileName = defaultFilename;

  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename=(.+)/);
    if (fileNameMatch && fileNameMatch.length === 2) {
      fileName = fileNameMatch[1];
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
