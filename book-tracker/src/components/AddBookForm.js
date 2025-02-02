"use client";

import { useState } from 'react';

const COLORS = [
  'bg-[#B4E4E4]',
  'bg-[#FFD699]',
  'bg-[#F2E5D5]',
  'bg-[#FF9966]',
  'bg-[#D8BFD8]'
];

const AddBookForm = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    color: COLORS[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setFormData({ title: '', author: '', color: COLORS[0] });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors mb-8 flex items-center justify-center space-x-2"
      >
        <span className="text-2xl">+</span>
        <span>Add New Book</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 rounded-xl bg-white/10 mb-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Book Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF9966]"
            placeholder="Enter book title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Author
          </label>
          <input
            type="text"
            required
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF9966]"
            placeholder="Enter author name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Card Color
          </label>
          <div className="flex space-x-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full ${color} ${
                  formData.color === color ? 'ring-2 ring-white' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 p-2 rounded-lg bg-[#FF9966] text-white hover:bg-[#FF8844] transition-colors"
          >
            Add Book
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddBookForm;
