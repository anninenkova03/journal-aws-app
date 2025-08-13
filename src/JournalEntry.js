import React from 'react';
import { Button } from '@aws-amplify/ui-react';

function JournalEntry({ entry, onDelete, onEdit }) {
  const { entryId, title, content, updatedAt } = entry;

  const updatedDate = new Date(updatedAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="journal-entry-card">
      <div className="card-header">
        <h4 className="card-title">{title}</h4>
        <span className="card-date">last modified {updatedDate}</span>
      </div>
      <p className="card-content">{content}</p>
      <div className="card-actions">
        <Button 
          onClick={() => onEdit(entry)} 
          variation="link" 
          size="small"
        >
          Update
        </Button>
        <Button 
          onClick={() => onDelete(entryId)} 
          variation="destructive" 
          size="small"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default JournalEntry;
