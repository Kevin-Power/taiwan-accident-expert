import type { LawReference } from './types';

// === Traffic Accident Handling Regulations (道路交通事故處理辦法) ===

export const LAW_ACCIDENT_HANDLING: Record<string, LawReference> = {
  ART_2: {
    law: '道路交通事故處理辦法',
    article: '第2條',
    summary: '道路交通事故分類：A1（造成人員當場或24小時內死亡）、A2（造成人員受傷或超過24小時死亡）、A3（僅有財物損失）。',
  },
  ART_3: {
    law: '道路交通事故處理辦法',
    article: '第3條',
    summary: '事故發生後，駕駛人應立即在適當距離處放置警告標誌，事故現場排除後應即撤除。有受傷者應迅速救護，並儘速通知消防機關。',
  },
  ART_3_MOVE: {
    law: '道路交通事故處理辦法',
    article: '第3條',
    clause: '第1項第4款',
    summary: '不得任意移動肇事車輛及現場痕跡證據。但無人傷亡且車輛尚能行駛，或有人受傷且當事人均同意者，應先標繪車輛位置及現場相關跡證後，將車輛移置不妨礙交通之處所。',
  },
  ART_4: {
    law: '道路交通事故處理辦法',
    article: '第4條',
    summary: '前條第一項第四款之標繪，指以攝影或其他方式記錄現場狀況後移置。',
  },
  ART_10: {
    law: '道路交通事故處理辦法',
    article: '第10條',
    summary: '警察機關對道路交通事故現場，應就事故現場狀況繪製現場圖，並蒐集相關跡證。',
  },
  ART_13: {
    law: '道路交通事故處理辦法',
    article: '第13條',
    summary: '當事人或利害關係人得於事故發生7日後，向警察機關申請閱覽或提供現場圖及現場照片；於事故發生30日後，申請提供道路交通事故初步分析研判表。',
  },
  ART_2_DETAIL: {
    law: '道路交通事故處理辦法',
    article: '第2條',
    clause: '分類定義',
    summary: 'A1類：造成人員當場或24小時內死亡之事故。A2類：造成人員受傷或超過24小時死亡之事故。A3類：僅有財物損失之事故。',
  },
  ART_10_DETAIL: {
    law: '道路交通事故處理辦法',
    article: '第10條',
    summary: '警察機關對道路交通事故現場，應就事故現場狀況繪製現場圖，並蒐集相關跡證。',
  },
  ART_12: {
    law: '道路交通事故處理辦法',
    article: '第12條',
    summary: '當事人不能或不宜於現場製作調查紀錄者，警察機關應於7日內聯繫補製。證據得暫時扣留，期間不得超過3個月。',
  },
  ART_13_DETAIL: {
    law: '道路交通事故處理辦法',
    article: '第13條',
    clause: '申請節點細則',
    summary: '現場可申請登記聯單；事故7日後可申請現場圖及現場照片；30日後可申請初步分析研判表。閱覽可能收取費用。',
  },
};

// === Road Traffic Management and Penalty Act (道路交通管理處罰條例) ===

export const LAW_TRAFFIC_PENALTY: Record<string, LawReference> = {
  ART_62: {
    law: '道路交通管理處罰條例',
    article: '第62條',
    summary: '汽車駕駛人駕駛汽車肇事，無人受傷或死亡而未依規定處置者，處新臺幣一千元以上三千元以下罰鍰；逃逸者，並吊扣其駕駛執照一個月至三個月。致人傷亡而逃逸者處以更重罰則。',
  },
  ART_62_MOVE_PENALTY: {
    law: '道路交通管理處罰條例',
    article: '第62條',
    clause: '第2項',
    summary: '無人傷亡且車輛尚能行駛而不儘速將車輛位置標繪移置，致妨礙交通者，處六百元以上一千八百元以下罰鍰。',
  },
  ART_92: {
    law: '道路交通管理處罰條例',
    article: '第92條',
    summary: '授權主管機關訂定故障車輛警告標誌設置距離相關規定。',
  },
  ART_3_ROAD_DEF: {
    law: '道路交通管理處罰條例',
    article: '第3條',
    summary: '「道路」定義：指公路、街道、巷衖、廣場、騎樓、走廊或其他供公眾通行之地方。包含車道、人行道等。用於判斷事故是否屬「道路」範圍。',
  },
  ART_62_DETAIL: {
    law: '道路交通管理處罰條例',
    article: '第62條',
    clause: '完整罰則',
    summary: '無傷亡未依規定處置：罰1,000~3,000元。逃逸：吊扣駕照1~3個月。車能行駛不移致妨礙交通：罰600~1,800元。致人傷亡未處置：罰3,000~9,000元並吊扣駕照。致人傷亡逃逸：吊銷駕照。肇事致人重傷或死亡而逃逸：吊銷駕照且不得考領。',
  },
};

