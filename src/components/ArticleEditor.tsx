'use client';

import { useState, useEffect, useCallback } from 'react';
import VoiceSelector from './VoiceSelector';
import AudioPlayer from './AudioPlayer';

interface ArticleEditorProps {
  article: string;
  onSummaryChange?: (summary: string) => void;
}

export default function ArticleEditor({ 
  article,
  onSummaryChange = () => {}
}: ArticleEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSummarize = useCallback(async () => {
    if (!article) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: article }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '要約の生成に失敗しました');
      }

      const data = await response.json();
      setEditedScript(data.summary);
      onSummaryChange(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [article, onSummaryChange]);

  useEffect(() => {
    if (article && !editedScript) {
      handleSummarize();
    }
  }, [article, editedScript, handleSummarize]);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleBack = () => {
    setIsConfirmed(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">セリフを生成中...</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onSummaryChange(editedScript);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleAudioGenerated = (url: string) => {
    setAudioUrl(url);
  };

  return (
    <div className="space-y-4">
      {!isEditing ? (
        <>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">生成されたセリフ</h3>
            <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{editedScript}</p>
            </div>
            <div className="mt-4 flex gap-4">
              {!isConfirmed ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    セリフを編集
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    このセリフで確定
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBack}
                  className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  セリフを修正
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">セリフの編集</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  セリフ（500文字以内）
                </label>
                <textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={8}
                  placeholder="セリフを編集してください..."
                />
                <p className="mt-2 text-sm text-gray-500">
                  残り文字数: {500 - editedScript.length}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  保存して次へ
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">編集のヒント</h4>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
              <li>自然な話し言葉を心がけてください</li>
              <li>「えーと」「そうですね」などの話し言葉を適度に入れると自然になります</li>
              <li>重要なポイントは強調して話すように意識してください</li>
              <li>聞き手を意識した表現を使ってください</li>
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isConfirmed && (
        <>
          <VoiceSelector
            text={editedScript}
            onAudioGenerated={handleAudioGenerated}
          />

          {audioUrl && <AudioPlayer url={audioUrl} />}
        </>
      )}
    </div>
  );
} 