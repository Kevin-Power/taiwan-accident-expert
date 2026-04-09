import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-4 py-3">
        <h1 className="text-xl font-bold">台灣車禍事故處理專家</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8 bg-gradient-to-b from-red-50/50 to-background">
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-extrabold mb-4">車禍發生，不要慌</h2>
          <p className="text-lg text-muted-foreground">
            依據台灣交通法規，一步步引導你完成安全處置、蒐證、申請資料、準備文件。
          </p>
        </div>

        <Link href="/scene" className="w-full max-w-md">
          <Button size="lg" className="w-full h-20 text-2xl font-extrabold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 rounded-xl">
            我剛發生事故
          </Button>
        </Link>

        <Link href="/dashboard" className="w-full max-w-md">
          <Button variant="outline" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl">
            管理我的案件
          </Button>
        </Link>

        <div className="grid gap-4 w-full max-w-md mt-6">
          <Card className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <h3 className="text-lg font-bold mb-1">安全處置指引</h3>
              <p className="text-base text-muted-foreground">
                警示距離、可移車判斷、救護通報 — 每一步都有法規依據。
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <h3 className="text-lg font-bold mb-1">時效提醒不漏步</h3>
              <p className="text-base text-muted-foreground">
                7日現場圖、30日研判表、6個月鑑定、2年保險時效 — 自動幫你算好。
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <h3 className="text-lg font-bold mb-1">文件一鍵生成</h3>
              <p className="text-base text-muted-foreground">
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
