import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
} from "firebase/firestore";

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    content: string; // MDX or HTML
    excerpt: string;
    coverImage: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

const POSTS_COLLECTION = "posts";

export const getPosts = async (): Promise<BlogPost[]> => {
    const q = query(collection(db, POSTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as BlogPost[];
};

export const getPostById = async (id: string): Promise<BlogPost | null> => {
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    } else {
        return null;
    }
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    // Note: In a real app, you should index 'slug' and use a query. 
    // For now, client-side filtering or a simple query is fine given low volume.
    // Better: Query
    const q = query(collection(db, POSTS_COLLECTION)); // Optimization: Add where clause if slug is indexed
    const querySnapshot = await getDocs(q);
    const doc = querySnapshot.docs.find(d => d.data().slug === slug);
    return doc ? { id: doc.id, ...doc.data() } as BlogPost : null;
};


export const createPost = async (post: Omit<BlogPost, "id">) => {
    return await addDoc(collection(db, POSTS_COLLECTION), post);
};

export const updatePost = async (id: string, post: Partial<BlogPost>) => {
    const docRef = doc(db, POSTS_COLLECTION, id);
    return await updateDoc(docRef, post);
};

export const deletePost = async (id: string) => {
    const docRef = doc(db, POSTS_COLLECTION, id);
    return await deleteDoc(docRef);
};
