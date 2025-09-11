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
    
    // List all files in the bucket
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ Error listing files from Supabase:', error);
      throw error;
    }

    if (!files || files.length === 0) {
      console.warn('⚠️ No files found in bucket:', bucketName);
      return [];
    }

    // Get public URLs for all files
    const images: SupabaseImage[] = [];
    for (const file of files) {
      // Skip folders (they have no size)
      if (!file.metadata?.size) continue;
      
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file.name);

      if (data?.publicUrl) {
        images.push({
          name: file.name,
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

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Try to list buckets as a connection test
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📦 Available buckets:', data?.map(b => b.name).join(', '));
    return true;
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
}