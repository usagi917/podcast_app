'use client';

import { useState } from 'react';

interface VoiceSelectorProps {
  text: string;
  onAudioGenerated: (url: string) => void;
}

export default function VoiceSelector({ text, onAudioGenerated }: VoiceSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateVoice = async () => {
    if (!text) return;
    
    if (text.length > 800) {
      setError('テキストが長すぎます。800文字以内に編集してください。');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          style_id: 41,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
        throw new Error(errorData.error || '音声の生成に失敗しました');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('音声URLが見つかりません');
      }

      // 音声要素を作成して再生
      const audio = new Audio(data.url);
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
        throw new Error('音声の再生に失敗しました');
      });

      onAudioGenerated(data.url);

    } catch (err) {
      console.error('Voice generation error:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {text.length > 800 && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400">
          現在の文字数: {text.length}文字（800文字を超えています）
        </div>
      )}
      
      <button
        onClick={handleGenerateVoice}
        disabled={isLoading || text.length > 800}
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            音声を生成中...
          </>
        ) : (
          '音声を生成'
        )}
      </button>

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
    </div>
  );
} 