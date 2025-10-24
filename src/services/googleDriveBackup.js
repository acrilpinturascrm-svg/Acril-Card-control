/**
 * Servicio para backup en Google Drive
 * FASE 2: Implementación para aprendizaje de Google Drive API
 */

import { gapi } from 'gapi-script';

class GoogleDriveBackupService {
  constructor() {
    this.isInitialized = false;
    this.isSignedIn = false;
    this.gapi = null;
    this.discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    this.scopes = 'https://www.googleapis.com/auth/drive.file';

    // Configuración - DEBES OBTENER ESTAS CREDENCIALES EN GOOGLE CLOUD CONSOLE
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY || '';

    this.appFolderName = 'ACRILCARD_Backups';
    this.appFolderId = null;
    
    // Cargar script de Google API dinámicamente
    this.loadGapiScript();
  }

  /**
   * Cargar script de Google API dinámicamente
   */
  loadGapiScript() {
    // Verificar si ya está cargado
    if (window.gapi) {
      console.log('✅ Google API script ya está cargado');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google API script cargado exitosamente');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Error cargando Google API script:', error);
        reject(new Error('Failed to load Google API script'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Inicializar Google Drive API usando el patrón estándar oficial de gapi-script
   */
  async initialize() {
    try {
      console.log('🔄 Iniciando inicialización de Google Drive API...');

      // Asegurar que el script de Google API esté cargado
      await this.loadGapiScript();

      // Esperar a que gapi esté disponible
      if (!window.gapi) {
        throw new Error('Google API script not loaded. Please check your internet connection.');
      }

      if (!this.clientId || !this.apiKey) {
        throw new Error('Google Drive credentials not configured. Please set REACT_APP_GOOGLE_CLIENT_ID and REACT_APP_GOOGLE_API_KEY in your .env file');
      }

      console.log('📋 Configuración:', {
        clientId: this.clientId.substring(0, 20) + '...',
        apiKey: this.apiKey.substring(0, 20) + '...',
        discoveryDoc: this.discoveryDoc,
        scopes: this.scopes
      });

      // Patrón estándar oficial de gapi-script
      console.log('🔄 Cargando client:auth2...');
      await new Promise((resolve) => gapi.load('client:auth2', resolve));

      console.log('🚀 Inicializando gapi.client...');
      await gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: [this.discoveryDoc],
        scope: this.scopes,
      });

      console.log('✅ Google Drive API inicializada exitosamente');
      this.gapi = gapi;
      this.isInitialized = true;

      // Verificar autenticación
      const authInstance = gapi.auth2.getAuthInstance();
      this.isSignedIn = authInstance.isSignedIn.get();

      console.log('👤 Estado de autenticación:', this.isSignedIn ? 'Autenticado' : 'No autenticado');
      return true;

    } catch (error) {
      console.error('❌ Error inicializando Google Drive API:', error);
      this.isInitialized = false;
      this.isSignedIn = false;

      // Crear mensaje de error detallado
      const errorMessage = this.buildDetailedErrorMessage(error);
      throw new Error(`Google Drive initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Construir mensaje de error detallado
   */
  buildDetailedErrorMessage(error) {
    let errorMessage = 'Unknown error occurred';
    let errorDetails = '';

    try {
      // Método 1: Propiedad message estándar
      if (error?.message) {
        errorMessage = error.message;
      }
      // Método 2: Método toString()
      else if (error?.toString && error.toString() !== '[object Object]') {
        errorMessage = error.toString();
      }
      // Método 3: Buscar en propiedades comunes
      else if (error?.error_description) {
        errorMessage = error.error_description;
      }
      else if (error?.error) {
        errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
      }
      // Método 4: Buscar en propiedades de respuesta
      else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Método 5: Status text para errores HTTP
      else if (error?.statusText) {
        errorMessage = error.statusText;
      }
      // Método 6: Constructor name como último recurso
      else if (error?.constructor?.name && error.constructor.name !== 'Object') {
        errorMessage = `Error of type: ${error.constructor.name}`;
      }

      // Extraer detalles adicionales si están disponibles
      if (error?.status) errorDetails += `Status: ${error.status}. `;
      if (error?.code) errorDetails += `Code: ${error.code}. `;
      if (error?.reason) errorDetails += `Reason: ${error.reason}. `;
      if (error?.response?.status) errorDetails += `Response Status: ${error.response.status}. `;

    } catch (extractError) {
      console.error('Error extracting error information:', extractError);
      errorMessage = 'Unable to extract error details';
    }

    return errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage;
  }

  /**
   * Función de diagnóstico simple
   */
  async diagnoseConfiguration() {
    console.log('🔍 Diagnóstico de configuración de Google Drive:');

    if (!this.clientId || !this.apiKey) {
      return {
        status: 'error',
        message: 'Credenciales no configuradas en .env'
      };
    }

    if (!gapi) {
      return {
        status: 'error',
        message: 'Google API no cargada'
      };
    }

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      return {
        status: 'success',
        message: 'Configuración correcta',
        details: {
          isSignedIn: authInstance.isSignedIn.get()
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error en autenticación',
        error: error.message
      };
    }
  }

  /**
   * Autenticar usuario con Google
   */
  async signIn() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      this.isSignedIn = true;
      console.log('✅ User signed in:', user.getBasicProfile().getName());
      
      return {
        name: user.getBasicProfile().getName(),
        email: user.getBasicProfile().getEmail(),
        imageUrl: user.getBasicProfile().getImageUrl()
      };
    } catch (error) {
      console.error('❌ Error signing in:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al iniciar sesión en Google Drive';
      
      if (error && typeof error === 'object') {
        if (error.error === 'popup_closed_by_user') {
          errorMessage = 'Inicio de sesión cancelado por el usuario';
        } else if (error.error === 'access_denied') {
          errorMessage = 'Acceso denegado. Por favor, autoriza la aplicación para continuar';
        } else if (error.error === 'immediate_failed') {
          errorMessage = 'No se pudo iniciar sesión automáticamente. Por favor, intenta de nuevo';
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = `Error: ${error.error}`;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut() {
    try {
      if (!this.isInitialized) return;

      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      
      this.isSignedIn = false;
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Crear o encontrar carpeta de la app
   */
  async ensureAppFolder() {
    try {
      if (this.appFolderId) return this.appFolderId;

      // Buscar carpeta existente
      const response = await this.gapi.client.drive.files.list({
        q: `name='${this.appFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive'
      });

      if (response.result.files.length > 0) {
        this.appFolderId = response.result.files[0].id;
        console.log('Found existing app folder:', this.appFolderId);
      } else {
        // Crear nueva carpeta
        const folderResponse = await this.gapi.client.drive.files.create({
          resource: {
            name: this.appFolderName,
            mimeType: 'application/vnd.google-apps.folder'
          }
        });
        
        this.appFolderId = folderResponse.result.id;
        console.log('Created new app folder:', this.appFolderId);
      }

      return this.appFolderId;
    } catch (error) {
      console.error('Error ensuring app folder:', error);
      throw error;
    }
  }

