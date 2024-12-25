import { NextResponse } from 'next/server';

// モックデータ（開発用）
const MOCK_VOICE_ACTORS = [
  {
    id: '8c08fd5b-b3eb-4294-b102-a1da00f09c72',
    name: '高槻 リコ',
    nameReading: 'たかつき りこ',
    gender: 'FEMALE',
    age: 16,
    birthMonth: 8,
    birthDay: 18,
    smallImageUrl: 'https://storage.googleapis.com/ai-voice-prod-public-storage/voice-actors/8c08fd5b-b3eb-4294-b102-a1da00f09c72/images/s.webp',
    mediumImageUrl: 'https://storage.googleapis.com/ai-voice-prod-public-storage/voice-actors/8c08fd5b-b3eb-4294-b102-a1da00f09c72/images/m.webp',
    largeImageUrl: 'https://storage.googleapis.com/ai-voice-prod-public-storage/voice-actors/8c08fd5b-b3eb-4294-b102-a1da00f09c72/images/l.webp',
    sampleVoiceUrl: 'https://storage.googleapis.com/ai-voice-prod-public-storage/voice-actors/8c08fd5b-b3eb-4294-b102-a1da00f09c72/audio-files/audio.wav',
    sampleScript: 'ウチのポリシー？いいことは全力で楽しむ、悪いことは全力で蹴散らすっ たったそれだけ！簡単っしょ！',
    recommendedVoiceSpeed: 0.9,
    recommendedEmotionalLevel: 0.1,
    recommendedSoundDuration: 0.1,
    voiceStyles: [
      { id: 63, style: '軽快' },
      { id: 43, style: '活発' },
      { id: 41, style: '明るい' },
      { id: 6, style: 'お茶目' }
    ]
  }
];

const USE_MOCK = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_VOICE_ACTORS === 'true';

export async function GET() {
  try {
    if (USE_MOCK) {
      return NextResponse.json({ voiceActors: MOCK_VOICE_ACTORS });
    }

    if (!process.env.NIJIVOICE_API_KEY) {
      throw new Error('NIJIVOICE_API_KEYが設定されていません');
    }

    // APIリクエストの設定を修正
    const response = await fetch(
      `${process.env.NIJIVOICE_API_URL}/voice-actors`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.NIJIVOICE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Voice Actor fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
} 