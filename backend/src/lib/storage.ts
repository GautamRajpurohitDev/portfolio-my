import fs from "fs/promises";
import path from "path";

/**
 * Abstract storage interface for media files.
 * In a production environment, you would implement an S3StorageProvider
 * or CloudinaryStorageProvider here and swap them out.
 */
export interface StorageProvider {
  /** Saves a file and returns the public URL */
  save(filename: string, buffer: Buffer, mimeType: string): Promise<string>;
  /** Deletes a file by filename or URL */
  delete(filenameOrUrl: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private publicBaseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    this.publicBaseUrl = "/uploads"; // Relative URL served by Express
  }

  async save(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return `${this.publicBaseUrl}/${filename}`;
  }

  async delete(filenameOrUrl: string): Promise<void> {
    // Extract filename if a URL was passed
    const filename = filenameOrUrl.split("/").pop();
    if (!filename) return;

    const filepath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filepath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        console.error(`Failed to delete local file ${filepath}:`, err);
        throw err;
      }
    }
  }
}

// Export a singleton instance. 
// Can easily be swapped out using an env var later (e.g., if (process.env.STORAGE === 's3'))
export const storage = new LocalStorageProvider();