  /**
   * Subir backup a Google Drive
   */
  async uploadBackup(backupId, backupData) {
    try {
      if (!this.isSignedIn) {
        throw new Error('User not signed in to Google Drive');
      }

      await this.ensureAppFolder();

      const fileName = `acrilcard-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      const fileContent = JSON.stringify(backupData, null, 2);
      
      // Crear metadata del archivo
      const metadata = {
        name: fileName,
        parents: [this.appFolderId],
        description: `ACRILCARD backup created on ${new Date().toLocaleString()}. Contains ${backupData.customers?.length || 0} customers.`
      };

      // Subir archivo
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
        }),
        body: form
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Backup uploaded to Google Drive:', result.id);

      return {
        fileId: result.id,
        fileName: fileName,
        size: fileContent.length,
        url: `https://drive.google.com/file/d/${result.id}/view`
      };

    } catch (error) {
      console.error('Error uploading backup to Google Drive:', error);
      throw error;
    }
  }

  /**
   * Listar backups en Google Drive
   */
  async listBackups() {
    try {
      if (!this.isSignedIn) {
        throw new Error('User not signed in to Google Drive');
      }

      await this.ensureAppFolder();

      const response = await this.gapi.client.drive.files.list({
        q: `parents in '${this.appFolderId}' and name contains 'acrilcard-backup' and trashed=false`,
        orderBy: 'createdTime desc',
        fields: 'files(id,name,size,createdTime,modifiedTime,description)'
      });

      return response.result.files.map(file => ({
        id: file.id,
        name: file.name,
        size: parseInt(file.size) || 0,
        createdAt: file.createdTime,
        modifiedAt: file.modifiedTime,
        description: file.description,
        url: `https://drive.google.com/file/d/${file.id}/view`
      }));

    } catch (error) {
      console.error('Error listing backups from Google Drive:', error);
      throw error;
    }
  }

  /**
   * Descargar backup desde Google Drive
   */
  async downloadBackup(fileId) {
    try {
      if (!this.isSignedIn) {
        throw new Error('User not signed in to Google Drive');
      }

      const response = await this.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return JSON.parse(response.body);

    } catch (error) {
      console.error('Error downloading backup from Google Drive:', error);
      throw error;
    }
  }

  /**
   * Eliminar backup de Google Drive
   */
  async deleteBackup(fileId) {
    try {
      if (!this.isSignedIn) {
        throw new Error('User not signed in to Google Drive');
      }

      await this.gapi.client.drive.files.delete({
        fileId: fileId
      });

      console.log('Backup deleted from Google Drive:', fileId);
      return true;

    } catch (error) {
      console.error('Error deleting backup from Google Drive:', error);
      throw error;
    }
  }
  /**
   * Obtener información del usuario autenticado
   */
  getUserInfo() {
    try {
      if (!this.isSignedIn || !this.isInitialized) return null;

      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const profile = user.getBasicProfile();

      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }
  /**
   * Sincronización bidireccional con Google Drive
   * Compara archivos locales con remotos y sincroniza
   */
  async syncWithGoogleDrive(localBackups = []) {
    try {
      if (!this.isSignedIn) {
        throw new Error('User not signed in to Google Drive');
      }

      const remoteBackups = await this.listBackups();
      const syncResults = {
        uploaded: [],
        downloaded: [],
        conflicts: [],
        errors: []
      };

      // Crear mapa de archivos locales por timestamp
      const localMap = new Map();
      localBackups.forEach(backup => {
        if (backup.metadata?.createdAt) {
          localMap.set(backup.metadata.createdAt, backup);
        }
      });

      // Crear mapa de archivos remotos por fecha de modificación
      const remoteMap = new Map();
      remoteBackups.forEach(backup => {
        if (backup.modifiedAt) {
          remoteMap.set(backup.modifiedAt, backup);
        }
      });

      // Encontrar archivos para subir (solo en local)
      for (const [timestamp, localBackup] of localMap) {
        if (!remoteMap.has(timestamp)) {
          try {
            const uploadResult = await this.uploadBackup(`sync_${Date.now()}`, localBackup);
            syncResults.uploaded.push(uploadResult);
          } catch (error) {
            syncResults.errors.push(`Failed to upload local backup: ${error.message}`);
          }
        }
      }

      // Encontrar archivos para descargar (solo en remoto)
      for (const [timestamp, remoteBackup] of remoteMap) {
        if (!localMap.has(timestamp)) {
          try {
            const downloadedBackup = await this.downloadBackup(remoteBackup.id);
            syncResults.downloaded.push({
              ...remoteBackup,
              data: downloadedBackup
            });
          } catch (error) {
            syncResults.errors.push(`Failed to download remote backup: ${error.message}`);
          }
        }
      }

      return syncResults;
    } catch (error) {
      console.error('Error during Google Drive sync:', error);
      throw error;
    }
  }
  /**
   * Verificar integridad de backups en Google Drive
   */
  async verifyBackupIntegrity(fileId) {
    try {
      if (!this.isSignedIn) {
        throw new Error('User not signed in to Google Drive');
      }

      // Obtener metadata del archivo
      const fileResponse = await this.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id,name,size,md5Checksum,createdTime,modifiedTime'
      });

      const file = fileResponse.result;

      // Descargar contenido para verificar
      const content = await this.downloadBackup(fileId);

      // Verificaciones básicas
      const checks = {
        fileExists: !!file,
        hasValidContent: !!content && typeof content === 'object',
        hasCustomersArray: Array.isArray(content.customers),
        hasMetadata: !!content.metadata,
        sizeMatches: content.customers?.length > 0
      };

      return {
        file,
        content,
        checks,
        isValid: Object.values(checks).every(check => check)
      };

    } catch (error) {
      console.error('Error verifying backup integrity:', error);
      return {
        error: error.message,
        isValid: false
      };
    }
  }

  /**
   * Verificar cuota de almacenamiento
   */
  async getStorageInfo() {
    try {
      if (!this.isSignedIn) {
        throw new Error('User not signed in to Google Drive');
      }

      const response = await this.gapi.client.drive.about.get({
        fields: 'storageQuota'
      });

      const quota = response.result.storageQuota;
      return {
        limit: parseInt(quota.limit) || 0,
        usage: parseInt(quota.usage) || 0,
        usageInDrive: parseInt(quota.usageInDrive) || 0,
        available: parseInt(quota.limit) - parseInt(quota.usage) || 0
      };

    } catch (error) {
      console.error('Error getting storage info:', error);
      throw error;
    }
  }
}

// Instancia singleton
const googleDriveService = new GoogleDriveBackupService();

export default googleDriveService;

/**
 * INSTRUCCIONES PARA CONFIGURAR GOOGLE DRIVE API:
 * 
 * 1. Ve a Google Cloud Console (https://console.cloud.google.com/)
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. Habilita la Google Drive API
 * 4. Crea credenciales (OAuth 2.0 Client ID)
 * 5. Configura el origen autorizado: http://localhost:3000 (desarrollo)
 * 6. Obtén el Client ID y API Key
 * 7. Crea archivo .env.local con:
 *    REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_aqui
 *    REACT_APP_GOOGLE_API_KEY=tu_api_key_aqui
 * 
 * EJEMPLO DE USO:
 * 
 * import googleDriveService from './services/googleDriveBackup';
 * 
 * // Inicializar y autenticar
 * await googleDriveService.initialize();
 * const userInfo = await googleDriveService.signIn();
 * 
 * // Subir backup
 * const result = await googleDriveService.uploadBackup('backup_123', backupData);
 * 
 * // Listar backups
 * const backups = await googleDriveService.listBackups();
 * 
 * // Descargar backup
 * const backupData = await googleDriveService.downloadBackup(fileId);
 */
