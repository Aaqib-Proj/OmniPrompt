import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, Twitter, Users, CalendarDays, Briefcase, Award, FileText, GitFork, Plus, Star } from 'lucide-react';
import { User, Prompt, Badge } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { openAuthModal } from '../lib/events';
import { formatCount, formatDate } from '../lib/format';
import { ContributionHeatmap } from '../components/profile/ContributionHeatmap';
import { PromptCard, cardHeight } from '../components/prompt/PromptCard';
import { Masonry } from '../components/common/Masonry';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/ui';

const TIER_COLORS: Record<Badge['tier'], string> = {
  BRONZE: '#b0703c',
  SILVER: '#8b949e',
  GOLD: '#c89b1c',
  OBSIDIAN: '#6e5bd6',
};

// Deterministic identity hue per user (same palette as the monogram avatar), so
// each profile gets its own signature banner + accent colour.
const HUES = [12, 32, 145, 190, 215, 260, 330];
const hueFor = (name: string) => HUES[Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % HUES.length];

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<(User & { prompts: Prompt[] }) | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ totalContributions: number; days: any[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'prompts' | 'forks'>('prompts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerDelta, setFollowerDelta] = useState(0);
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setActiveTab('prompts');
    setFollowerDelta(0);
    Promise.all([api.getUserProfile(username), api.getUserHeatmap(username)])
      .then(([userData, heatData]) => {
        setProfile(userData.user);
        setIsFollowing((userData.user as any).isFollowing || false);
        setHeatmapData(heatData);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div>
        <div className="skeleton h-36 sm:h-44 w-full !rounded-none" />
        <div className="page">
          <div className="-mt-12 sm:-mt-14 flex items-end gap-4 pb-6">
            <div className="skeleton w-28 h-28 sm:w-32 sm:h-32 rounded-2xl ring-4 ring-canvas" />
            <div className="space-y-2 pb-2">
              <div className="skeleton h-7 w-48" />
              <div className="skeleton h-4 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page py-24 text-center">
        <h1 className="text-2xl font-semibold">User not found</h1>
        <Link to="/" className="btn btn-default mt-6">
          Go home
        </Link>
      </div>
    );
  }

  const handleFollowToggle = async () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.toggleFollow(profile.username);
      setIsFollowing(res.following);
      setFollowerDelta((d) => d + (res.following ? 1 : -1));
    } catch (err) {
      console.error(err);
    }
  };

  const isSelf = currentUser?.username === profile.username;
  // The profile endpoint omits `author` on each prompt; it is always this user.
  const prompts = profile.prompts.map((p) => ({ ...p, author: p.author ?? profile }));
  const originalPrompts = prompts.filter((p) => !p.forkedFromPromptId);
  const forkedPrompts = prompts.filter((p) => !!p.forkedFromPromptId);
  const visiblePrompts = activeTab === 'prompts' ? originalPrompts : forkedPrompts;
  const followers = (profile.stats?.followersCount ?? profile._count?.followers ?? 0) + followerDelta;
  const following = profile.stats?.followingCount ?? profile._count?.following ?? 0;

  const hue = hueFor(profile.username);
  const bannerStyle: React.CSSProperties = {
    backgroundColor: `hsl(${hue} 64% 52%)`,
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.16) 1.5px, transparent 1.6px)',
    backgroundSize: '20px 20px',
  };

  const statCards = [
    { label: 'Prompts', value: profile.stats?.totalPrompts ?? profile.prompts.length, icon: FileText, chip: 'bg-accent/10 text-accent' },
    { label: 'Stars', value: profile.stats?.totalStarsReceived ?? 0, icon: Star, chip: 'bg-attention/10 text-attention' },
    { label: 'Forks', value: profile.stats?.totalForksReceived ?? 0, icon: GitFork, chip: 'bg-done/10 text-done' },
    { label: 'Followers', value: followers, icon: Users, chip: 'bg-link/10 text-link' },
  ];

  return (
    <div className="pb-16">
      {/* Cover banner — a flat signature colour unique to this user */}
      <div className="h-36 sm:h-44 w-full" style={bannerStyle} aria-hidden="true" />

      <div className="page">
        {/* Header: avatar overlaps the banner */}
        <header className="-mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5 pb-6">
          <Avatar
            src={profile.avatarUrl}
            name={profile.username}
            size={128}
            square
            className="!w-28 !h-28 sm:!w-32 sm:!h-32 !rounded-3xl ring-4 ring-canvas shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0 sm:pb-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight truncate">{profile.name || profile.username}</h1>
            <p className="text-[15px] font-semibold text-accent">@{profile.username}</p>
          </div>
          <div className="sm:pb-1.5 shrink-0">
            {isSelf ? (
              <Link to="/create" className="btn btn-primary w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                New prompt
              </Link>
            ) : (
              <button onClick={handleFollowToggle} className={`btn w-full sm:w-auto ${isFollowing ? 'btn-default' : 'btn-primary'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </header>

        {/* Bio + meta chips */}
        {profile.bio && <p className="text-[15px] leading-relaxed max-w-2xl mb-4">{profile.bio}</p>}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-fg-muted">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <strong className="font-semibold text-fg">{formatCount(followers)}</strong> followers ·{' '}
            <strong className="font-semibold text-fg">{formatCount(following)}</strong> following
          </span>
          {profile.role && (
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span className="capitalize">{profile.role.toLowerCase().replace(/_/g, ' ')}</span>
            </span>
          )}
          {profile.githubHandle && (
            <a href={`https://github.com/${profile.githubHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-fg">
              <Github className="w-4 h-4 shrink-0" />
              {profile.githubHandle}
            </a>
          )}
          {profile.twitterHandle && (
            <a href={`https://x.com/${profile.twitterHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-fg">
              <Twitter className="w-4 h-4 shrink-0" />@{profile.twitterHandle}
            </a>
          )}
          {profile.createdAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 shrink-0" />
              Joined {formatDate(profile.createdAt)}
            </span>
          )}
        </div>

        {/* Colourful stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface p-4 flex items-center gap-3">
              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${s.chip}`}>
                <s.icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="text-2xl font-bold tabular-nums leading-none">{formatCount(s.value)}</div>
                <div className="text-xs text-fg-muted mt-1 truncate">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements as colourful chips */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {profile.badges.map(({ badge }) => (
              <span
                key={badge.id}
                title={badge.description}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[13px] font-medium"
                style={{ color: TIER_COLORS[badge.tier], borderColor: TIER_COLORS[badge.tier] + '55', backgroundColor: TIER_COLORS[badge.tier] + '14' }}
              >
                <Award className="w-4 h-4" />
                {badge.name}
              </span>
            ))}
          </div>
        )}

        {heatmapData && (
          <div className="mt-6">
            <ContributionHeatmap days={heatmapData.days} totalContributions={heatmapData.totalContributions} />
          </div>
        )}

        {/* Tabs + prompt grid */}
        <div className="mt-8">
          <nav role="tablist" className="flex gap-2 border-b border-line mb-5">
            <button role="tab" aria-selected={activeTab === 'prompts'} onClick={() => setActiveTab('prompts')} className="tab">
              <FileText className="w-4 h-4 text-fg-subtle" />
              Prompts
              <span className="counter">{originalPrompts.length}</span>
            </button>
            <button role="tab" aria-selected={activeTab === 'forks'} onClick={() => setActiveTab('forks')} className="tab">
              <GitFork className="w-4 h-4 text-fg-subtle" />
              Forks
              <span className="counter">{forkedPrompts.length}</span>
            </button>
          </nav>

          {visiblePrompts.length > 0 ? (
            <Masonry
              items={visiblePrompts}
              getKey={(p) => p.id}
              getHeight={cardHeight}
              minColumnWidth={260}
              minColumns={1}
              maxColumns={4}
              renderItem={(p) => <PromptCard prompt={p} />}
            />
          ) : (
            <EmptyState icon={activeTab === 'prompts' ? FileText : GitFork} title={activeTab === 'prompts' ? 'No prompts yet' : 'No forks yet'}>
              {activeTab === 'prompts'
                ? `${isSelf ? 'You haven’t' : `${profile.username} hasn’t`} published any prompts.`
                : `${isSelf ? 'You haven’t' : `${profile.username} hasn’t`} forked any prompts.`}
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
};
