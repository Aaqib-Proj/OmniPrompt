import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { OpenHiggsfieldApp } from '../openhiggsfield/openhiggsfield-app';
import type { RunRecord } from '../openhiggsfield/history';
import '../openhiggsfield/openhiggsfield.css';

export const StudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const promptParam = searchParams.get('prompt') || undefined;
  const modelParam = searchParams.get('model') || undefined;
  const surfaceParam = (searchParams.get('surface') as 'image' | 'video') || undefined;

  useEffect(() => {
    document.title = 'Higgsfield AI Studio — PromptIt';
    return () => {
      document.title = 'PromptIt — GitHub x Hugging Face for AI Prompts';
    };
  }, []);

  const handlePublishToPromptIt = (run: RunRecord) => {
    const url = run.urls[0] || '';
    const mediaType = run.kind === 'video' ? 'VIDEO' : 'IMAGE';
    
    // Navigate to create prompt page with pre-filled state and query
    navigate('/create', {
      state: {
        fromStudio: true,
        title: run.prompt.slice(0, 60),
        shortDescription: `Generated with ${run.modelLabel} on Higgsfield AI Studio`,
        fullPrompt: run.prompt,
        descriptionMd: `### Generated with ${run.modelLabel}\n\n**Prompt:**\n> ${run.prompt}\n\n**Settings:**\n\`\`\`json\n${JSON.stringify(run.settings || {}, null, 2)}\n\`\`\``,
        mediaUrl: url,
        mediaType,
        modelSlug: run.modelId,
      },
    });
  };

  const handleExit = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-[#0a0a0b] text-[#edefef]">
      <OpenHiggsfieldApp
        initialPrompt={promptParam}
        initialModel={modelParam}
        initialSurface={surfaceParam}
        onPublishToPromptIt={handlePublishToPromptIt}
        onExit={handleExit}
      />
    </div>
  );
};

export default StudioPage;
