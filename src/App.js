import { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// ━━━ ① ここをFirebaseの設定に書き換えてください ━━━
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBLG1Xkh1Oba_gdwG_jZAPaV8hLIDBQBsA",
  authDomain:        "bekkan-pa.firebaseapp.com",
  projectId:         "bekkan-pa",
  storageBucket:     "bekkan-pa.firebasestorage.app",
  messagingSenderId: "688298009058",
  appId:             "1:688298009058:web:ace8b15bfd40604aef59bb",
};
const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db   = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// ── TOKENS ───────────────────────────────────────────────────────────
const G    = "#C8A84B";
const GB   = "rgba(200,168,75,0.08)";
const GBH  = "rgba(200,168,75,0.16)";
const BG   = "#090909";
const C1   = "#111111";
const C2   = "#191919";
const C3   = "#212121";
const BR   = "#242424";
const BR2  = "#2E2E2E";
const TX   = "#EDE8DF";
const TM   = "#888888";
const TS   = "#3A3A3A";

const SECTIONS  = ["ホール","アフター","BAR","ソムリエ"];
const SEC_COLOR = { "ホール":"#C8A84B","アフター":"#A89060","BAR":"#8A9AAA","ソムリエ":"#C4A870" };

// ── STAFF ─────────────────────────────────────────────────────────────
const INITIAL_STAFF_DATA = {
  {id:1,  last:"堀口",   section:"ホール"},
  {id:2,  last:"木村大", section:"ホール"},
  {id:3,  last:"杉木",   section:"ホール"},
  {id:4,  last:"西川",   section:"ホール"},
  {id:5,  last:"長江",   section:"ホール"},
  {id:6,  last:"尾本",   section:"ホール"},
  {id:7,  last:"高木彩", section:"ホール"},
  {id:8,  last:"鈴木大", section:"ホール"},
  {id:9,  last:"森",     section:"ホール"},
  {id:10, last:"浦辺",   section:"ホール"},
  {id:11, last:"高木一", section:"ホール"},
  {id:12, last:"古賀尚", section:"ホール"},
  {id:13, last:"須田",   section:"ホール"},
  {id:14, last:"遠藤",   section:"ホール"},
  {id:15, last:"塚原",   section:"ホール"},
  {id:16, last:"阪田",   section:"ホール"},
  {id:17, last:"鈴木蓮", section:"ホール"},
  {id:18, last:"小川",   section:"ホール"},
  {id:19, last:"馬越",   section:"ホール"},
  {id:20, last:"羽地",   section:"ホール"},
  {id:21, last:"徳澤",   section:"ホール"},
  {id:22, last:"進藤",   section:"ホール"},
  {id:23, last:"佐藤蘭", section:"ホール"},
  {id:24, last:"新城",   section:"ホール"},
  {id:25, last:"森島",   section:"ホール"},
  {id:26, last:"古川",   section:"ホール"},
  {id:27, last:"児玉",   section:"ホール"},
  {id:28, last:"小宮",   section:"ホール"},
  {id:29, last:"鈴木瞳", section:"ホール"},
  {id:30, last:"早坂武", section:"ホール"},
  {id:31, last:"小池",   section:"ホール"},
  {id:32, last:"田中",   section:"ホール"},
  {id:33, last:"奥野",   section:"ホール"},
  {id:34, last:"菊池",   section:"ホール"},
  {id:35, last:"小倉",   section:"アフター"},
  {id:36, last:"澤出",   section:"アフター"},
  {id:37, last:"辛",     section:"アフター"},
  {id:38, last:"中林",   section:"アフター"},
  {id:39, last:"鈴木敏", section:"BAR"},
  {id:40, last:"横山",   section:"BAR"},
  {id:41, last:"伊藤",   section:"BAR"},
  {id:42, last:"川端",   section:"BAR"},
  {id:43, last:"野島",   section:"BAR"},
  {id:44, last:"丹羽",   section:"BAR"},
  {id:45, last:"武田",   section:"BAR"},
  {id:46, last:"東",     section:"BAR"},
  {id:47, last:"野田",   section:"BAR"},
  {id:48, last:"大谷",   section:"ソムリエ"},
};

const DEFAULT_SD = { fullName:"", startDate:"", lv:1, shiftRate:0, lateCount:0, score:0 };

