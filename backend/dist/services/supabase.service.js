"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your_supabase_anon_key';
const isMock = supabaseUrl.includes('xxxxxxxxxxxxxxxxxxxx') || supabaseKey === 'your_supabase_anon_key';
let supabase = null;
if (!isMock) {
    try {
        supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        console.log('[Supabase] Client initialized successfully for Storage bucket.');
    }
    catch (error) {
        console.warn(`[Supabase] Failed to initialize Supabase client: ${error.message}. Defaulting to mock mode.`);
    }
}
else {
    console.warn('[Supabase] Credentials are empty or default placeholders. Running in mock storage mode.');
}
/**
 * Uploads a file to Supabase Storage or returns a mock URL
 */
const uploadFile = async (bucket, fileName, buffer, mimeType) => {
    if (isMock || !supabase) {
        console.log(`[Mock Storage] Uploaded ${fileName} to bucket "${bucket}" successfully.`);
        // Return a realistic mock file path
        return `https://via.placeholder.com/300x150.png?text=${encodeURIComponent(fileName)}`;
    }
    const uniquePath = `${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniquePath, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
    });
    if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
    }
    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniquePath);
    return publicUrlData.publicUrl;
};
exports.uploadFile = uploadFile;
/**
 * Deletes a file from Supabase Storage
 */
const deleteFile = async (bucket, fileUrl) => {
    if (isMock || !supabase) {
        console.log(`[Mock Storage] Deleted file from bucket "${bucket}" with URL: ${fileUrl}`);
        return;
    }
    try {
        // Extract unique path from URL
        const urlParts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
        if (urlParts.length < 2)
            return;
        const filePath = urlParts[1];
        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (error) {
            console.error(`[Supabase] Delete file error: ${error.message}`);
        }
    }
    catch (err) {
        console.error(`[Supabase] File delete failed: ${err.message}`);
    }
};
exports.deleteFile = deleteFile;
