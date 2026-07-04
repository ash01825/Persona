export function Navigation() {
  return (
    <nav className="w-full p-4 flex justify-between items-center border-b border-white/10">
      <div className="font-bold text-xl text-white">Persona</div>
      <div className="flex gap-4">
        <a href="/explorer" className="text-sm text-gray-300 hover:text-white">Explorer</a>
      </div>
    </nav>
  );
}
