import { MetadataRoute } from 'next';
import { getPosts, getCategories } from '@/services/postService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://achadosvipdaisa.com.br';

  try {
    // 1. Fetch data from Firebase
    const [allPosts, categories] = await Promise.all([
      getPosts(),
      getCategories(),
    ]);

    // Filter published posts in memory to avoid Firestore index issues
    const posts = allPosts.filter(p => p.status === 'published');

    const slugify = (text: string) => text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

    // 2. Map Posts
    const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
      const isExperiencia = slugify(post.category || "") === "minhas-experiencias";
      const prefix = isExperiencia ? "experiencias" : "achados";
      
      return {
        url: `${baseUrl}/${prefix}/${post.slug}`,
        lastModified: post.updatedAt?.toDate?.() || post.createdAt?.toDate?.() || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });

    // 3. Map Categories
    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.createdAt?.toDate?.() || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    // 4. Static Pages
    const staticEntries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/sobre`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${baseUrl}/politica-de-privacidade`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
      },
      {
        url: `${baseUrl}/termos-de-uso`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.1,
      },
    ];

    return [...staticEntries, ...postEntries, ...categoryEntries];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least the static pages as fallback
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      }
    ];
  }
}
