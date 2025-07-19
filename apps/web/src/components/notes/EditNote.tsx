"use client";

import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "@/components/common/button";
import { Calendar, Edit3, FileText, Sparkles, X } from "lucide-react";

interface EditNoteProps {
  note: {
    _id: Id<"notes">;
    title: string;
    content: string;
    date: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditNote({ note, isOpen, onClose }: EditNoteProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [date, setDate] = useState(note.date);
  const [regenerateSummary, setRegenerateSummary] = useState(false);

  const updateNote = useMutation(api.notes.updateNote);

  const cancelButtonRef = useRef(null);

  // Update form when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setDate(note.date);
    setRegenerateSummary(false);
  }, [note]);

  const updateUserNote = async () => {
    await updateNote({
      noteId: note._id,
      title,
      content,
      date,
      regenerateSummary,
    });
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <form className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-2 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-6 h-6 text-blue-600" />
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      Edit Journal Entry
                    </Dialog.Title>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Date Field */}
                  <div>
                    <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </label>
                    <input
                      id="edit-date"
                      name="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Title Field */}
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Title
                      </div>
                    </label>
                    <input
                      id="edit-title"
                      name="title"
                      type="text"
                      placeholder="What's on your mind today?"
                      autoComplete="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Content Field */}
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Journal Entry
                      </div>
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      rows={8}
                      placeholder="Write about your day, thoughts, feelings, or anything you'd like to remember..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* AI Summary Option */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      id="regenerate-summary"
                      type="checkbox"
                      checked={regenerateSummary}
                      onChange={(e) => setRegenerateSummary(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="regenerate-summary" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Regenerate AI Summary
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateUserNote}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Update Entry
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </form>
      </Dialog>
    </Transition.Root>
  );
} 