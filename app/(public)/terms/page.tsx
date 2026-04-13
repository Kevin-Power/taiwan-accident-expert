import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-4 py-3">
        <a href="/" className="text-xl font-bold hover:text-primary">台灣車禍事故處理專家</a>
      </header>
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm">
          <h1>服務條款</h1>
          <p>最後更新：2026年4月</p>

          <h2>一、服務說明</h2>
          <p>本系統（以下稱「本服務」）依據中華民國公開法規，提供交通事故處理之資訊參考與流程導航工具。</p>

          <h2>二、重要聲明</h2>
          <p><strong>本服務不構成法律意見。</strong>本服務提供之所有資訊僅供參考，不代表對個案之法律判斷、責任認定或訴訟結果之保證。個案情況各異，涉及權益事項請諮詢律師或法律扶助基金會（電話：412-8518）。</p>

          <h2>三、使用限制</h2>
          <p>本服務不提供以下內容：肇事責任判定、勝訴機率評估、和解金額建議、訴訟策略、肇責比例分配。</p>

          <h2>四、使用者責任</h2>
          <p>您應確保所提供之資訊正確完整。本服務之建議基於您所提供之資訊，如資訊有誤可能導致不適當之建議。</p>

          <h2>五、免責聲明</h2>
          <p>本服務盡力確保法規資訊之正確性與即時性，但不保證絕對無誤。法規如有修正，以全國法規資料庫公告為準。因使用本服務所生之任何損害，本服務不負賠償責任。</p>

          <h2>六、智慧財產權</h2>
          <p>本服務之程式碼、介面設計、文件模板等均受著作權法保護。法規條文內容屬公共領域。</p>
        </div>
      </main>
      <DisclaimerFooter />
    </div>
  );
}
