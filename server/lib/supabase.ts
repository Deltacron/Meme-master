import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseImage {
  name: string;
  publicUrl: string;
}

export async function getImagesFromBucket(bucketName: string = 'photocards'): Promise<SupabaseImage[]> {
  try {
    console.log(`🔍 Fetching images from Supabase bucket: ${bucketName}`);
    
    // Get all files recursively (including in subfolders)
    const allFiles = await listAllFiles(bucketName);
    
    if (allFiles.length === 0) {
      console.warn(`⚠️ No image files found in bucket: ${bucketName}`);
      return [];
    }

    // Get public URLs for all image files
    const images: SupabaseImage[] = [];
    for (const filePath of allFiles) {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        images.push({
          name: filePath,
          publicUrl: data.publicUrl
        });
      }
    }

    console.log(`✅ Successfully fetched ${images.length} images from Supabase`);
    return images;
    
  } catch (error) {
    console.error('❌ Failed to fetch images from Supabase:', error);
    throw error;
  }
}

async function listAllFiles(bucketName: string, prefix: string = ''): Promise<string[]> {
  const allFiles: string[] = [];
  
  try {
    const { data: items, error } = await supabase.storage
      .from(bucketName)
      .list(prefix, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error(`❌ Error listing files in ${bucketName}/${prefix}:`, error);
      return allFiles;
    }

    if (!items || items.length === 0) {
      console.log(`📁 No items found in ${bucketName}/${prefix}`);
      return allFiles;
    }

    console.log(`📁 Found ${items.length} items in ${bucketName}/${prefix}`);

    for (const item of items) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      
      // If it's a folder (no metadata.size), recurse into it
      if (!item.metadata?.size && item.name !== '.emptyFolderPlaceholder') {
        console.log(`📂 Exploring folder: ${itemPath}`);
        const subFiles = await listAllFiles(bucketName, itemPath);
        allFiles.push(...subFiles);
      } 
      // If it's a file and looks like an image, add it
      else if (item.metadata?.size && isImageFile(item.name)) {
        console.log(`🖼️ Found image: ${itemPath}`);
        allFiles.push(itemPath);
      }
    }

    return allFiles;
    
  } catch (error) {
    console.error(`❌ Error in recursive listing for ${bucketName}/${prefix}:`, error);
    return allFiles;
  }
}

function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowercaseFilename = filename.toLowerCase();
  return imageExtensions.some(ext => lowercaseFilename.endsWith(ext));
}

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test actual bucket access instead of just listing buckets
    const { data, error } = await supabase.storage
      .from('photocards')
      .list('', { limit: 1 });
    
    if (error) {
      console.error('❌ Supabase bucket access test failed:', error);
      // If bucket doesn't exist, try to list buckets to give more info
      const { data: buckets } = await supabase.storage.listBuckets();
      if (buckets && buckets.length > 0) {
        console.log('📦 Available buckets:', buckets.map(b => b.name).join(', '));
        console.log('💡 Tip: Make sure your bucket is named "photocards" and is public');
      }
      return false;
    }
    
    console.log('✅ Supabase connection and bucket access successful');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
}