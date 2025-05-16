export default function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="bg-gray-900 border-2 border-gray-700 p-4 rounded hover:border-green-400 transition-colors cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <div className="font-pixel text-green-400 group-hover:text-yellow-400 transition-colors flex items-center">
          <span className="mr-2">►</span> {question}
        </div>
      </div>
      <div className="pl-6 font-pixel text-gray-400 text-sm">{answer}</div>
    </div>
  );
}
