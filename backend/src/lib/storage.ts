import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const storage = {
  async save(filename: string, buffer: Buffer, subdir?: string): Promise<string> {
    const dir = subdir ? path.join(UPLOADS_DIR, subdir) : UPLOADS_DIR;
    await fs.mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, buffer);
    return subdir ? `${subdir}/${filename}` : filename;
  },

  async delete(relativePath: string): Promise<void> {
    const filepath = path.join(UPLOADS_DIR, relativePath);
    try {
      await fs.unlink(filepath);
    } catch {
    }
  },

  async deleteMany(relativePaths: string[]): Promise<void> {
    await Promise.all(relativePaths.map(p => this.delete(p)));
  },

  getUrl(relativePath: string): string {
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  },

  getUploadsDir(): string {
    return UPLOADS_DIR;
  },
};
