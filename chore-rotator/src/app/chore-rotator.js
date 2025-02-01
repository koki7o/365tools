'use client';
import { useState, useEffect } from 'react';

const ChoreRotator = () => {
  const [chores, setChores] = useState([]);
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState('');
  const [newChore, setNewChore] = useState('');
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    fetchPeople();
    fetchChores();
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await fetch('/api/people');
      const data = await res.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const fetchChores = async () => {
    try {
      const res = await fetch('/api/chores');
      const data = await res.json();
      setChores(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chores:', error);
      setLoading(false);
    }
  };

  const addPerson = async () => {
    if (newPerson.trim()) {
      try {
        const res = await fetch('/api/people', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newPerson.trim() }),
        });
        if (res.ok) {
          setNewPerson('');
          await fetchPeople();
        }
      } catch (error) {
        console.error('Error adding person:', error);
      }
    }
  };

  const removePerson = async (id) => {
    try {
      const res = await fetch('/api/people', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchPeople();
        await fetchChores();
      }
    } catch (error) {
      console.error('Error removing person:', error);
    }
  };

  const addChore = async () => {
    if (newChore.trim()) {
      try {
        const res = await fetch('/api/chores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newChore.trim() }),
        });
        if (res.ok) {
          setNewChore('');
          await fetchChores();
        }
      } catch (error) {
        console.error('Error adding chore:', error);
      }
    }
  };

  const removeChore = async (id) => {
    try {
      const res = await fetch('/api/chores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchChores();
      }
    } catch (error) {
      console.error('Error removing chore:', error);
    }
  };

  const assignChore = async (choreId, personId) => {
    try {
      const res = await fetch('/api/chores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: choreId, personId }),
      });
      if (res.ok) {
        await fetchChores();
      }
    } catch (error) {
      console.error('Error assigning chore:', error);
    }
  };

  const rotateChores = async () => {
    if (people.length === 0 || chores.length === 0) return;
    setRotating(true);
    
    try {
      // Create a map of current assignments for reference
      const currentAssignments = new Map(
        chores.map(chore => [chore.id, chore.personId])
      );
      
      // Create arrays for processing
      const choreIds = chores.map(chore => chore.id);
      const personIds = people.map(person => person.id);
      
      // For each chore, find its current assignee's position and calculate next person
      const newAssignments = choreIds.map((choreId, index) => {
        const currentPersonId = currentAssignments.get(choreId);
        const currentIndex = personIds.indexOf(currentPersonId);
        
        // If chore was unassigned or person not found, start with first person
        if (currentIndex === -1) {
          return {
            choreId,
            personId: personIds[index % personIds.length]
          };
        }
        
        // Calculate next person's index, ensuring even distribution
        const nextIndex = (currentIndex + 1) % personIds.length;
        return {
          choreId,
          personId: personIds[nextIndex]
        };
      });
      
      // Apply all assignments
      for (const assignment of newAssignments) {
        await assignChore(assignment.choreId, assignment.personId);
      }
      
      await fetchChores();
    } catch (error) {
      console.error('Error rotating chores:', error);
    } finally {
      setRotating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-[#1DB954]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-[734px] bg-[#121212] rounded-lg p-10">
        <div className="flex justify-center mb-8">
          <svg className="w-12 h-12 text-[#1DB954]" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 3H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H5V7h14v12zM7 9h10v2H7zm0 4h7v2H7z"/>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Chore Assignment Rotator</h1>
        
        {/* Social Login Style Buttons */}
        <div className="space-y-4 mb-8">
          <button 
            onClick={rotateChores}
            disabled={rotating || people.length === 0 || chores.length === 0}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-black" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 11l-6-6v4H9c-3.31 0-6 2.69-6 6s2.69 6 6 6h2v-2H9c-2.21 0-4-1.79-4-4s1.79-4 4-4h6v4l6-6z"/>
            </svg>
            <span className="font-medium text-black">
              {rotating ? 'Rotating...' : 'Rotate All Chores'}
            </span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#121212] text-gray-400">or</span>
          </div>
        </div>

        {/* Add Person Section */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-300">Add Person</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newPerson}
              onChange={(e) => setNewPerson(e.target.value)}
              placeholder="Enter name"
              className="flex-1 px-4 py-3 bg-[#282828] text-white border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            />
            <button
              onClick={addPerson}
              disabled={!newPerson.trim()}
              className="px-6 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {people.map((person) => (
              <div key={person.id} className="group relative">
                <span className="px-4 py-2 bg-[#282828] text-white rounded-full inline-flex items-center">
                  {person.name}
                  <button
                    onClick={() => removePerson(person.id)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Chore Section */}
        <div className="space-y-4 mb-8">
          <label className="block text-sm font-medium text-gray-300">Add Chore</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newChore}
              onChange={(e) => setNewChore(e.target.value)}
              placeholder="Enter chore"
              className="flex-1 px-4 py-3 bg-[#282828] text-white border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            />
            <button
              onClick={addChore}
              disabled={!newChore.trim()}
              className="px-6 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Current Assignments</h2>
          <div className="space-y-3">
            {chores.map((chore) => (
              <div
                key={chore.id}
                className="flex justify-between items-center bg-[#282828] p-4 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => removeChore(chore.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                  <span className="text-white">{chore.name}</span>
                </div>
                <select
                  value={chore.personId || ''}
                  onChange={(e) => assignChore(chore.id, e.target.value || null)}
                  className="px-4 py-2 bg-[#181818] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#1DB954] cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Don&apos;t forget to complete your chores!</p>
        </div>
      </div>
    </div>
  );
};

export default ChoreRotator;
