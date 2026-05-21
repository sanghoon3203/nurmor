import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildStorageObjectPath, checksumHex, detectMediaType, storageKeyForObject } from './firebaseStorageRest';

test('buildStorageObjectPath creates a stable per-user observation path', () => {
  const path = buildStorageObjectPath({
    firebaseUid: 'userABC123',
    originalName: 'Back Yard.JPG',
    capturedAt: new Date('2026-05-21T02:00:00.000Z'),
  });

  assert.equal(path, 'users/userABC123/observations/2026-05-21T02-00-00-000Z-back-yard.jpg');
});

test('detectMediaType maps supported MIME families to Atlas media types', () => {
  assert.equal(detectMediaType('image/jpeg'), 'PHOTO');
  assert.equal(detectMediaType('video/mp4'), 'VIDEO');
  assert.equal(detectMediaType('audio/m4a'), 'AUDIO');
  assert.throws(() => detectMediaType('application/pdf'), /Unsupported media MIME type/);
});

test('checksumHex is stable and changes when bytes change', async () => {
  const left = await checksumHex(new Uint8Array([1, 2, 3, 4]).buffer);
  const right = await checksumHex(new Uint8Array([1, 2, 3, 5]).buffer);

  assert.match(left, /^[a-f0-9]{8}$/);
  assert.notEqual(left, right);
});

test('storageKeyForObject stores the bucket and object path without a public token', () => {
  assert.equal(
    storageKeyForObject('atlas-demo.firebasestorage.app', 'users/u1/observations/a.jpg'),
    'firebase://atlas-demo.firebasestorage.app/users/u1/observations/a.jpg'
  );
});
