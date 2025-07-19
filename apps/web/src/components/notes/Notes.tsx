"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { Button } from "@/components/common/button";
import { Plus, Search, BookOpen, Calendar, Clock } from "lucide-react";
import CreateNote from "./CreateNote";
import NoteItem from "./NoteItem";

const Notes = () => {
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const allNotes = useQuery(api.notes.getNotes);
  const deleteNote = useMutation(api.notes.deleteNote);

  // Group notes by date
  const groupedNotes = useMemo(() => {
    if (!allNotes) return {};
    
    const filteredNotes = search
      ? allNotes.filter(
          (note) =>
            note.title.toLowerCase().includes(search.toLowerCase()) ||
            note.content.toLowerCase().includes(search.toLowerCase()),
        )
      : allNotes;

    return filteredNotes.reduce((groups, note) => {
      let date = note.date;
      console.log('Processing note:', note.title, 'with date:', date);
      
      if (!date) {
        // Fallback to creation time, but use local date
        const creationDate = new Date(note._creationTime);
        date = creationDate.toLocaleDateString('en-CA'); // en-CA format is YYYY-MM-DD
        console.log('No date found, using creation time:', date);
      }
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {} as Record<string, typeof allNotes>);
  }, [allNotes, search]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedNotes).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedNotes]);

  const formatDate = (dateString: string) => {
    // Parse the date string (YYYY-MM-DD format)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    // Get today's date in local timezone
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayYear = yesterday.getFullYear();
    const yesterdayMonth = yesterday.getMonth();
    const yesterdayDay = yesterday.getDate();
    
    // Compare dates properly
    if (year === todayYear && month - 1 === todayMonth && day === todayDay) {
      return "Today";
    } else if (year === yesterdayYear && month - 1 === yesterdayMonth && day === yesterdayDay) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Calculate stats
  const totalEntries = allNotes?.length || 0;
  const todayEntries = allNotes?.filter(note => {
    const noteDate = note.date || new Date(note._creationTime).toLocaleDateString('en-CA');
    const today = new Date().toLocaleDateString('en-CA');
    return noteDate === today;
  }).length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Daily Journal</h1>
            {todayEntries > 0 && (
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                ✍️ {todayEntries} Entry{todayEntries > 1 ? 's' : ''} Today
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Capture your thoughts, memories, and daily reflections
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Entries</p>
              <p className="text-2xl font-bold text-green-600">{todayEntries}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Journal Days</p>
              <p className="text-2xl font-bold text-purple-600">{sortedDates.length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search your journal entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Journal Entries */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No journal entries yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your journaling journey by creating your first entry
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            Write Your First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDate(date)}
                </h2>
              </div>
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedNotes[date].map((note) => (
                  <NoteItem key={note._id} note={note} deleteNote={deleteNote} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CreateNote Modal */}
      <CreateNote 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};

export default Notes;
