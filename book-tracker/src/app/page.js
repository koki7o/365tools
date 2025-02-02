"use client";

import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import AddBookForm from '../components/AddBookForm';

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
      if (response.ok) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const response = await fetch('/api/books', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleProgressUpdate = async (id, newProgress) => {
    try {
      const book = books.find(b => b.id === id);
      const response = await fetch('/api/books', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...book,
          progress: newProgress,
        }),
      });
      if (response.ok) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Book<span className="text-[#FF9966]">Track</span>
          </h1>
          <p className="text-gray-400">Your personal reading companion</p>
        </header>

        <AddBookForm onAdd={handleAddBook} />

        <div className="space-y-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              {...book}
              onDelete={handleDeleteBook}
              onProgressUpdate={handleProgressUpdate}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
