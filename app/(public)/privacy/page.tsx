import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-4 py-3">
        <a href="/" className="text-xl font-bold hover:text-primary">台灣車禍事故處理專家</a>
      </header>
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm">
          <h1>隱私權政策</h1>
          <p>最後更新：2026年4月</p>

          <h2>一、蒐集之目的</h2>
          <p>本系統蒐集您的個人資料，僅用於提供交通事故處理流程導航、證據管理、時效提醒及文件生成等服務。</p>

          <h2>二、蒐集之個人資料類別</h2>
          <ul>
            <li>識別類：姓名、電話號碼</li>
            <li>事故相關：事故日期、地點、車輛資訊、現場照片</li>
            <li>特種個人資料（如有）：傷勢照片、診斷書（需額外書面同意）</li>
          </ul>

          <h2>三、利用之期間、地區、對象及方式</h2>
          <p>期間：至案件結案後一年，或依您的要求提前刪除。地區：中華民國境內。對象：僅限您本人及您授權之人員。方式：電子化處理與利用。</p>

          <h2>四、當事人權利</h2>
          <p>依個人資料保護法第3條，您得隨時請求查詢、閱覽、複製、補充、更正、停止蒐集/處理/利用或刪除您的個人資料。</p>

          <h2>五、安全維護措施</h2>
          <p>本系統採用傳輸加密（TLS）及靜態加密保護您的資料，並設有存取權限控管與稽核日誌。</p>

          <h2>六、聯絡方式</h2>
          <p>如有任何隱私相關問題，請透過系統內建聯絡功能與我們聯繫。</p>
        </div>
      </main>
      <DisclaimerFooter />
    </div>
  );
}
