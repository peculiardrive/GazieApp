import { supabase, isMock } from './supabase';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads a document file (image/pdf) to Supabase Storage with strict security validation.
 * @param file The HTML File object to upload
 * @param userId The UUID of the current user
 * @param docType The type of document (e.g. 'gov_id', 'driver_license', 'incident')
 */
export async function uploadDocument(
  file: File,
  userId: string,
  docType: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // 1. File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { url: null, error: 'File size exceeds maximum allowed limit of 5MB.' };
    }

    // 2. MIME type & extension validation
    const fileExt = (file.name.split('.').pop() || '').toLowerCase().trim();
    if (!ALLOWED_EXTENSIONS.includes(fileExt) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return { url: null, error: 'Invalid file type. Only JPG, PNG, WEBP, and PDF files are permitted.' };
    }

    // 3. Sanitize docType and userId to prevent directory traversal
    const safeDocType = docType.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');

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

    // 4. In live mode, upload to Supabase Storage
    const fileName = `${safeUserId}/${safeDocType}_${Date.now()}.${fileExt}`;
    const filePath = `verifications/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data } = supabase.storage
      .from('verification-docs')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred during upload';
    return { url: null, error: errorMsg };
  }
}
