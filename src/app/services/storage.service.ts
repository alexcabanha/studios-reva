import { Injectable } from '@angular/core';
import { User, StoragePlan, PlanType, PaymentMethod } from '../models/user.model';
import { Folder } from '../models/folder.model';
import { Photo } from '../models/photo.model';

/**
 * Serviço de gerenciamento de armazenamento
 * Responsável por todas as operações de CRUD em localStorage
 * para usuários, pastas e fotos
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  // Limites de armazenamento por plano (em bytes)
  private readonly STORAGE_LIMITS = {
    essencial: 100 * 1024 * 1024 * 1024, // 100GB
    pro: 300 * 1024 * 1024 * 1024,       // 300GB
    studio: Infinity                      // Ilimitado
  };

  constructor() {
    this.initializeStorage();
  }

  /**
   * Inicializa o storage com usuários padrão se não existirem
   */
  initializeStorage(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      this.createUser({
        email: 'admin@revastudio.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin',
        plan: 'studio',
        storageUsed: 0,
        createdAt: new Date().toISOString(),
        id: ''
      });

      this.createUser({
        email: 'contato@teacherkarololiveira.org',
        password: '123456',
        name: 'Karoline de Oliveira',
        role: 'user',
        plan: 'essencial',
        storageUsed: 0,
        createdAt: new Date().toISOString(),
        id: '',
        cnpj: '42.070.149/0001-97',
        telefone: '27 99999-2732',
        endereco: 'Avenida Barao Rio Branco, 812, Interlagos, Linhares - ES, CEP: 29903-066',
        planType: 'mensal',
        paymentMethod: 'pix',
        accountStatus: 'ativo'
      });
    }
  }

  /**
   * Obtém o limite de armazenamento baseado no plano
   */
  getStorageLimit(plan: StoragePlan): number {
    return this.STORAGE_LIMITS[plan];
  }

  /**
   * Formata bytes em formato legível
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // ========== MÉTODOS DE USUÁRIO ==========

  /**
   * Obtém todos os usuários do localStorage
   */
  getUsers(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  /**
   * Salva array de usuários no localStorage
   */
  saveUsers(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  /**
   * Obtém o usuário atualmente logado
   */
  getCurrentUser(): User | null {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return null;
    const users = this.getUsers();
    return users.find(u => u.id === currentUserId) || null;
  }

  /**
   * Define o usuário atual
   */
  setCurrentUser(userId: string): void {
    localStorage.setItem('currentUserId', userId);
  }

  /**
   * Realiza logout removendo o usuário atual
   */
  logout(): void {
    localStorage.removeItem('currentUserId');
  }

  /**
   * Cria um novo usuário
   */
  createUser(userData: Partial<User>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      storageUsed: 0,
      createdAt: new Date().toISOString(),
    } as User;
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  /**
   * Atualiza dados de um usuário
   */
  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
    }
  }

  /**
   * Deleta um usuário e suas fotos
   */
  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    this.saveUsers(filtered);
    
    // Remove fotos do usuário
    const photos = this.getPhotos();
    const userPhotos = photos.filter(p => p.userId !== userId);
    this.savePhotos(userPhotos);
  }

  // ========== MÉTODOS DE PASTA ==========

  /**
   * Obtém todas as pastas
   */
  getFolders(): Folder[] {
    const folders = localStorage.getItem('folders');
    return folders ? JSON.parse(folders) : [];
  }

  /**
   * Salva pastas no localStorage
   */
  saveFolders(folders: Folder[]): void {
    localStorage.setItem('folders', JSON.stringify(folders));
  }

  /**
   * Obtém pastas de um usuário específico
   */
  getUserFolders(userId: string): Folder[] {
    return this.getFolders().filter(f => f.userId === userId);
  }

  /**
   * Cria uma nova pasta
   */
  createFolder(userId: string, name: string, parentId: string | null = null): Folder {
    const folders = this.getFolders();
    const newFolder: Folder = {
      id: this.generateId(),
      userId,
      name,
      parentId,
      createdAt: new Date().toISOString()
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    return newFolder;
  }

  /**
   * Renomeia uma pasta
   */
  renameFolder(folderId: string, newName: string): void {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === folderId);
    if (index !== -1) {
      folders[index].name = newName;
      this.saveFolders(folders);
    }
  }

  /**
   * Deleta uma pasta e suas subpastas recursivamente
   */
  deleteFolder(folderId: string): void {
    const folders = this.getFolders();
    const photos = this.getPhotos();
    
    // Obtém IDs de todas as subpastas recursivamente
    const getAllSubfolderIds = (parentId: string): string[] => {
      const subfolders = folders.filter(f => f.parentId === parentId);
      let ids = subfolders.map(f => f.id);
      subfolders.forEach(sf => {
        ids = [...ids, ...getAllSubfolderIds(sf.id)];
      });
      return ids;
    };
    
    const folderIdsToDelete = [folderId, ...getAllSubfolderIds(folderId)];
    
    // Remove pastas
    const remainingFolders = folders.filter(f => !folderIdsToDelete.includes(f.id));
    this.saveFolders(remainingFolders);
    
    // Remove fotos das pastas deletadas
    folderIdsToDelete.forEach(id => {
      const photosToDelete = photos.filter(p => p.folderId === id);
      photosToDelete.forEach(photo => this.deletePhoto(photo.id));
    });
  }

  // ========== MÉTODOS DE FOTO ==========

  /**
   * Obtém todas as fotos
   */
  getPhotos(): Photo[] {
    const photos = localStorage.getItem('photos');
    return photos ? JSON.parse(photos) : [];
  }

  /**
   * Salva fotos no localStorage
   */
  savePhotos(photos: Photo[]): void {
    localStorage.setItem('photos', JSON.stringify(photos));
  }

  /**
   * Obtém fotos de um usuário, opcionalmente filtradas por pasta
   */
  getUserPhotos(userId: string, folderId?: string | null): Photo[] {
    const photos = this.getPhotos().filter(p => p.userId === userId);
    if (folderId !== undefined) {
      return photos.filter(p => p.folderId === folderId);
    }
    return photos;
  }

  /**
   * Move foto para outra pasta
   */
  movePhotoToFolder(photoId: string, folderId: string | null): void {
    const photos = this.getPhotos();
    const index = photos.findIndex(p => p.id === photoId);
    if (index !== -1) {
      photos[index].folderId = folderId;
      this.savePhotos(photos);
    }
  }

  /**
   * Faz upload de uma foto
   * @deprecated Este método salva arquivos em base64 no localStorage.
   * Use UploadService.uploadFile() para enviar arquivos para o S3 da AWS.
   * Este método permanece apenas para compatibilidade com código legado.
   */
  async uploadPhoto(userId: string, file: File, folderId: string | null = null): Promise<Photo> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const storageLimit = this.getStorageLimit(user.plan);
    if (user.storageUsed + file.size > storageLimit) {
      throw new Error('Storage limit exceeded');
    }

    // Converte arquivo para base64
    const dataUrl = await this.fileToBase64(file);

    const photo: Photo = {
      id: this.generateId(),
      userId,
      folderId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      dataUrl
    };

    const photos = this.getPhotos();
    photos.push(photo);
    this.savePhotos(photos);

    // Atualiza uso de storage do usuário
    this.updateUser(userId, { storageUsed: user.storageUsed + file.size });

    return photo;
  }

  /**
   * Deleta uma foto
   */
  deletePhoto(photoId: string): void {
    const photos = this.getPhotos();
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    const filtered = photos.filter(p => p.id !== photoId);
    this.savePhotos(filtered);

    // Atualiza uso de storage do usuário
    const users = this.getUsers();
    const user = users.find(u => u.id === photo.userId);
    if (user) {
      this.updateUser(user.id, { storageUsed: Math.max(0, user.storageUsed - photo.size) });
    }
  }

  // ========== RECUPERAÇÃO DE SENHA ==========

  /**
   * Gera senha temporária aleatória
   */
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Define senha temporária para um usuário
   */
  setTemporaryPassword(email: string): { success: boolean; tempPassword?: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false };
    }

    const tempPassword = this.generateTemporaryPassword();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutos

    this.updateUser(user.id, {
      temporaryPassword: tempPassword,
      temporaryPasswordExpiry: expiry.toISOString(),
      needsPasswordReset: false
    });

    return { success: true, tempPassword, user };
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Gera ID único usando crypto
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Converte arquivo para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}