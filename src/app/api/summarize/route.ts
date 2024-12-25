import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // デバッグログ
    console.log('Received text:', typeof text === 'string' ? text.substring(0, 100) + '...' : 'Invalid text');

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '記事の内容を入力してください。空のテキストは処理できません。' },
        { status: 400 }
      );
    }

    // 日本語文字が含まれているかチェック
    if (!/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(text)) {
      return NextResponse.json(
        { error: '日本語の文章を入力してください。英数字のみのテキストは処理できません。' },
        { status: 400 }
      );
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: '記事が短すぎます。より詳細な内容の記事を入力してください（50文字以上）。' },
        { status: 400 }
      );
    }

    const prompt = `
以下の記事をポッドキャストのセリフに変換してください。

要件：
1. 自然な会話形式で
2. 聞き手が理解しやすい表現を使用
3. 重要なポイントを強調
4. 一人で話すラジオ形式で
5. 音声で読み上げることを考慮した文体で
6. 「はい」「えーと」などの話し言葉を適度に入れる
7. 必ず300文字程度で簡潔に
8. 絵文字は使用しない

記事:
${text}
`;

    // OpenAI APIの呼び出し
    console.log('Calling OpenAI API...');
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",  // 元のモデルに戻す
        messages: [
          {
            role: "system",
            content: "あなたは人気ポッドキャスターです。記事の内容を魅力的な話し言葉で伝えることが得意です。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
    } catch (error) {
      console.error('Error with gpt-4o:', error);
      console.log('Falling back to gpt-4...');
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",  // フォールバックも同じモデルを使用
        messages: [
          {
            role: "system",
            content: "あなたは人気ポッドキャスターです。記事の内容を魅力的な話し言葉で伝えることが得意です。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
    }

    const script = completion.choices[0]?.message?.content?.trim();

    if (!script) {
      console.error('No script generated from OpenAI');
      throw new Error('セリフの生成に失敗しました');
    }

    // 生成されたスクリプトをログ出力
    console.log('Generated script:', script.substring(0, 100) + '...');

    return NextResponse.json({ 
      summary: script,
      voiceText: script.replace(/[「」『』（）\n]/g, '')
    });

  } catch (error) {
    console.error('Script generation error:', error);
    
    let errorMessage = 'セリフの生成に失敗しました';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'APIキーの設定に問題があります';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'APIの利用制限に達しました。しばらく待ってから再試行してください';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 