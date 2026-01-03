import { PasteCreator } from "@/shared/components";

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Pastebin Lite</h1>
          <PasteCreator />
        </div>
      </main>
      
    </>
  );
}