// Firestoreデータ → なければ初期値 → なければデフォルト の順で参照
function getStaffData(paId, allStaffData) {
  const fromDB = allStaffData[paId];
  const initial = INITIAL_STAFF_DATA[paId] || DEFAULT_SD;
  if (!fromDB) return initial;
  // DBに保存された値を優先しつつ、未入力項目は初期値で補完
  return {
    fullName:  fromDB.fullName  || initial.fullName,
    startDate: fromDB.startDate || initial.startDate,
    lv:        fromDB.lv        || initial.lv,
    shiftRate: fromDB.shiftRate !== undefined ? fromDB.shiftRate : initial.shiftRate,
    lateCount: fromDB.lateCount !== undefined ? fromDB.lateCount : initial.lateCount,
    score:     fromDB.score     !== undefined ? fromDB.score     : initial.score,
    photo:     fromDB.photo     || "",
  };
}
  1:  {fullName:"堀口 敬巧",   startDate:"2011-07-02", lv:5, shiftRate:0, lateCount:0, score:0},
  2:  {fullName:"木村 大翔",   startDate:"2024-05-01", lv:3, shiftRate:0, lateCount:0, score:0},
  3:  {fullName:"杉野 航平",   startDate:"2024-05-01", lv:4, shiftRate:0, lateCount:0, score:0},
  4:  {fullName:"西川 旺輝",   startDate:"2024-05-01", lv:1, shiftRate:0, lateCount:0, score:0},
  5:  {fullName:"長江 海星",   startDate:"2024-05-01", lv:3, shiftRate:0, lateCount:0, score:0},
  6:  {fullName:"尾本 卓也",   startDate:"2024-05-01", lv:5, shiftRate:0, lateCount:0, score:0},
  7:  {fullName:"髙木 彰良",   startDate:"2024-07-02", lv:3, shiftRate:0, lateCount:0, score:0},
  8:  {fullName:"鈴木 大介",   startDate:"2024-07-26", lv:3, shiftRate:0, lateCount:0, score:0},
  9:  {fullName:"森 航佑",     startDate:"2024-08-18", lv:3, shiftRate:0, lateCount:0, score:0},
  10: {fullName:"浦邉 真聖",   startDate:"2024-09-06", lv:2, shiftRate:0, lateCount:0, score:0},
  11: {fullName:"髙木 一哉",   startDate:"2025-01-13", lv:1, shiftRate:0, lateCount:0, score:0},
  12: {fullName:"古賀 尚章",   startDate:"2025-03-28", lv:1, shiftRate:0, lateCount:0, score:0},
  13: {fullName:"須田 和太郎", startDate:"2025-06-06", lv:1, shiftRate:0, lateCount:0, score:0},
  15: {fullName:"塚原 元気",   startDate:"2025-07-10", lv:1, shiftRate:0, lateCount:0, score:0},
  16: {fullName:"阪田 駿策",   startDate:"2025-09-17", lv:1, shiftRate:0, lateCount:0, score:0},
  17: {fullName:"鈴木 蓮太郎", startDate:"2025-09-27", lv:1, shiftRate:0, lateCount:0, score:0},
  18: {fullName:"小川 壮健",   startDate:"2025-10-27", lv:1, shiftRate:0, lateCount:0, score:0},
  19: {fullName:"馬越 翼",     startDate:"2025-11-14", lv:1, shiftRate:0, lateCount:0, score:0},
  21: {fullName:"徳澤 佑",     startDate:"2026-01-11", lv:1, shiftRate:0, lateCount:0, score:0},
  22: {fullName:"進藤 凜雄",   startDate:"2026-01-21", lv:1, shiftRate:0, lateCount:0, score:0},
  23: {fullName:"佐藤 欄",     startDate:"2026-02-28", lv:2, shiftRate:0, lateCount:0, score:0},
  26: {fullName:"古川 友哉",   startDate:"2026-02-27", lv:1, shiftRate:0, lateCount:0, score:0},
  35: {fullName:"小倉 功也",   startDate:"2025-08-14", lv:1, shiftRate:0, lateCount:0, score:0},
  36: {fullName:"澤出 慶太",   startDate:"2025-12-19", lv:5, shiftRate:0, lateCount:0, score:0},
  37: {fullName:"辛 善道",     startDate:"2025-12-23", lv:5, shiftRate:0, lateCount:0, score:0},
  38: {fullName:"中林 聖",     startDate:"2025-12-29", lv:5, shiftRate:0, lateCount:0, score:0},
  40: {fullName:"横山 漣",     startDate:"2024-12-16", lv:1, shiftRate:0, lateCount:0, score:0},
  41: {fullName:"伊藤 ゆめ",   startDate:"2025-09-24", lv:1, shiftRate:0, lateCount:0, score:0},
  42: {fullName:"川端 菜月",   startDate:"2025-03-31", lv:1, shiftRate:0, lateCount:0, score:0},
  43: {fullName:"野島 遥斗",   startDate:"2025-12-16", lv:1, shiftRate:0, lateCount:0, score:0},
  44: {fullName:"丹羽 和",     startDate:"2026-01-24", lv:1, shiftRate:0, lateCount:0, score:0},
  45: {fullName:"武田 裕司",   startDate:"2026-02-02", lv:1, shiftRate:0, lateCount:0, score:0},
  48: {fullName:"大山 提地",   startDate:"2025-07-22", lv:1, shiftRate:0, lateCount:0, score:0},
};

const PHASE_META = [
  {lv:1, phase:"PHASE 1", label:"新人",     wage:1400},
  {lv:2, phase:"PHASE 2", label:"一人前",   wage:1500},
  {lv:3, phase:"PHASE 3", label:"中堅",     wage:1600},
  {lv:4, phase:"PHASE 4", label:"ベテラン", wage:1800},
  {lv:5, phase:"PHASE 5", label:"エース",   wage:2000},
];

