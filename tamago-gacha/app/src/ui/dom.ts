// 画面モジュールで共有する小さな DOM ヘルパ。

/** 必須要素を取得する（無ければ即エラーで早期発見）。 */
export function must<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`要素が見つかりません: ${selector}`);
  return el;
}
