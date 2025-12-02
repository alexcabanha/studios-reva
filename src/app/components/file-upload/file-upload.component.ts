import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService, UploadResponse } from '../../services/upload.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  uploadedFiles: UploadResponse[] = [];
  error: string | null = null;

  // ✅ Regex movida para o TS para evitar erros no template
  imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;

  constructor(private uploadService: UploadService) {}

  // ✅ Método usado pelo *ngIf — seguro e compatível com Angular
  isImage(url?: string): boolean {
    if (!url) return false;
    return this.imageRegex.test(url);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'Arquivo muito grande! Máximo 10MB';
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Tipo de arquivo não permitido!';
        return;
      }

      this.selectedFile = file;
      this.error = null;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.error = 'Selecione um arquivo primeiro!';
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    this.error = null;

    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (result) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.uploading = false;
        this.uploadedFiles.push(result);
        this.selectedFile = null;

        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploading = false;
        this.uploadProgress = 0;
        this.error = 'Falha no upload! Tente novamente.';
        console.error('Erro no upload:', error);
      }
    });
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }
}
