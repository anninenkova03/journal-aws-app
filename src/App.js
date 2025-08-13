import './App.css';
import '@aws-amplify/ui-react/styles.css';
import JournalEntry from './JournalEntry';
import { fetchAuthSession } from 'aws-amplify/auth';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import { useState, useEffect, useCallback } from 'react';

const API_ENDPOINT = 'https://abpg4l3obe.execute-api.us-east-1.amazonaws.com/v1'; 

function App({ signOut, user }) {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);

  const getAuthToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  };

  const fetchEntries = useCallback (async (date) => {
    setLoading(true);
    const dateStr = date.toISOString().split('T')[0];
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_ENDPOINT}/entries?date=${dateStr}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const entriesData = await response.json();
      const sortedEntries = entriesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setEntries(sortedEntries);
      setError(null);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Error fetching entries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && selectedDate) {
      fetchEntries(selectedDate);
    }
  }, [user, selectedDate, fetchEntries]);

  const handleCreateEntry = async (e) => {
    e.preventDefault(); 
    if (!title || !content) {
      alert('Please enter a title and content.');
      return;
    }

    try {
      const token = await getAuthToken();
      await fetch(`${API_ENDPOINT}/entries`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content}),
      });

      setTitle('');
      setContent('');
      setSelectedDate(new Date());
    } catch (err) {
      console.error('Error creating entry:', err);
      setError('Error creating entry.');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const token = await getAuthToken();
      await fetch(`${API_ENDPOINT}/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });
      setEntries(entries.filter(entry => entry.entryId !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Error deleting entry.');
    }
  };

  const handleEditClick = (entry) => {
    setIsEditing(true);
    setEditEntryId(entry.entryId);
    setTitle(entry.title);
    setContent(entry.content);
  };

  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    if (!title && !content) {
      alert('Nothing to update.');
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_ENDPOINT}/entries/${editEntryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry.');
      }

      const updatedData = await response.json();
      setEntries(entries.map(entry =>
        entry.entryId === editEntryId ? updatedData.entry : entry
      ));

      setTitle('');
      setContent('');
      setIsEditing(false);
      setEditEntryId(null);
    } catch (err) {
      console.error('Error updating entry:', err);
      setError('Error updating entry.');
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };
  
  const handleNextDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  return (
    <div className="App">
      <header className="app-header">
        <Heading level={1} className="app-title">My Journal</Heading>
        <div className="user-info">
          <Button onClick={signOut} variation="primary" size="small">Logout</Button>
        </div>
      </header>

      <main className="app-main">
        <div className="form-container">
          <Heading level={3}>{isEditing ? 'Edit Entry' : 'New Entry'}</Heading>
          <form onSubmit={isEditing ? handleUpdateEntry : handleCreateEntry}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
            <textarea
              placeholder="Dear Diary..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
            />
            <Button type="submit" variation="primary" isFullWidth={true}>
              {isEditing ? 'Update' : 'Save'}
            </Button>
            {isEditing && (
              <Button
                variation="link"
                isFullWidth={true}
                onClick={() => {
                  setIsEditing(false);
                  setEditEntryId(null);
                  setTitle('');
                  setContent('');
                }}
              >
                Cancel
              </Button>
            )}
          </form>
        </div>

        <div className="entries-container">
          <div className="date-navigation">
            <Button onClick={handlePreviousDay} variation="link">‹ Prev</Button>
            <Heading level={3} className="current-date">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Heading>
            <Button onClick={handleNextDay} variation="link">Next ›</Button>
          </div>
          <Heading level={3}>My Entries</Heading>
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && entries.length === 0 && (
          <p className="no-entries-message">No entries for the day :(</p>)}
          <div className="entries-list">
            {entries.map((entry) => (
              <JournalEntry 
                key={entry.entryId} 
                entry={entry} 
                onDelete={handleDeleteEntry} 
                onEdit={handleEditClick}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuthenticator(App, {
  loginMechanisms: ['email'],
});