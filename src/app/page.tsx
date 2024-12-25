'use client';

import { useState } from 'react';
import ArticleInput from '@/components/ArticleInput';
import ArticleEditor from '@/components/ArticleEditor';
import VoiceSelector from '@/components/VoiceSelector';
import AudioPlayer from '@/components/AudioPlayer';
import { Article } from '@/types';

export default function Home() {
  const [article, setArticle] = useState<Article | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Podcast Generator
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Note記事から簡単にポッドキャストを作成
          </p>
        </div>

        {!article ? (
          <ArticleInput onArticleLoad={setArticle} />
        ) : (
          <ArticleEditor
            article={article}
            summary={summary}
            onSummaryChange={setSummary}
          />
        )}
      </div>
    </div>
  );
}
