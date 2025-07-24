
import { BaseApiService, EVENTS_BASE_URL } from './baseApi';
import { XanoBusinessPost, XanoBusinessPostImage } from './types';

class BusinessPostsApiService extends BaseApiService {
  /**
   * Get all posts for a business
   * @param businessId The ID of the business
   */
  async getBusinessPosts(businessId: number): Promise<XanoBusinessPost[]> {
    console.log('BusinessPostsApiService.getBusinessPosts: Fetching posts for business ID:', businessId);
    try {
      // First get all posts
      const response = await this.request<XanoBusinessPost[]>('/business_posts', {
        method: 'GET',
      });
      
      // Filter posts by businessId
      const filteredPosts = response.filter(post => post.business_id === businessId);
      console.log('BusinessPostsApiService.getBusinessPosts: Filtered posts:', filteredPosts);
      
      // Get images for each filtered post in parallel
      const postsWithImages = await Promise.all(
        filteredPosts.map(async (post) => {
          try {
            const images = await this.getPostImages(post.id);
            console.log('BusinessPostsApiService.getBusinessPosts: Fetched images for post:', post.id, images);
            return { ...post, images };
          } catch (error) {
            console.error(`Error fetching images for post ${post.id}:`, error);
            return { ...post, images: [] };
          }
        })
      );
      
      console.log('BusinessPostsApiService.getBusinessPosts: Response with images:', postsWithImages);
      return postsWithImages;
    } catch (error) {
      console.error('BusinessPostsApiService.getBusinessPosts: Error fetching posts:', error);
      return [];
    }
  }
  
  /**
   * Get all images for a specific business post
   * @param postId The ID of the business post
   */
  async getPostImages(postId: number): Promise<XanoBusinessPostImage[]> {
    try {
      // First get all images
      const response = await this.request<any[]>('/images', {
        method: 'GET',
      });
      
      // Filter images by postId
      const filteredImages = response.filter(image => image.business_posts_id === postId);
      console.log('BusinessPostsApiService.getPostImages: Filtered images for post', postId, ':', filteredImages);
      
      // Map the filtered response to our expected format
      const mappedImages: XanoBusinessPostImage[] = filteredImages.map(item => ({
        id: item.id,
        created_at: item.created_at,
        business_posts_id: item.business_posts_id,
        image: item.image,
        // Extract URL from the nested image object for backward compatibility
        url: item.image?.url || '',
        name: item.image?.name || '',
        alt_text: item.image?.name || '',
      }));
      
      console.log(`Fetched ${mappedImages.length} images for post ${postId}:`, mappedImages);
      return mappedImages;
    } catch (error) {
      console.error(`Error fetching images for post ${postId}:`, error);
      return [];
    }
  }

