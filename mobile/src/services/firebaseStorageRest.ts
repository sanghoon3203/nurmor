export type AtlasMediaType = 'PHOTO' | 'VIDEO' | 'AUDIO';

type BuildStorageObjectPathInput = {
  firebaseUid: string;
  originalName?: string | null;
  capturedAt: Date;
};

type UploadFirebaseStorageObjectInput = {
  bucket: string;
  firebaseIdToken: string;
  objectPath: string;
  blob: Blob;
  mimeType: string;
  fetchImpl?: typeof fetch;
};

type UploadFirebaseStorageObjectResult = {
  storageKey: string;
  bucket: string;
  objectPath: string;
};

export function detectMediaType(mimeType: string): AtlasMediaType {
  const normalized = mimeType.toLowerCase();

  if (normalized.startsWith('image/')) {
    return 'PHOTO';
  }
  if (normalized.startsWith('video/')) {
    return 'VIDEO';
  }
  if (normalized.startsWith('audio/')) {
    return 'AUDIO';
  }

  throw new Error(`Unsupported media MIME type: ${mimeType}`);
}

export function inferMimeType(uri: string, explicitMimeType?: string | null): string {
  if (explicitMimeType?.trim()) {
    return explicitMimeType.trim().toLowerCase();
  }

  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.heic')) {
    return 'image/heic';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.mp4') || lower.endsWith('.mov')) {
    return 'video/mp4';
  }
  if (lower.endsWith('.m4a')) {
    return 'audio/m4a';
  }
  if (lower.endsWith('.wav')) {
    return 'audio/wav';
  }

  return 'image/jpeg';
}

export function buildStorageObjectPath({ firebaseUid, originalName, capturedAt }: BuildStorageObjectPathInput): string {
  const safeUid = sanitizeFirebaseUid(firebaseUid);
  const extension = extensionFromName(originalName);
  const baseName = baseNameFrom(originalName);
  const timestamp = capturedAt.toISOString().replace(/[:.]/g, '-');

  return `users/${safeUid}/observations/${timestamp}-${baseName}${extension}`;
}

export function storageKeyForObject(bucket: string, objectPath: string): string {
  return `firebase://${bucket}/${objectPath}`;
}

export async function blobFromUri(uri: string, fetchImpl: typeof fetch = fetch): Promise<Blob> {
  const response = await fetchImpl(uri);
  if (!response.ok) {
    throw new Error(`Unable to read local media: ${response.status}`);
  }
  return response.blob();
}

export async function checksumHex(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let hash = 0x811c9dc5;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
}

export async function arrayBufferFromBlob(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }
      reject(new Error('Unable to read media bytes'));
    };
    reader.onerror = () => reject(new Error('Unable to read media bytes'));
    reader.readAsArrayBuffer(blob);
  });
}

export async function uploadFirebaseStorageObject({
  bucket,
  firebaseIdToken,
  objectPath,
  blob,
  mimeType,
  fetchImpl = fetch,
}: UploadFirebaseStorageObjectInput): Promise<UploadFirebaseStorageObjectResult> {
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;
  const response = await fetchImpl(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Firebase ${firebaseIdToken}`,
      'Content-Type': mimeType,
    },
    body: blob as BodyInit,
  });

  if (!response.ok) {
    throw new Error(await readStorageError(response));
  }

  return {
    storageKey: storageKeyForObject(bucket, objectPath),
    bucket,
    objectPath,
  };
}

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'unknown';
}

function sanitizeFirebaseUid(value: string): string {
  return value.trim().replace(/[/%?#\[\]]+/g, '-') || 'unknown';
}

function baseNameFrom(originalName?: string | null): string {
  if (!originalName?.trim()) {
    return 'capture';
  }

  const withoutExtension = originalName.trim().replace(/\.[^.]+$/, '');
  return sanitizeSegment(withoutExtension) || 'capture';
}

function extensionFromName(originalName?: string | null): string {
  if (!originalName?.includes('.')) {
    return '.jpg';
  }

  const extension = originalName.slice(originalName.lastIndexOf('.')).toLowerCase();
  return extension.replace(/[^.a-z0-9]+/g, '') || '.jpg';
}

async function readStorageError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? `Firebase Storage upload failed: ${response.status}`;
  } catch {
    return `Firebase Storage upload failed: ${response.status}`;
  }
}
