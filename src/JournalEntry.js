import React from 'react';
import { Button } from '@aws-amplify/ui-react';

function JournalEntry({ entry, onDelete }) {
  const formattedDate = new Date(entry.createdAt).toLocaleString('bg-BG', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="journal-entry-card">
      <div className="card-header">
        <h4 className="card-title">{entry.title}</h4>
        <span className="card-date">{formattedDate}</span>
      </div>
      <p className="card-content">{entry.content}</p>
      <div className="card-actions">
        <Button 
          onClick={() => onDelete(entry.entryId)} 
          variation="destructive" 
          size="small"
        >
          Изтрий
        </Button>
      </div>
    </div>
  );
}

export default JournalEntry;
