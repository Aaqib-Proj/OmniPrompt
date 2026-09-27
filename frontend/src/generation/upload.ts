import { api } from "@/services/api";

export async function uploadMedia(file: File): Promise<{ url: string }> {
  const result = await api.uploadFile(file);
  return { url: result.url };
}
