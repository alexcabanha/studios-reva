import { Component, inject, OnInit, signal, ViewChild, ElementRef, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { StorageService } from '../../services/storage.service';
import { LanguageService } from '../../services/language.service';
import { UploadService, UploadResponse } from '../../services/upload.service';
import { User } from '../../models/user.model';
import { Photo } from '../../models/photo.model';
import { Folder } from '../../models/folder.model';
import { CustomTreeComponent, TreeNode } from '../../components/custom-tree/custom-tree.component';

/**
 * Interface estendida para fotos com URL de visualização
 */
interface PhotoWithUrl extends Photo {
  displayUrl?: string;
  isLoadingUrl?: boolean;
}

/**
 * Componente do dashboard do usuário
 * Gerencia upload, visualização e organização de fotos em pastas
 */
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    FileUploadModule,
    ToastModule,
    MenuModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    NavbarComponent,
    CustomTreeComponent
  ],
  providers: [MessageService],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserDashboardComponent implements OnInit {
  private router = inject(Router);
  private storageService = inject(StorageService);
  private messageService = inject(MessageService);
  private uploadService = inject(UploadService);
  public languageService = inject(LanguageService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Signals para controle de estado
  currentUser = signal<User | null>(null);
  photos = signal<PhotoWithUrl[]>([]);
  folders = signal<Folder[]>([]);
  selectedFolderId = signal<string | null>(null);
  isUploading = signal(false);
  isLoadingPhotos = signal(false);
  selectedFile = signal<{ name: string; path: string } | null>(null);

  // Signals para modal de edição
  showEditDialog = signal(false);
  editingFolder = signal<Folder | null>(null);
  newFolderName = signal('');

  // Signals para modal de criar pasta
  showCreateDialog = signal(false);
  parentFolderForCreate = signal<Folder | null>(null);
  createFolderName = signal('');

  // Signals para modal de deletar pasta
  showDeleteDialog = signal(false);
  folderToDelete = signal<Folder | null>(null);

  // Computed signal para tree nodes
  treeNodes = computed(() => this.convertToTreeNodes(this.folders()));

  ngOnInit(): void {
    // Verifica autenticação
    const user = this.storageService.getCurrentUser();
    if (!user || user.role !== 'user') {
      this.router.navigate(['/auth']);
      return;
    }
    this.currentUser.set(user);
    this.loadData();
  }

  /**
   * Converte Folders para TreeNodes
   */
  private convertToTreeNodes(folders: Folder[], parentId: string | null = null): TreeNode[] {
    const filtered = folders.filter(f => f.parentId === parentId);
    
    return filtered.map(folder => ({
      id: folder.id,
      label: folder.name,
      data: folder,
      children: this.convertToTreeNodes(folders, folder.id),
      expanded: true,
      selected: folder.id === this.selectedFolderId()
    }));
  }

  /**
   * Constrói tree nodes com nó raiz "Todas as fotos"
   */
  getRootTreeNodes(): TreeNode[] {
    return [
      {
        id: 'root',
        label: this.languageService.t('userDashboard.allPhotos'),
        data: null,
        children: this.treeNodes(),
        expanded: true,
        selected: this.selectedFolderId() === null
      }
    ];
  }

  /**
   * Carrega dados de pastas e fotos
   */
  loadData(): void {
    const user = this.currentUser();
    if (!user) return;

    const userFolders = this.storageService.getUserFolders(user.id);
    this.folders.set(userFolders);
    this.loadPhotos();
  }

  /**
   * Carrega fotos da pasta selecionada e suas URLs de visualização
   */
  loadPhotos(): void {
    const user = this.currentUser();
    if (!user) return;

    this.isLoadingPhotos.set(true);

    const userPhotos = this.storageService.getUserPhotos(user.id, this.selectedFolderId());
    
    // Inicializa fotos sem URLs
    const photosWithUrl: PhotoWithUrl[] = userPhotos.map(photo => ({
      ...photo,
      displayUrl: undefined,
      isLoadingUrl: true
    }));
    
    this.photos.set(photosWithUrl);

    // Carrega URLs pré-assinadas para cada foto
    if (userPhotos.length > 0) {
      this.loadPhotoUrls(userPhotos);
    } else {
      this.isLoadingPhotos.set(false);
    }
  }

  /**
   * Carrega URLs pré-assinadas para visualização das fotos
   */
  private loadPhotoUrls(photos: Photo[]): void {
    const urlRequests = photos.map(photo => 
      this.uploadService.getDownloadUrl(photo.s3Key || '').pipe(
        catchError(error => {
          console.error(`Erro ao carregar URL para ${photo.name}:`, error);
          return of(null);
        })
      )
    );

    forkJoin(urlRequests).subscribe({
      next: (urls) => {
        const updatedPhotos = this.photos().map((photo, index) => ({
          ...photo,
          displayUrl: urls[index] || undefined,
          isLoadingUrl: false
        }));
        
        this.photos.set(updatedPhotos);
        this.isLoadingPhotos.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar URLs das fotos:', error);
        this.isLoadingPhotos.set(false);
        this.showError(
          this.languageService.t('userDashboard.messages.error'),
          this.languageService.t('userDashboard.messages.loadImageError')
        );
      }
    });
  }

  /**
   * Seleciona uma pasta no tree
   */
  onFolderSelect(event: { node: TreeNode, data: any }): void {
    if (event.data) {
      this.selectedFolderId.set(event.data.id);
    } else {
      this.selectedFolderId.set(null);
    }
    this.loadPhotos();
  }

  /**
   * Abre modal para criar nova pasta raiz
   */
  createFolder(): void {
    const user = this.currentUser();
    if (!user) return;

    this.parentFolderForCreate.set(null);
    this.createFolderName.set('');
    this.showCreateDialog.set(true);
  }

  /**
   * Abre modal para criar subpasta dentro de uma pasta existente
   * Recebe o objeto Folder diretamente do custom-tree
   */
  createSubfolder(folder: Folder | null): void {
    console.log('createSubfolder chamado com:', folder);

    // Ignora se for o nó raiz (null)
    if (!folder) {
      console.warn('Tentou criar subpasta no nó raiz (null) - ignorado');
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    this.parentFolderForCreate.set(folder);
    this.createFolderName.set('');
    this.showCreateDialog.set(true);
  }

  /**
   * Salva a nova pasta/subpasta
   */
  saveCreateFolder(): void {
    const user = this.currentUser();
    if (!user) return;

    const folderName = this.createFolderName().trim();
    const parentFolder = this.parentFolderForCreate();

    if (!folderName) {
      this.showError(
        this.languageService.t('userDashboard.messages.error'),
        this.languageService.t('userDashboard.messages.folderNameEmpty')
      );
      return;
    }

    this.storageService.createFolder(user.id, folderName, parentFolder?.id || null);
    this.loadData();

    const message = parentFolder
      ? this.languageService.t('userDashboard.messages.subfolderCreatedIn').replace('{name}', folderName).replace('{parent}', parentFolder.name)
      : this.languageService.t('userDashboard.messages.folderCreatedSuccess').replace('{name}', folderName);

    this.showSuccess(this.languageService.t('userDashboard.messages.folderCreated'), message);
    this.closeCreateDialog();
  }

  /**
   * Fecha o modal de criar pasta
   */
  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
    this.parentFolderForCreate.set(null);
    this.createFolderName.set('');
  }

  /**
   * Abre modal para editar nome de uma pasta
   * Recebe o objeto Folder diretamente do custom-tree
   */
  editFolder(folder: Folder | null): void {
    console.log('editFolder chamado com:', folder);

    // Se for null (nó raiz), ignora
    if (!folder) {
      console.warn('Tentou editar o nó raiz (null) - ignorado');
      return;
    }

    // Abre o modal com o folder selecionado
    this.editingFolder.set(folder);
    this.newFolderName.set(folder.name);
    this.showEditDialog.set(true);
  }

  /**
   * Salva a edição do nome da pasta
   */
  saveEditFolder(): void {
    const folder = this.editingFolder();
    const newName = this.newFolderName().trim();

    if (!folder || !newName) {
      this.showError(
        this.languageService.t('userDashboard.messages.error'),
        this.languageService.t('userDashboard.messages.folderNameEmpty')
      );
      return;
    }

    if (newName === folder.name) {
      this.closeEditDialog();
      return;
    }

    this.storageService.renameFolder(folder.id, newName);
    this.loadData();
    this.showSuccess(
      this.languageService.t('userDashboard.messages.folderRenamed'),
      this.languageService.t('userDashboard.messages.folderRenamedTo').replace('{name}', newName)
    );
    this.closeEditDialog();
  }

  /**
   * Fecha o modal de edição
   */
  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingFolder.set(null);
    this.newFolderName.set('');
  }

  /**
   * Abre modal para confirmar exclusão de pasta
   * Recebe o objeto Folder diretamente do custom-tree
   */
  deleteFolder(folder: Folder | null): void {
    console.log('deleteFolder chamado com:', folder);

    // Ignora se for o nó raiz (null)
    if (!folder) {
      console.warn('Tentou deletar o nó raiz (null) - ignorado');
      return;
    }

    this.folderToDelete.set(folder);
    this.showDeleteDialog.set(true);
  }

  /**
   * Confirma e executa a exclusão da pasta
   */
  confirmDeleteFolder(): void {
    const folder = this.folderToDelete();
    if (!folder) return;

    this.storageService.deleteFolder(folder.id);
    this.loadData();

    if (this.selectedFolderId() === folder.id) {
      this.selectedFolderId.set(null);
    }

    this.showSuccess(
      this.languageService.t('userDashboard.messages.folderDeleted'),
      this.languageService.t('userDashboard.messages.folderDeletedSuccess').replace('{name}', folder.name)
    );
    this.closeDeleteDialog();
  }

  /**
   * Fecha o modal de deletar pasta
   */
  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.folderToDelete.set(null);
  }

  /**
   * Manipula seleção de arquivos
   */
  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const user = this.currentUser();
    if (!user) return;

    this.isUploading.set(true);

    for (const file of Array.from(input.files)) {
      const filePath = (file as any).webkitRelativePath || file.name;
      this.selectedFile.set({ name: file.name, path: filePath });

      const currentStorage = user.storageUsed;
      const storageLimit = this.storageService.getStorageLimit(user.plan);

      if (storageLimit !== Infinity && currentStorage + file.size > storageLimit) {
        this.showError(
          this.languageService.t('userDashboard.messages.storageLimitExceeded'),
          this.languageService.t('userDashboard.messages.storageLimitExceededDesc')
        );
        continue;
      }

      try {
        this.uploadService.uploadAndGetUrl(file).subscribe({
          next: (result: UploadResponse) => {
            console.log('Upload S3 bem-sucedido:', result);

            const photo: Photo = {
              id: crypto.randomUUID(),
              userId: user.id,
              folderId: this.selectedFolderId(),
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString(),
              dataUrl: result.fileUrl,
              s3Key: result.fileKey,
              bucketName: result.bucketName
            };

            const photos = this.storageService.getPhotos();
            photos.push(photo);
            this.storageService.savePhotos(photos);

            this.storageService.updateUser(user.id, {
              storageUsed: user.storageUsed + file.size
            });

            this.showSuccess(
              this.languageService.t('userDashboard.messages.uploadSuccess'),
              this.languageService.t('userDashboard.messages.uploadSuccessDesc').replace('{name}', file.name)
            );

            const updatedUser = this.storageService.getCurrentUser();
            if (updatedUser) {
              this.currentUser.set(updatedUser);
            }

            this.loadPhotos();
          },
          error: (error) => {
            console.error('Erro no upload S3:', error);
            this.showError(
              this.languageService.t('userDashboard.messages.uploadError'),
              this.languageService.t('userDashboard.messages.uploadErrorDesc').replace('{name}', file.name)
            );
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : this.languageService.t('userDashboard.messages.uploadError');
        this.showError(this.languageService.t('userDashboard.messages.uploadError'), errorMessage);
      }
    }

    this.isUploading.set(false);
    input.value = '';
  }

  /**
   * Abre seletor de arquivos
   */
  openFileSelector(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Faz download de uma foto
   */
  downloadPhoto(photo: PhotoWithUrl): void {
    if (!photo.s3Key) {
      this.showError(
        this.languageService.t('userDashboard.messages.error'),
        this.languageService.t('userDashboard.messages.s3KeyNotFound')
      );
      return;
    }

    this.uploadService.getDownloadUrl(photo.s3Key).subscribe({
      next: (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = photo.name;
        link.click();
        this.showSuccess(
          this.languageService.t('userDashboard.messages.downloadStarted'),
          this.languageService.t('userDashboard.messages.downloadStartedDesc').replace('{name}', photo.name)
        );
      },
      error: (error) => {
        console.error('Erro ao gerar URL de download:', error);
        this.showError(
          this.languageService.t('userDashboard.messages.error'),
          this.languageService.t('userDashboard.messages.downloadError')
        );
      }
    });
  }

  /**
   * Deleta uma foto
   */
  deletePhoto(photo: PhotoWithUrl): void {
    if (!confirm(this.languageService.t('userDashboard.messages.deletePhotoConfirm'))) {
      return;
    }

    if (photo.s3Key) {
      this.uploadService.deleteFile(photo.s3Key).subscribe({
        next: (response) => {
          console.log('Arquivo deletado do S3:', response);

          this.storageService.deletePhoto(photo.id);
          this.showSuccess(
            this.languageService.t('userDashboard.messages.photoDeleted'),
            this.languageService.t('userDashboard.messages.photoDeletedFromS3')
          );

          const updatedUser = this.storageService.getCurrentUser();
          if (updatedUser) {
            this.currentUser.set(updatedUser);
          }

          this.loadPhotos();
        },
        error: (error) => {
          console.error('Erro ao deletar do S3:', error);

          this.storageService.deletePhoto(photo.id);
          this.showError(
            this.languageService.t('userDashboard.messages.warning'),
            this.languageService.t('userDashboard.messages.photoDeletedWarning')
          );

          this.loadPhotos();
        }
      });
    } else {
      this.storageService.deletePhoto(photo.id);
      this.showSuccess(
        this.languageService.t('userDashboard.messages.photoDeleted'),
        this.languageService.t('userDashboard.messages.photoDeletedLocal')
      );

      const updatedUser = this.storageService.getCurrentUser();
      if (updatedUser) {
        this.currentUser.set(updatedUser);
      }

      this.loadPhotos();
    }
  }

  /**
   * Obtém itens do menu de mover
   */
  getMoveMenuItems(photo: PhotoWithUrl): MenuItem[] {
    const allFolders = this.folders();
    const flatFolderList: MenuItem[] = [];

    const buildFlatList = (parentId: string | null, level: number = 0): void => {
      allFolders
        .filter(f => f.parentId === parentId)
        .forEach(folder => {
          const indent = level > 0 ? '\u00A0\u00A0'.repeat(level) : '';
          flatFolderList.push({
            label: `${indent}${folder.name}`,
            icon: 'pi pi-folder',
            command: () => this.movePhoto(photo.id, folder.id),
            styleClass: 'move-menu-item'
          });
          buildFlatList(folder.id, level + 1);
        });
    };

    buildFlatList(null);

    return [
      {
        label: this.languageService.t('userDashboard.root'),
        icon: 'pi pi-folder-open',
        command: () => this.movePhoto(photo.id, null),
        styleClass: 'move-menu-item'
      },
      ...flatFolderList
    ];
  }

  /**
   * Move foto para outra pasta
   */
  movePhoto(photoId: string, folderId: string | null): void {
    this.storageService.movePhotoToFolder(photoId, folderId);
    this.showSuccess(
      this.languageService.t('userDashboard.messages.photoMoved'),
      this.languageService.t('userDashboard.messages.photoMovedSuccess')
    );
    this.loadPhotos();
  }

  /**
   * Calcula porcentagem de storage usado
   */
  getStoragePercentage(): number {
    const user = this.currentUser();
    if (!user) return 0;

    const limit = this.storageService.getStorageLimit(user.plan);
    if (limit === Infinity) return 0;

    return (user.storageUsed / limit) * 100;
  }

  /**
   * Formata bytes em formato legível
   */
  formatBytes(bytes: number): string {
    return this.storageService.formatBytes(bytes);
  }

  /**
   * Obtém limite de storage formatado
   */
  getStorageLimitFormatted(): string {
    const user = this.currentUser();
    if (!user) return '';

    const limit = this.storageService.getStorageLimit(user.plan);
    return limit === Infinity ? this.languageService.t('userDashboard.unlimited') : this.formatBytes(limit);
  }

  /**
   * Obtém total de fotos do usuário
   */
  getTotalPhotos(): number {
    const user = this.currentUser();
    if (!user) return 0;

    return this.storageService.getUserPhotos(user.id).length;
  }

  /**
   * Obtém nome da pasta atual
   */
  getCurrentFolderName(): string {
    const folderId = this.selectedFolderId();
    if (!folderId) return this.languageService.t('userDashboard.allPhotos');

    const folder = this.folders().find(f => f.id === folderId);
    return folder?.name || this.languageService.t('userDashboard.allPhotos');
  }

  /**
   * Exibe mensagem de sucesso
   */
  private showSuccess(title: string, message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message
    });
  }

  /**
   * Exibe mensagem de erro
   */
  private showError(title: string, message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message
    });
  }

  /**
   * Trata erro ao carregar imagem
   */
  onImageError(event: Event, photo: PhotoWithUrl): void {
    console.error('Erro ao carregar imagem:', photo.name);
    
    const updatedPhotos = this.photos().map(p => 
      p.id === photo.id ? { ...p, displayUrl: undefined, isLoadingUrl: false } : p
    );
    this.photos.set(updatedPhotos);
  }
}