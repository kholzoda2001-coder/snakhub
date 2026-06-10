export const uploadImage = async (file: File): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("ImgBB API key is missing. Please add NEXT_PUBLIC_IMGBB_API_KEY to your environment variables.");
  }

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || 'Upload failed');
  }
};