const CHECKLIST = {
  1:[
    {cat:"心構え・基本姿勢", items:[
      "お客様・上司・先輩に対して敬語を使える",
      "相手の顔と目を見て元気よく挨拶ができる",
      "清潔感があり、お客様に不快な印象を与えない",
      "疑問点や教えてもらった事に対し素直に学び、自ら質問できる",
      "上司・同僚・後輩と円滑に業務を行うためのコミュニケーションが取れる",
      "上長に報告・連絡・相談ができる（休憩時も必ずセンター報告）",
      "閑散時に自分から仕事を探す自主性がある",
      "上司からの指示に迅速に対応できる",
      "業務において人任せにせず率先して行動できる",
    ]},
    {cat:"接客・サービス基本", items:[
      "ダウンサービスを理解し、実践できる",
      "立ち姿勢（背筋・手の位置）が正しくできる",
      "店内で走らず、早足で機敏に動ける",
      "グラスを下げる際に「こちらお下げ致します」と断りを入れられる",
      "「わかりません」で終わらず「確認致します」と対応できる",
      "お客様の顔を見て、コールを逃さず対応できる",
      "オーダーとドリンク提供の優先順位を理解している",
    ]},
    {cat:"グラス類知識", items:[
      "コリンズグラスの用途を答えられる",
      "焼酎グラスの用途を答えられる",
      "10タングラスの用途を答えられる",
      "チェイサーグラスの用途を答えられる",
      "女性用グラスの用途を答えられる",
      "ロックグラスの用途を答えられる",
      "8タングラス（ホット用）の用途を答えられる",
      "ワイングラス3種（モンラッシェ・ブルゴーニュ・ボルドー・キャンティ）を区別できる",
      "各グラスの注ぎ量の目安を把握している",
    ]},
    {cat:"伝票・オーダー", items:[
      "伝票の書き方（卓番・客数・係・品名・数量）を正しく書ける",
      "女性会員のドリンクに○をつけることができる",
      "ファーストドリンク時に「N」を客数欄に記入できる",
      "ラストオーダー時に「L」を客数欄に記入できる",
      "オーダー名を各自判断で省略せず、誰が見てもわかるように書ける",
      "書き換えが必要なドリンクの略語を覚えている（チャイナローズシロなし等）",
      "ドリンクとフードの伝票を分けて書ける",
      "インカムでのオーダーはやむを得ない場合のみであることを理解している",
    ]},
    {cat:"ランナー・基本業務", items:[
      "ランナー業務を滞りなく遂行できる",
      "インカムに対して適切に反応できる",
      "掃除・ホール・個室・トイレのクローズが完璧にできる",
      "灰皿交換（吸い殻2本で交換）を正しくできる",
      "おしぼりの提供・交換のタイミングを理解している",
      "バッシングの正しい手順ができる（グラスの持ち方含む）",
      "ゲストアウト後すぐに忘れ物チェックができる",
    ]},
    {cat:"各種対応・基礎", items:[
      "フード対応の基本フロー（伝票・カトラリー準備・提供）ができる",
      "タバコ対応（現金処理・伝票付けの判断）ができる",
      "シーシャ対応（在庫確認・現金受取り）ができる",
      "Wi-Fi・空調・タクシー依頼の基本対応ができる",
      "クラッシュ時の対応手順（インカム→清掃→報告）ができる",
      "卓の禁止事項（持ち込み・撮影・接触等）を把握し報告できる",
      "休憩のルール（センター報告・代わりの人員確保）を守れる",
      "飲酒を勧められた際に丁重に断ることができる",
    ]},
    {cat:"昇格要件", promo:true, items:[
      "エスコートの名前を全員覚えている",
      "勤怠に問題がない（遅刻・欠勤が月1回以内）",
      "勤続1ヶ月以上",
    ]},
  ],
  2:[
    {cat:"ラウンジ・トップ業務", items:[
      "F1〜F4側のトップ業務ができる",
      "F5〜F9側のトップ業務ができる",
      "ラウンジ対応中のコールが平均3回以内（研修外れ済み）",
      "ファーストドリンクの重要性を理解し、迅速に提供できる",
      "オーダープッシュのタイミング（グラス2〜3割）を理解し実践できる",
      "女性会員のオーダー取りの手順（男性側に許可を取る）を実践できる",
    ]},
    {cat:"ドリンク・ボトル知識", items:[
      "グラスワインを適量注げる",
      "ウイスキー・焼酎BTLの対応がスムーズにできる",
      "5万円以下のボトル対応がスムーズにできる",
      "シャンパン・ワインの値段を把握している",
      "シャンパン主要銘柄（クリスタル・クリュッグ・ドンペリ・ベルエポック等）を覚えている",
      "ドリンクバック（DB）の仕組みを理解し正しく計上できる",
      "キープの伝票の書き方（2種類）を正しくできる",
    ]},
    {cat:"ドリチェ・転卓・会計", items:[
      "ドリンクチェック（ドリチェ）の手順を正確にできる",
      "転卓時の伝票・ドリチェ・引き継ぎ手順を正しくできる",
      "ラストオーダーの流れ（24:30・L記入・追加対応）を正しくできる",
      "チェック（会計）の合図を理解し、正しい手順で対応できる",
      "ゲストアウトの手順（B1・B2別）を正しくできる",
      "ステイ・戻しステイ・リクエストの違いを理解し報告できる",
    ]},
    {cat:"新人育成補助", items:[
      "新人に対するランナー業務の研修を任せられる",
      "新人に対するトップ研修ができる（研修マニュアルに基づく）",
    ]},
    {cat:"昇格要件", promo:true, items:[
      "ドリンクメニュー・ボトル値段・フードテストに合格（95点以上）",
      "出勤日数が月10日以上",
    ]},
  ],
  3:[
    {cat:"個室担当・基本フロー", items:[
      "予約確定から入客までの準備フロー（テーブルセット・情報確認・アミューズ確認）ができる",
      "入客フロー全体（①インカム発信〜⑧オーダー伝票）を正しく実行できる",
      "個室1部屋を自立して担当できる【Jr1・R9・A1】",
      "個室2部屋を担当できる【A1・A2・Jr2・W】",
      "個室対応中のコールが平均3回以内",
      "お客様・エスコートからクレームがない",
      "優先順位を理解している（インカム・イレギュラー対応・ボトル等）",
    ]},
    {cat:"個室特有のサービス", items:[
      "ブランケット・モバイルバッテリー・スリッパ・トランプ等の貸し出し対応ができる",
      "照明調光器の操作ができる",
      "個室でのフード対応（カトラリー・フルーツトング・姫フォーク等準備）ができる",
      "個室でのゲストアウト（エレベーター案内・忘れ物確認）ができる",
      "卓の禁止事項（個室版）の対応・報告ができる",
      "空調・Wi-Fi・タクシー・運転代行の個室対応ができる",
    ]},
    {cat:"高額ボトル・シガー対応", items:[
      "お客様の前で10万円以上のボトル抜栓ができる",
      "焼酎・ウイスキーBTL対応が迅速にできる。ドリンクメイクが正確",
      "先読みサービス（お客様から請求が来る前にドリンクを作り・注ぐ）ができる",
      "シガー対応ができる（シガーカット・火付け）",
      "個室でのシャンパン・ワインボトル対応（グラス準備〜抜栓〜サーブ）ができる",
      "個室でのテキーラボトル対応ができる",
    ]},
    {cat:"個室別対応", items:[
      "R9A1の椅子引き業務ができる",
      "Jr1・Jr2・和室でのキッチン前配膳台の活用ができる",
      "和室での靴対応（靴箱・内履き・外履き）ができる",
      "スイートルームのファースト対応フロー（部屋付きシャンパン・アミューズ等）ができる",
      "スイート・パーティスイートのオペレーション補助ができる",
    ]},
    {cat:"新人育成", items:["新人に対する個室研修ができる（研修マニュアルに基づく）"]},
    {cat:"昇格要件", promo:true, items:["個室実技テスト60点以上","勤続3ヶ月以上"]},
  ],
  4:[
    {cat:"高度な顧客対応", items:[
      "顧客の顔と名前を20組以上把握し、挨拶ができる",
      "特別対応者を5組以上対応できる（特別対応表に基づく）",
      "特別対応表に記載されている内容を理解し自ら確認・準備できる",
      "お客様の好み・習慣を把握し、先読みサービスができる",
    ]},
    {cat:"店舗オペレーション", items:[
      "ポーター業務ができる（センター・フロントから合格をもらえる）",
      "SW対応ができる",
      "MAMO営業を滞りなく遂行できる",
      "アフターヘルプに積極的に参加できる",
      "複数卓を同時にコントロールし、優先順位をつけて動ける",
      "混雑時でも伝票ミス・提供ミスなく業務遂行できる",
    ]},
    {cat:"後輩育成・チームサポート", items:[
      "Lv.1〜Lv.3の研修項目を他スタッフに指導できる",
      "新人・中堅の動きを観察し、適切なタイミングでフォローできる",
      "研修マニュアルの内容を正しく伝えられる",
    ]},
    {cat:"昇格要件", promo:true, items:["出勤日数が月16日以上","勤続6ヶ月以上"]},
  ],
  5:[
    {cat:"センター補佐・リーダーシップ", items:[
      "センターサブ業務ができる",
      "営業全体の状況を把握し、適切な指示・調整ができる",
      "イレギュラー発生時に自ら判断・対応し、センターに適切に報告できる",
      "パーティスイート等の大型オペレーションをリードできる",
    ]},
    {cat:"育成体制の中核", items:[
      "特別対応者を10組以上対応できる（特別対応表に基づく）",
      "後輩スタッフの評価・フィードバックをマネージャーに報告できる",
      "育成チェックリストを活用し、担当スタッフの進捗を管理できる",
      "研修内容の改善提案をマネージャーに行える",
    ]},
    {cat:"昇格要件", promo:true, items:["出勤日数が月18日以上","勤続1年以上"]},
  ],
};