  /**
   * Upload images for a business post
   * @param businessPostId The ID of the business post
   * @param images Array of image files to upload
   */
  async uploadPostImages(businessPostId: number, images: File[]): Promise<XanoBusinessPostImage[]> {
    if (!images.length) return [];
    
    const uploadPromises = images.map(async (image) => {
      try {
        // Create a base64 string from the image file
        const base64Image = await this.fileToBase64(image);
        
        // Prepare the request body according to API requirements
        const requestBody = {
          business_posts_id: businessPostId,
          // Include any other required fields for the image
          // For example, if the API expects the image data in a specific field:
          file: base64Image,
          // or if it expects a file URL (you'll need to handle the actual file upload first)
          // file_url: await this.uploadImageFile(image)
        };
        
        // Send the request to create the image record
        const imageRecord = await this.request<XanoBusinessPostImage>('/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log('Image record created successfully:', imageRecord);
        return imageRecord;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error; // Re-throw to be caught by the caller
      }
    });
    
    return Promise.all(uploadPromises);
  }
  
  /**
   * Convert a File object to a base64 string
   * @param file The file to convert
   * @returns A promise that resolves to a base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  
  /**
   * Upload an image file to the server (if required)
   * @param file The file to upload
   * @returns A promise that resolves to the file URL
   */
  private async uploadImageFile(file: File): Promise<string> {
    // If your API requires a separate file upload endpoint,
    // implement that logic here and return the file URL
    throw new Error('File upload not implemented. Please implement the file upload logic.');
  }

  /**
   * Create a new business post with optional images
   * @param postData The post data (without ID, created_at, or images)
   * @param images Optional array of image files to upload
   */
  async createBusinessPost(
    postData: Omit<XanoBusinessPost, 'id' | 'created_at' | 'business_name' | 'images'>,
    images: File[] = []
  ): Promise<XanoBusinessPost> {
    console.log('BusinessPostsApiService.createBusinessPost: Creating post', postData);
    
    // First create the post
    const response = await this.request<XanoBusinessPost>('/business_posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    console.log('BusinessPostsApiService.createBusinessPost: Post created, uploading images', { 
      postId: response.id, 
      imageCount: images.length 
    });
    
    // Then upload images if any
    if (images.length > 0) {
      try {
        const uploadedImages = await this.uploadPostImages(response.id, images);
        // Return the post with the uploaded images
        return { ...response, images: uploadedImages };
      } catch (error) {
        console.error('Error uploading post images:', error);
        // Return the post even if image upload fails, but log the error
        return response;
      }
    }
    
    return response;
  }

  /**
   * Delete post images by their IDs
   * @param imageIds Array of image IDs to delete
   */
  async deletePostImages(imageIds: number[]): Promise<void> {
    if (!imageIds.length) return;
    
    await Promise.all(
      imageIds.map(id => 
        this.request(`/images/${id}`, {
          method: 'DELETE',
        })
      )
    );
  }

  /**
   * Update a business post and handle image uploads/deletions
   * @param postId The ID of the post to update
   * @param postData The updated post data
   * @param images Object containing new files to upload and IDs of images to delete
   */
  async updateBusinessPost(
    postId: number, 
    postData: Partial<Omit<XanoBusinessPost, 'id' | 'created_at' | 'business_name' | 'images'>>,
    images: { files: File[]; deletedImageIds?: number[] } = { files: [] }
  ): Promise<XanoBusinessPost> {
    console.log('BusinessPostsApiService.updateBusinessPost: Updating post ID:', postId, { 
      postData, 
      newImages: images.files.length,
      deletedImages: images.deletedImageIds?.length || 0
    });
    
    // First update the post data
    const response = await this.request<XanoBusinessPost>(`/business_posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    // Handle image operations
    const imageOperations: Promise<any>[] = [];
    
    // Upload new images
    if (images.files.length > 0) {
      imageOperations.push(
        this.uploadPostImages(postId, images.files)
          .then(uploadedImages => {
            // Add new images to the response
            if (response.images) {
              response.images.push(...uploadedImages);
            } else {
              response.images = uploadedImages;
            }
          })
      );
    }
    
    // Delete removed images
    if (images.deletedImageIds?.length) {
      imageOperations.push(this.deletePostImages(images.deletedImageIds));
    }
    
    // Wait for all image operations to complete
    if (imageOperations.length > 0) {
      try {
        await Promise.all(imageOperations);
      } catch (error) {
        console.error('Error updating post images:', error);
        // Continue even if image operations fail, but log the error
      }
    }
    
    console.log('BusinessPostsApiService.updateBusinessPost: Update completed', response);
    return response;
  }

  async deleteBusinessPost(postId: number): Promise<void> {
    console.log('BusinessPostsApiService.deleteBusinessPost: Deleting post ID:', postId);
    await this.request<void>(`/business_posts/${postId}`, {
      method: 'DELETE',
    });
    console.log('BusinessPostsApiService.deleteBusinessPost: Post deleted successfully');
  }
}

export const businessPostsApi = new BusinessPostsApiService();
