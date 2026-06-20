import { describe, it, expect } from "vitest";
import {
  defaultSave,
  sanitizeSave,
  parseSave,
  recordCollect,
  loadSave,
  saveSave,
  type SaveData,
  type StorageLike,
} from "../src/core/save";
import { SAVE_KEY } from "../src/config";

/** localStorage を模した最小ストレージ（テスト用）。 */
function memoryStorage(initial: Record<string, string> = {}): StorageLike & { dump(): Record<string, string> } {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    dump: () => Object.fromEntries(map),
  };
}

describe("defaultSave", () => {
  it("collected は空・settings は既定値", () => {
    const s = defaultSave();
    expect(s.collected).toEqual({});
    expect(s.settings).toEqual({ speechEnabled: true, soundEnabled: true, reducedMotion: false });
  });

  it("呼ぶたびに別インスタンス（共有されない）", () => {
    const a = defaultSave();
    a.collected["dog"] = { count: 1, firstSeenAt: 1 };
    expect(defaultSave().collected).toEqual({});
  });
});

describe("sanitizeSave（破損フォールバック）", () => {
  it("オブジェクトでない値は既定値になる", () => {
    expect(sanitizeSave(null)).toEqual(defaultSave());
    expect(sanitizeSave(42)).toEqual(defaultSave());
    expect(sanitizeSave("x")).toEqual(defaultSave());
    expect(sanitizeSave([1, 2])).toEqual(defaultSave());
  });

  it("壊れた collected 項目は捨て、正しい項目だけ残す", () => {
    const raw = {
      collected: {
        ok: { count: 3, firstSeenAt: 1000 },
        noCount: { firstSeenAt: 1000 },
        zero: { count: 0, firstSeenAt: 1000 }, // count<=0 は無効
        nan: { count: Number.NaN, firstSeenAt: 1000 },
        badStamp: { count: 2, firstSeenAt: "x" },
        notObj: 5,
      },
    };
    const s = sanitizeSave(raw);
    expect(Object.keys(s.collected)).toEqual(["ok"]);
    expect(s.collected.ok).toEqual({ count: 3, firstSeenAt: 1000 });
  });

  it("count は整数に丸める", () => {
    const s = sanitizeSave({ collected: { dog: { count: 2.9, firstSeenAt: 5 } } });
    expect(s.collected.dog!.count).toBe(2);
  });

  it("settings は boolean のものだけ採用し、欠落は既定値", () => {
    const s = sanitizeSave({ settings: { speechEnabled: false, soundEnabled: "yes" } });
    expect(s.settings.speechEnabled).toBe(false); // 採用
    expect(s.settings.soundEnabled).toBe(true); // 型違い→既定
    expect(s.settings.reducedMotion).toBe(false); // 欠落→既定
  });
});

describe("parseSave", () => {
  it("null は既定値", () => {
    expect(parseSave(null)).toEqual(defaultSave());
  });

  it("不正なJSONは既定値（例外を投げない）", () => {
    expect(parseSave("{壊れた")).toEqual(defaultSave());
  });

  it("正しいJSONはサニタイズして返す", () => {
    const json = JSON.stringify({ collected: { cat: { count: 2, firstSeenAt: 9 } } });
    const s = parseSave(json);
    expect(s.collected.cat).toEqual({ count: 2, firstSeenAt: 9 });
  });
});

describe("recordCollect", () => {
  it("初回取得は count=1・firstSeenAt=now・isNew=true", () => {
    const r = recordCollect(defaultSave(), "dog", 1234);
    expect(r.isNew).toBe(true);
    expect(r.save.collected.dog).toEqual({ count: 1, firstSeenAt: 1234 });
  });

  it("2回目は count+1・firstSeenAt 不変・isNew=false", () => {
    const r1 = recordCollect(defaultSave(), "dog", 1000);
    const r2 = recordCollect(r1.save, "dog", 5000);
    expect(r2.isNew).toBe(false);
    expect(r2.save.collected.dog).toEqual({ count: 2, firstSeenAt: 1000 });
  });

  it("元の SaveData を破壊しない（イミュータブル）", () => {
    const base = defaultSave();
    recordCollect(base, "dog", 1);
    expect(base.collected).toEqual({});
  });
});

describe("loadSave / saveSave（ストレージ注入）", () => {
  it("保存→読込で往復できる", () => {
    const store = memoryStorage();
    const data: SaveData = recordCollect(defaultSave(), "apple", 777).save;
    saveSave(data, store);
    expect(store.dump()[SAVE_KEY]).toBeDefined();
    expect(loadSave(store)).toEqual(data);
  });

  it("空ストレージからは既定値を読む", () => {
    expect(loadSave(memoryStorage())).toEqual(defaultSave());
  });

  it("ストレージ内の壊れた値は既定値にフォールバック", () => {
    const store = memoryStorage({ [SAVE_KEY]: "{こわれてる" });
    expect(loadSave(store)).toEqual(defaultSave());
  });

  it("ストレージが null（未対応環境）でも例外を投げない", () => {
    expect(loadSave(null)).toEqual(defaultSave());
    expect(() => saveSave(defaultSave(), null)).not.toThrow();
  });

  it("setItem が例外を投げても握りつぶす（容量超過等）", () => {
    const throwing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    };
    expect(() => saveSave(defaultSave(), throwing)).not.toThrow();
  });
});
