'use client';

import { useState } from 'react';
import type { GeneratedProject } from '@/app/api/generate-project/route';
import { GenerateInput, UseGenerateProjectReturn } from '@/lib/chat/definitions';


export function useGenerateProject(): UseGenerateProjectReturn {
    const [generating, setGenerating]             = useState(false);
    const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
    const [error, setError]                       = useState<string | null>(null);

    const generate = async (input: GenerateInput) => {
        setGenerating(true);
        setError(null);
        setGeneratedProject(null);

        try {
            const res = await fetch('/api/generate-project', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(input),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to generate project');
            }

            const data: GeneratedProject = await res.json();
            setGeneratedProject(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setGenerating(false);
        }
    };

    const reset = () => {
        setGenerating(false);
        setGeneratedProject(null);
        setError(null);
    };

    return { generating, generatedProject, error, generate, reset };
}
