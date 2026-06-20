// セーブデータの入出力と健全化（REQUIREMENTS.md 5.2 / 2.3）。
// ロジック（純粋関数）と localStorage 副作用を分離する（CLAUDE.md §5 / §10）。
// - sanitizeSave / parseSave / recordCollect は純粋関数でテスト対象。
// - loadSave / saveSave は Storage 注入可能な薄いラッパ（テストはモックで通せる）。

import { SAVE_KEY } from "../config";

/** 1アイテムの取得記録。 */
export interface CollectedEntry {
  /** 取得個数（ダブり含む）。 */
  count: number;
  /** 初回取得日時（エポックミリ秒、NEW判定の起点）。 */
  firstSeenAt: number;
  /**
   * 図鑑の詳細を開いて確認済みか（フェーズ5）。
   * false の間だけ図鑑に「NEW」を出し、詳細を開くと true にする（task.md 仮決め）。
   */
  seen: boolean;
}

/** localStorage に保存するデータ全体（REQUIREMENTS.md 5.2）。 */
export interface SaveData {
  /** アイテムID → 取得記録。 */
  collected: Record<string, CollectedEntry>;
  settings: {
    speechEnabled: boolean;
    soundEnabled: boolean;
    /** 演出控えめモード（OS設定とは別に、アプリ内で明示ON/OFFしたい場合用）。 */
    reducedMotion: boolean;
  };
}

/** localStorage と同等に扱える最小インターフェース（テスト時のモック用）。 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** 初期セーブ（未保存・破損時のフォールバック先）。 */
export function defaultSave(): SaveData {
  return {
    collected: {},
    settings: { speechEnabled: true, soundEnabled: true, reducedMotion: false },
  };
}

/**
 * 任意の値を安全な SaveData に正規化する（純粋関数）。
 * 型が合わない／欠落しているフィールドは既定値で補い、壊れた collected 項目は捨てる。
 */
export function sanitizeSave(raw: unknown): SaveData {
  const base = defaultSave();
  if (typeof raw !== "object" || raw === null) return base;
  const obj = raw as Record<string, unknown>;

  // collected：count(正の有限数)・firstSeenAt(有限数) が揃っている項目だけ採用。
  const collected: Record<string, CollectedEntry> = {};
  const rawCollected = obj.collected;
  if (typeof rawCollected === "object" && rawCollected !== null) {
    for (const [id, v] of Object.entries(rawCollected as Record<string, unknown>)) {
      if (typeof v !== "object" || v === null) continue;
      const e = v as Record<string, unknown>;
      const count = e.count;
      const firstSeenAt = e.firstSeenAt;
      if (
        typeof count === "number" &&
        Number.isFinite(count) &&
        count > 0 &&
        typeof firstSeenAt === "number" &&
        Number.isFinite(firstSeenAt)
      ) {
        // seen は boolean ならその値、欠落（旧スキーマ）は true＝既読扱い（移行時の大量NEWを防ぐ）。
        const seen = typeof e.seen === "boolean" ? e.seen : true;
        collected[id] = { count: Math.floor(count), firstSeenAt, seen };
      }
    }
  }

  // settings：boolean のものだけ上書き（欠落・型違いは既定値のまま）。
  const settings = { ...base.settings };
  const rawSettings = obj.settings;
  if (typeof rawSettings === "object" && rawSettings !== null) {
    const s = rawSettings as Record<string, unknown>;
    if (typeof s.speechEnabled === "boolean") settings.speechEnabled = s.speechEnabled;
    if (typeof s.soundEnabled === "boolean") settings.soundEnabled = s.soundEnabled;
    if (typeof s.reducedMotion === "boolean") settings.reducedMotion = s.reducedMotion;
  }

  return { collected, settings };
}

/** JSON文字列（または null）を SaveData に変換する。パース失敗・null は既定値へ（純粋関数）。 */
export function parseSave(json: string | null): SaveData {
  if (json == null) return defaultSave();
  try {
    return sanitizeSave(JSON.parse(json));
  } catch {
    return defaultSave();
  }
}

/**
 * アイテムを1つ取得した記録を反映した新しい SaveData を返す（純粋関数）。
 * 初回取得（0→1）なら firstSeenAt を now にし、isNew=true を返す。
 * 既取得なら count を+1し、firstSeenAt は保持する。
 */
export function recordCollect(
  save: SaveData,
  itemId: string,
  now: number,
): { save: SaveData; isNew: boolean } {
  const existing = save.collected[itemId];
  const isNew = existing == null;
  const entry: CollectedEntry = isNew
    ? { count: 1, firstSeenAt: now, seen: false } // 初回は未確認（図鑑で NEW を出す）
    : { count: existing.count + 1, firstSeenAt: existing.firstSeenAt, seen: existing.seen };

  return {
    save: { ...save, collected: { ...save.collected, [itemId]: entry } },
    isNew,
  };
}

/**
 * 指定アイテムを「確認済み（seen=true）」にした新しい SaveData を返す（純粋関数）。
 * 未取得・既に確認済みなら元の参照をそのまま返す（無駄な再描画・保存を避けられる）。
 */
export function markSeen(save: SaveData, itemId: string): SaveData {
  const existing = save.collected[itemId];
  if (!existing || existing.seen) return save;
  return {
    ...save,
    collected: { ...save.collected, [itemId]: { ...existing, seen: true } },
  };
}

/**
 * 既定の保存先（localStorage）。
 * 未対応環境やプライベートモードでアクセス自体が例外になる場合は null を返す。
 */
function defaultStorage(): StorageLike | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

/** localStorage から読み込む。失敗時は安全に既定値へフォールバックする。 */
export function loadSave(storage: StorageLike | null = defaultStorage()): SaveData {
  if (!storage) return defaultSave();
  try {
    return parseSave(storage.getItem(SAVE_KEY));
  } catch {
    return defaultSave();
  }
}

/** localStorage へ書き込む。容量超過・プライベートモード等の失敗は致命的でないので握りつぶす。 */
export function saveSave(data: SaveData, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // 保存できなくてもプレイは継続できるため無視する。
  }
}
