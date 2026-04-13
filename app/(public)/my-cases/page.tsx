'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '@/components/shared/risk-badge';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';
import { listCases, type CaseRecord } from '@/lib/cases/store';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const STATUS_LABELS: Record<string, string> = {
  on_scene: '現場處理中',
  post_scene: '事故後處理',
  data_request: '資料申請中',
  appraisal: '鑑定中',
  mediation: '調解中',
  closed: '已結案',
};

const ROAD_LABELS: Record<string, string> = {
  highway: '高速公路',
  expressway: '快速道路',
  general: '一般道路',
  alley: '巷弄',
};

export default function MyCasesPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await listCases();
      setCases(result);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-bold hover:text-primary">台灣車禍事故處理專家</a>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-lg mx-auto w-full px-5 py-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">我的案件</h2>
            <Link href="/scene">
              <Button size="sm">+ 新增案件</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">載入中...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl">📋</div>
              <p className="text-xl font-semibold">尚無案件</p>
              <p className="text-muted-foreground">完成事故精靈後，案件會自動保存在這裡。</p>
              <Link href="/scene">
                <Button size="lg" className="h-14 text-lg rounded-xl mt-4">
                  🚨 我剛發生事故
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                📱 以下案件儲存於此瀏覽器，共 {cases.length} 筆
              </p>
              {cases.map((c) => (
                <Link key={c.id} href={`/my-cases/${c.id}`}>
                  <Card className="shadow-sm rounded-xl hover:shadow-md transition-shadow hover:border-primary/30 mb-3">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <SeverityBadge severity={c.severity} />
                        <span className="text-sm text-muted-foreground">
                          {STATUS_LABELS[c.status] || c.status}
                        </span>
                      </div>
                      <div className="text-base">
                        <span className="font-mono text-sm">{c.id}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(c.accidentDate)}
                        {c.roadType && ` · ${ROAD_LABELS[c.roadType] || c.roadType}`}
                        {c.speedLimit && ` · ${c.speedLimit}km/h`}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
