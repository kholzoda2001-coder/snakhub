/**
 * Sends the file to our own admin-only endpoint, which holds the ImgBB key.
 * The key must never be a NEXT_PUBLIC_ variable — that ships it to every browser.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Upload failed');
  }

  return data.url;
};
