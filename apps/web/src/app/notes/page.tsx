import Header from "@/components/Header";
import Notes from "@/components/notes/Notes";

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <Notes />
    </main>
  );
}
