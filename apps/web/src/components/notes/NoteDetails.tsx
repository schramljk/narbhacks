"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/common/button";
import { 
  Edit3, 
  Calendar, 
  Clock, 
  FileText, 
  Sparkles, 
  ArrowLeft,
  BookOpen,
  Share2
} from "lucide-react";
import EditNote from "./EditNote";
import Link from "next/link";

interface NoteDetailsProps {
  noteId: Id<"notes">;
}

const NoteDetails = ({ noteId }: NoteDetailsProps) => {
  const [isSummary, setIsSummary] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const currentNote = useQuery(api.notes.getNote, { id: noteId });
  const regenerateSummary = useMutation(api.notes.regenerateSummary);

  const formatDate = (dateString: string) => {
    console.log('NoteDetails formatDate called with:', dateString);
    
    // Parse the date string (YYYY-MM-DD format) properly
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    console.log('Parsed date components:', { year, month, day });
    console.log('Created Date object:', date);
    
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    console.log('Formatted date:', formattedDate);
    return formattedDate;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!currentNote) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/notes">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Entry
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Entry Header */}
      <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentNote.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{currentNote.date && formatDate(currentNote.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentNote._creationTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{currentNote.content?.length || 0} characters</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <Button
            variant={!isSummary ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsSummary(false)}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Full Entry
          </Button>
          <Button
            variant={isSummary ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsSummary(true)}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Summary
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border p-8 shadow-sm">
        {!isSummary ? (
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
              {currentNote.content}
            </div>
          </div>
        ) : (
          <div>
            {currentNote.summary ? (
              <div className="prose prose-lg max-w-none">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
                  </div>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {currentNote.summary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No AI Summary Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate an AI summary to get a concise overview of your entry
                </p>
                <Button
                  onClick={() => regenerateSummary({ noteId })}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Summary
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entry Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {currentNote.content?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Characters</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {currentNote.content?.split(' ').length || 0}
          </div>
          <div className="text-sm text-gray-600">Words</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {currentNote.content?.split('.').length - 1 || 0}
          </div>
          <div className="text-sm text-gray-600">Sentences</div>
        </div>
      </div>

      {currentNote && (
        <EditNote
          note={currentNote}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  );
};

export default NoteDetails;
