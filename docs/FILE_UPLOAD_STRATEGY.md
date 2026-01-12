# 📁 FILE UPLOAD STRATEGY

## Tổng quan

Hệ thống file upload cho Golden Energy ERP với support cho multiple storage providers và intelligent file handling.

---

## 🎯 YÊU CẦU

### File Types Support
- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Documents**: PDF, DOC, DOCX, XLS, XLSX (max 20MB)
- **Archives**: ZIP, RAR (max 50MB)
- **Videos**: MP4, WebM (max 100MB)

### Use Cases
1. **Chat attachments** - Files in messages
2. **Task attachments** - Documents attached to tasks
3. **Employee documents** - Contracts, certificates
4. **Product images** - Product catalog photos
5. **Invoice PDFs** - Generated invoices
6. **Avatar uploads** - User profile pictures

---

## 🏗️ KIẾN TRÚC

### Storage Providers

#### 1. **Vercel Blob Storage** (Recommended for production)
```typescript
// lib/upload/vercel-blob.ts
import { put } from '@vercel/blob';

export async function uploadToVercel(
  file: File,
  options: {
    folder: string;
    access?: 'public' | 'private';
  }
) {
  const blob = await put(`${options.folder}/${file.name}`, file, {
    access: options.access || 'public',
    addRandomSuffix: true,
  });
  
  return {
    url: blob.url,
    pathname: blob.pathname,
    size: blob.size,
  };
}
```

**Pros:**
- ✅ Tích hợp seamless với Vercel
- ✅ CDN tự động
- ✅ Không cần config storage bucket
- ✅ Pay-as-you-go pricing

**Cons:**
- ❌ Phụ thuộc vào Vercel ecosystem
- ❌ Chi phí cao cho bandwidth lớn

#### 2. **Supabase Storage** (Alternative)
```typescript
// lib/upload/supabase-storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadToSupabase(
  file: File,
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return {
    url: publicUrl,
    path: data.path,
  };
}
```

**Pros:**
- ✅ Free tier generous (1GB storage)
- ✅ Built-in image transformations
- ✅ Policy-based access control

#### 3. **Local Filesystem** (Development only)
```typescript
// lib/upload/local.ts
import fs from 'fs/promises';
import path from 'path';

export async function uploadLocal(
  file: File,
  uploadDir: string = 'public/uploads'
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(process.cwd(), uploadDir, filename);
  
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, buffer);
  
  return {
    url: `/uploads/${filename}`,
    filepath,
  };
}
```

---

## 📤 UPLOAD API

### Endpoint Structure

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge'; // Use edge runtime for better performance

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const access = formData.get('access') as 'public' | 'private' || 'public';
    
    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 10MB' },
        { status: 400 }
      );
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }
    
    // Upload to Vercel Blob
    const blob = await put(`${folder}/${file.name}`, file, {
      access,
      addRandomSuffix: true,
    });
    
    // Save to database
    await prisma.attachment.create({
      data: {
        name: file.name,
        url: blob.url,
        mimeType: file.type,
        size: file.size,
        uploadedById: 'current-user-id', // Get from session
      },
    });
    
    return NextResponse.json({
      success: true,
      file: {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: blob.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### Multiple Files Upload

```typescript
// app/api/upload/multiple/route.ts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }
    
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files per request' },
        { status: 400 }
      );
    }
    
    const results = await Promise.all(
      files.map(async (file) => {
        // Validate and upload each file
        const blob = await put(`uploads/${file.name}`, file, {
          access: 'public',
          addRandomSuffix: true,
        });
        
        return {
          name: file.name,
          url: blob.url,
          size: blob.size,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      files: results,
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 FRONTEND COMPONENTS

### Upload Component

```typescript
// components/FileUpload.tsx
'use client';

import { useState } from 'react';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onUpload: (files: { url: string; name: string }[]) => void;
  maxFiles?: number;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({ 
  onUpload, 
  maxFiles = 5,
  accept = 'image/*,application/pdf',
  maxSize = 10 * 1024 * 1024 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    // Validate file sizes
    const oversized = files.filter(f => f.size > maxSize);
    if (oversized.length > 0) {
      alert(`Files too large: ${oversized.map(f => f.name).join(', ')}`);
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onUpload(data.files);
      
      // Generate previews for images
      const imagePreviews = await Promise.all(
        files.filter(f => f.type.startsWith('image/')).map(f => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(f);
          });
        })
      );
      setPreviews(imagePreviews);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D4AF37] transition-colors cursor-pointer">
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each
          </p>
        </label>
      </div>
      
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#D4AF37] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center mt-2">Uploading... {progress}%</p>
        </div>
      )}
      
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {previews.map((preview, i) => (
            <div key={i} className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-24 object-cover rounded"
              />
              <button
                onClick={() => setPreviews(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔒 SECURITY

### File Validation
```typescript
// lib/upload/validation.ts
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];
  
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum ${MAX_SIZE / 1024 / 1024}MB`,
    };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed',
    };
  }
  
  return { valid: true };
}
```

### Virus Scanning (Optional)
- Integrate with ClamAV or cloud virus scanning service
- Scan files before storing
- Quarantine suspicious files

### Access Control
```typescript
// Middleware to check file access
export async function checkFileAccess(
  userId: string,
  fileId: string
): Promise<boolean> {
  const file = await prisma.attachment.findUnique({
    where: { id: fileId },
    include: {
      task: {
        include: {
          assignees: true,
        },
      },
    },
  });
  
  if (!file) return false;
  
  // Check if user has access to the related entity
  if (file.taskId) {
    return file.task.assignees.some(a => a.userId === userId);
  }
  
  return false;
}
```

---

## 📊 MONITORING

### Metrics to Track
- Upload success rate
- Average upload time
- Storage usage by user/workspace
- File type distribution
- Failed uploads with reasons

### Logging
```typescript
// Log upload events
await prisma.auditLog.create({
  data: {
    workspaceId: 'workspace-id',
    userId: 'user-id',
    action: 'FILE_UPLOAD',
    entityType: 'Attachment',
    entityId: attachment.id,
    newValues: {
      filename: file.name,
      size: file.size,
      type: file.type,
    },
  },
});
```

---

## 💰 COST OPTIMIZATION

### Strategies
1. **Compress images** before upload (client-side)
2. **Lazy load** thumbnails
3. **Cache CDN** responses
4. **Delete unused files** after 30 days
5. **Use WebP format** for images
6. **Progressive image loading**

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Basic Upload (Week 1)
- [x] Setup Vercel Blob integration
- [ ] Create upload API endpoint
- [ ] Build FileUpload component
- [ ] Add to chat messages

### Phase 2: Advanced Features (Week 2)
- [ ] Multiple file uploads
- [ ] Image compression
- [ ] Thumbnails generation
- [ ] Progress tracking

### Phase 3: Security & Optimization (Week 3)
- [ ] File validation
- [ ] Virus scanning
- [ ] Access control
- [ ] CDN optimization

---

**Recommended Provider:** Vercel Blob Storage
**Backup Provider:** Supabase Storage
**Development:** Local filesystem
