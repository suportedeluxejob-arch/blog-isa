import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function GET() {
    try {
        const contentDirectory = path.join(process.cwd(), "content/reviews");

        if (!fs.existsSync(contentDirectory)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(contentDirectory);

        const posts = files
            .filter((f) => f.endsWith(".mdx"))
            .map((fileName) => {
                const slug = fileName.replace(/\.mdx$/, "");
                const fullPath = path.join(contentDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const { data } = matter(fileContents);

                return {
                    slug,
                    title: data.title || slug,
                    excerpt: data.excerpt || "",
                    coverImage: data.featuredImage || "",
                    category: data.category || "",
                    date: data.date || "",
                    articleType: data.isReview ? "sales" : "educational",
                    isReview: data.isReview || false,
                    origin: "mdx",
                };
            });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error reading legacy posts:", error);
        return NextResponse.json([]);
    }
}
