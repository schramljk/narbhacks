import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/common/button";
import { Edit3, MoreVertical, Clock, FileText } from "lucide-react";
import DeleteNote from "./DeleteNote";
import EditNote from "./EditNote";
import { Id } from "@packages/backend/convex/_generated/dataModel";

export interface NoteProps {
  note: {
    title: string;
    _id: Id<"notes">;
    _creationTime: number;
    content?: string;
    date?: string;
  };
  deleteNote: any;
}

const NoteItem = ({ note, deleteNote }: NoteProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/notes/${note._id}`} className="block">
              <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                {note.title}
              </h3>
            </Link>
            {note.content && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {truncateContent(note.content, 120)}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(note._creationTime)}</span>
              </div>
              {note.content && (
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{note.content.length} characters</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/notes/${note._id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Read Entry
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-gray-600 hover:text-blue-600"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <DeleteNote deleteAction={() => deleteNote({ noteId: note._id })} />
          </div>
        </div>
      </div>

      <EditNote
        note={note}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
};

export default NoteItem;
