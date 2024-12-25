'use client';

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <audio 
        controls 
        className="w-full"
        aria-label="生成された音声"
      >
        <source src={url} type="audio/wav" />
        <source src={url} type="audio/mp3" />
        お使いのブラウザは音声の再生に対応していません。
      </audio>
      
      <button
        onClick={handleDownload}
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="音声をダウンロード"
      >
        音声をダウンロード
      </button>
    </div>
  );
} 