// === Appraisal and Review Regulations (車輛行車事故鑑定及覆議作業辦法) ===

export const LAW_APPRAISAL: Record<string, LawReference> = {
  ART_3: {
    law: '車輛行車事故鑑定及覆議作業辦法',
    article: '第3條',
    summary: '鑑定案件之受理，距肇事日期逾六個月以上者，原則不予受理。但因特殊原因者不在此限。',
  },
  ART_10: {
    law: '車輛行車事故鑑定及覆議作業辦法',
    article: '第10條',
    summary: '當事人對鑑定結果不服者，得於收受鑑定書之翌日起三十日內申請覆議，以一次為限。',
  },
  ART_3_DETAIL: {
    law: '車輛行車事故鑑定及覆議作業辦法',
    article: '第3條',
    clause: '受理限制完整',
    summary: '不受理情形：(1)非屬道路交通事故。(2)未經警察機關處理。(3)已進入偵查或審判程序且非法院/檢察官囑託。(4)距肇事日期逾6個月（不可歸責事由除外）。鑑定期限2個月，必要時延長2個月。',
  },
  ART_9: {
    law: '車輛行車事故鑑定及覆議作業辦法',
    article: '第9條',
    summary: '鑑定委員會應製作鑑定意見書，載明鑑定經過及鑑定意見。',
  },
  ART_10_DETAIL: {
    law: '車輛行車事故鑑定及覆議作業辦法',
    article: '第10條',
    clause: '覆議細則',
    summary: '對鑑定不服者，收受鑑定書翌日起30日內得申請覆議，以一次為限。覆議由車輛行車事故鑑定覆議委員會受理。',
  },
};

// === Compulsory Automobile Liability Insurance Act (強制汽車責任保險法) ===

export const LAW_COMPULSORY_INSURANCE: Record<string, LawReference> = {
  ART_14: {
    law: '強制汽車責任保險法',
    article: '第14條',
    summary: '請求權人對保險人之保險給付請求權，自知有損害發生及保險人時起，二年間不行使而消滅；自汽車交通事故發生時起，逾十年者亦同。',
  },
  ART_14_DETAIL: {
    law: '強制汽車責任保險法',
    article: '第14條',
    clause: '時效完整',
    summary: '請求權自知有損害及保險人起2年不行使消滅；自事故發生起逾10年亦同。向保險人請求後，有「不計入時效」期間。特別補償基金之權利亦準用。',
  },
  ART_40: {
    law: '強制汽車責任保險法',
    article: '第40條',
    summary: '特別補償基金適用情形：肇事車無法查究、未投保強制險、被保險車輛為失竊車。被害人得向特別補償基金請求補償。',
  },
};

// === Personal Data Protection Act (個人資料保護法) ===

export const LAW_PDPA: Record<string, LawReference> = {
  ART_6: {
    law: '個人資料保護法',
    article: '第6條',
    summary: '有關醫療、基因、性生活、健康檢查及犯罪前科之個人資料，不得蒐集、處理或利用。但法律明文規定、當事人書面同意等情形例外。',
  },
  ART_8: {
    law: '個人資料保護法',
    article: '第8條',
    summary: '蒐集個人資料時，應明確告知當事人蒐集之目的、個人資料之類別、利用之期間及方式等事項。',
  },
  ART_27: {
    law: '個人資料保護法',
    article: '第27條',
    summary: '非公務機關保有個人資料檔案者，應採行適當之安全措施，防止個人資料被竊取、竄改、毀損、滅失或洩漏。',
  },
};

