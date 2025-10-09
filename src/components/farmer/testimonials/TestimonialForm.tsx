import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/services/api';

const testimonialSchema = z.object({
  content: z.string().min(10, { message: 'Testimonial must be at least 10 characters.' }).max(1000, { message: 'Testimonial must not exceed 1000 characters.' }),
  tags: z.string().optional(),
});

interface TestimonialFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  existingTestimonial?: {
    _id: string;
    content: string;
    images?: string[];
    tags?: string[];
  };
}

const TestimonialForm = ({ onSuccess, onCancel, existingTestimonial }: TestimonialFormProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(existingTestimonial?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      content: existingTestimonial?.content || '',
      tags: existingTestimonial?.tags?.join(', ') || '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length + imagePreviews.length > 5) {
      toast({
        title: 'Too Many Images',
        description: 'You can only upload up to 5 images',
        variant: 'destructive'
      });
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Upload images first if any
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach(image => {
          imageFormData.append('images', image);
        });

        const uploadResponse = await apiCall<{ success: boolean; data: { documents: string[] } }>(
          'POST', 
          '/upload/registration-documents', 
          imageFormData
        );

        if (uploadResponse.success && uploadResponse.data.documents) {
          uploadedImageUrls = uploadResponse.data.documents;
        }
      }

      // Combine existing images (if editing) with newly uploaded ones
      const allImages = [...(existingTestimonial?.images || []), ...uploadedImageUrls];

      // Parse tags
      const tagsArray = values.tags 
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      // Create or update testimonial
      const testimonialData = {
        content: values.content,
        images: allImages,
        tags: tagsArray,
      };

      if (existingTestimonial) {
        await apiCall('PUT', `/testimonials/${existingTestimonial._id}`, testimonialData);
        toast({
          title: 'Testimonial Updated',
          description: 'Your testimonial has been updated successfully',
        });
      } else {
        await apiCall('POST', '/testimonials', testimonialData);
        toast({
          title: 'Testimonial Created',
          description: 'Your testimonial has been created successfully',
        });
      }

      form.reset();
      setImages([]);
      setImagePreviews([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: apiError?.response?.data?.message || `Failed to ${existingTestimonial ? 'update' : 'create'} testimonial`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingTestimonial ? 'Edit Testimonial' : 'Share Your Experience'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Testimonial</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your farming experience, challenges, or success stories..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., harvest, success, challenge (separate with commas)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to help others find your testimonial
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Images (Optional, max 5)</FormLabel>
              <div className="mt-2">
                <label
                  htmlFor="testimonial-images"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-farmer-primary transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    id="testimonial-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={imagePreviews.length >= 5}
                  />
                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingTestimonial ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {existingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TestimonialForm;
