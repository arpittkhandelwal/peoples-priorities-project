import { supabase } from './supabase';

export async function uploadFile(file: File | Blob, bucket: string, path: string): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  
  if (error) {
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrlData.publicUrl;
}
