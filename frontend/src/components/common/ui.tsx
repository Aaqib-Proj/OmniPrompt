import React from 'react';
import { Link } from 'react-router-dom';
import { Model } from '../../types';

// Colored dot + model name, the way model hubs label things.
export const ModelBadge: React.FC<{
  model: Pick<Model, 'name' | 'slug' | 'badgeColor'>;
  link?: boolean;
  className?: string;
}> = ({ model, link = false, className = '' }) => {
  const content = (
    <>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: model.badgeColor || '#8b949e' }} />
      <span className="truncate">{model.name}</span>
    </>
  );
  const classes = `inline-flex items-center gap-1.5 min-w-0 ${className}`;

  return link ? (
    <Link to={`/models/${model.slug}`} className={`${classes} hover:text-link`}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
};

// Letter tile tinted with the model's brand color (external favicons are unreliable).
export const ProviderMark: React.FC<{ model: Pick<Model, 'provider' | 'badgeColor'>; size?: number }> = ({
  model,
  size = 40,
}) => {
  const color = model.badgeColor || '#8b949e';
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center shrink-0 rounded-lg font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        color,
        backgroundColor: `${color}1f`,
        boxShadow: `inset 0 0 0 1px ${color}33`,
      }}
    >
      {model.provider.charAt(0)}
    </span>
  );
};

// Renders prompt text with {variables} highlighted.
export const PromptText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\{[^}]+\})/g).map((part, i) =>
      /^\{[^}]+\}$/.test(part) ? (
        <span key={i} className="var-token">
          {part}
        </span>
      ) : (
        part
      )
    )}
  </>
);

export const PageHeader: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-line-muted">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="text-fg-muted mt-1 max-w-2xl">{description}</p>}
    </div>
    {actions}
  </div>
);

export const EmptyState: React.FC<{
  icon?: React.ElementType;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, children, action }) => (
  <div className="box px-6 py-14 text-center">
    {Icon && <Icon className="w-6 h-6 text-fg-subtle mx-auto mb-3" strokeWidth={1.5} />}
    <h3 className="text-[15px] font-semibold">{title}</h3>
    {children && <p className="text-[13px] text-fg-muted mt-1 max-w-sm mx-auto">{children}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="box overflow-hidden">
    <div className="aspect-[16/9] skeleton rounded-none" />
    <div className="p-3.5 space-y-2.5">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  </div>
);
