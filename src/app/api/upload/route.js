import { NextResponse } from 'next/server';
import { uploadStream, deleteFromCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

/**
 * POST /api/upload
 * Upload image or document to Cloudinary
 */
export async function POST(request) {
  try {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      return NextResponse.json(
        {
          error:
            'Cloudinary Cloud Name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'task_manager';

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadStream(buffer, {
      folder,
      resource_type: 'auto',
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      name: file.name || result.original_filename,
      size: result.bytes,
      format: result.format,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to upload image to Cloudinary',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete an asset from Cloudinary
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = searchParams.get('resourceType') || 'image';

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteFromCloudinary(publicId, resourceType);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
