(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();const M={squash:180,shake:1e3,open:220,reveal:450},C={common:80,rare:18,superRare:2},_={common:{shakeScale:1,holdBeforeOpen:0,sparkleCount:14,sparkleVariant:"normal",label:""},rare:{shakeScale:1.6,holdBeforeOpen:180,sparkleCount:26,sparkleVariant:"rare",label:"レア！"},superRare:{shakeScale:2.3,holdBeforeOpen:420,sparkleCount:40,sparkleVariant:"super",label:"げきレア!!"}},S=["common","rare","superRare"];function w(a,e,t){if(e.length===0)throw new Error("pickWeighted: entries が空です");const i=e.map(r=>Math.max(0,t(r))),n=i.reduce((r,s)=>r+s,0);if(n<=0){const r=Math.min(e.length-1,Math.floor(a()*e.length));return e[r]}let o=a()*n;for(let r=0;r<e.length;r++){if(o<i[r])return e[r];o-=i[r]}return e[e.length-1]}function P(a){const e={common:[],rare:[],superRare:[]};for(const t of a)e[t.rarity].push(t);return e}function I(a,e,t=C){if(e.length===0)throw new Error("drawItem: items が空です");const i=P(e),n=S.filter(r=>i[r].length>0),o=w(a,n,r=>t[r]??0);return w(a,i[o],()=>1)}function T(a){let e=a>>>0;return function(){e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function $(){const a=new Uint32Array(1);return crypto.getRandomValues(a),a[0]>>>0}const O=[{id:"dog",nameJa:"いぬ",nameEn:"dog",category:"animal",rarity:"common",emoji:"🐶"},{id:"cat",nameJa:"ねこ",nameEn:"cat",category:"animal",rarity:"common",emoji:"🐱"},{id:"rabbit",nameJa:"うさぎ",nameEn:"rabbit",category:"animal",rarity:"common",emoji:"🐰"},{id:"elephant",nameJa:"ぞう",nameEn:"elephant",category:"animal",rarity:"common",emoji:"🐘"},{id:"panda",nameJa:"パンダ",nameEn:"panda",category:"animal",rarity:"common",emoji:"🐼"},{id:"fox",nameJa:"きつね",nameEn:"fox",category:"animal",rarity:"rare",emoji:"🦊"},{id:"lion",nameJa:"ライオン",nameEn:"lion",category:"animal",rarity:"rare",emoji:"🦁"},{id:"unicorn",nameJa:"ユニコーン",nameEn:"unicorn",category:"animal",rarity:"superRare",emoji:"🦄"},{id:"dragon",nameJa:"ドラゴン",nameEn:"dragon",category:"animal",rarity:"superRare",emoji:"🐉"},{id:"car",nameJa:"くるま",nameEn:"car",category:"vehicle",rarity:"common",emoji:"🚗"},{id:"train",nameJa:"でんしゃ",nameEn:"train",category:"vehicle",rarity:"common",emoji:"🚆"},{id:"ship",nameJa:"ふね",nameEn:"ship",category:"vehicle",rarity:"common",emoji:"🚢"},{id:"fire_engine",nameJa:"しょうぼうしゃ",nameEn:"fire engine",category:"vehicle",rarity:"common",emoji:"🚒"},{id:"airplane",nameJa:"ひこうき",nameEn:"airplane",category:"vehicle",rarity:"rare",emoji:"✈️"},{id:"helicopter",nameJa:"ヘリコプター",nameEn:"helicopter",category:"vehicle",rarity:"rare",emoji:"🚁"},{id:"rocket",nameJa:"ロケット",nameEn:"rocket",category:"vehicle",rarity:"superRare",emoji:"🚀"},{id:"apple",nameJa:"りんご",nameEn:"apple",category:"food",rarity:"common",emoji:"🍎"},{id:"banana",nameJa:"バナナ",nameEn:"banana",category:"food",rarity:"common",emoji:"🍌"},{id:"strawberry",nameJa:"いちご",nameEn:"strawberry",category:"food",rarity:"common",emoji:"🍓"},{id:"grapes",nameJa:"ぶどう",nameEn:"grapes",category:"food",rarity:"common",emoji:"🍇"},{id:"cake",nameJa:"ケーキ",nameEn:"cake",category:"food",rarity:"rare",emoji:"🍰"},{id:"icecream",nameJa:"アイス",nameEn:"ice cream",category:"food",rarity:"rare",emoji:"🍦"},{id:"donut",nameJa:"ドーナツ",nameEn:"donut",category:"food",rarity:"superRare",emoji:"🍩"}],A={normal:["✨","⭐","💫","🌟"],rare:["✨","⭐","💫","🌟","💖","🔷"],super:["✨","🌟","💎","👑","🌈","🎉"]},B={normal:1,rare:1.15,super:1.35};function G(a,e,t=16,i="normal"){const n=A[i],o=B[i];for(let r=0;r<t;r++){const s=document.createElement("span");s.className=`sparkle sparkle--${i}`,s.textContent=n[Math.floor(e()*n.length)];const d=e()*Math.PI*2,p=(90+e()*140)*o;s.style.setProperty("--dx",`${(Math.cos(d)*p).toFixed(1)}px`),s.style.setProperty("--dy",`${(Math.sin(d)*p).toFixed(1)}px`),s.style.setProperty("--delay",`${(e()*140).toFixed(0)}ms`),s.style.setProperty("--size",`${((.9+e()*1.3)*o).toFixed(2)}rem`),s.addEventListener("animationend",()=>s.remove()),a.appendChild(s)}}function q(){return`
<svg class="egg-svg" viewBox="0 0 200 270" role="img" aria-label="タマゴ" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff7e6" />
      <stop offset="55%" stop-color="#ffe1a8" />
      <stop offset="100%" stop-color="#ffc46b" />
    </linearGradient>
  </defs>

  <g class="egg-shake">
    <!-- 下半分 -->
    <g class="egg-bottom">
      <path class="egg-shell"
        d="M35,138 C35,205 60,250 100,250 C140,250 165,205 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle cx="72" cy="198" r="11" fill="#ff9a3c" opacity="0.45" />
      <circle cx="120" cy="214" r="8" fill="#ff9a3c" opacity="0.45" />
      <circle cx="98" cy="176" r="6" fill="#ff9a3c" opacity="0.45" />
    </g>

    <!-- 上半分 -->
    <g class="egg-top">
      <path class="egg-shell"
        d="M35,138 C35,72 58,18 100,18 C142,18 165,72 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle cx="122" cy="70" r="9" fill="#ff9a3c" opacity="0.45" />
      <circle cx="82" cy="104" r="7" fill="#ff9a3c" opacity="0.45" />
      <ellipse class="egg-shine" cx="74" cy="74" rx="15" ry="24" fill="#ffffff" opacity="0.5" />
    </g>

    <!-- ひび線（割れ目と同じ形。最初は隠れていて、shake 中に描画される） -->
    <path class="egg-crack"
      d="M35,138 L55,122 L78,150 L100,126 L122,152 L145,123 L165,140"
      fill="none" stroke="#9b6a2f" stroke-width="3"
      stroke-linecap="round" stroke-linejoin="round" pathLength="1" />
  </g>
</svg>`}const f=a=>new Promise(e=>setTimeout(e,a));function F(a){const e=T($());let t="idle";a.innerHTML=`
    <main class="gacha">
      <div class="gacha__stage" data-phase="idle">
        <div class="flash" aria-hidden="true"></div>
        <button class="egg-button" type="button" aria-label="タマゴをタップしてガチャを回す">
          ${q()}
        </button>
        <div class="result" aria-live="polite"></div>
        <div class="sparkles" aria-hidden="true"></div>
      </div>
      <p class="hint">タマゴをタップしてね！</p>
    </main>
  `;const i=c(a,".gacha__stage"),n=c(a,".egg-button"),o=c(a,".egg-shake"),r=c(a,".egg-top"),s=c(a,".egg-bottom"),d=c(a,".egg-crack"),p=c(a,".flash"),y=c(a,".result"),h=c(a,".sparkles"),v=c(a,".hint"),k=window.matchMedia("(prefers-reduced-motion: reduce)").matches,u=k?{squash:60,shake:280,open:120,reveal:220}:M;function E(l){t=l,i.dataset.phase=l}async function j(){if(t!=="idle")return;E("playing"),y.replaceChildren(),h.replaceChildren(),v.textContent="";const l=I(e,O),m=_[l.rarity];i.dataset.rarity=l.rarity,o.classList.add("is-squash"),await f(u.squash),o.classList.remove("is-squash");const g=Math.round(u.shake*m.shakeScale);d.style.setProperty("--crack-dur",`${g}ms`),o.classList.add("is-shaking"),d.classList.add("is-cracking"),await f(g),o.classList.remove("is-shaking");const L=k?0:m.holdBeforeOpen;L>0&&await f(L);const b=`${u.open}ms`;r.style.setProperty("--open-dur",b),s.style.setProperty("--open-dur",b),r.classList.add("is-open"),s.classList.add("is-open"),p.classList.add("is-flash"),k||G(h,e,m.sparkleCount,m.sparkleVariant),await f(u.open),p.classList.remove("is-flash"),J(l,m),await f(u.reveal),E("result"),v.textContent="タップでつぎへ"}function J(l,m){const g=m.label?`<div class="result__rarity">${m.label}</div>`:"";y.innerHTML=`
      ${g}
      <div class="result__item">${l.emoji}</div>
      <div class="result__got">ゲット！</div>
      <div class="result__name">${l.nameJa}</div>
    `}function R(){r.classList.remove("is-open"),s.classList.remove("is-open"),d.classList.remove("is-cracking"),y.replaceChildren(),h.replaceChildren(),v.textContent="タマゴをタップしてね！",delete i.dataset.rarity,E("idle")}n.addEventListener("click",()=>{t==="idle"&&j()}),i.addEventListener("click",()=>{t==="result"&&R()})}function c(a,e){const t=a.querySelector(e);if(!t)throw new Error(`要素が見つかりません: ${e}`);return t}function N(a){F(a)}const x=document.getElementById("app");if(!x)throw new Error("#app が見つかりません");N(x);
