export default function RetroStats() {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
      <div className="bg-yellow-400 border-2 border-black p-4 rounded transform rotate-2 hover:rotate-0 transition-transform hover:scale-105">
        <div className="font-pixel text-4xl font-bold text-black">500+</div>
        <div className="font-pixel text-black">Active Users</div>
      </div>
      <div className="bg-pink-400 border-2 border-black p-4 rounded transform -rotate-2 hover:rotate-0 transition-transform hover:scale-105">
        <div className="font-pixel text-4xl font-bold text-black">10K+</div>
        <div className="font-pixel text-black">Files Managed</div>
      </div>
      <div className="bg-blue-400 border-2 border-black p-4 rounded transform rotate-1 hover:rotate-0 transition-transform hover:scale-105">
        <div className="font-pixel text-4xl font-bold text-black">70%</div>
        <div className="font-pixel text-black">Faster Handoff</div>
      </div>
    </div>
  );
}
