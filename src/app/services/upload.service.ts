import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError, forkJoin, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

// SUAS PASTAS
export type FolderType = 'MinhaMelhorTurmadeIngles' | 'MinhasFotos';

export interface UploadResponse {
  success: boolean;
  fileKey: string;
  fileUrl: string;
  bucketName?: string;
  folder?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  bucketName: string;
  folder: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  fileKey: string;
  bucketName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  // VOCÊ VAI COLOCAR A URL DO SEU API GATEWAY AQUI DEPOIS
  private apiUrl = 'https://8ahtc9m51l.execute-api.us-east-1.amazonaws.com/prod';
  
  // Configurações
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  constructor(private http: HttpClient) { }

  /**
   * Faz upload de um arquivo para o S3 em uma pasta específica
   */
  uploadFile(file: File, folder: FolderType): Observable<UploadResponse> {
    // Validar arquivo
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error!));
    }

    console.log(`Iniciando upload de ${file.name} para pasta ${folder}`);
    
    return this.http.post<PresignedUrlResponse>(
      `${this.apiUrl}/generate-upload-url`,
      {
        fileName: file.name,
        fileType: file.type,
        folder: folder
      }
    ).pipe(
      switchMap(response => {
        console.log('URL pré-assinada recebida:', response);
        
        return from(
          fetch(response.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          }).then(uploadResponse => {
            if (!uploadResponse.ok) {
              throw new Error(`Upload failed: ${uploadResponse.statusText}`);
            }
            console.log('Upload concluído com sucesso');
            
            return {
              success: true,
              fileKey: response.fileKey,
              fileUrl: this.getProxyImageUrl(response.fileKey),
              bucketName: response.bucketName,
              folder: response.folder
            };
          })
        );
      }),
      catchError(error => {
        console.error('Erro no upload:', error);
        const errorMessage = error.error?.message || error.message || 'Erro desconhecido no upload';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Upload para pasta "MinhaMelhorTurmadeIngles"
   */
  uploadTurmaIngles(file: File): Observable<UploadResponse> {
    return this.uploadFile(file, 'MinhaMelhorTurmadeIngles');
  }

  /**
   * Upload para pasta "MinhasFotos"
   */
  uploadMinhasFotos(file: File): Observable<UploadResponse> {
    return this.uploadFile(file, 'MinhasFotos');
  }

  /**
   * Deleta um arquivo do S3
   */
  deleteFile(fileKey: string): Observable<DeleteResponse> {
    console.log('Deletando arquivo do S3:', fileKey);
    
    return this.http.delete<DeleteResponse>(
      `${this.apiUrl}/delete-image`,
      {
        params: { fileKey }
      }
    ).pipe(
      catchError(error => {
        console.error('Erro ao deletar arquivo:', error);
        const errorMessage = error.error?.message || error.message || 'Erro ao deletar arquivo';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Obtém URL do proxy de imagem
   */
  getProxyImageUrl(fileKey: string): string {
    return `${this.apiUrl}/proxy-image?fileKey=${encodeURIComponent(fileKey)}`;
  }

  /**
   * Upload múltiplo na mesma pasta
   */
  uploadMultipleFiles(files: File[], folder: FolderType): Observable<UploadResponse[]> {
    if (files.length === 0) {
      return of([]);
    }
    
    const uploads = files.map(file => this.uploadFile(file, folder));
    return forkJoin(uploads);
  }

  /**
   * Upload múltiplo para "MinhaMelhorTurmadeIngles"
   */
  uploadMultipleTurmaIngles(files: File[]): Observable<UploadResponse[]> {
    return this.uploadMultipleFiles(files, 'MinhaMelhorTurmadeIngles');
  }

  /**
   * Upload múltiplo para "MinhasFotos"
   */
  uploadMultipleMinhasFotos(files: File[]): Observable<UploadResponse[]> {
    return this.uploadMultipleFiles(files, 'MinhasFotos');
  }

  /**
   * Valida o arquivo antes do upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'Arquivo não fornecido' };
    }

    if (file.size > this.maxFileSize) {
      const maxSizeMB = this.maxFileSize / 1024 / 1024;
      return { 
        valid: false, 
        error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB` 
      };
    }

    if (!this.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Tipo de arquivo não permitido. Apenas imagens são aceitas.` 
      };
    }

    return { valid: true };
  }
}
