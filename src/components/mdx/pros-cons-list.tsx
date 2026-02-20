import { CheckCircle, XCircle } from "lucide-react";

interface ProsConsListProps {
    pros: string[];
    cons: string[];
}

export function ProsConsList({ pros = [], cons = [] }: ProsConsListProps) {
    if (!pros || !cons) return null; // Additional safety check
    return (
        <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-xl font-bold text-green-800 mb-4">
                    <CheckCircle className="w-6 h-6" />
                    Pontos Fortes
                </h3>
                <ul className="space-y-3">
                    {pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2 text-green-900">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-green-600 rounded-full flex-shrink-0" />
                            {pro}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-xl font-bold text-red-800 mb-4">
                    <XCircle className="w-6 h-6" />
                    Pontos Fracos
                </h3>
                <ul className="space-y-3">
                    {cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2 text-red-900">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0" />
                            {con}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
