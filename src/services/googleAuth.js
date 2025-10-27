/**
 * Servicio de Autenticación con Google
 * Permite iniciar sesión usando cuentas de Google
 */

class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
    this.isSignedIn = false;
    this.currentUser = null;
    
    // Configuración de Google OAuth
    // Prioridad: 1) window.APP_CONFIG (runtime), 2) process.env (build time)
    this.clientId = (window.APP_CONFIG?.googleClientId) || process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive.file'
    ].join(' ');
    
    this.redirectUri = (window.APP_CONFIG?.publicBaseUrl) || process.env.REACT_APP_PUBLIC_BASE_URL || window.location.origin;
  }

  /**
   * Cargar el script de Google Identity Services
   */
  loadGoogleScript() {
    if (window.google?.accounts) {
      console.log('✅ Google Identity Services ya está cargado');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Identity Services cargado exitosamente');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Error cargando Google Identity Services:', error);
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Inicializar el servicio de autenticación
   */
  async initialize() {
    try {
      console.log('🔄 Iniciando Google Auth Service...');

      if (!this.clientId) {
        throw new Error('Google Client ID no configurado. Configura REACT_APP_GOOGLE_CLIENT_ID en .env');
      }

      // Cargar el script de Google
      await this.loadGoogleScript();

      // Esperar a que google.accounts esté disponible
      let attempts = 0;
      while (!window.google?.accounts && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.google?.accounts) {
        throw new Error('Google Identity Services no se pudo cargar');
      }

      this.isInitialized = true;
      console.log('✅ Google Auth Service inicializado');

      // Verificar si hay sesión guardada
      this.checkSavedSession();

      return true;
    } catch (error) {
      console.error('❌ Error inicializando Google Auth:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay una sesión guardada
   */
  checkSavedSession() {
    try {
      const savedUser = localStorage.getItem('google_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.isSignedIn = true;
        console.log('✅ Sesión de Google restaurada:', this.currentUser.email);
      }
    } catch (error) {
      console.error('Error verificando sesión guardada:', error);
      localStorage.removeItem('google_user');
    }
  }

  /**
   * Iniciar sesión con Google usando OAuth 2.0
   */
  async signIn() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scopes,
          ux_mode: 'popup', // Usar popup en lugar de redirect
          callback: async (response) => {
            if (response.error) {
              console.error('❌ Error en autenticación:', response);
              reject(new Error(response.error));
              return;
            }

            try {
              // Obtener información del usuario
              const userInfo = await this.getUserInfo(response.access_token);
              
              this.currentUser = {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                accessToken: response.access_token,
                expiresAt: Date.now() + (response.expires_in * 1000)
              };

              this.isSignedIn = true;

              // Guardar sesión
              localStorage.setItem('google_user', JSON.stringify(this.currentUser));
              localStorage.setItem('google_access_token', response.access_token);

              console.log('✅ Inicio de sesión exitoso:', this.currentUser.email);
              resolve(this.currentUser);
            } catch (error) {
              console.error('❌ Error obteniendo información del usuario:', error);
              reject(error);
            }
          },
        });

        // Solicitar el token con prompt para seleccionar cuenta
        client.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('❌ Error en signIn:', error);
      throw error;
    }
  }

  /**
   * Obtener información del usuario desde Google
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo información del usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo info del usuario:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut() {
    try {
      // Revocar el token si existe
      if (this.currentUser?.accessToken) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.currentUser.accessToken}`, {
          method: 'POST'
        });
      }

      // Limpiar datos locales
      this.currentUser = null;
      this.isSignedIn = false;
      localStorage.removeItem('google_user');
      localStorage.removeItem('google_access_token');

      console.log('✅ Sesión de Google cerrada');
      return true;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Limpiar de todas formas
      this.currentUser = null;
      this.isSignedIn = false;
      localStorage.removeItem('google_user');
      localStorage.removeItem('google_access_token');
      return true;
    }
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return this.isSignedIn && this.currentUser !== null;
  }

  /**
   * Obtener el token de acceso
   */
  getAccessToken() {
    return this.currentUser?.accessToken || localStorage.getItem('google_access_token');
  }

  /**
   * Verificar si el token ha expirado
   */
  isTokenExpired() {
    if (!this.currentUser?.expiresAt) return true;
    return Date.now() >= this.currentUser.expiresAt;
  }

  /**
   * Renovar el token si es necesario
   */
  async refreshTokenIfNeeded() {
    if (this.isTokenExpired()) {
      console.log('🔄 Token expirado, renovando...');
      await this.signOut();
      return false;
    }
    return true;
  }
}

// Exportar instancia única (singleton)
const googleAuthService = new GoogleAuthService();
export default googleAuthService;
