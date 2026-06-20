(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const c of a)if(c.type==="childList")for(const o of c.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(a){const c={};return a.integrity&&(c.integrity=a.integrity),a.referrerPolicy&&(c.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?c.credentials="include":a.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function s(a){if(a.ep)return;a.ep=!0;const c=n(a);fetch(a.href,c)}})();const ne={squash:180,shake:1e3,open:220,reveal:450},ae={common:80,rare:18,superRare:2},se={common:{shakeScale:1,holdBeforeOpen:0,sparkleCount:14,sparkleVariant:"normal",label:""},rare:{shakeScale:1.6,holdBeforeOpen:180,sparkleCount:26,sparkleVariant:"rare",label:"レア！"},superRare:{shakeScale:2.3,holdBeforeOpen:420,sparkleCount:40,sparkleVariant:"super",label:"げきレア!!"}},F="tamago-gacha:save:v1",O={ja:.95,en:.85},oe=.18;function v(){return{collected:{},settings:{speechEnabled:!0,soundEnabled:!0,reducedMotion:!1}}}function ce(e){const t=v();if(typeof e!="object"||e===null)return t;const n=e,s={},a=n.collected;if(typeof a=="object"&&a!==null)for(const[i,f]of Object.entries(a)){if(typeof f!="object"||f===null)continue;const d=f,r=d.count,l=d.firstSeenAt;if(typeof r=="number"&&Number.isFinite(r)&&r>0&&typeof l=="number"&&Number.isFinite(l)){const m=typeof d.seen=="boolean"?d.seen:!0;s[i]={count:Math.floor(r),firstSeenAt:l,seen:m}}}const c={...t.settings},o=n.settings;if(typeof o=="object"&&o!==null){const i=o;typeof i.speechEnabled=="boolean"&&(c.speechEnabled=i.speechEnabled),typeof i.soundEnabled=="boolean"&&(c.soundEnabled=i.soundEnabled),typeof i.reducedMotion=="boolean"&&(c.reducedMotion=i.reducedMotion)}return{collected:s,settings:c}}function ie(e){if(e==null)return v();try{return ce(JSON.parse(e))}catch{return v()}}function re(e,t,n){const s=e.collected[t],a=s==null,c=a?{count:1,firstSeenAt:n,seen:!1}:{count:s.count+1,firstSeenAt:s.firstSeenAt,seen:s.seen};return{save:{...e,collected:{...e.collected,[t]:c}},isNew:a}}function le(e,t){const n=e.collected[t];return!n||n.seen?e:{...e,collected:{...e.collected,[t]:{...n,seen:!0}}}}function H(){try{return typeof localStorage<"u"?localStorage:null}catch{return null}}function de(e=H()){if(!e)return v();try{return ie(e.getItem(F))}catch{return v()}}function C(e,t=H()){if(t)try{t.setItem(F,JSON.stringify(e))}catch{}}let j=null,D=!0;function ue(){return typeof window<"u"&&typeof Y()=="function"}function Y(){if(typeof window>"u")return;const e=window;return window.AudioContext??e.webkitAudioContext}function Z(){if(j)return j;const e=Y();return e?(j=new e,j):null}function fe(e){D=e}function pe(){if(typeof window>"u"||!ue())return;const e=()=>{const t=Z();t&&t.state==="suspended"&&t.resume(),window.removeEventListener("pointerdown",e),window.removeEventListener("touchstart",e),window.removeEventListener("click",e)};window.addEventListener("pointerdown",e,{passive:!0}),window.addEventListener("touchstart",e,{passive:!0}),window.addEventListener("click",e,{passive:!0})}function A(e,t,n,s,a,c){const o=e.currentTime+n,i=e.createOscillator(),f=e.createGain();i.type=a,Array.isArray(t)?(i.frequency.setValueAtTime(t[0],o),i.frequency.exponentialRampToValueAtTime(Math.max(1,t[1]),o+s)):i.frequency.setValueAtTime(t,o);const d=Math.max(1e-4,c*oe);f.gain.setValueAtTime(1e-4,o),f.gain.exponentialRampToValueAtTime(d,o+.012),f.gain.exponentialRampToValueAtTime(1e-4,o+s),i.connect(f).connect(e.destination),i.start(o),i.stop(o+s+.02)}function R(e,t,n,s,a,c){t.forEach((o,i)=>A(e,o,i*n,s,a,c))}function L(e){if(!D)return;const t=Z();if(t)switch(t.state==="suspended"&&t.resume(),e){case"tap":A(t,[520,320],0,.12,"triangle",.9);break;case"open":A(t,[300,760],0,.16,"square",.6),A(t,[760,900],.05,.18,"sine",.7);break;case"sparkle":R(t,[1320,1760,2200],.06,.18,"sine",.5);break;case"rareJingle":R(t,[659.25,830.61,987.77],.1,.22,"triangle",.7);break;case"superJingle":R(t,[523.25,659.25,783.99,1046.5,1318.51],.11,.3,"triangle",.75);break}}const me=["common","rare","superRare"];function B(e,t,n){if(t.length===0)throw new Error("pickWeighted: entries が空です");const s=t.map(o=>Math.max(0,n(o))),a=s.reduce((o,i)=>o+i,0);if(a<=0){const o=Math.min(t.length-1,Math.floor(e()*t.length));return t[o]}let c=e()*a;for(let o=0;o<t.length;o++){if(c<s[o])return t[o];c-=s[o]}return t[t.length-1]}function ge(e){const t={common:[],rare:[],superRare:[]};for(const n of e)t[n.rarity].push(n);return t}function ye(e,t,n=ae){if(t.length===0)throw new Error("drawItem: items が空です");const s=ge(t),a=me.filter(o=>s[o].length>0),c=B(e,a,o=>n[o]??0);return B(e,s[c],()=>1)}function he(e){let t=e>>>0;return function(){t=t+1831565813|0;let n=Math.imul(t^t>>>15,1|t);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296}}function be(){const e=new Uint32Array(1);return crypto.getRandomValues(e),e[0]>>>0}const T=[{id:"dog",nameJa:"いぬ",nameEn:"dog",category:"animal",rarity:"common",emoji:"🐶"},{id:"cat",nameJa:"ねこ",nameEn:"cat",category:"animal",rarity:"common",emoji:"🐱"},{id:"rabbit",nameJa:"うさぎ",nameEn:"rabbit",category:"animal",rarity:"common",emoji:"🐰"},{id:"elephant",nameJa:"ぞう",nameEn:"elephant",category:"animal",rarity:"common",emoji:"🐘"},{id:"panda",nameJa:"パンダ",nameEn:"panda",category:"animal",rarity:"common",emoji:"🐼"},{id:"fox",nameJa:"きつね",nameEn:"fox",category:"animal",rarity:"rare",emoji:"🦊"},{id:"lion",nameJa:"ライオン",nameEn:"lion",category:"animal",rarity:"rare",emoji:"🦁"},{id:"unicorn",nameJa:"ユニコーン",nameEn:"unicorn",category:"animal",rarity:"superRare",emoji:"🦄"},{id:"dragon",nameJa:"ドラゴン",nameEn:"dragon",category:"animal",rarity:"superRare",emoji:"🐉"},{id:"car",nameJa:"くるま",nameEn:"car",category:"vehicle",rarity:"common",emoji:"🚗"},{id:"train",nameJa:"でんしゃ",nameEn:"train",category:"vehicle",rarity:"common",emoji:"🚆"},{id:"ship",nameJa:"ふね",nameEn:"ship",category:"vehicle",rarity:"common",emoji:"🚢"},{id:"fire_engine",nameJa:"しょうぼうしゃ",nameEn:"fire engine",category:"vehicle",rarity:"common",emoji:"🚒"},{id:"airplane",nameJa:"ひこうき",nameEn:"airplane",category:"vehicle",rarity:"rare",emoji:"✈️"},{id:"helicopter",nameJa:"ヘリコプター",nameEn:"helicopter",category:"vehicle",rarity:"rare",emoji:"🚁"},{id:"rocket",nameJa:"ロケット",nameEn:"rocket",category:"vehicle",rarity:"superRare",emoji:"🚀"},{id:"apple",nameJa:"りんご",nameEn:"apple",category:"food",rarity:"common",emoji:"🍎"},{id:"banana",nameJa:"バナナ",nameEn:"banana",category:"food",rarity:"common",emoji:"🍌"},{id:"strawberry",nameJa:"いちご",nameEn:"strawberry",category:"food",rarity:"common",emoji:"🍓"},{id:"grapes",nameJa:"ぶどう",nameEn:"grapes",category:"food",rarity:"common",emoji:"🍇"},{id:"cake",nameJa:"ケーキ",nameEn:"cake",category:"food",rarity:"rare",emoji:"🍰"},{id:"icecream",nameJa:"アイス",nameEn:"ice cream",category:"food",rarity:"rare",emoji:"🍦"},{id:"donut",nameJa:"ドーナツ",nameEn:"donut",category:"food",rarity:"superRare",emoji:"🍩"}],ke={normal:["✨","⭐","💫","🌟"],rare:["✨","⭐","💫","🌟","💖","🔷"],super:["✨","🌟","💎","👑","🌈","🎉"]},_e={normal:1,rare:1.15,super:1.35};function ve(e,t,n=16,s="normal"){const a=ke[s],c=_e[s];for(let o=0;o<n;o++){const i=document.createElement("span");i.className=`sparkle sparkle--${s}`,i.textContent=a[Math.floor(t()*a.length)];const f=t()*Math.PI*2,d=(90+t()*140)*c;i.style.setProperty("--dx",`${(Math.cos(f)*d).toFixed(1)}px`),i.style.setProperty("--dy",`${(Math.sin(f)*d).toFixed(1)}px`),i.style.setProperty("--delay",`${(t()*140).toFixed(0)}ms`),i.style.setProperty("--size",`${((.9+t()*1.3)*c).toFixed(2)}rem`),i.addEventListener("animationend",()=>i.remove()),e.appendChild(i)}}const $=[{c1:"#fff7e6",c2:"#ffe1a8",c3:"#ffc46b",stroke:"#e0a04a",accent:"#ff9a3c"},{c1:"#fff0f5",c2:"#ffd1e3",c3:"#ff9ec4",stroke:"#e87aa8",accent:"#ff7eb3"},{c1:"#f0fff7",c2:"#c2f5dd",c3:"#8fe6b8",stroke:"#5cc191",accent:"#57c785"},{c1:"#eef7ff",c2:"#c7e6ff",c3:"#8fc8ff",stroke:"#5a9fe0",accent:"#5fb8ff"},{c1:"#f7f0ff",c2:"#e0d1ff",c3:"#c2a8ff",stroke:"#9b7ad0",accent:"#b07eff"},{c1:"#fffdf0",c2:"#fff3b8",c3:"#ffe066",stroke:"#e0c24a",accent:"#ffd34e"}];function G(e,t){const n=$[Math.floor(t()*$.length)]??$[0];e.style.setProperty("--egg-c1",n.c1),e.style.setProperty("--egg-c2",n.c2),e.style.setProperty("--egg-c3",n.c3),e.style.setProperty("--egg-stroke",n.stroke),e.style.setProperty("--egg-accent",n.accent)}function Ee(){return`
<svg class="egg-svg" viewBox="0 0 200 270" role="img" aria-label="タマゴ" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
      <stop class="egg-stop1" offset="0%" />
      <stop class="egg-stop2" offset="55%" />
      <stop class="egg-stop3" offset="100%" />
    </linearGradient>
  </defs>

  <g class="egg-shake">
    <!-- 下半分 -->
    <g class="egg-bottom">
      <path class="egg-shell"
        d="M35,138 C35,205 60,250 100,250 C140,250 165,205 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle class="egg-accent" cx="72" cy="198" r="11" fill="#ff9a3c" opacity="0.45" />
      <circle class="egg-accent" cx="120" cy="214" r="8" fill="#ff9a3c" opacity="0.45" />
      <circle class="egg-accent" cx="98" cy="176" r="6" fill="#ff9a3c" opacity="0.45" />
    </g>

    <!-- 上半分 -->
    <g class="egg-top">
      <path class="egg-shell"
        d="M35,138 C35,72 58,18 100,18 C142,18 165,72 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle class="egg-accent" cx="122" cy="70" r="9" fill="#ff9a3c" opacity="0.45" />
      <circle class="egg-accent" cx="82" cy="104" r="7" fill="#ff9a3c" opacity="0.45" />
      <ellipse class="egg-shine" cx="74" cy="74" rx="15" ry="24" fill="#ffffff" opacity="0.5" />
    </g>

    <!-- ひび線（割れ目と同じ形。最初は隠れていて、shake 中に描画される） -->
    <path class="egg-crack"
      d="M35,138 L55,122 L78,150 L100,126 L122,152 L145,123 L165,140"
      fill="none" stroke="#9b6a2f" stroke-width="3"
      stroke-linecap="round" stroke-linejoin="round" pathLength="1" />
  </g>
</svg>`}function u(e,t){const n=e.querySelector(t);if(!n)throw new Error(`要素が見つかりません: ${t}`);return n}const S=e=>new Promise(t=>setTimeout(t,e));function we(e,t){const n=he(be());let s="idle";e.innerHTML=`
    <main class="gacha">
      <button class="gacha__settings-btn" type="button" aria-label="せっていを開く">⚙</button>
      <button class="gacha__zukan-btn" type="button" aria-label="ずかんを開く">ずかん</button>
      <div class="gacha__stage" data-phase="idle">
        <div class="flash" aria-hidden="true"></div>
        <button class="egg-button" type="button" aria-label="タマゴをタップしてガチャを回す">
          ${Ee()}
        </button>
        <div class="result" aria-live="polite"></div>
        <div class="sparkles" aria-hidden="true"></div>
      </div>
      <p class="hint">タマゴをタップしてね！</p>
    </main>
  `;const a=u(e,".gacha__stage"),c=u(e,".egg-button"),o=u(e,".gacha__zukan-btn"),i=u(e,".gacha__settings-btn"),f=u(e,".egg-svg"),d=u(e,".egg-shake"),r=u(e,".egg-top"),l=u(e,".egg-bottom"),m=u(e,".egg-crack"),p=u(e,".flash"),E=u(e,".result"),g=u(e,".sparkles"),w=u(e,".hint");G(f,n);function _(y){s=y,a.dataset.phase=y}async function X(){if(s!=="idle")return;const y=t.isReducedMotion(),b=y?{squash:60,shake:280,open:120,reveal:220}:ne;_("playing"),L("tap"),E.replaceChildren(),g.replaceChildren(),w.textContent="";const h=ye(n,T),k=se[h.rarity];a.dataset.rarity=h.rarity,d.classList.add("is-squash"),await S(b.squash),d.classList.remove("is-squash");const M=Math.round(b.shake*k.shakeScale);m.style.setProperty("--crack-dur",`${M}ms`),d.classList.add("is-shaking"),m.classList.add("is-cracking"),await S(M),d.classList.remove("is-shaking");const P=y?0:k.holdBeforeOpen;P>0&&await S(P);const N=`${b.open}ms`;r.style.setProperty("--open-dur",N),l.style.setProperty("--open-dur",N),r.classList.add("is-open"),l.classList.add("is-open"),p.classList.add("is-flash"),L("open"),y||ve(g,n,k.sparkleCount,k.sparkleVariant),await S(b.open),p.classList.remove("is-flash");const te=t.onCollect(h.id);L("sparkle"),h.rarity==="rare"?L("rareJingle"):h.rarity==="superRare"&&L("superJingle"),Q(h,k,te),await S(b.reveal),_("result"),w.textContent="タップでつぎへ"}function Q(y,b,h){const k=b.label?`<div class="result__rarity">${b.label}</div>`:"",M=h.isNew?'<div class="result__new">NEW!</div>':`<div class="result__dupe">${h.count}こめ！</div>`;E.innerHTML=`
      ${k}
      ${M}
      <div class="result__item">${y.emoji}</div>
      <div class="result__got">ゲット！</div>
      <div class="result__name">${y.nameJa}</div>
    `}function ee(){r.classList.remove("is-open"),l.classList.remove("is-open"),m.classList.remove("is-cracking"),E.replaceChildren(),g.replaceChildren(),w.textContent="タマゴをタップしてね！",delete a.dataset.rarity,G(f,n),_("idle")}c.addEventListener("click",()=>{s==="idle"&&X()}),a.addEventListener("click",()=>{s==="result"&&ee()}),o.addEventListener("click",()=>t.onOpenZukan()),i.addEventListener("click",()=>t.onOpenSettings())}function U(e,t){var n;return(((n=e.collected[t])==null?void 0:n.count)??0)>0}function Le(e,t){var n;return((n=e.collected[t])==null?void 0:n.count)??0}function Se(e,t){const n=e.collected[t];return n!=null&&n.count>0&&n.seen===!1}function xe(e,t){var c;const n={};let s=0;for(const o of t){const i=n[c=o.category]??(n[c]={collected:0,total:0});i.total++,U(e,o.id)&&(i.collected++,s++)}const a=t.length;return{collected:s,total:a,ratio:a===0?0:s/a,isComplete:a>0&&s===a,byCategory:n}}const J={animal:"どうぶつ",vehicle:"のりもの",food:"たべもの"},Me={common:"ノーマル",rare:"レア",superRare:"げきレア"};function x(){return typeof window<"u"&&"speechSynthesis"in window&&typeof window.SpeechSynthesisUtterance<"u"}function Ce(e,t){const n=z(t),s=V(t),a=e.find(o=>z(o.lang)===n);return a||(e.find(o=>V(o.lang)===s)??null)}function z(e){return e.toLowerCase().replace(/_/g,"-")}function V(e){return z(e).split("-")[0]??""}let W=[];function I(){if(!x())return;const e=window.speechSynthesis.getVoices();e.length>0&&(W=e)}function je(){var e,t;x()&&(I(),(t=(e=window.speechSynthesis).addEventListener)==null||t.call(e,"voiceschanged",I))}function Ae(e){if(!x()||e.length===0)return $e;const t=window.speechSynthesis;(t.speaking||t.pending)&&t.cancel();for(const n of e){const s=new SpeechSynthesisUtterance(n.text);s.lang=n.lang,n.rate!=null&&(s.rate=n.rate);const a=Ce(W,n.lang);a&&(s.voice=a),t.speak(s)}return()=>t.cancel()}function q(e,t){return Ae([{text:e,lang:"ja-JP",rate:O.ja},{text:t,lang:"en-US",rate:O.en}])}function Re(){x()&&window.speechSynthesis.cancel()}const $e=()=>{};function Je(e,t,n){const s=n.speechEnabled&&x(),a=document.createElement("div");a.className="detail-modal",a.dataset.rarity=e.rarity,a.innerHTML=`
    <div class="detail-modal__card" role="dialog" aria-label="${e.nameJa} のしょうさい">
      <button class="detail-modal__close" type="button" aria-label="とじる">×</button>
      <div class="detail-modal__emoji">${e.emoji}</div>
      <div class="detail-modal__rarity">${Me[e.rarity]}</div>
      <div class="detail-modal__name-ja">${e.nameJa}</div>
      <div class="detail-modal__name-en">${e.nameEn}</div>
      <div class="detail-modal__count">もってる数：${t}こ</div>
      ${s?'<button class="detail-modal__speak" type="button">🔊 よんで</button>':""}
    </div>
  `;const c=()=>{Re(),a.remove()};a.addEventListener("click",o=>{o.target===a&&c()}),u(a,".detail-modal__close").addEventListener("click",c),s&&u(a,".detail-modal__speak").addEventListener("click",()=>{q(e.nameJa,e.nameEn)}),document.body.appendChild(a),s&&q(e.nameJa,e.nameEn)}const Te=[{key:"all",label:"ぜんぶ"},{key:"animal",label:J.animal},{key:"vehicle",label:J.vehicle},{key:"food",label:J.food}];function ze(e,t){const{save:n}=t,s=xe(n,T);let a="all";const c=s.isComplete?'<div class="zukan__complete">🎉 ぜんぶ あつめた！おめでとう！ 🎉</div>':"";e.innerHTML=`
    <main class="zukan">
      <header class="zukan__bar">
        <button class="zukan__back" type="button">← ガチャへ</button>
        <div class="zukan__title">ずかん</div>
        <div class="zukan__progress">
          <strong>${s.collected}</strong> / ${s.total} しゅるい
        </div>
      </header>
      ${c}
      <nav class="zukan__filters">
        ${Te.map(r=>`<button class="zukan__filter" type="button" data-filter="${r.key}">${r.label}</button>`).join("")}
      </nav>
      <div class="zukan__grid"></div>
    </main>
  `;const o=u(e,".zukan__grid"),i=Array.from(e.querySelectorAll(".zukan__filter"));function f(){o.replaceChildren();const r=T.filter(l=>a==="all"||l.category===a);for(const l of r)if(U(n,l.id)){const p=Le(n,l.id),E=Se(n,l.id),g=document.createElement("button");g.type="button",g.className="zukan__cell is-got",g.dataset.rarity=l.rarity;const w=E?'<span class="zukan__new" aria-label="あたらしい">NEW</span>':"";g.innerHTML=`
          ${w}
          <span class="zukan__emoji">${l.emoji}</span>
          <span class="zukan__name">${l.nameJa}</span>
          ${p>1?`<span class="zukan__count">×${p}</span>`:""}
        `,g.addEventListener("click",()=>{var _;t.onMarkSeen(l.id),(_=g.querySelector(".zukan__new"))==null||_.remove(),Je(l,p,{speechEnabled:n.settings.speechEnabled})}),o.appendChild(g)}else{const p=document.createElement("div");p.className="zukan__cell is-locked",p.innerHTML='<span class="zukan__q">？</span>',o.appendChild(p)}}function d(r){a=r;for(const l of i)l.classList.toggle("is-active",l.dataset.filter===r);f()}for(const r of i)r.addEventListener("click",()=>d(r.dataset.filter??"all"));u(e,".zukan__back").addEventListener("click",()=>t.onBack()),d("all")}const Pe=[{key:"speechEnabled",label:"よみあげ",hint:"ずかんで なまえを よみあげる"},{key:"soundEnabled",label:"こうかおん",hint:"タップや パカッの おと"},{key:"reducedMotion",label:"えんしゅつ ひかえめ",hint:"はげしい うごきを おさえる"}];function Ne(e){const t={speechEnabled:e.speechEnabled,soundEnabled:e.soundEnabled,reducedMotion:e.reducedMotion},n=document.createElement("div");n.className="settings-modal",n.innerHTML=`
    <div class="settings-modal__card" role="dialog" aria-label="せってい">
      <button class="settings-modal__close" type="button" aria-label="とじる">×</button>
      <h2 class="settings-modal__title">せってい</h2>
      <div class="settings-modal__list">
        ${Pe.map(a=>`
          <label class="settings-row">
            <span class="settings-row__text">
              <span class="settings-row__label">${a.label}</span>
              <span class="settings-row__hint">${a.hint}</span>
            </span>
            <input class="settings-row__toggle" type="checkbox" data-key="${a.key}"
              ${t[a.key]?"checked":""} />
            <span class="settings-row__switch" aria-hidden="true"></span>
          </label>`).join("")}
      </div>
      <button class="settings-modal__reset" type="button">データを リセット</button>
      <p class="settings-modal__note">あつめた ものが ぜんぶ きえます（おうちのひと むけ）</p>
    </div>
  `;const s=()=>n.remove();n.addEventListener("click",a=>{a.target===n&&s()}),u(n,".settings-modal__close").addEventListener("click",s);for(const a of n.querySelectorAll(".settings-row__toggle"))a.addEventListener("change",()=>{const c=a.dataset.key;e.onChange(c,a.checked)});u(n,".settings-modal__reset").addEventListener("click",()=>{window.confirm("あつめた ものを ぜんぶ けします。よろしいですか？")&&(e.onReset(),s())}),document.body.appendChild(n)}function Oe(e){let t=de(),n=r;o();function s(m){const p=re(t,m,Date.now());return t=p.save,C(t),{isNew:p.isNew,count:t.collected[m].count}}function a(m){const p=le(t,m);p!==t&&(t=p,C(t))}function c(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches||t.settings.reducedMotion}function o(){fe(t.settings.soundEnabled),document.documentElement.classList.toggle("is-reduced",c())}function i(m,p){t={...t,settings:{...t.settings,[m]:p}},C(t),o()}function f(){t=v(),C(t),o(),n()}function d(){Ne({speechEnabled:t.settings.speechEnabled,soundEnabled:t.settings.soundEnabled,reducedMotion:t.settings.reducedMotion,onChange:i,onReset:f})}function r(){n=r,we(e,{onCollect:s,onOpenZukan:l,onOpenSettings:d,isReducedMotion:c})}function l(){n=l,ze(e,{save:t,onBack:r,onMarkSeen:a})}r()}je();pe();const K=document.getElementById("app");if(!K)throw new Error("#app が見つかりません");Oe(K);
