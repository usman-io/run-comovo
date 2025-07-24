
import { BaseApiService, EVENTS_BASE_URL } from './baseApi';
import { usersApi } from './usersService';

// Email configuration
const SENDER_EMAIL = 'doe.john@codefulcrum.com';
const SENDER_NAME = 'RunConnect Team';
const TOKEN_EXPIRATION_HOURS = 24;

class VerificationApiService extends BaseApiService {
  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate verification token and update user in Xano
   */
  async generateVerificationToken(userId: number, email: string): Promise<{ token: string; success: boolean }> {
    console.log('VerificationApiService.generateVerificationToken: Generating token for user:', userId, 'email:', email);
    
    try {
      // Generate a new token
      const token = this.generateToken();
      
      // Update user in Xano with the verification token, set is_active to false, and include email
      await usersApi.updateUser(userId, {
        email: email, // Include email as required by Xano API
        verification_token: token,
        is_active: false
      });
      
      console.log('Generated and stored verification token for user ID:', userId);
      return { token, success: true };
      
    } catch (error) {
      console.error('VerificationApiService.generateVerificationToken error:', error);
      throw error;
    }
  }

  /**
   * Verify user with token by looking up in Xano database
   */
  async verifyUserWithToken(token: string): Promise<{ success: boolean; message: string; user?: any }> {
    console.log('VerificationApiService.verifyUserWithToken: Verifying token:', token);
    
    try {
      // Find user by verification token in Xano
      const user = await usersApi.getUserByVerificationToken(token);
      
      if (!user) {
        return { 
          success: false, 
          message: 'Invalid or expired verification token' 
        };
      }
      
      // Check if user is already verified
      if (user.is_active) {
        return { 
          success: false, 
          message: 'This email has already been verified' 
        };
      }
      
      // Update user to set is_active to true and clear verification token, including email
      await usersApi.updateUser(user.id, {
        email: user.email, // Include email as required by Xano API
        is_active: true,
        verification_token: null
      });
      
      return { 
        success: true, 
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          verified: true
        }
      };
      
    } catch (error) {
      console.error('VerificationApiService.verifyUserWithToken error:', error);
      return { 
        success: false, 
        message: 'An error occurred while verifying your email' 
      };
    }
  }

  /**
   * Send verification email using external service
   */
  async sendVerificationEmail(email: string, userId: number): Promise<{ success: boolean; message: string }> {
    console.log('VerificationApiService.sendVerificationEmail: Sending verification email to:', email, 'for user ID:', userId);
    
    try {
      // Generate the verification token and store it in Xano
      const tokenResponse = await this.generateVerificationToken(userId, email);
      
      if (!tokenResponse.success) {
        throw new Error('Failed to generate verification token');
      }
      
      const verificationToken = tokenResponse.token;
      console.log('Generated verification token:', verificationToken);
      
      // Create verification link
      const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}`;
      
      // Send email via external service
      try {
        const response = await fetch('https://send-emails-beta.vercel.app/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            verificationLink,
            tokenExpirationHours: TOKEN_EXPIRATION_HOURS,
          }),
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Email service error:', errorText);
          throw new Error('Failed to send verification email');
        }
    
        const data = await response.json();
        console.log('Email service response:', data.message);
        return { success: true, message: 'Verification email sent successfully' };
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('VerificationApiService.sendVerificationEmail error:', error);
      throw error;
    }
  }
}

export const verificationApi = new VerificationApiService();
