
import { useState } from "react";
import { Chapter } from "@/types/chapter";
import ChapterEditor from "./ChapterEditor";
import BookPreview from "./BookPreview";
import DeleteChapterModal from "./DeleteChapterModal";
import ChapterList from "./ChapterList";
import ChapterPreview from "./ChapterPreview";
import EmptyChapterState from "./EmptyChapterState";

interface FormData {
  title: string;
  author: string;
  description: string;
  genre: string;
  isbn: string;
  price: string;
  isFree: boolean;
  coverImage?: File;
}

interface BookContentStepProps {
  chapters: Chapter[];
  onChapterSave: (chapter: Chapter) => void;
  onChapterDelete: (chapterId: string) => void;
  formData: FormData;
  coverImageUrl?: string;
}

const BookContentStep = ({ 
  chapters, 
  onChapterSave, 
  onChapterDelete, 
  formData,
  coverImageUrl 
}: BookContentStepProps) => {
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

  const handleSaveChapter = (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const chapter: Chapter = {
      id: editingChapter?.id || Date.now().toString(),
      title: chapterData.title,
      content: chapterData.content,
      createdAt: editingChapter?.createdAt || now,
      updatedAt: now
    };

    onChapterSave(chapter);
    setEditingChapter(null);
    setIsCreatingNew(false);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setIsCreatingNew(false);
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapterToDelete(chapterId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteChapter = () => {
    if (chapterToDelete) {
      onChapterDelete(chapterToDelete);
      if (selectedChapter?.id === chapterToDelete) {
        setSelectedChapter(null);
      }
      setDeleteModalOpen(false);
      setChapterToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditingChapter(null);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
  };

  const handleShowPreview = () => {
    setShowPreview(true);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  if (showPreview) {
    return (
      <BookPreview
        formData={formData}
        chapters={chapters}
        onClose={() => setShowPreview(false)}
        coverImageUrl={coverImageUrl}
      />
    );
  }

  const renderChapterEditor = () => {
    if (isCreatingNew || editingChapter) {
      return (
        <ChapterEditor
          chapter={editingChapter || undefined}
          onSave={handleSaveChapter}
          onCancel={handleCancel}
        />
      );
    }

    if (selectedChapter) {
      return (
        <ChapterPreview
          chapter={selectedChapter}
          onEditChapter={handleEditChapter}
        />
      );
    }

    return <EmptyChapterState onCreateNew={handleCreateNew} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      {/* Chapters List - Mobile: full width, Desktop: narrower */}
      <div className="lg:col-span-4 flex flex-col">
        <ChapterList
          chapters={chapters}
          selectedChapter={selectedChapter}
          onChapterSelect={handleChapterSelect}
          onEditChapter={handleEditChapter}
          onDeleteChapter={handleDeleteChapter}
          onShowPreview={handleShowPreview}
          onCreateNew={handleCreateNew}
        />
      </div>
      
      {/* Chapter Editor - Mobile: full width, Desktop: wider */}
      <div className="lg:col-span-8">
        {renderChapterEditor()}
      </div>

      <DeleteChapterModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteChapter}
      />
    </div>
  );
};

export default BookContentStep;
