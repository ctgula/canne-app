import { supabaseAdmin } from './supabase-admin';

const BUCKET = 'canne-prints';
const SIGNED_URL_EXPIRY = 60 * 30; // 30 minutes

/**
 * Generate a signed download URL for a collectible print file.
 * The file must exist in the private `canne-prints` bucket.
 */
export async function getSignedDownloadUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY, { download: true });

  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Generate a signed preview URL (non-download, shorter expiry).
 */
export async function getSignedPreviewUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60 * 60); // 1 hour for previews

  if (error) {
    console.error('Error creating preview URL:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Upload a print file to the canne-prints bucket.
 * Used by admin to add new collectible assets.
 */
export async function uploadPrintFile(
  filePath: string,
  fileBuffer: Buffer | Uint8Array,
  contentType: string
): Promise<{ path: string } | null> {
  const { data, error } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Error uploading print file:', error);
    return null;
  }

  return { path: data.path };
}
