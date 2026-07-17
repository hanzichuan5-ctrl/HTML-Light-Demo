export type CollectedEgg = {
  id: string;
  discoveredAt: string;
};

export type DetectiveProgress = {
  collected: CollectedEgg[];
  completedRounds: number;
  totalDiscoveries: number;
  soundEnabled: boolean;
};

export const EMPTY_PROGRESS: DetectiveProgress = {
  collected: [],
  completedRounds: 0,
  totalDiscoveries: 0,
  soundEnabled: true,
};

const DATABASE_NAME = "hzc-detective-notebook";
const STORE_NAME = "state";
const STATE_KEY = "progress";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadDetectiveProgress() {
  if (typeof indexedDB === "undefined") return EMPTY_PROGRESS;
  const database = await openDatabase();
  return new Promise<DetectiveProgress>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(STATE_KEY);
    request.onsuccess = () => {
      database.close();
      resolve({ ...EMPTY_PROGRESS, ...(request.result as Partial<DetectiveProgress> | undefined) });
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function saveDetectiveProgress(progress: DetectiveProgress) {
  if (typeof indexedDB === "undefined") return;
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(progress, STATE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
