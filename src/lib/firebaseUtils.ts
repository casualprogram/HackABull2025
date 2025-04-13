// /lib/firebaseUtils.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  WhereFilterOp,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";

// Define response types
interface FirebaseResponse<T> {
  success: boolean;
  data?: T;
  id?: string;
  error?: any;
}

// Upload JSON data to Firestore
export async function uploadData<T extends DocumentData>(
  collectionName: string,
  data: T,
): Promise<FirebaseResponse<null>> {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error uploading data: ", error);
    return { success: false, error };
  }
}

// Get all documents from a collection
export async function getAllData<T = DocumentData>(
  collectionName: string,
): Promise<FirebaseResponse<T[]>> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error getting data: ", error);
    return { success: false, error };
  }
}

// Get a specific document by ID
export async function getDataById<T = DocumentData>(
  collectionName: string,
  docId: string,
): Promise<FirebaseResponse<T>> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() } as T,
      };
    } else {
      return { success: false, error: "Document not found" };
    }
  } catch (error) {
    console.error("Error getting document: ", error);
    return { success: false, error };
  }
}

// Query data based on a field
export async function queryData<T = DocumentData>(
  collectionName: string,
  field: string,
  operator: WhereFilterOp,
  value: any,
): Promise<FirebaseResponse<T[]>> {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator, value),
    );
    const querySnapshot = await getDocs(q);
    const data: T[] = [];

    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error querying data: ", error);
    return { success: false, error };
  }
}

// Update a document
export async function updateData<T extends DocumentData>(
  collectionName: string,
  docId: string,
  updates: Partial<T>,
): Promise<FirebaseResponse<null>> {
  try {
    const docRef = doc(db, collectionName, docId);
    // Type assertion to fix the compatibility issue
    await updateDoc(docRef, updates as DocumentData);
    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    return { success: false, error };
  }
}

// Delete a document
export async function deleteData(
  collectionName: string,
  docId: string,
): Promise<FirebaseResponse<null>> {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return { success: false, error };
  }
}
