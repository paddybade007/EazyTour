export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      base64: reader.result,
      mimeType: file.type
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
