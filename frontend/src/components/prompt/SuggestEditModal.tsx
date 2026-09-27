import React, { useEffect, useState } from 'react';
import { GitPullRequest } from 'lucide-react';
import { Prompt } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { DiffView } from './DiffView';

interface SuggestEditModalProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuggestEditModal: React.FC<SuggestEditModalProps> = ({ prompt, isOpen, onClose, onSuccess }) => {
  const [proposedTitle, setProposedTitle] = useState(prompt.title);
  const [proposedPromptText, setProposedPromptText] = useState(prompt.fullPrompt);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProposedTitle(prompt.title);
      setProposedPromptText(prompt.fullPrompt);
      setNotes('');
      setError('');
    }
  }, [isOpen, prompt]);

  const hasChanges = proposedPromptText !== prompt.fullPrompt || proposedTitle !== prompt.title;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.suggestEdit(prompt.id, { proposedTitle, proposedPromptText, notes });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Suggest an edit"
      description="Propose changes to this prompt. The author can review and merge them into a new version."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-default">
            Cancel
          </button>
          <button type="submit" form="suggest-edit-form" disabled={isSubmitting || !hasChanges} className="btn btn-primary">
            <GitPullRequest className="w-4 h-4" />
            {isSubmitting ? 'Submitting…' : 'Submit suggestion'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 px-3 py-2 rounded-md border border-danger/30 bg-danger/10 text-[13px] text-danger">{error}</div>
      )}

      <form id="suggest-edit-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="suggest-title" className="label">Title</label>
          <input
            id="suggest-title"
            type="text"
            required
            value={proposedTitle}
            onChange={(e) => setProposedTitle(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="suggest-prompt" className="label">Prompt</label>
          <textarea
            id="suggest-prompt"
            required
            rows={7}
            value={proposedPromptText}
            onChange={(e) => setProposedPromptText(e.target.value)}
            className="input font-mono text-[12.5px] resize-y"
          />
        </div>

        {proposedPromptText !== prompt.fullPrompt && (
          <div>
            <span className="label">Changes</span>
            <DiffView before={prompt.fullPrompt} after={proposedPromptText} />
          </div>
        )}

        <div>
          <label htmlFor="suggest-notes" className="label">Why is this better?</label>
          <textarea
            id="suggest-notes"
            required
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Adding --c 5 keeps skin tones consistent across seeds on Midjourney v7."
            className="input resize-y"
          />
        </div>
      </form>
    </Modal>
  );
};
