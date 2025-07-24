import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, X, Image as ImageIcon, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import { businessPostsApi } from '@/services/api/businessPostsService';
import { XanoBusinessPost } from '@/services/api/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessFeedProps {
  businessId: string;
}

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
}

const BusinessFeed: React.FC<BusinessFeedProps> = ({ businessId }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<XanoBusinessPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is the owner of this business profile
  const isBusinessOwner = user?.role === 'business' && user?.id === businessId;

  useEffect(() => {
    return () => {
      // Clean up object URLs to avoid memory leaks
      imagePreviews.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [imagePreviews]);

  useEffect(() => {
    fetchPosts();
  }, [businessId]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const fetchedPosts = await businessPostsApi.getBusinessPosts(Number(businessId));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImagePreviews = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreviews(prev => [...prev, ...newImagePreviews]);
  };

  const removeImage = (id: string) => {
    setImagePreviews(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleCreatePost = async () => {
    // Authorization check - only business owner can create posts
    if (!isBusinessOwner) {
      toast.error('You are not authorized to create posts for this business');
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsCreating(true);
    try {
      const createdPost = await businessPostsApi.createBusinessPost(
        {
          business_id: Number(businessId),
          title: newPost.title,
          content: newPost.content,
        },
        imagePreviews.map(img => img.file)
      );
      
      setPosts([createdPost, ...posts]);
      setNewPost({ title: '', content: '' });
      setImagePreviews([]);
      setShowCreateForm(false);
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    // Authorization check - only business owner can delete posts
    if (!isBusinessOwner) {
      toast.error('You are not authorized to delete posts for this business');
      return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeletingPostId(postId);
    try {
      await businessPostsApi.deleteBusinessPost(postId);
      
      // Remove the post from the local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Create Post Section - Only show if user is the business owner */}
      {isBusinessOwner && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Share an Update
              </CardTitle>
              {!showCreateForm && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              )}
            </div>
          </CardHeader>
          
          {showCreateForm && (
            <CardContent className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px]"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              />
              
              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {imagePreviews.map((image) => (
                    <div key={image.id} className="relative group">
                      <img 
                        src={image.preview} 
                        alt="Preview" 
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Add Images
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setImagePreviews([]);
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : 'Post'}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading posts...</p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">
                {isBusinessOwner 
                  ? "Share your first update with the community!"
                  : "This business hasn't shared any updates yet."}
              </p>
              {!showCreateForm && isBusinessOwner && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <CardTitle className="text-lg">{post.title}</CardTitle>
                   <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1 text-sm text-gray-500">
                       <Calendar className="w-4 h-4" />
                       {formatDate(post.created_at)}
                     </div>
                     {/* Delete button - Only show if user is the business owner */}
                     {isBusinessOwner && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleDeletePost(post.id)}
                         disabled={deletingPostId === post.id}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         {deletingPostId === post.id ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                         ) : (
                           <Trash2 className="w-4 h-4" />
                         )}
                       </Button>
                     )}
                   </div>
                 </div>
               </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {post.images.map((image) => {
                      // Use the nested image.url structure from the API response
                      const imageSrc = image.image?.url || image.url;
                      
                      if (!imageSrc) {
                        console.warn('No valid image source found for image:', image);
                        return null;
                      }
                      
                      return (
                        <div key={image.id} className="relative group rounded-md overflow-hidden">
                          <img 
                            src={imageSrc}
                            alt={image.alt_text || image.image?.name || 'Post image'} 
                            className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              // Fallback in case the image fails to load
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          {(image.alt_text || image.image?.name) && (
                            <p className="mt-1 text-sm text-gray-500 truncate">
                              {image.alt_text || image.image?.name}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BusinessFeed;
