import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-bold">台灣車禍事故處理專家</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">車禍發生，不要慌</h2>
          <p className="text-muted-foreground">
            依據台灣交通法規，一步步引導你完成安全處置、蒐證、申請資料、準備文件。
          </p>
        </div>

        <Link href="/scene" className="w-full max-w-md">
          <Button size="lg" className="w-full h-16 text-xl font-bold bg-red-600 hover:bg-red-700">
            我剛發生事故
          </Button>
        </Link>

        <Link href="/dashboard" className="w-full max-w-md">
          <Button variant="outline" size="lg" className="w-full h-12 text-base">
            管理我的案件
          </Button>
        </Link>

        <div className="grid gap-3 w-full max-w-md mt-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">安全處置指引</h3>
              <p className="text-sm text-muted-foreground">
                警示距離、可移車判斷、救護通報 — 每一步都有法規依據。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">時效提醒不漏步</h3>
              <p className="text-sm text-muted-foreground">
                7日現場圖、30日研判表、6個月鑑定、2年保險時效 — 自動幫你算好。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">文件一鍵生成</h3>
              <p className="text-sm text-muted-foreground">
                報案摘要、證據清單、事故時間線 — 結構化文件可下載。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
