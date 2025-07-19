"use client";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Checkbox from "./Checkbox";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/common/button";
import { Calendar, FileText, Plus, Sparkles, X } from "lucide-react";

interface CreateNoteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CreateNote({ open: externalOpen, onOpenChange }: CreateNoteProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [date, setDate] = useState(() => {
    // Get today's date in the user's local timezone
    const now = new Date();
    // Use toLocaleDateString to ensure we get the local date
    const localDate = now.toLocaleDateString('en-CA'); // en-CA format is YYYY-MM-DD
    console.log('Initial date set to:', localDate);
    console.log('Current Date object:', now);
    console.log('Timezone offset:', now.getTimezoneOffset());
    return localDate;
  });

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const cancelButtonRef = useRef(null);

  const createNote = useMutation(api.notes.createNote);
  const openaiKeySet = useQuery(api.openai.openaiKeySet) ?? false;

  const createUserNote = async () => {
    console.log('Creating note with date:', date);
    console.log('Current local date:', new Date().toLocaleDateString('en-CA'));
    console.log('Date input value:', date);
    console.log('Date type:', typeof date);
    
    await createNote({
      title,
      content,
      isSummary: isChecked,
      date,
    });
    setOpen(false);
    setTitle("");
    setContent("");
    const now = new Date();
    const localDate = now.toLocaleDateString('en-CA'); // en-CA format is YYYY-MM-DD
    setDate(localDate);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[60]"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
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

          <div className="fixed inset-0 z-[60] w-screen overflow-y-auto">
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
                      <Plus className="w-6 h-6 text-blue-600" />
                      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                        New Journal Entry
                      </Dialog.Title>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Date Field */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date
                        </div>
                      </label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Title Field */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Title
                        </div>
                      </label>
                      <input
                        id="title"
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
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Journal Entry
                        </div>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={8}
                        placeholder="Write about your day, thoughts, feelings, or anything you'd like to remember..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* AI Summary Section */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-gray-700">AI Summary</p>
                      </div>
                      <Checkbox
                        openaiKeySet={openaiKeySet}
                        isChecked={isChecked}
                        checkHandler={() => setIsChecked(!isChecked)}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={createUserNote}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Save Entry
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
                      </div>
        </div>
        </Dialog>
      </Transition.Root>
  );
}
