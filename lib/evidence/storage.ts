/**
 * Evidence file storage using IndexedDB. Stores blobs locally (no server upload).
 * Each evidence item has a SHA-256 hash for integrity verification.
 */

export interface StoredEvidence {
  id: string;            // unique id (uuid)
  caseId: string;        // case this belongs to (or 'pending' for in-progress wizard)
  category: string;      // e.g. 'scene_overview', 'collision_point'
  type: 'photo' | 'video';
  filename: string;
  mimeType: string;
  size: number;
  hash: string;          // SHA-256 hex
  blob: Blob;
  capturedAt: string;    // ISO timestamp
}

const DB_NAME = 'accident_expert_evidence';
const DB_VERSION = 1;
const STORE_NAME = 'evidence';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('caseId', 'caseId', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function computeSha256(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function saveEvidence(input: {
  caseId: string;
  category: string;
  file: File;
}): Promise<StoredEvidence> {
  const hash = await computeSha256(input.file);
  const record: StoredEvidence = {
    id: generateId(),
    caseId: input.caseId,
    category: input.category,
    type: input.file.type.startsWith('video') ? 'video' : 'photo',
    filename: input.file.name,
    mimeType: input.file.type,
    size: input.file.size,
    hash,
    blob: input.file,
    capturedAt: new Date().toISOString(),
  };

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).add(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function listEvidenceByCase(caseId: string): Promise<StoredEvidence[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const idx = tx.objectStore(STORE_NAME).index('caseId');
    const req = idx.getAll(caseId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteEvidence(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function reassignEvidenceCase(fromCaseId: string, toCaseId: string): Promise<void> {
  const items = await listEvidenceByCase(fromCaseId);
  const db = await openDb();
  await Promise.all(
    items.map(item => new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).put({ ...item, caseId: toCaseId });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }))
  );
}
