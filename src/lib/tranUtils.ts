// lib/transcriptionUtils.ts
import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  getDoc,
  doc,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

// Interface for transcription data
export interface TranscriptionEntry {
  id?: string;
  from: string;
  message: string;
  timestamp?: any;
  metadata?: {
    audioFileName?: string;
    audioFileType?: string;
    audioFileSize?: number;
  };
}

/**
 * Get all transcriptions, sorted by timestamp (newest first)
 */
export async function getAllTranscriptions(
  limitCount: number = 50,
): Promise<TranscriptionEntry[]> {
  try {
    const transcriptionsRef = collection(db, "transcriptions");
    const q = query(
      transcriptionsRef,
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );

    const querySnapshot = await getDocs(q);
    const transcriptions: TranscriptionEntry[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as Omit<TranscriptionEntry, "id">;
      transcriptions.push({
        id: doc.id,
        ...data,
      });
    });

    return transcriptions;
  } catch (error) {
    console.error("Error fetching transcriptions:", error);
    throw error;
  }
}

/**
 * Get a single transcription by ID
 */
export async function getTranscriptionById(
  id: string,
): Promise<TranscriptionEntry | null> {
  try {
    const docRef = doc(db, "transcriptions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<TranscriptionEntry, "id">;
      return {
        id: docSnap.id,
        ...data,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching transcription:", error);
    throw error;
  }
}

/**
 * Search transcriptions by content
 */
export async function searchTranscriptions(
  searchText: string,
  limitCount: number = 10,
): Promise<TranscriptionEntry[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that searches for exact matches
    // For production use, consider Firebase extensions like Algolia or ElasticSearch

    // Filter where message field contains the search text
    // This is case-sensitive and only works for exact substring matches
    const transcriptionsRef = collection(db, "transcriptions");

    // Get all documents and filter client-side
    // (not efficient for large collections)
    const querySnapshot = await getDocs(transcriptionsRef);
    const transcriptions: TranscriptionEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<TranscriptionEntry, "id">;
      if (data.message.toLowerCase().includes(searchText.toLowerCase())) {
        transcriptions.push({
          id: doc.id,
          ...data,
        });
      }
    });

    // Sort by timestamp (newest first)
    transcriptions.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.seconds - a.timestamp.seconds;
    });

    // Limit results
    return transcriptions.slice(0, limitCount);
  } catch (error) {
    console.error("Error searching transcriptions:", error);
    throw error;
  }
}
