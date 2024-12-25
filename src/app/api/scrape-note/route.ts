import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    const urlPattern = /^https:\/\/(note\.com|note\.mu)\/[a-zA-Z0-9_-]+\/n\/[a-zA-Z0-9]+$/;
    if (!urlPattern.test(url)) {
      return NextResponse.json(
        { error: '無効なURLです。Note.comの記事URLを入力してください。' },
        { status: 400 }
      );
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // タイトルの取得方法を改善（新しいセレクターを追加）
    let title = '';
    const titleSelectors = [
      'h1.o-noteContentText__title',
      'article h1',
      '.note-title',
      'h1.note-container__title',
      '.p-article__title',
      'h1', // 最後の手段として単純なh1を試す
    ];

    for (const selector of titleSelectors) {
      title = $(selector).first().text().trim();
      if (title) break;
    }

    // 本文の取得方法を改善（新しいセレクターを追加）
    let content = '';
    const contentSelectors = [
      '.note-common-styles__textnote-body',
      'article[role="article"]',
      '.o-noteContentText__body',
      '.note-content',
      '.note-container__body',
      '.p-article__content',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // テキストノードと段落を取得
        const textNodes = element.find('p, div:not(:has(p)), h1, h2, h3, h4, h5, h6, blockquote')
          .map((_, el) => {
            const $el = $(el);
            const text = $el.text().trim();
            
            // 要素の種類に応じてフォーマットを変更
            if (el.tagName.match(/^h[1-6]$/i)) {
              return `\n\n${text}\n\n`;
            } else if (el.tagName === 'blockquote') {
              return `\n> ${text}\n`;
            }
            return text;
          })
          .get()
          .filter(text => text.length > 0);

        content = textNodes.join('\n\n');
        if (content) break;
      }
    }

    // デバッグ情報をログに出力
    console.log('URL:', url);
    console.log('Found title:', title);
    console.log('Found content length:', content.length);

    if (!title && !content) {
      console.log('Available selectors:', {
        titles: titleSelectors.map(s => `${s}: ${$(s).length}`),
        contents: contentSelectors.map(s => `${s}: ${$(s).length}`),
      });
      throw new Error('記事の内容を取得できませんでした');
    }

    return NextResponse.json({
      url,
      title: title || 'タイトルなし',
      content: content || '本文を取得できませんでした',
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    let errorMessage = '記事の取得に失敗しました';
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'サーバーに接続できません';
      } else if (error.response?.status === 404) {
        errorMessage = '記事が見つかりません';
      } else if (error.response?.status === 403) {
        errorMessage = 'Note.comがアクセスを制限しています。しばらく待ってから再試行してください。';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = '接続がタイムアウトしました';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 