// ── HELPERS ──────────────────────────────────────────────────────────
function calcTenure(startDate) {
  if (!startDate) return null;
  const s = new Date(startDate);
  const n = new Date();
  const months = (n.getFullYear() - s.getFullYear()) * 12 + (n.getMonth() - s.getMonth());
  if (months < 0) return "0ヶ月";
  if (months >= 12) return `${Math.floor(months / 12)}年${months % 12}ヶ月`;
  return `${months}ヶ月`;
}

function fmtDate(d) {
  return d ? d.replace(/-/g, "/") : "";
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function compressImage(file) {
  return new Promise(function(resolve) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const MAX = 300;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function allItemKeys(lv) {
  const keys = [];
  Object.entries(CHECKLIST).forEach(([k, cats]) => {
    if (Number(k) > lv) return;
    cats.forEach((cat, ci) => {
      cat.items.forEach((_, ii) => keys.push(`${k}_${ci}_${ii}`));
    });
  });
  return keys;
}

// ── FIRESTORE I/O ─────────────────────────────────────────────
async function sGet(key) {
  try {
    var snap = await getDoc(doc(db, "bekkan", key));
    return snap.exists() ? snap.data().v : null;
  } catch(e) { return null; }
}
async function sSet(key, val) {
  try { await setDoc(doc(db, "bekkan", key), { v: val }); }
  catch(e) { console.error("Firestore write error:", e); }
}
function sListen(key, cb) {
  return onSnapshot(doc(db, "bekkan", key), function(snap) {
    cb(snap.exists() ? snap.data().v : null);
  });
}

// ── ATOMS ─────────────────────────────────────────────────────────────
function GoldBar({ pct, h }) {
  const height = h || 2;
  const width = Math.min(100, pct || 0);
  return (
    <div style={{ height: height, background: TS, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: width + "%", background: G, borderRadius: 2, transition: "width .5s" }} />
    </div>
  );
}

function PhaseTag({ phase }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: G, fontFamily: "monospace" }}>
      {phase}
    </span>
  );
}

