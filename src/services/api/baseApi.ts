import { toast } from 'sonner';

// API Configuration - Updated for upgraded Xano subscription
export const AUTH_BASE_URL = 'https://xbye-fy8t-vfht.n7e.xano.io/api:SV2QC-Dp';
export const EVENTS_BASE_URL = 'https://xbye-fy8t-vfht.n7e.xano.io/api:F7jy405C';
export const API_TOKEN = 'eyJhbGciOiJSUzI1NiJ9.eyJ4YW5vIjp7ImRibyI6Im1hc3Rlcjp1c2VyIiwiaWQiOjExNjQwOCwiYWNjZXNzX3Rva2VuIjp7ImtleWlkIjoiNzFhODc3NmItMDMwYi00N2ZkLWE0NTQtMTgwZmM5NTAzYmIwIiwic2NvcGUiOnsidGVuYW50X2NlbnRlcjpiYWNrdXAiOjAsInRlbmFudF9jZW50ZXI6ZGVwbG95IjowLCJ0ZW5hbnRfY2VudGVyOmltcGVyc29uYXRlIjowLCJ0ZW5hbnRfY2VudGVyOmxvZyI6MCwidGVuYW50X2NlbnRlcjpyYmFjIjowLCJ0ZW5hbnRfY2VudGVyOnNlY3JldHMiOjAsInRlbmFudF9jZW50ZXIiOjAsIndvcmtzcGFjZTphZGRvbiI6MTUsIndvcmtzcGFjZTphcGkiOjE1LCJ3b3Jrc3BhY2U6Y29udGVudCI6MTUsIndvcmtzcGFjZTpkYXRhYmFzZSI6MTUsIndvcmtzcGFjZTpkYXRhc291cmNlOmxpdmUiOjE1LCJ3b3Jrc3BhY2U6ZmlsZSI6MTUsIndvcmtzcGFjZTpmdW5jdGlvbiI6MTUsIndvcmtzcGFjZTpsb2ciOjE1LCJ3b3Jrc3BhY2U6bWlkZGxld2FyZSI6MTUsIndvcmtzcGFjZTpyZXF1ZXN0aGlzdG9yeSI6MTUsIndvcmtzcGFjZTp0YXNrIjoxNSwid29ya3NwYWNlOnRvb2wiOjE1fX19LCJpYXQiOjE3NDk0MTI4NTIsIm5iZiI6MTc0OTQxMjg1MiwiYXVkIjoieGFubzptZXRhIn0.UAFXi42IsfphRH_8QBNdKzFN6MbvJ6qyFwVOyC0B2lrTyLWZhdhFt7lQnUVvP3CX0Z_ajJKO8oRV4lf-rv3gQdLxDkP6gaoTHjlfvHwT_8L7NbWOHLAk8LUFhgtHAsjsMEp-zBi5q-ISBmaF2KfpAvzQ6Z69cFLzSevS4TOaVwESiIWTG04xqfBwts2_JAQI4STOb_-Xu3hk-gtdQybDyGns48LR4kXy1U9eRzVXYAgarQ4odZ7Zus3PgZfFIvTirTrmq6XGSOWmeXRx877lZAQslNffpvC9wgTOKoucVtFjzyLLd0brb7TKT0KnFc7nTATQls4jGfevbYyZKvGyb5BmWGuwLLAlu-lmMP8UZsKunykPj-WIH_hl73vLzN2ZqjjixHvTtqu3MaP3iDeTpt-cgw6r_LFjB9BLOdQMnttrHt0sGRYbmZBMg_f0L_qeQwTYUcCRktSag7aAUuEoA_R7vRYhz9FO-KP2yhsUs1pJQQcBNnP4FBvoOU9EKZbUyZ8mFju7t2T3at0ZTaWZPN_xkF8QJRoCveC0I-F8reZxVW8VTENlb2WVMWgFoJ2IQ2KC6CTH6qOgkgJDZ5S-s_fHhYOJs8mcSbeZ0DG0AKuTJSIqT07IwIn_XLQakjHJEiQP0paTE6CfzHtFRumvBTcRKMKY0JfRrhp63l4yUNE';

export class BaseApiService {
  // Get auth token from localStorage or use API token
  protected getAuthToken(): string {
    const userToken = localStorage.getItem('xanoAuthToken');
    return userToken || API_TOKEN;
  }

  // Generic request method
  protected async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    baseUrl: string = EVENTS_BASE_URL
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`Making API request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        
        // If unauthorized, clear stored token
        if (response.status === 401) {
          localStorage.removeItem('xanoAuthToken');
          localStorage.removeItem('user');
        }
        
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  }
}
