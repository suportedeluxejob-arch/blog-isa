import { db } from "./src/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

async function updateCategories() {
  console.log("Iniciando varredura no banco...");
  const querySnapshot = await getDocs(collection(db, "posts"));
  
  let count = 0;
  
  for (const currDoc of querySnapshot.docs) {
    const data = currDoc.data();
    if (data.category === "Carros Blindados RJ") {
        console.log(`Atualizando categoria do post: ${data.title}...`);
        
        await updateDoc(doc(db, "posts", currDoc.id), {
            category: "Minhas Experiências"
        });
        
        count++;
    }
  }
  
  console.log(`Finalizado! ${count} posts foram migrados para a categoria 'Minhas Experiências'.`);
  process.exit(0);
}

updateCategories().catch((e) => {
    console.error("Erro na atualização:", e);
    process.exit(1);
});
