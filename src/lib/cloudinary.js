import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Check whether Cloudinary configuration has all required variables
 */
export function isCloudinaryConfigured() {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  return Boolean(
    cloudName &&
      cloudName !== 'your_cloud_name' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a file buffer directly to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer
 * @param {Object} options - { folder, public_id, resource_type, tags }
 * @returns {Promise<Object>} Cloudinary upload result
 */
export async function uploadStream(fileBuffer, options = {}) {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error(
      'Cloudinary Cloud Name is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local'
    );
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'task_manager',
      resource_type: 'auto',
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });
}

/**
 * Delete a file from Cloudinary by public ID
 * @param {string} publicId
 * @param {string} resourceType - 'image' | 'raw' | 'video'
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
    throw error;
  }
}

export default cloudinary;