// === Township Mediation Act (鄉鎮市調解條例) ===

export const LAW_MEDIATION: Record<string, LawReference> = {
  ART_25: {
    law: '鄉鎮市調解條例',
    article: '第25條',
    summary: '調解成立後，調解書應於3日內送管轄法院審核。',
  },
  ART_26: {
    law: '鄉鎮市調解條例',
    article: '第26條',
    summary: '調解經法院核定後，當事人就該事件不得再行起訴、告訴或自訴。',
  },
  ART_27: {
    law: '鄉鎮市調解條例',
    article: '第27條',
    summary: '經法院核定之民事調解，與民事確定判決有同一之效力。經法院核定之刑事調解，以給付金錢或其他代替物或有價證券之一定數量為標的者，其調解書得為執行名義。',
  },
  ART_29: {
    law: '鄉鎮市調解條例',
    article: '第29條',
    summary: '經法院核定之調解有無效或得撤銷之原因者，當事人得於30日內請求法院撤銷或宣告調解無效。',
  },
};

// === Criminal Code (中華民國刑法) ===

export const LAW_CRIMINAL: Record<string, LawReference> = {
  ART_276: {
    law: '中華民國刑法',
    article: '第276條',
    summary: '因過失致人於死者，處五年以下有期徒刑、拘役或五十萬元以下罰金。（僅作風險提示，非定性用途）',
  },
  ART_284: {
    law: '中華民國刑法',
    article: '第284條',
    summary: '因過失傷害人者，處一年以下有期徒刑、拘役或十萬元以下罰金。致重傷者，處三年以下有期徒刑、拘役或三十萬元以下罰金。（僅作風險提示，非定性用途）',
  },
};

// === Civil Code (民法) ===

export const LAW_CIVIL: Record<string, LawReference> = {
  ART_184: {
    law: '民法',
    article: '第184條',
    summary: '因故意或過失，不法侵害他人之權利者，負損害賠償責任。違反保護他人之法律，致生損害於他人者，負賠償責任，但能證明其行為無過失者，不在此限。',
  },
  ART_191_2: {
    law: '民法',
    article: '第191條之2',
    summary: '汽車、機車或其他非依軌道行駛之動力車輛，在使用中加損害於他人者，駕駛人應賠償因此所生之損害。但於防止損害之發生，已盡相當之注意者，不在此限。',
  },
  ART_193: {
    law: '民法',
    article: '第193條',
    summary: '不法侵害他人之身體或健康者，對於被害人因此喪失或減少勞動能力或增加生活上之需要時，應負損害賠償責任。',
  },
  ART_195: {
    law: '民法',
    article: '第195條',
    summary: '不法侵害他人之身體、健康、名譽、自由、信用、隱私、貞操，或不法侵害其他人格法益而情節重大者，被害人雖非財產上之損害，亦得請求賠償相當之金額（精神慰撫金）。',
  },
  ART_197: {
    law: '民法',
    article: '第197條',
    summary: '因侵權行為所生之損害賠償請求權，自請求權人知有損害及賠償義務人時起，二年間不行使而消滅；自有侵權行為時起，逾十年者亦同。',
  },
};

// === Legal Disclaimer ===

export const LEGAL_DISCLAIMER = {
  text: '本系統依據公開法規提供資訊參考與流程導航，不構成法律意見。個案情況各異，涉及權益事項請諮詢律師或法律扶助基金會（電話：412-8518）。',
  legalAidPhone: '412-8518',
  legalAidUrl: 'https://www.laf.org.tw',
} as const;

// === Forbidden output types (hard block) ===

export const FORBIDDEN_OUTPUTS = [
  'liability_determination',
  'win_probability',
  'settlement_amount',
  'legal_strategy',
  'fault_percentage',
] as const;
