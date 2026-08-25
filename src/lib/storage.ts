import { supabase, isMock } from './supabase';

/**
 * Uploads a document file (image/pdf) to Supabase Storage or reads it as a base64 URL if running in mock mode.
 * @param file The HTML File object to upload
 * @param userId The UUID of the current user
 * @param docType The type of document (e.g. 'gov_id', 'driver_license', 'insurance')
 */
export async function uploadDocument(
  file: File,
  userId: string,
  docType: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    if (isMock) {
      // In mock mode, convert file to base64 so it can be stored in localStorage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            url: reader.result as string,
            error: null
          });
        };
        reader.onerror = () => {
          resolve({
            url: null,
            error: 'Failed to read document file locally'
          });
        };
        reader.readAsDataURL(file);
      });
    }

    // In live mode, upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;
    const filePath = `verifications/${fileName}`;

    // Upload to 'verification-docs' bucket (User should create this bucket in Supabase dashboard)
    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data } = supabase.storage
      .from('verification-docs')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'An unknown error occurred during upload' };
  }
}
