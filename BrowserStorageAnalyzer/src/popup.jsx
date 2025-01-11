// popup.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import StorageAnalyzer from './components/StorageAnalyzer';
import './index.css'; // For Tailwind

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StorageAnalyzer />
  </React.StrictMode>
);