'use client';

import { useState } from 'react';
import ArticleInput from '@/components/ArticleInput';
import ArticleEditor from '@/components/ArticleEditor';

export default function Home() {
  const [article, setArticle] = useState('');

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Podcast Generator</h1>
        <ArticleInput onArticleSubmit={setArticle} />
        {article && (
          <ArticleEditor article={article} />
        )}
      </div>
    </main>
  );
}