function Stars({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(function(i) {
        return (
          <span
            key={i}
            onClick={function() { if (onChange) onChange(i); }}
            onMouseEnter={function() { if (onChange) setHov(i); }}
            onMouseLeave={function() { if (onChange) setHov(0); }}
            style={{ cursor: onChange ? "pointer" : "default", fontSize: 15, color: i <= (hov || value) ? G : TS, transition: "color .15s" }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: C3, border: "1px solid " + BR2,
  borderRadius: 8, padding: "8px 10px", color: TX, fontSize: 12,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const labelStyle = {
  fontSize: 10, color: TM, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", marginBottom: 5, display: "block",
};

// ── CHECKLIST TAB ─────────────────────────────────────────────────────
function ChecklistTab({ paId, paLv }) {
  const [checks, setChecks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    sGet("bekkan-cl-" + paId).then(function(d) {
      setChecks(d || {});
      setLoading(false);
    });
  }, [paId]);

  async function toggle(key, lvNum) {
    if (lvNum > paLv) return;
    const next = Object.assign({}, checks);
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = { done: true, date: todayStr() };
    }
    setChecks(next);
    await sSet("bekkan-cl-" + paId, next);
  }

  if (loading) {
    return <div style={{ padding: 32, color: TM, textAlign: "center" }}>読み込み中...</div>;
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {Object.entries(CHECKLIST).map(function([lv, cats]) {
        const lvNum = Number(lv);
        const meta = PHASE_META[lvNum - 1];
        const lvKeys = [];
        cats.forEach(function(cat, ci) {
          cat.items.forEach(function(_, ii) { lvKeys.push(lv + "_" + ci + "_" + ii); });
        });
        const done = lvKeys.filter(function(k) { return checks[k]; }).length;
        const pct = Math.round((done / lvKeys.length) * 100);
        const active = lvNum <= paLv;

        return (
          <div key={lv} style={{ opacity: active ? 1 : 0.4 }}>
            <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid " + BR, background: lvNum === paLv ? GB : "transparent", position: "sticky", top: 0, zIndex: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                <div>
                  <PhaseTag phase={meta.phase} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: TX, marginTop: 3 }}>
                    {meta.label}
                    <span style={{ fontSize: 10, color: TM, fontWeight: 400, marginLeft: 8 }}>¥{meta.wage.toLocaleString()}/h</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: pct === 100 ? G : TM }}>
                  {done}/{lvKeys.length} {pct === 100 ? "✓" : pct + "%"}
                </span>
              </div>
              <GoldBar pct={pct} />
            </div>
            {cats.map(function(cat, ci) {
              return (
                <div key={ci}>
                  <div style={{ padding: "9px 20px 5px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: cat.promo ? G : TM, textTransform: "uppercase", borderBottom: "1px solid " + BR }}>
                    {cat.promo ? "▲ " : ""}{cat.cat}
                  </div>
                  {cat.items.map(function(item, ii) {
                    const key = lv + "_" + ci + "_" + ii;
                    const checked = checks[key];
                    return (
                      <div
                        key={ii}
                        onClick={function() { toggle(key, lvNum); }}
                        style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 20px", borderBottom: "1px solid " + BR, cursor: active ? "pointer" : "default", background: checked ? GB : "transparent" }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1, border: "1.5px solid " + (checked ? G : BR2), background: checked ? G : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                          {checked && <span style={{ color: "#000", fontSize: 10, fontWeight: 900 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, color: checked ? TX : "#888", lineHeight: 1.5 }}>{item}</div>
                          {checked && <div style={{ fontSize: 10, color: G, marginTop: 2 }}>習得日 {fmtDate(checked.date)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── OJT TAB ──────────────────────────────────────────────────────────
const EMPTY_SESSION = { date: "", trainer: "", phase: "PHASE 1", content: "", rating: 0 };

function OJTTab({ paId }) {
  const [sessions, setSessions] = useState(
    Array.from({ length: 10 }, function(_, i) {
      return Object.assign({ session: i + 1 }, EMPTY_SESSION);
    })
  );
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(Object.assign({}, EMPTY_SESSION));
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    sGet("bekkan-ojt-" + paId).then(function(d) {
      if (d) setSessions(d);
      setLoading(false);
    });
  }, [paId]);

  function openEdit(s) {
    setForm({ date: s.date, trainer: s.trainer, phase: s.phase || "PHASE 1", content: s.content, rating: s.rating });
    setEditing(s.session);
  }

  async function saveSession() {
    const next = sessions.map(function(s) {
      return s.session === editing ? Object.assign({}, s, form) : s;
    });
    setSessions(next);
    await sSet("bekkan-ojt-" + paId, next);
    setEditing(null);
  }

  async function clearSession(num) {
    const next = sessions.map(function(s) {
      return s.session === num ? Object.assign({ session: num }, EMPTY_SESSION) : s;
    });
    setSessions(next);
    await sSet("bekkan-ojt-" + paId, next);
    setEditing(null);
  }

  if (loading) {
    return <div style={{ padding: 32, color: TM, textAlign: "center" }}>読み込み中...</div>;
  }

  const filled = sessions.filter(function(s) { return s.content || s.date; }).length;

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ padding: "12px 20px 14px", borderBottom: "1px solid " + BR }}>
        <div style={{ fontSize: 10, color: TM, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>OJT セッション記録</div>
        <div style={{ fontSize: 12, color: TM, marginBottom: 6 }}>
          <span style={{ color: G, fontWeight: 700 }}>{filled}</span> / 10 セッション記録済み
        </div>
        <GoldBar pct={(filled / 10) * 100} />
      </div>

      {sessions.map(function(s) {
        const hasData = !!(s.content || s.date);
        const isEditing = editing === s.session;
        return (
          <div key={s.session} style={{ margin: "8px 14px", background: hasData ? C2 : C1, border: "1px solid " + (isEditing ? G + "55" : hasData ? BR2 : BR), borderRadius: 10, overflow: "hidden" }}>
            <div
              onClick={function() { if (!isEditing) openEdit(s); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 8px", borderBottom: "1px solid " + BR, background: hasData ? GB : "transparent", cursor: isEditing ? "default" : "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: hasData ? G : TS, color: hasData ? "#000" : TM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                  {s.session}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: hasData ? TX : TM }}>
                    {hasData ? "第" + s.session + "回 OJT" : "第" + s.session + "回 — 未記録"}
                  </div>
                  {s.date && <div style={{ fontSize: 10, color: TM }}>{fmtDate(s.date)}</div>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {(s.phase && hasData) && <PhaseTag phase={s.phase} />}
                {s.rating > 0 && <Stars value={s.rating} />}
                {!hasData && <span style={{ fontSize: 10, color: TM }}>＋ 記録を追加</span>}
              </div>
            </div>

            {(hasData && !isEditing) && (
              <div style={{ padding: "12px 14px" }}>
                {s.trainer && (
                  <div style={{ fontSize: 10, color: G, marginBottom: 6, fontWeight: 700 }}>👤 {s.trainer}</div>
                )}
                <div style={{ fontSize: 12.5, color: TX, lineHeight: 1.7, background: C3, borderRadius: 8, padding: "10px 12px", borderLeft: "3px solid " + G, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {s.content}
                </div>
              </div>
            )}

            {isEditing && (
              <div style={{ padding: 14 }} onClick={function(e) { e.stopPropagation(); }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={labelStyle}>実施日</label>
                    <input type="date" value={form.date} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { date: e.target.value }); }); }} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>担当者名</label>
                    <input value={form.trainer} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { trainer: e.target.value }); }); }} placeholder="山田マネージャー" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>フェーズ</label>
                  <select value={form.phase} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { phase: e.target.value }); }); }} style={inputStyle}>
                    {["PHASE 1","PHASE 2","PHASE 3","PHASE 4","PHASE 5"].map(function(p) {
                      return <option key={p} value={p}>{p}</option>;
                    })}
                  </select>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>記録内容</label>
                  <textarea
                    value={form.content}
                    onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { content: e.target.value }); }); }}
                    placeholder="実施内容・気づき・次回の課題など..."
                    rows={4}
                    style={Object.assign({}, inputStyle, { resize: "vertical", lineHeight: 1.6 })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>評価</label>
                  <Stars value={form.rating} onChange={function(r) { setForm(function(f) { return Object.assign({}, f, { rating: r }); }); }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveSession} style={{ flex: 1, background: G, color: "#000", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>保存</button>
                  {hasData && (
                    <button onClick={function() { clearSession(s.session); }} style={{ background: "transparent", color: TM, border: "1px solid " + BR2, borderRadius: 8, padding: "9px 14px", fontSize: 12, cursor: "pointer" }}>削除</button>
                  )}
                  <button onClick={function() { setEditing(null); }} style={{ background: "transparent", color: TM, border: "1px solid " + BR2, borderRadius: 8, padding: "9px 14px", fontSize: 12, cursor: "pointer" }}>キャンセル</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────
function ProfileTab({ pa, staffData, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName:  staffData.fullName  || "",
    startDate: staffData.startDate || "",
    lv:        staffData.lv        || 1,
    shiftRate: staffData.shiftRate || 0,
    lateCount: staffData.lateCount || 0,
    score:     staffData.score     || 0,
    photo:     staffData.photo     || "",
  });

  useEffect(function() {
    setForm({
      fullName:  staffData.fullName  || "",
      startDate: staffData.startDate || "",
      lv:        staffData.lv        || 1,
      shiftRate: staffData.shiftRate || 0,
      lateCount: staffData.lateCount || 0,
      score:     staffData.score     || 0,
      photo:     staffData.photo     || "",
    });
  }, [staffData]);

  async function save() {
    await onUpdate(form);
    setEditing(false);
  }

  const tenure = calcTenure(staffData.startDate);
  const lv = staffData.lv || 1;
  const meta = PHASE_META[lv - 1];

  if (editing) {
    return (
      <div style={{ padding: "20px 20px 40px" }}>

        {/* Photo upload */}
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <label style={labelStyle}>顔写真</label>
          <div style={{ position: "relative" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", overflow: "hidden", background: GB, border: "2px solid " + (form.photo ? G : BR2), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: G }}>
              {form.photo ? (
                <img src={form.photo} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (form.fullName || pa.last).slice(0, 1)
              )}
            </div>
            <label style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, border: "2px solid " + C1 }}>
              📷
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const compressed = await compressImage(file);
                setForm(function(f) { return Object.assign({}, f, { photo: compressed }); });
              }} />
            </label>
          </div>
          {form.photo && (
            <button onClick={function() { setForm(function(f) { return Object.assign({}, f, { photo: "" }); }); }} style={{ fontSize: 10, color: TM, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              写真を削除
            </button>
          )}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>フルネーム</label>
          <input value={form.fullName} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { fullName: e.target.value }); }); }} placeholder={pa.last + "（フルネームを入力）"} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 12, padding: 14, background: GB, border: "1px solid " + G + "33", borderRadius: 10 }}>
          <label style={Object.assign({}, labelStyle, { color: G })}>入社日 — 勤続年数が自動計算されます</label>
          <input type="date" value={form.startDate} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { startDate: e.target.value }); }); }} style={Object.assign({}, inputStyle, { border: "1px solid " + G + "55" })} />
          {form.startDate && (
            <div style={{ fontSize: 11, color: G, marginTop: 8 }}>→ 勤続 {calcTenure(form.startDate)}</div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div>
            <label style={labelStyle}>ランク</label>
            <select value={form.lv} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { lv: Number(e.target.value) }); }); }} style={inputStyle}>
              {PHASE_META.map(function(m) { return <option key={m.lv} value={m.lv}>Lv.{m.lv} {m.label}</option>; })}
            </select>
          </div>
          <div>
            <label style={labelStyle}>評価スコア</label>
            <Stars value={form.score} onChange={function(r) { setForm(function(f) { return Object.assign({}, f, { score: r }); }); }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>出勤率(%)</label>
            <input type="number" min={0} max={100} value={form.shiftRate} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { shiftRate: Number(e.target.value) }); }); }} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>遅刻・欠勤回数</label>
            <input type="number" min={0} value={form.lateCount} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { lateCount: Number(e.target.value) }); }); }} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save} style={{ flex: 1, background: G, color: "#000", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>保存</button>
          <button onClick={function() { setEditing(false); }} style={{ background: "transparent", color: TM, border: "1px solid " + BR2, borderRadius: 8, padding: "10px 16px", fontSize: 12, cursor: "pointer" }}>キャンセル</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px" }}>

      {/* Photo display in view mode */}
      {staffData.photo && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid " + G + "44" }}>
            <img src={staffData.photo} alt={staffData.fullName || pa.last} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      )}

      <div style={{ background: staffData.startDate ? GB : C2, border: "1px solid " + (staffData.startDate ? G + "44" : BR), borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: TM, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>入社日 · 勤続年数</div>
        {staffData.startDate ? (
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: G, lineHeight: 1 }}>{tenure}</div>
            <div style={{ fontSize: 11, color: TM, marginTop: 4 }}>入社日 {fmtDate(staffData.startDate)}</div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: TM }}>
            未登録 —{" "}
            <span style={{ color: G, cursor: "pointer", textDecoration: "underline" }} onClick={function() { setEditing(true); }}>
              入社日を登録する →
            </span>
          </div>
        )}
      </div>

      {[
        { label: "シフト出勤率", value: (staffData.shiftRate || 0) + "%", pct: staffData.shiftRate || 0 },
        { label: "遅刻・欠勤（累計）", value: (staffData.lateCount || 0) + "回", pct: Math.max(0, 100 - (staffData.lateCount || 0) * 8) },
      ].map(function(m) {
        return (
          <div key={m.label} style={{ background: C2, border: "1px solid " + BR, borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: TM, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: G }}>{m.value}</div>
            </div>
            <GoldBar pct={m.pct} h={3} />
          </div>
        );
      })}

      <div style={{ background: C2, border: "1px solid " + BR, borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: TM, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>上司評価スコア</div>
        <Stars value={staffData.score || 0} />
      </div>

      <div style={{ background: C2, border: "1px solid " + BR, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: TM, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>基本情報</div>
        {[
          ["セクション", pa.section],
          ["ランク", "Lv." + lv + " " + meta.label],
          ["時給", "¥" + meta.wage.toLocaleString() + "/h"],
        ].map(function([k, v]) {
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid " + BR }}>
              <span style={{ fontSize: 12, color: TM }}>{k}</span>
              <span style={{ fontSize: 12, color: TX, fontWeight: 600 }}>{v}</span>
            </div>
          );
        })}
      </div>

      <button onClick={function() { setEditing(true); }} style={{ width: "100%", background: "transparent", border: "1px solid " + BR2, color: TM, borderRadius: 10, padding: "11px 0", fontSize: 12, cursor: "pointer" }}>
        ✏ プロフィール・数値を編集
      </button>
    </div>
  );
}

// ── PA MODAL ─────────────────────────────────────────────────────────
function PAModal({ pa, onClose, allStaffData, onStaffUpdate }) {
  const [tab, setTab] = useState("profile");
  const staffData = getStaffData(pa.id, allStaffData);
  const lv = staffData.lv || 1;
  const displayName = staffData.fullName || pa.last;
  const secColor = SEC_COLOR[pa.section] || G;
  const [clPct, setClPct] = useState(0);

  useEffect(function() {
    sGet("bekkan-cl-" + pa.id).then(function(d) {
      if (!d) return;
      const total = allItemKeys(lv).length;
      const done = Object.keys(d).filter(function(k) {
        return Number(k.split("_")[0]) <= lv && d[k];
      }).length;
      setClPct(total > 0 ? Math.round((done / total) * 100) : 0);
    });
  }, [pa, lv]);

  async function handleUpdate(form) {
    const next = Object.assign({}, allStaffData, { [pa.id]: Object.assign({}, staffData, form) });
    await onStaffUpdate(next);
  }

  const tenure = calcTenure(staffData.startDate);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ background: C1, width: "100%", maxWidth: 560, height: "92vh", borderRadius: "16px 16px 0 0", display: "flex", flexDirection: "column", border: "1px solid " + BR2, borderBottom: "none", overflow: "hidden" }}>

        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid " + BR, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: GB, border: "1.5px solid " + secColor + "55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: secColor, flexShrink: 0, overflow: "hidden" }}>
              {staffData.photo ? (
                <img src={staffData.photo} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                displayName.slice(0, 1)
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: TX }}>{displayName}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                    <span style={{ fontSize: 10, color: secColor, fontWeight: 700 }}>{pa.section}</span>
                    <span style={{ fontSize: 10, color: TM }}>·</span>
                    <span style={{ fontSize: 10, color: TM }}>
                      {tenure ? ("勤続 " + tenure) : "入社日未登録"}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} style={{ background: C3, border: "1px solid " + BR2, color: TM, borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 10, color: G, border: "1px solid " + G + "44", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>
                  Lv.{lv} {PHASE_META[lv - 1].label}
                </span>
                <span style={{ fontSize: 11, color: TM }}>
                  研修 <span style={{ color: G, fontWeight: 700 }}>{clPct}%</span>
                </span>
              </div>
            </div>
          </div>
          <GoldBar pct={clPct} />
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid " + BR, flexShrink: 0 }}>
          {[["profile","プロフィール"],["checklist","チェックリスト"],["ojt","OJT ログ"]].map(function([k, l]) {
            return (
              <button key={k} onClick={function() { setTab(k); }} style={{ flex: 1, background: "transparent", border: "none", borderBottom: "2px solid " + (tab === k ? G : "transparent"), color: tab === k ? G : TM, padding: "12px 0", fontSize: 12, fontWeight: tab === k ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                {l}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "profile"   && <ProfileTab pa={pa} staffData={staffData} onUpdate={handleUpdate} />}
          {tab === "checklist" && <ChecklistTab paId={pa.id} paLv={lv} />}
          {tab === "ojt"       && <OJTTab paId={pa.id} />}
        </div>
      </div>
    </div>
  );
}

// ── PA CARD ───────────────────────────────────────────────────────────
function PACard({ pa, staffData, allStaffData, onClick }) {
  const sd = getStaffData(pa.id, allStaffData || {});
  const lv = sd.lv || 1;
  const meta = PHASE_META[lv - 1];
  const displayName = sd.fullName || pa.last;
  const tenure = calcTenure(sd.startDate);
  const secColor = SEC_COLOR[pa.section] || G;
  const [clPct, setClPct] = useState(0);
  const [hov, setHov] = useState(false);

  useEffect(function() {
    sGet("bekkan-cl-" + pa.id).then(function(d) {
      if (!d) return;
      const total = allItemKeys(lv).length;
      const done = Object.keys(d).filter(function(k) {
        return Number(k.split("_")[0]) <= lv && d[k];
      }).length;
      setClPct(total > 0 ? Math.round((done / total) * 100) : 0);
    });
  }, [pa, lv]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      style={{ background: C1, border: "1px solid " + (hov ? secColor + "44" : BR), borderRadius: 12, padding: "13px 13px 11px", cursor: "pointer", transition: "all .2s", transform: hov ? "translateY(-1px)" : "none" }}
    >
      <div style={{ marginBottom: 7 }}><PhaseTag phase={meta.phase} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <div style={{ width: 33, height: 33, borderRadius: "50%", background: GB, border: "1.5px solid " + secColor + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: secColor, flexShrink: 0, overflow: "hidden" }}>
          {sd.photo ? (
            <img src={sd.photo} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            displayName.slice(0, 1)
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TX, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
          <div style={{ fontSize: 10, color: TM, marginTop: 1 }}>
            {tenure ? tenure : "入社日未登録"}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 9, paddingBottom: 9, borderBottom: "1px solid " + BR }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: TM }}>研修進捗</span>
          <span style={{ fontSize: 9, color: clPct === 100 ? G : TM, fontWeight: 700 }}>{clPct}%</span>
        </div>
        <GoldBar pct={clPct} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: secColor, letterSpacing: "0.06em" }}>{pa.section}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: G + "88", border: "1px solid " + G + "33", borderRadius: 4, padding: "1px 6px" }}>Lv.{lv}</span>
      </div>
    </div>
  );
}

