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
    where,
    Timestamp,
} from "firebase/firestore";

export interface FaqItem {
    question: string;
    answer: string;
}

export interface ContentImage {
    url: string;
    caption: string;
}

export interface RatingCriteria {
    label: string;
    score: number; // 1-5
}

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage: string;
    category: string;
    articleType: "educational" | "sales";
    status: "draft" | "published";
    author: string;
    // SEO Fields
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    // Schema
    schemaType?: "Article" | "Product" | "Review" | "BlogPosting";
    // Product-specific (for sales articles)
    productName?: string;
    productPrice?: string;
    productRating?: number;
    affiliateLink?: string;
    // Structured Content Blocks
    pros?: string[];
    cons?: string[];
    faqItems?: FaqItem[];
    contentImages?: ContentImage[];
    ratingCriteria?: RatingCriteria[];
    verdict?: string;
    // Timestamps
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
}

export interface Category {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    postCount?: number;
    createdAt: Timestamp;
}

const POSTS_COLLECTION = "posts";
const CATEGORIES_COLLECTION = "categories";

// ==================== POSTS ====================

export const getPosts = async (): Promise<BlogPost[]> => {
    try {
        const q = query(collection(db, POSTS_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as BlogPost[];
    } catch (error) {
        console.warn("Error fetching posts from Firestore (likely permission issue or offline):", error);
        return [];
    }
};

export const getPublishedPosts = async (): Promise<BlogPost[]> => {
    try {
        const q = query(
            collection(db, POSTS_COLLECTION),
            where("status", "==", "published"),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as BlogPost[];
    } catch (error) {
        console.warn("Error fetching published posts:", error);
        return [];
    }
};

export const getPostById = async (id: string): Promise<BlogPost | null> => {
    try {
        const docRef = doc(db, POSTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as BlogPost;
        }
        return null;
    } catch (error) {
        console.error("Error fetching post by ID:", error);
        return null;
    }
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
        const q = query(collection(db, POSTS_COLLECTION));
        const querySnapshot = await getDocs(q);
        const docFound = querySnapshot.docs.find(d => d.data().slug === slug);
        return docFound ? { id: docFound.id, ...docFound.data() } as BlogPost : null;
    } catch (error) {
        console.warn(`Error fetching post by slug '${slug}':`, error);
        return null;
    }
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

// ==================== CATEGORIES ====================

export const getCategories = async (): Promise<Category[]> => {
    try {
        const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Category[];
    } catch (error) {
        console.warn("Error fetching categories:", error);
        return [];
    }
};

export const createCategory = async (category: Omit<Category, "id">) => {
    return await addDoc(collection(db, CATEGORIES_COLLECTION), category);
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    return await updateDoc(docRef, category);
};

export const deleteCategory = async (id: string) => {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    return await deleteDoc(docRef);
};
