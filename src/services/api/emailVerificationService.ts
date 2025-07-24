
// Email configuration - Update these values as needed
const SENDER_EMAIL = 'doe.john@codefulcrum.com';
const SENDER_NAME = 'RunConnect Team';
const SENDGRID_API_KEY = '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';
const TOKEN_EXPIRATION_HOURS = 24; // Token expires in 24 hours

import { BaseApiService } from './baseApi';

// In-memory storage for tokens (replace with database in production)
interface TokenData {
  email: string;
  expiresAt: Date;
  verified: boolean;
}

const tokenStore: Record<string, TokenData> = {};

class EmailVerificationApiService extends BaseApiService {
  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Create and store a new verification token for the given email
   */
  private createVerificationToken(email: string): string {
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    // Generate a new token
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);
    
    // Store the token
    tokenStore[token] = {
      email,
      expiresAt,
      verified: false
    };
    
    return token;
  }

  /**
   * Verify a token and mark it as used
   */
  private verifyToken(token: string): { valid: boolean; email?: string; message: string } {
    const tokenData = tokenStore[token];
    
    if (!tokenData) {
      return { valid: false, message: 'Invalid or expired token' };
    }
    
    if (tokenData.expiresAt < new Date()) {
      delete tokenStore[token];
      return { valid: false, message: 'Token has expired' };
    }
    
    if (tokenData.verified) {
      return { valid: false, message: 'Token has already been used' };
    }
    
    // Mark token as verified
    tokenData.verified = true;
    
    return { 
      valid: true, 
      email: tokenData.email,
      message: 'Email verified successfully' 
    };
  }

  /**
   * Remove expired tokens from the store
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    Object.keys(tokenStore).forEach(token => {
      if (tokenStore[token].expiresAt < now) {
        delete tokenStore[token];
      }
    });
  }

  /**
   * Send verification email with a token
   */
  async sendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    console.log('EmailVerificationApiService.sendVerificationEmail: Sending verification email to:', email);
    
    try {
      // Generate and store a new verification token
      const activationToken = this.createVerificationToken(email);
      console.log('Generated activation token:', activationToken);
      
      // Create verification link
      const verificationLink = `${window.location.origin}/verify-email?token=${activationToken}`;
      
      // Send email via SendGrid API directly
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email }]
            }
          ],
          from: {
            email: SENDER_EMAIL,
            name: SENDER_NAME
          },
          subject: 'Verify Your Email - RunConnect',
          content: [
            {
              type: 'text/html',
              value: `
                <h2>Welcome to RunConnect!</h2>
                <p>Thank you for signing up. Please click the link below to verify your email address:</p>
                <p><a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                <p>Or copy and paste this link in your browser:</p>
                <p>${verificationLink}</p>
                <p>This link will expire in ${TOKEN_EXPIRATION_HOURS} hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
              `
            }
          ]
        })
      });

      if (!sendGridResponse.ok) {
        const errorText = await sendGridResponse.text();
        console.error('SendGrid API error:', errorText);
        throw new Error('Failed to send verification email');
      }

      console.log('Verification email sent successfully via SendGrid');
      return { success: true, message: 'Verification email sent successfully' };
      
    } catch (error) {
      console.error('EmailVerificationApiService.sendVerificationEmail error:', error);
      throw error;
    }
  }

  /**
   * Verify an email using the provided token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    console.log('EmailVerificationApiService.verifyEmail: Verifying token:', token);
    
    try {
      const result = this.verifyToken(token);
      
      if (!result.valid) {
        console.log('Email verification failed:', result.message);
        return { 
          success: false, 
          message: result.message 
        };
      }
      
      console.log('Email verified successfully for:', result.email);
      return { 
        success: true, 
        message: result.message 
      };
      
    } catch (error) {
      console.error('EmailVerificationApiService.verifyEmail error:', error);
      return { 
        success: false, 
        message: 'An error occurred while verifying your email' 
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    console.log('EmailVerificationApiService.resendVerificationEmail: Resending verification email to:', email);
    return this.sendVerificationEmail(email);
  }
}

export const emailVerificationApi = new EmailVerificationApiService();
