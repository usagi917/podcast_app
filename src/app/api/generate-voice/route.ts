import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'テキストは必須です' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NIJIVOICE_API_KEY;
    const baseUrl = process.env.NIJIVOICE_API_URL?.replace(/\/+$/, '');
    const voiceActorId = "8c08fd5b-b3eb-4294-b102-a1da00f09c72";

    if (!apiKey || !baseUrl) {
      console.error('Missing API configuration');
      return NextResponse.json(
        { error: 'API設定が不正です' },
        { status: 500 }
      );
    }

    // テキストの長さ制限
    if (text.length > 800) {
      return NextResponse.json(
        { error: 'テキストは800文字以内にしてください' },
        { status: 400 }
      );
    }

    const url = `${baseUrl}/voice-actors/${voiceActorId}/generate-voice`;
    
    // 音声生成APIを呼び出し
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        script: text,
        speed: "1.0",
        format: "mp3"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      // エラータイプに応じたメッセージ
      switch (response.status) {
        case 400:
          if (errorData.message?.includes('Insufficient credits')) {
            const remainingCredits = (errorData.message.match(/Remaining: (\d+)/) || [])[1];
            throw new Error(
              `クレジットが不足しています。\n` +
              `残りクレジット: ${remainingCredits || '不明'}\n` +
              `クレジットを追加してください。`
            );
          }
          throw new Error('リクエストの形式が不正です: ' + errorData.message);
        case 401:
          throw new Error('APIキーが無効です');
        case 429:
          throw new Error('APIのリクエスト制限に達しました。しばらく待ってから再試行してください。');
        case 500:
          throw new Error('サーバーエラーが発生しました。しばらく待ってから再試行してください。');
        default:
          throw new Error(`API request failed: ${response.status} ${errorData.message || errorText}`);
      }
    }

    const data = await response.json();
    const audioFileUrl = data.generatedVoice?.audioFileUrl;
    
    if (!audioFileUrl) {
      throw new Error('音声ファイルのURLが見つかりません');
    }

    // 残りのクレジット数をログ出力
    if (data.generatedVoice?.remainingCredits) {
      console.log('Remaining credits:', data.generatedVoice.remainingCredits);
    }

    // 音声URLを直接返す
    return NextResponse.json({
      url: audioFileUrl,
      remainingCredits: data.generatedVoice?.remainingCredits
    });

  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : '予期せぬエラーが発生しました'
      },
      { status: 500 }
    );
  }
} 