import fs from 'fs';
import path from 'path';

export default function GalleryPage() {
    const directory = path.join(process.cwd(), 'public/images/reviews');
    let files: string[] = [];

    try {
        files = fs.readdirSync(directory).filter(file => !file.startsWith('.'));
    } catch (err) {
        console.error(err);
    }

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Galeria de Imagens de Reviews</h1>
            <p className="mb-8 text-gray-600">Copie o código abaixo e cole no seu arquivo .mdx</p>

            <div className="grid gap-8">
                {files.map(file => (
                    <div key={file} className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
                        <div className="mb-4 bg-gray-200 border rounded flex items-center justify-center w-full h-48">
                            {/* Using img tag directly here for simplicity in this utility page */}
                            <img
                                src={`/images/reviews/${file}`}
                                alt={file}
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>

                        <code className="bg-gray-800 text-green-400 p-3 rounded text-sm w-full overflow-x-auto whitespace-pre-wrap">
                            {`<Image 
  src="/images/reviews/${file}" 
  alt="Descrição da imagem" 
  width={800} 
  height={600} 
/>`}
                        </code>
                        <p className="mt-2 text-xs text-gray-500">{file}</p>
                    </div>
                ))}

                {files.length === 0 && (
                    <p className="text-red-500">Nenhuma imagem encontrada em public/images/reviews</p>
                )}
            </div>
        </div>
    );
}
