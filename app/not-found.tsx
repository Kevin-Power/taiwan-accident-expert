import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-4 py-3">
        <a href="/" className="text-xl font-bold hover:text-primary">台灣車禍事故處理專家</a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        <div className="text-6xl">🚧</div>
        <h1 className="text-3xl font-extrabold">找不到此頁面</h1>
        <p className="text-lg text-muted-foreground text-center max-w-md">
          您要找的頁面不存在或已被移動。
        </p>
        <div className="flex gap-3">
          <Link href="/">
            <Button size="lg" className="h-14 text-lg rounded-xl">
              🏠 回到首頁
            </Button>
          </Link>
          <Link href="/scene">
            <Button variant="outline" size="lg" className="h-14 text-lg rounded-xl">
              🚨 事故精靈
            </Button>
          </Link>
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