// ── LOGIN MODAL ───────────────────────────────────────────────────────
function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch(e) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(6px)", padding: 20 }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ background: C1, border: "1px solid " + G + "44", borderRadius: 16, padding: 28, width: "100%", maxWidth: 340 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: "0.14em", marginBottom: 4 }}>BEKKAN</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: TX, marginBottom: 24 }}>マネージャーログイン</div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>メールアドレス</label>
          <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="manager@bekkan.jp" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>パスワード</label>
          <input type="password" value={password} onChange={function(e) { setPassword(e.target.value); }} placeholder="••••••••" style={inputStyle}
            onKeyDown={function(e) { if (e.key === "Enter") handleLogin(); }} />
        </div>
        {error && (
          <div style={{ fontSize: 12, color: "#E05555", marginBottom: 12, padding: "8px 12px", background: "rgba(224,85,85,0.1)", borderRadius: 8 }}>{error}</div>
        )}
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: G, color: "#000", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
          {loading ? "ログイン中..." : "ログイン"}
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "none", color: TM, marginTop: 10, padding: "8px 0", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>キャンセル</button>
      </div>
    </div>
  );
}

// ── DASHBOARD ROOT ────────────────────────────────────────────────────
export default function BekkanDashboard() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("section");
  const [filterSec, setFilterSec] = useState("ALL");
  const [allStaffData, setAllStaffData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Auth listener
  useEffect(function() {
    return onAuthStateChanged(auth, function(user) {
      setIsManager(!!user);
    });
  }, []);

  // Real-time Firestore listener for staff data
  useEffect(function() {
    const unsub = sListen("bekkan-all-staff", function(data) {
      setAllStaffData(data || {});
      setLoaded(true);
    });
    return unsub;
  }, []);

  async function handleStaffUpdate(next) {
    setAllStaffData(next);
    await sSet("bekkan-all-staff", next);
  }

  const filtered = useMemo(function() {
    let list = STAFF_BASE.filter(function(p) {
      const sd = allStaffData[p.id] || {};
      const name = sd.fullName || p.last;
      return name.includes(search) && (filterSec === "ALL" || p.section === filterSec);
    });

    if (sortBy === "name") {
      list = list.slice().sort(function(a, b) {
        return (allStaffData[a.id]?.fullName || a.last).localeCompare(allStaffData[b.id]?.fullName || b.last, "ja");
      });
    } else if (sortBy === "section") {
      list = list.slice().sort(function(a, b) {
        return SECTIONS.indexOf(a.section) - SECTIONS.indexOf(b.section);
      });
    } else if (sortBy === "lv") {
      list = list.slice().sort(function(a, b) {
        return (allStaffData[b.id]?.lv || 1) - (allStaffData[a.id]?.lv || 1);
      });
    } else if (sortBy === "score") {
      list = list.slice().sort(function(a, b) {
        return (allStaffData[b.id]?.score || 0) - (allStaffData[a.id]?.score || 0);
      });
    } else if (sortBy === "tenure") {
      list = list.slice().sort(function(a, b) {
        const da = allStaffData[a.id]?.startDate;
        const db = allStaffData[b.id]?.startDate;
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return new Date(da) - new Date(db);
      });
    }
    return list;
  }, [search, sortBy, filterSec, allStaffData]);

  const secCounts = {};
  SECTIONS.forEach(function(s) { secCounts[s] = STAFF_BASE.filter(function(p) { return p.section === s; }).length; });
  const registered = STAFF_BASE.filter(function(p) { return !!(allStaffData[p.id] && allStaffData[p.id].startDate); }).length;

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: TM, fontFamily: "sans-serif" }}>
        接続中...
      </div>
    );
  }

  const showGrouped = sortBy === "section" && filterSec === "ALL";

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; } input, textarea, select { font-family: 'Noto Sans JP', sans-serif !important; } input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }`}</style>

      <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid " + BR }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: "0.14em" }}>BEKKAN</div>
            <div style={{ fontSize: 11, color: TM, letterSpacing: "0.06em" }}>/ PA 育成ダッシュボード</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isManager ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: G, fontWeight: 700, border: "1px solid " + G + "44", borderRadius: 4, padding: "3px 8px" }}>🔓 マネージャー</span>
                <button onClick={function() { signOut(auth); }} style={{ fontSize: 10, color: TM, background: "transparent", border: "1px solid " + BR2, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>ログアウト</button>
              </div>
            ) : (
              <button onClick={function() { setShowLogin(true); }} style={{ fontSize: 10, color: TM, background: "transparent", border: "1px solid " + BR2, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}>🔒 ログイン</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid " + BR }}>
        {[
          { label: "在籍PA", value: STAFF_BASE.length, unit: "名" },
          { label: "ホール",  value: secCounts["ホール"],  unit: "名" },
          { label: "BAR",    value: secCounts["BAR"],    unit: "名" },
          { label: "その他", value: secCounts["アフター"] + secCounts["ソムリエ"], unit: "名" },
        ].map(function(s, i) {
          return (
            <div key={i} style={{ padding: "11px 14px", borderRight: i < 3 ? "1px solid " + BR : "none" }}>
              <div style={{ fontSize: 9, color: TM, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: G, lineHeight: 1 }}>
                {s.value}<span style={{ fontSize: 10, color: TM }}>{s.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "10px 14px", borderBottom: "1px solid " + BR, display: "flex", flexDirection: "column", gap: 7 }}>
        <input
          value={search}
          onChange={function(e) { setSearch(e.target.value); }}
          placeholder="名前で検索..."
          style={{ width: "100%", background: C2, border: "1px solid " + BR, borderRadius: 8, padding: "7px 12px", color: TX, fontSize: 12, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {[["section","部署順"],["name","名前順"],["lv","ランク↓"],["score","評価↓"],["tenure","勤続↓"]].map(function([k, l]) {
            return (
              <button key={k} onClick={function() { setSortBy(k); }} style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: sortBy === k ? GB : "transparent", border: "1px solid " + (sortBy === k ? G + "55" : BR), color: sortBy === k ? G : TM, cursor: "pointer" }}>
                {l}
              </button>
            );
          })}
          <div style={{ width: 1, background: BR, margin: "0 2px" }} />
          {[["ALL","全員"]].concat(SECTIONS.map(function(s) { return [s, s]; })).map(function([v, l]) {
            return (
              <button key={v} onClick={function() { setFilterSec(v); }} style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: filterSec === v ? GBH : "transparent", border: "1px solid " + (filterSec === v ? G : BR), color: filterSec === v ? G : TM, cursor: "pointer" }}>
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {showGrouped ? (
        SECTIONS.filter(function(sec) { return filtered.some(function(p) { return p.section === sec; }); }).map(function(sec) {
          const secStaff = filtered.filter(function(p) { return p.section === sec; });
          return (
            <div key={sec}>
              <div style={{ padding: "10px 16px 7px", borderBottom: "1px solid " + BR, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: SEC_COLOR[sec], letterSpacing: "0.1em" }}>{sec}</span>
                <span style={{ fontSize: 10, color: TM }}>{secStaff.length}名</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 7, padding: "8px 10px" }}>
                {secStaff.map(function(pa) {
                  return <PACard key={pa.id} pa={pa} staffData={allStaffData[pa.id]} allStaffData={allStaffData} onClick={function() { setSelected(pa); }} />;
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 7, padding: "10px" }}>
          {filtered.map(function(pa) {
            return <PACard key={pa.id} pa={pa} staffData={allStaffData[pa.id]} allStaffData={allStaffData} onClick={function() { setSelected(pa); }} />;
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: TM, padding: 40, fontSize: 13 }}>
              該当するスタッフが見つかりません
            </div>
          )}
        </div>
      )}

      {selected && (
        <PAModal
          pa={selected}
          onClose={function() { setSelected(null); }}
          allStaffData={allStaffData}
          onStaffUpdate={handleStaffUpdate}
          isManager={isManager}
        />
      )}
      {showLogin && <LoginModal onClose={function() { setShowLogin(false); }} />}
    </div>
  );
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
② Firestore セキュリティルール
   Firebaseコンソール → Firestore → ルール に貼り付け
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bekkan/{document} {
      allow read: true;
      allow write: if request.auth != null;
    }
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
③ StackBlitz セットアップ手順（全体の流れ）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. firebase.google.com でプロジェクト作成
2. Firestoreデータベースを作成（本番モードで開始）
3. Authentication → ログイン方法 → メール/パスワード を有効化
4. ユーザーを追加（マネージャーのメール＆パスワードを設定）
5. プロジェクト設定 → Firebase SDK設定 → 設定をコピー
6. このファイルの FIREBASE_CONFIG に貼り付け
7. Firestoreのセキュリティルールを上記に設定
8. stackblitz.com/fork/react-ts を開く
9. ターミナルで: npm install firebase
10. App.tsx をこのファイルの内容に置き換え
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
