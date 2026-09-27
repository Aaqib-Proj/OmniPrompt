import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitFork } from 'lucide-react';
import { api } from '../../services/api';
import { LineageGraphData } from '../../types';
import { Avatar } from '../common/Avatar';
import { EmptyState } from '../common/ui';

type Node = LineageGraphData['nodes'][number];

const INDENT = 24;

const TreeRow: React.FC<{ node: Node; depth: number; last: boolean; label?: string }> = ({ node, depth, last, label }) => (
  <li className="relative flex items-center gap-2.5 py-1.5 min-w-0" style={{ paddingLeft: depth * INDENT }}>
    {depth > 0 && (
      <>
        <span className="absolute top-0 border-l border-line" style={{ left: depth * INDENT - 14, height: last ? '50%' : '100%' }} />
        <span className="absolute top-1/2 border-t border-line" style={{ left: depth * INDENT - 14, width: 9 }} />
      </>
    )}
    <Avatar src={node.avatar} name={node.author} size={20} />
    <span className="min-w-0 truncate text-[13px]">
      {node.isCurrent ? (
        <span className="font-semibold">
          {node.author} / {node.title}
        </span>
      ) : (
        <Link to={`/prompts/${node.slug}`} className="link">
          {node.author} / {node.title}
        </Link>
      )}
    </span>
    {label && <span className="pill shrink-0">{label}</span>}
  </li>
);

export const LineageGraph: React.FC<{ promptId: string }> = ({ promptId }) => {
  const [data, setData] = useState<LineageGraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLineage(promptId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [promptId]);

  if (loading) {
    return (
      <div className="box p-4 space-y-3">
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-2/3 ml-6" />
        <div className="skeleton h-4 w-1/2 ml-12" />
      </div>
    );
  }

  if (!data || data.nodes.length <= 1) {
    return (
      <EmptyState icon={GitFork} title="No forks yet">
        Fork this prompt to adapt it for another model or style — it will show up here.
      </EmptyState>
    );
  }

  const current = data.nodes.find((n) => n.isCurrent);
  const root = data.nodes.find((n) => n.isRoot && !n.isCurrent);
  const remixes = data.nodes.filter((n) => n.isRemix);
  const currentDepth = root ? 1 : 0;

  return (
    <div className="box">
      <div className="box-header">
        <span className="flex items-center gap-2 font-medium">
          <GitFork className="w-4 h-4 text-fg-muted" />
          Fork network
        </span>
        <span className="text-xs text-fg-muted">{data.nodes.length} prompts</span>
      </div>
      <ul className="px-4 py-3 overflow-x-auto">
        {root && <TreeRow node={root} depth={0} last label="Original" />}
        {current && <TreeRow node={current} depth={currentDepth} last label="This prompt" />}
        {remixes.map((remix, i) => (
          <TreeRow key={remix.id} node={remix} depth={currentDepth + 1} last={i === remixes.length - 1} />
        ))}
      </ul>
    </div>
  );
};
