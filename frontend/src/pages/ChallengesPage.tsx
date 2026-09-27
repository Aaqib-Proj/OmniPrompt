import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Trophy } from 'lucide-react';
import { Challenge } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { openAuthModal } from '../lib/events';
import { formatDate, timeAgo } from '../lib/format';
import { Avatar } from '../components/common/Avatar';
import { EmptyState, ModelBadge } from '../components/common/ui';

export const ChallengesPage: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedSubmissions, setVotedSubmissions] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();

  useEffect(() => {
    api.getActiveChallenge()
      .then((data) => setChallenge(data.challenge))
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (subId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (votedSubmissions.has(subId)) return;
    try {
      await api.voteChallengeSubmission(subId);
      setVotedSubmissions((prev) => new Set(prev).add(subId));
      setChallenge((prev) =>
        prev && {
          ...prev,
          submissions: prev.submissions?.map((s) => (s.id === subId ? { ...s, votesCount: s.votesCount + 1 } : s)),
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page py-8 space-y-4">
        <div className="skeleton h-48 w-full rounded-lg" />
        <div className="skeleton h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="page py-8">
        <EmptyState icon={Trophy} title="No challenge is running right now">
          A new one starts every Monday.
        </EmptyState>
      </div>
    );
  }

  const isOpen = new Date(challenge.endsAt).getTime() > Date.now();
  const submissions = [...(challenge.submissions || [])].sort((a, b) => b.votesCount - a.votesCount);

  return (
    <div className="page py-8">
      <section className="box overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`pill ${isOpen ? 'border-success/40 text-success' : ''}`}>
              {isOpen && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
              {isOpen ? 'Open' : 'Closed'}
            </span>
            <span className="text-fg-muted">
              {isOpen ? 'Closes' : 'Closed'} {timeAgo(challenge.endsAt)}
            </span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">{challenge.title}</h1>
          <p className="mt-2 max-w-2xl text-fg-muted leading-relaxed">{challenge.description}</p>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-4 border-t border-line-muted bg-subtle divide-y sm:divide-y-0 sm:divide-x divide-line-muted">
          {[
            ['Prize', challenge.prize],
            ['Theme', challenge.theme],
            ['Ends', formatDate(challenge.endsAt)],
            ['Submissions', String(submissions.length)],
          ].map(([label, value]) => (
            <div key={label} className="px-6 py-4">
              <dt className="text-xs text-fg-muted">{label}</dt>
              <dd className="mt-0.5 text-[13px] font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 mb-3 flex items-end justify-between gap-4">
        <h2 className="text-lg font-semibold">Leaderboard</h2>
        <Link to="/create" className="btn btn-sm btn-default">
          Submit a prompt
        </Link>
      </div>

      {submissions.length > 0 ? (
        <div className="box overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-subtle text-left text-xs text-fg-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium w-12">#</th>
                <th className="px-4 py-2.5 font-medium">Prompt</th>
                <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Author</th>
                <th className="px-4 py-2.5 font-medium text-right">Votes</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, index) => {
                const voted = votedSubmissions.has(sub.id);
                return (
                  <tr key={sub.id} className="border-t border-line-muted">
                    <td className="px-4 py-3 tabular-nums text-fg-muted">{index + 1}</td>
                    <td className="px-4 py-3 min-w-[16rem]">
                      <Link to={`/prompts/${sub.prompt.slug}`} className="font-medium hover:text-link">
                        {sub.prompt.title}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-fg-muted">
                        {sub.prompt.model && <ModelBadge model={sub.prompt.model} />}
                        <span className="line-clamp-1">{sub.prompt.shortDescription}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Link to={`/users/${sub.user.username}`} className="inline-flex items-center gap-2 hover:text-link">
                        <Avatar src={sub.user.avatarUrl} name={sub.user.username} size={20} />
                        {sub.user.username}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleVote(sub.id)}
                        aria-pressed={voted}
                        className={`btn btn-sm btn-default tabular-nums ${voted ? 'border-link/50 text-link' : ''}`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${voted ? 'fill-current' : ''}`} />
                        {sub.votesCount}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Trophy} title="No submissions yet">
          Be the first to enter this week’s challenge.
        </EmptyState>
      )}
    </div>
  );
};
