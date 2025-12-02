/**
 * Interface para representar fotos armazenadas
 * Contém metadados e URL da imagem no S3
 */
export interface Photo {
  id: string;
  userId: string;
  folderId: string | null;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl: string;        // URL do S3 (antes era base64)
  s3Key?: string;         // Chave do arquivo no S3
  bucketName?: string;    // Nome do bucket S3
}