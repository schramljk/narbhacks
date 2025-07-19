import Header from "@/components/Header";
import NoteDetails from "@/components/notes/NoteDetails";
import { Id } from "@packages/backend/convex/_generated/dataModel";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <NoteDetails noteId={slug as Id<"notes">} />
    </main>
  );
}
