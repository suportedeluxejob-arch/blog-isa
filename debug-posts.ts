import { db } from "./src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function debugPosts() {
  const querySnapshot = await getDocs(collection(db, "posts"));
  console.log("Found", querySnapshot.size, "posts");
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`- Slug: ${data.slug}, Status: "${data.status}", Title: ${data.title}`);
  });
}

debugPosts().catch(console.error);
