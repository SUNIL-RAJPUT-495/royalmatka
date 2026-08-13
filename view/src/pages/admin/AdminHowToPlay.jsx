import React, { useState } from 'react';
import { FaSave, FaPlus, FaTrashAlt, FaChevronDown, FaChevronUp, FaBookOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const AdminHowToPlay = () => {
  // Load initial settings or use defaults
  const [pageTitle, setPageTitle] = useState(() => {
    const saved = localStorage.getItem('how_to_play_title');
    return saved || 'How to Play';
  });

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('how_to_play_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn(e);
      }
    }
    return [
      {
        id: 1,
        title: 'Introduction',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        instructions: 'Welcome to our platform. Follow these simple steps to learn how to place bids and check game results.',
        files: [],
        isOpen: false
      }
    ];
  });

  // Modal Control States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null); // { id, title }

  // Toggle Accordion State
  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, isOpen: !sec.isOpen } : sec
      )
    );
  };

  // Add New Section (it should be closed by default)
  const handleAddSection = () => {
    const newSec = {
      id: Date.now(),
      title: `Section ${sections.length + 1}`,
      videoUrl: '',
      instructions: '',
      files: [],
      isOpen: false
    };
    setSections((prev) => [...prev, newSec]);
    toast.success('New section added!');
  };

  // Update Section values
  const handleSectionChange = (id, key, value) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, [key]: value } : sec
      )
    );
  };

  // Remove Section trigger
  const handleRemoveSectionClick = (id, title) => {
    setSectionToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion handler
  const handleConfirmDelete = () => {
    if (sectionToDelete) {
      setSections((prev) => prev.filter((sec) => sec.id !== sectionToDelete.id));
      toast.success('Section deleted successfully');
    }
    setIsDeleteModalOpen(false);
    setSectionToDelete(null);
  };

  // Save all content
  const handleSaveAll = () => {
    localStorage.setItem('how_to_play_title', pageTitle);
    localStorage.setItem('how_to_play_sections', JSON.stringify(sections));
    toast.success('How To Play content saved successfully!');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800">
      
      {/* Centered container wrapper to align header and main card perfectly */}
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Page Title Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 shrink-0">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-md text-white">
            <FaBookOpen size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
              How To Play Settings
            </h1>
            <p className="text-xs text-gray-505 font-medium mt-1.5 uppercase tracking-wider">
              Edit instructions, video tutorials, and guides for players
            </p>
          </div>
        </div>

        {/* Main Form Box Container */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Manage How To Play Content
          </h2>

          {/* Overall Page Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Overall Page Title
            </label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="How to Play"
              className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
            />
          </div>

          {/* Sections Header */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Sections
            </h3>

            {/* List of Accordions */}
            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div 
                  key={sec.id} 
                  className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs bg-white transition-all duration-300"
                >
                  {/* Accordion Toggle Bar */}
                  <div 
                    onClick={() => toggleSection(sec.id)}
                    className="bg-gray-50/75 hover:bg-gray-50 px-4 py-3.5 flex items-center justify-between cursor-pointer select-none transition-colors border-b border-gray-100"
                  >
                    <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-gray-400">Section {idx + 1}:</span>
                      <span>{sec.title || 'Untitled Section'}</span>
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSectionClick(sec.id, sec.title);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-750 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Section"
                      >
                        <FaTrashAlt size={10} />
                      </button>

                      {sec.isOpen ? (
                        <FaChevronUp size={11} className="text-gray-500" />
                      ) : (
                        <FaChevronDown size={11} className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Accordion Content Block */}
                  {sec.isOpen && (
                    <div className="p-4 space-y-4 bg-white/50">
                      
                      {/* Section Title */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleSectionChange(sec.id, 'title', e.target.value)}
                          placeholder="e.g. Introduction"
                          className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Video URL */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Video URL (YouTube, Vimeo, etc.)
                        </label>
                        <input
                          type="text"
                          value={sec.videoUrl}
                          onChange={(e) => handleSectionChange(sec.id, 'videoUrl', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Instructions */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Notes / Instructions
                        </label>
                        <textarea
                          value={sec.instructions}
                          onChange={(e) => handleSectionChange(sec.id, 'instructions', e.target.value)}
                          placeholder="Type detailed instructions here..."
                          rows={3}
                          className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      {/* Upload Box */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Upload Photos, Videos, PDFs for this section
                        </label>
                        <div className="flex flex-col gap-1">
                          <input 
                            type="file" 
                            id={`file-${sec.id}`}
                            multiple
                            onChange={() => toast.success('Mock file selected')}
                            className="text-xs text-gray-550 font-medium cursor-pointer file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                          />
                          <span className="text-[9px] text-gray-400 font-medium">
                            Supported formats: images, videos, PDFs.
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Section trigger box */}
            <button
              type="button"
              onClick={handleAddSection}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500/80 rounded-2xl py-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-550 hover:text-blue-600 bg-gray-50/30 hover:bg-gray-50/80 cursor-pointer transition-all active:scale-[0.99]"
            >
              <FaPlus size={10} />
              <span>Add New Section</span>
            </button>
          </div>

          {/* Global Save Button */}
          <button
            type="button"
            onClick={handleSaveAll}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wider py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer uppercase mt-6"
          >
            <FaSave size={13} />
            <span>Save All Content</span>
          </button>

        </div>

      </div>

      {/* Reusable Warning/Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Section"
        message={`Are you sure you want to delete "${sectionToDelete?.title || 'this section'}"? This action cannot be undone.`}
        confirmText="Delete Section"
        cancelText="Keep Section"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />

    </div>
  );
};

export default AdminHowToPlay;
