import React, { useState, useRef } from 'react';
import { Upload, X, FileText, File } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './badge';

interface UploadedDocument {
  type: string;
  url: string;
  publicId?: string;
  fileName: string;
  uploadDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface DocumentUploadProps {
  onDocumentsUpload: (documents: UploadedDocument[]) => void;
  currentDocuments?: UploadedDocument[];
  onDocumentRemove?: (index: number) => void;
  className?: string;
  maxFiles?: number;
}

const documentTypes = [
  { value: 'degree', label: 'Degree Certificate' },
  { value: 'certificate', label: 'Professional Certificate' },
  { value: 'license', label: 'Professional License' },
  { value: 'id', label: 'ID Document' },
  { value: 'other', label: 'Other Verification Document' },
];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onDocumentsUpload,
  currentDocuments = [],
  onDocumentRemove,
  className = '',
  maxFiles = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Please upload a maximum of ${maxFiles} documents.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF, DOC, DOCX, or image files only.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `File "${file.name}" is too large. Please upload files smaller than 10MB.`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (selectedTypes.length !== files.length) {
      toast({
        title: 'Document types required',
        description: 'Please specify the type for each document before uploading.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('documents', file);
        formData.append('documentTypes', selectedTypes[index] || 'other');
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL + '/api' || 'http://localhost:5000/api'}/upload/expert-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        const uploadedDocuments: UploadedDocument[] = result.data.documents.map((doc: any) => ({
          type: doc.type,
          url: doc.url,
          publicId: doc.publicId,
          fileName: doc.fileName,
          uploadDate: new Date(doc.uploadDate),
          status: doc.status,
        }));

        onDocumentsUpload([...currentDocuments, ...uploadedDocuments]);
        setSelectedTypes([]);
        
        toast({
          title: 'Success',
          description: `${files.length} document(s) uploaded successfully.`,
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveDocument = (index: number) => {
    if (onDocumentRemove) {
      onDocumentRemove(index);
    }
  };

  const handleTypeSelection = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Verification Documents
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Upload documents to verify your expertise (PDF, DOC, DOCX, or images)
        </p>
      </div>

      {/* Document type selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select document types to upload:</label>
        <div className="flex flex-wrap gap-2">
          {documentTypes.map((docType) => (
            <Badge
              key={docType.value}
              variant={selectedTypes.includes(docType.value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTypeSelection(docType.value)}
            >
              {docType.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              disabled={isUploading || selectedTypes.length === 0}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {selectedTypes.length === 0 
              ? 'Select document types first, then upload files'
              : `Ready to upload ${selectedTypes.length} document(s)`
            }
          </p>
        </div>
      </div>

      {/* Uploaded documents list */}
      {currentDocuments.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Uploaded Documents:</label>
          <div className="space-y-2">
            {currentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{doc.fileName}</p>
                    <p className="text-xs text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                  </div>
                  <Badge 
                    variant={doc.status === 'approved' ? 'default' : 
                            doc.status === 'rejected' ? 'destructive' : 'secondary'}
                  >
                    {doc.status}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDocument(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};