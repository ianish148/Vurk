export interface StorageProvider {
  uploadFile(path: string, file: File | Blob, bucket?: string): Promise<string>
  deleteFile(path: string, bucket?: string): Promise<void>
  getFileUrl(path: string, bucket?: string): string
}

export class SupabaseStorageProvider implements StorageProvider {
  async uploadFile(path: string, file: File | Blob, bucket = 'submissions') {
    console.log(`[Storage] Uploading to ${bucket}/${path}`)
    return `mock-url-for-${path}`
  }
  
  async deleteFile(path: string, bucket = 'submissions') {
    console.log(`[Storage] Deleting from ${bucket}/${path}`)
  }

  getFileUrl(path: string, bucket = 'submissions') {
    return `https://mock.storage/${bucket}/${path}`
  }
}

export const storageClient: StorageProvider = new SupabaseStorageProvider()
