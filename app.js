const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let essays = [];
let selectedYear = '108';
let selectedType = 'all';

const escapeHTML = (value = '') => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]));
const clean = value => String(value ?? '').trim();
const typeClass = type => type === '知性題' ? 'knowledge' : 'affective';
const letter = n => String.fromCharCode(64 + Number(n));
const normalizeText = value => clean(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

function paragraphHTML(value, className = 'text-paragraphs') {
  const text = normalizeText(value);
  if (!text) return '';
  // Essay sources use single newline characters to separate paragraphs.
  // Render each essay paragraph as its own <p> so the two-character first-line indent
  // applies consistently to every paragraph, not just the first one.
  const paragraphs = className === 'essay-prose'
    ? text.split(/\n+/)
    : text.split(/\n\s*\n+/);
  return `<div class="${className}">${paragraphs.map(p => `<p>${escapeHTML(p).replace(/\n/g, '<br>')}</p>`).filter(p => p !== '<p></p>').join('')}</div>`;
}
function analysisList(items, className = '') {
  const list = (items || []).filter(item => clean(item));
  if (!list.length) return '<p class="empty-analysis">此欄暫無整理內容。</p>';
  return `<ol class="analysis-list ${className}">${list.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ol>`;
}
function sourceLink(e) {
  return `<a class="official-link" href="${escapeHTML(e.sourceUrl)}" target="_blank" rel="noopener noreferrer">大考中心官方佳作來源 ↗</a>`;
}
function questionPromptsHTML(e) {
  const prompts = e.prompts || [];
  if (!prompts.length) return '<p class="empty-analysis">此年度作答要求尚待核對官方原卷。</p>';
  return `<div class="prompt-list">${prompts.map((p, i) => `<article class="prompt-card"><span class="prompt-label">${escapeHTML(p.label || `寫作要求 ${i + 1}`)}</span>${paragraphHTML(p.text, 'prompt-text')}</article>`).join('')}</div>`;
}
function questionBlockHTML(qid, groupEssays) {
  const first = groupEssays[0];
  const type = first.type;
  const topicTitle = first.title || type;
  const promptMaterial = first.questionMaterial;
  const counts = groupEssays.length;
  const themeHint = type === '知性題' ? '閱讀材料、辨析觀點、形成論述' : '連結經驗、描寫感受、深化體悟';
  const material = promptMaterial ? `<details class="question-material"><summary><span class="material-icon">⌁</span><span>展開題目材料／引文</span><span class="summary-hint">${promptMaterial.length.toLocaleString()} 字元文字材料</span></summary>${paragraphHTML(promptMaterial, 'material-text')}<p class="material-caveat">若原題含圖表、圖片或版面資訊，請點選大考中心官方來源查閱完整題面。</p></details>` : '';
  const essaysHTML = groupEssays.map(e => essayUnitHTML(e)).join('');
  return `<section class="question-block ${typeClass(type)}" aria-labelledby="heading-${escapeHTML(qid)}">
    <header class="question-heading">
      <div class="question-heading-main"><span class="type-pill ${typeClass(type)}">${escapeHTML(type)}</span><h3 id="heading-${escapeHTML(qid)}">${escapeHTML(topicTitle)}</h3><p>${escapeHTML(themeHint)}</p></div>
      <div class="question-count"><strong>${counts}</strong><span>篇優秀範文</span></div>
    </header>
    <div class="question-body">
      <div class="task-heading"><span class="eyebrow-small">THE EXAM QUESTION</span><h4>本年度題目與作答要求</h4></div>
      ${questionPromptsHTML(first)}
      ${material}
      <div class="source-row"><span>題目與範文來源：大考中心學測國寫佳作</span>${sourceLink(first)}</div>
    </div>
    <div class="essays-heading"><div><span class="eyebrow-small">SELECTED ESSAYS</span><h4>優秀範文 <span>與逐篇分析</span></h4></div><span class="essays-heading-note">展開每篇，原文下方即是分析</span></div>
    <div class="essay-stack">${essaysHTML}</div>
  </section>`;
}
function essayUnitHTML(e) {
  const outlineTitle = e.type === '知性題' ? '段落功能與內容摘要' : '部分功能與情感發展';
  const outlineItems = (e.outline || []).slice(0, 4);
  const outlineNodes = outlineItems.map((item, i) => `<article class="mindmap-branch mindmap-branch-${i + 1}"><span class="mindmap-branch-number">${String(i + 1).padStart(2, '0')}</span><div class="mindmap-branch-copy"><span class="mindmap-branch-label">${['第一部分','第二部分','第三部分','第四部分'][i]}</span><p>${escapeHTML(item)}</p></div></article>`).join('');
  const outline = `<section class="analysis-section mindmap-section"><div class="analysis-section-heading"><span class="analysis-num">01</span><div><span class="section-kicker">STRUCTURE · MIND MAP</span><h5>${outlineTitle}</h5><p class="mindmap-section-note">以文章主旨為中心，沿四條主幹閱讀文章的論述／情感進程。</p></div></div><div class="mindmap-board" role="group" aria-label="四部分寫作大綱心智圖"><svg class="mindmap-connectors" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true"><path class="mindmap-line line-1" d="M 410 242 C 390 222, 375 180, 340 137"/><path class="mindmap-line line-2" d="M 590 242 C 610 222, 625 180, 660 137"/><path class="mindmap-line line-3" d="M 410 278 C 390 300, 375 342, 340 383"/><path class="mindmap-line line-4" d="M 590 278 C 610 300, 625 342, 660 383"/><circle class="mindmap-branch-dot dot-1" cx="340" cy="137" r="6"/><circle class="mindmap-branch-dot dot-2" cx="660" cy="137" r="6"/><circle class="mindmap-branch-dot dot-3" cx="340" cy="383" r="6"/><circle class="mindmap-branch-dot dot-4" cx="660" cy="383" r="6"/></svg>${outlineNodes}<div class="mindmap-center"><span class="mindmap-center-kicker">CENTRAL THEME</span><strong>中心主旨</strong><p>${escapeHTML(e.coreInsight || e.title || '本文主題')}</p></div></div></section>`;
  let materials = '';
  if (e.type === '知性題' && (e.materials || []).length) {
    materials = `<section class="analysis-section"><div class="analysis-section-heading"><span class="analysis-num">02</span><div><span class="section-kicker">MATERIALS</span><h5>素材與論證用途</h5></div></div><div class="material-analysis-grid">${e.materials.map(m => `<article class="material-analysis-card"><strong>${escapeHTML(m.name)}</strong><p>${escapeHTML(m.use)}</p></article>`).join('')}</div></section>`;
  }
  const highlightsTitle = e.type === '知性題' ? '論證／思考亮點' : '整體寫作亮點';
  const highlights = `<section class="analysis-section"><div class="analysis-section-heading"><span class="analysis-num">${materials ? '03' : '02'}</span><div><span class="section-kicker">HIGHLIGHTS</span><h5>${highlightsTitle}</h5></div></div>${analysisList(e.highlights, 'highlight-list')}</section>`;
  const quoteBlock = (e.quotes || []).length ? `<section class="analysis-section quote-section"><div class="analysis-section-heading"><span class="analysis-num">${materials ? '04' : '03'}</span><div><span class="section-kicker">ORIGINAL QUOTES</span><h5>值得學習的原文佳句</h5></div></div><div class="quote-grid">${e.quotes.map(q => `<blockquote class="quote-card"><span class="quote-mark">“</span><p>${escapeHTML(q)}</p></blockquote>`).join('')}</div></section>` : '';
  const techniques = e.type === '情意題' && (e.techniques || []).length ? `<section class="analysis-section"><div class="analysis-section-heading"><span class="analysis-num">04</span><div><span class="section-kicker">TECHNIQUES</span><h5>寫作技巧與表達效果</h5></div></div>${analysisList(e.techniques, 'technique-list')}</section>` : '';
  const insight = `<section class="insight-section"><span class="section-kicker">CORE INSIGHT</span><h5>核心洞見</h5><p>${escapeHTML(e.coreInsight || '尚待補充。')}</p></section>`;
  const strategy = `<section class="transfer-section"><span class="section-kicker">TRY IT IN YOUR OWN WRITING</span><h5>可遷移的寫作策略</h5><p>${escapeHTML(e.strategy || '尚待補充。')}</p></section>`;
  const displayTitle = e.type === '知性題' ? '思考與論證' : '敘事與情感';
  const essayBody = paragraphHTML(e.essayText, 'essay-prose');
  return `<article class="essay-unit" id="essay-${escapeHTML(e.id)}">
    <details class="essay-details">
      <summary class="essay-summary">
        <span class="essay-letter">${letter(e.sequence)}</span>
        <span class="essay-summary-text"><span class="essay-meta">${escapeHTML(e.year)} 年學測 · ${escapeHTML(e.type)} · ${escapeHTML(e.id)}</span><strong>優秀範文 ${letter(e.sequence)}</strong><small>${escapeHTML(displayTitle)}｜${escapeHTML(e.coreInsight || '閱讀原文與逐篇分析')}</small></span>
        <span class="expand-essay"><span class="closed-label">閱讀範文與分析</span><span class="open-label">收合文章與分析</span><span class="expand-icon">＋</span></span>
      </summary>
      <div class="essay-detail-content">
        <div class="essay-original-heading"><span class="eyebrow-small">THE ESSAY</span><h5>優秀範文全文</h5><p>先完整閱讀，再往下看分析。</p></div>
        ${essayBody}
        <div class="analysis-start"><span class="analysis-stem">✳</span><div><span class="eyebrow-small">READ THE WRITING</span><h4>這篇文章是如何寫成的？</h4><p>以下依文章原文整理，說明結構、寫作亮點與可學習的方法。</p></div></div>
        <div class="analysis-content">${outline}${materials}${highlights}${quoteBlock}${techniques}<div class="insight-strategy-grid">${insight}${strategy}</div></div>
        <div class="essay-source-note"><strong>來源說明</strong><p>${escapeHTML(e.sourceNote || '')}</p>${sourceLink(e)}</div>
      </div>
    </details>
  </article>`;
}
function groupByType(year) {
  const list = essays.filter(e => e.year === year && (selectedType === 'all' || e.type === selectedType));
  const types = selectedType === 'all' ? ['知性題', '情意題'] : [selectedType];
  return types.map(type => ({type, essays:list.filter(e=>e.type===type)})).filter(g=>g.essays.length);
}
function yearSectionHTML(year, compact = false) {
  const groups = groupByType(year);
  const total = groups.reduce((n,g)=>n+g.essays.length,0);
  const topicTypes = selectedType === 'all' ? ['知性題','情意題'] : [selectedType];
  const topicNames = topicTypes.map(type => {
    const e = essays.find(x=>x.year===year && x.type===type);
    return e ? e.title : '';
  }).filter(Boolean);
  const head = `<div class="year-banner"><div><span class="eyebrow-small">GAOKAO CHINESE WRITING</span><h3>${year} 年學測國寫</h3><p>${topicNames.map(escapeHTML).join('　／　')}</p></div><div class="year-banner-count"><strong>${total}</strong><span>篇範文</span></div></div>`;
  const body = groups.map(group => questionBlockHTML(group.essays[0].questionId, group.essays)).join('');
  if (!compact) return `<div class="year-panel">${head}${body}</div>`;
  return `<details class="year-accordion"><summary><span class="year-summary-number">${year}</span><span class="year-summary-content"><strong>${year} 年學測國寫</strong><small>${topicNames.map(escapeHTML).join('　／　')}</small></span><span class="year-summary-count">${total} 篇 <span>＋</span></span></summary><div class="year-accordion-content">${body}</div></details>`;
}
function render() {
  const container = $('#yearContent');
  if (!essays.length) {
    // Keep the diagnostic visible if data failed to load; year/type clicks must not replace it with an empty result.
    $('#resultCount').textContent = '資料尚未載入';
    $('#currentMode').textContent = selectedType === 'all' ? '知性題與情意題' : selectedType;
    updateCounts();
    if (!container.querySelector('.load-error')) {
      container.innerHTML = '<div class="load-error"><h3>範文資料暫時無法載入</h3><p>請確認 data/essays.js 已與 index.html 一起上傳，且資料檔內容完整。</p></div>';
    }
    return;
  }
  const years = [...new Set(essays.map(e=>e.year))].sort((a,b)=>a-b);
  const relevantYears = selectedYear === 'all' ? years : years.filter(y=>String(y)===String(selectedYear));
  if (selectedYear === 'all') {
    container.innerHTML = relevantYears.map(y=>yearSectionHTML(y,true)).join('');
    // By design, this view starts with the latest year open while keeping all years one click away.
    const latest = $('.year-accordion:last-child', container);
    if (latest) latest.open = true;
    $('#contentTitle').textContent = '全部年度｜題目與優秀範文';
  } else {
    const year = Number(selectedYear);
    container.innerHTML = yearSectionHTML(year,false);
    $('#contentTitle').textContent = `${year} 年學測國寫`;
  }
  const total = essays.filter(e=>(selectedYear==='all'||String(e.year)===String(selectedYear))&&(selectedType==='all'||e.type===selectedType)).length;
  $('#resultCount').textContent = `${total} 篇優秀範文`;
  $('#currentMode').textContent = selectedType==='all' ? '知性題與情意題' : selectedType;
  updateCounts();
}
function updateCounts() {
  $('#totalStat').textContent = essays.length;
  $('#sideTotal').textContent = essays.length;
  $$('.type-filter').forEach(btn => {
    const type = btn.dataset.type;
    const n = type==='all' ? essays.length : essays.filter(e=>e.type===type).length;
    const span = $('span',btn);
    if (span) span.textContent = `${n} 篇`;
  });
}
function setYear(value) {
  selectedYear=String(value);
  $$('.year-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.year===selectedYear));
  $$('.nav-link[data-nav-year]').forEach(btn=>btn.classList.toggle('active',selectedType==='all'));
  render();
  $('#yearLibrary').scrollIntoView({behavior:'smooth',block:'start'});
}
function setType(value) {
  selectedType=value;
  $$('.type-filter').forEach(btn=>btn.classList.toggle('active',btn.dataset.type===selectedType));
  $$('.nav-link[data-nav-type]').forEach(btn=>btn.classList.toggle('active',selectedType!=='all' && btn.dataset.navType===selectedType));
  $$('.nav-link[data-nav-year]').forEach(btn=>btn.classList.toggle('active',selectedType==='all'));
  render();
  $('#yearLibrary').scrollIntoView({behavior:'smooth',block:'start'});
}
async function init() {
  try {
    // Prefer bundled JS data: works when opening index.html directly from the file system.
    if (Array.isArray(window.COMPOSITION_ESSAYS)) {
      essays = window.COMPOSITION_ESSAYS;
    } else {
      // Retain a fallback for future environments that may supply JSON via HTTP.
      const response = await fetch('data/essays.json');
      if (!response.ok) throw new Error('資料載入失敗');
      essays = await response.json();
    }
    updateCounts();
    render();
  } catch(err) {
    $('#yearContent').innerHTML='<div class="load-error"><h3>範文資料暫時無法載入</h3><p>請確認 data/essays.js 已與 index.html 一起上傳，且檔案路徑正確。</p></div>';
  }
  $$('.year-tab').forEach(btn=>btn.addEventListener('click',()=>setYear(btn.dataset.year)));
  $$('.type-filter').forEach(btn=>btn.addEventListener('click',()=>setType(btn.dataset.type)));
  $$('.nav-link[data-nav-year]').forEach(btn=>btn.addEventListener('click',()=>{setType('all');setYear('all');$('#sidebar').classList.remove('open');}));
  $$('.nav-link[data-nav-type]').forEach(btn=>btn.addEventListener('click',()=>{setType(btn.dataset.navType);$('#sidebar').classList.remove('open');}));
  $('#startJourney').addEventListener('click',()=>$('#yearLibrary').scrollIntoView({behavior:'smooth'}));
  $('#mobileMenuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  document.addEventListener('click',e=>{if(window.innerWidth<=760&&!e.target.closest('#sidebar')&&!e.target.closest('#mobileMenuBtn'))$('#sidebar').classList.remove('open');});
}
init();
