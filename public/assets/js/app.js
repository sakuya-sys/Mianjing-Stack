/* 面经本 · 界面逻辑 */
(function () {
  'use strict';

  const Store = window.Store;
  const STATUS_LABEL = Store.STATUS_LABEL;
  const DIFF_LABEL = Store.DIFF_LABEL;
  const STATUS_ORDER = ['todo', 'learning', 'mastered'];
  const TAG_COLORS = [
    { key: 'blue', color: '#6aa8ff', label: '蓝' },
    { key: 'violet', color: '#a78bfa', label: '紫' },
    { key: 'green', color: '#35d399', label: '绿' },
    { key: 'amber', color: '#f2b84b', label: '橙' },
    { key: 'red', color: '#ff7385', label: '红' },
    { key: 'cyan', color: '#5eead4', label: '青' },
    { key: 'pink', color: '#f472b6', label: '粉' },
    { key: 'gray', color: '#94a3b8', label: '灰' }
  ];
  const TAG_COLOR_MAP = TAG_COLORS.reduce(function (map, item) {
    map[item.key] = item.color;
    return map;
  }, {});

  /* ---------------- 图标 ---------------- */
  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };

  function svgIcon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function hydrateIcons() {
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      el.innerHTML = svgIcon(el.getAttribute('data-icon'));
    });
  }

  /* ---------------- 工具 ---------------- */
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ESC_MAP[ch];
    });
  }

  function safeHref(value) {
    const url = String(value || '').trim();
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return url;
    return '';
  }

  function mdInline(text) {
    const codes = [];
    let out = esc(text);
    out = out.replace(/`([^`]+)`/g, function (_, code) {
      codes.push(code);
      return '\u0000CODE' + (codes.length - 1) + '\u0000';
    });
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, src) {
      const url = safeHref(src.replace(/&amp;/g, '&'));
      return url ? '<img src="' + esc(url) + '" alt="' + alt + '" loading="lazy">' : alt;
    });
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, href) {
      const url = safeHref(href.replace(/&amp;/g, '&'));
      if (!url) return label;
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    out = out.replace(/\u0000CODE(\d+)\u0000/g, function (_, index) {
      return '<code>' + esc(codes[Number(index)]) + '</code>';
    });
    return out;
  }

  function mdTableCells(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (cell) {
      return cell.trim();
    });
  }

  function isMdTableSeparator(line) {
    const cells = mdTableCells(line);
    return cells.length > 0 && cells.every(function (cell) {
      return /^:?-{3,}:?$/.test(cell);
    });
  }

  function isMdBlockStart(lines, index) {
    const line = lines[index];
    if (/^\s*```/.test(line) || /^\s*#{1,4}\s+/.test(line) || /^\s*>\s?/.test(line) ||
        /^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line) ||
        /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      return true;
    }
    return line.indexOf('|') > -1 && index + 1 < lines.length && isMdTableSeparator(lines[index + 1]);
  }

  function mdToHtml(text) {
    const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) {
        i++;
        continue;
      }

      const fence = /^\s*```([\w-]*)\s*$/.exec(line);
      if (fence) {
        const lang = fence[1];
        const code = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
          code.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;
        out.push('<pre class="md-code"><code' +
          (lang ? ' class="language-' + esc(lang) + '"' : '') + '>' + esc(code.join('\n')) +
          '</code></pre>');
        continue;
      }

      const heading = /^\s*(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
      if (heading) {
        const level = Math.min(6, heading[1].length + 2);
        out.push('<h' + level + '>' + mdInline(heading[2]) + '</h' + level + '>');
        i++;
        continue;
      }

      if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        out.push('<hr>');
        i++;
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        const quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + quote.map(mdInline).join('<br>') + '</blockquote>');
        continue;
      }

      if (line.indexOf('|') > -1 && i + 1 < lines.length && isMdTableSeparator(lines[i + 1])) {
        const header = mdTableCells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') > -1) {
          rows.push(mdTableCells(lines[i]));
          i++;
        }
        const head = '<tr>' + header.map(function (cell) { return '<th>' + mdInline(cell) + '</th>'; }).join('') + '</tr>';
        const body = rows.map(function (row) {
          return '<tr>' + header.map(function (_, index) {
            return '<td>' + mdInline(row[index] || '') + '</td>';
          }).join('') + '</tr>';
        }).join('');
        out.push('<div class="md-table-wrap"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>');
        continue;
      }

      const unordered = /^\s*[-*+]\s+(.+)/.exec(line);
      if (unordered) {
        const items = [];
        while (i < lines.length) {
          const match = /^\s*[-*+]\s+(.+)/.exec(lines[i]);
          if (!match) break;
          items.push('<li>' + mdInline(match[1]) + '</li>');
          i++;
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      const ordered = /^\s*\d+[.)]\s+(.+)/.exec(line);
      if (ordered) {
        const items = [];
        while (i < lines.length) {
          const match = /^\s*\d+[.)]\s+(.+)/.exec(lines[i]);
          if (!match) break;
          items.push('<li>' + mdInline(match[1]) + '</li>');
          i++;
        }
        out.push('<ol>' + items.join('') + '</ol>');
        continue;
      }

      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !isMdBlockStart(lines, i)) {
        paragraph.push(lines[i]);
        i++;
      }
      if (!paragraph.length) {
        paragraph.push(line);
        i++;
      }
      out.push('<p>' + paragraph.map(mdInline).join('<br>') + '</p>');
    }

    return out.join('');
  }

  function toggleMarkdownPreview(btn) {
    const target = document.getElementById(btn.dataset.target);
    const preview = document.querySelector('[data-md-preview="' + btn.dataset.target + '"]');
    if (!target || !preview) return;
    if (preview.hidden) {
      preview.innerHTML = target.value.trim()
        ? mdToHtml(target.value)
        : '<p class="md-empty">还没有内容，先写一点吧。</p>';
      preview.hidden = false;
      target.hidden = true;
      btn.textContent = '继续编辑';
    } else {
      preview.hidden = true;
      target.hidden = false;
      btn.textContent = '预览';
      target.focus();
    }
  }

  function fmtShortDate(date) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
    if (!m) return date || '';
    const currentYear = String(new Date().getFullYear());
    return m[1] === currentYear ? m[2] + '-' + m[3] : m[1] + '-' + m[2];
  }

  function fmtAdded(iso) {
    const d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return '';
    return (d.getMonth() + 1) + '月' + d.getDate() + '日添加';
  }

  function fmtUpdated(iso) {
    const d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return '';
    return (d.getMonth() + 1) + '月' + d.getDate() + '日更新';
  }

  function normalizeText(text) {
    return String(text == null ? '' : text)
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  function cleanLine(line) {
    let result = String(line).trim();
    result = result.replace(/^(?:Q\s*\d*\s*[:：]|Q\d+\s*[.、]\s*|问\s*[:：])\s*/i, '');
    result = result.replace(/^(?:[（(]\d{1,3}[)）]|\d{1,3}\s*[.)）](?=\s)|\d{1,3}\s*、|[-*•·])\s*/, '');
    return result.trim();
  }

  function safeName(name) {
    const cleaned = String(name || '')
      .replace(/[\\/:*?"<>|\n\r\t]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 60);
    return cleaned || '面经';
  }

  function safeHttpUrl(value) {
    const url = String(value == null ? '' : value).trim();
    return /^https?:\/\//i.test(url) ? url : '';
  }

  function getTagByName(name) {
    if (!state.data || !Array.isArray(state.data.tagLibrary)) return null;
    return state.data.tagLibrary.find(function (tag) { return tag.name === name; }) || null;
  }

  function tagColorHex(name) {
    const tag = getTagByName(name);
    return TAG_COLOR_MAP[tag && tag.color] || TAG_COLOR_MAP.gray;
  }

  function tagChip(name, className) {
    return '<span class="' + (className || 'tag') + '">' +
      '<i class="tag-dot" style="background:' + tagColorHex(name) + '"></i>#' + esc(name) +
    '</span>';
  }

  function getCategoryByName(name) {
    if (!state.data || !Array.isArray(state.data.knowledgeCategories)) return null;
    return state.data.knowledgeCategories.find(function (category) { return category.name === name; }) || null;
  }

  function categoryColorHex(name) {
    const category = getCategoryByName(name);
    return TAG_COLOR_MAP[category && category.color] || TAG_COLOR_MAP.gray;
  }

  function categoryChip(name, className) {
    const label = name || '未分类';
    return '<button class="' + (className || 'note-category') + '" type="button" ' +
      'data-action="filter-knowledge-category" data-category="' + esc(name || '__uncategorized') + '">' +
      '<i class="tag-dot" style="background:' + categoryColorHex(name) + '"></i>' + esc(label) +
    '</button>';
  }

  function nextCategoryColor() {
    const size = (state.data.knowledgeCategories || []).length;
    return TAG_COLORS[size % TAG_COLORS.length].key;
  }

  function ensureKnowledgeCategories() {
    state.data.knowledgeCategories = Array.isArray(state.data.knowledgeCategories)
      ? state.data.knowledgeCategories
      : [];
    const seen = new Set();
    let changed = false;
    state.data.knowledgeCategories = state.data.knowledgeCategories.filter(function (category) {
      if (!category.name || seen.has(category.name)) {
        changed = true;
        return false;
      }
      seen.add(category.name);
      return true;
    });
    (state.data.knowledge || []).forEach(function (note) {
      if (!note.category || seen.has(note.category)) return;
      state.data.knowledgeCategories.push(Store.makeKnowledgeCategory({
        name: note.category,
        color: nextCategoryColor()
      }));
      seen.add(note.category);
      changed = true;
    });
    if (changed) persist();
  }

  function ensureKnowledgeSources() {
    let changed = false;
    (state.data.knowledge || []).forEach(function (note) {
      if (note.sourceInterviewId && note.sourceQuestionId) {
        const sourceIv = getInterview(note.sourceInterviewId);
        if (sourceIv && !note.sourceInterviewName) {
          note.sourceInterviewName = sourceIv.name;
          changed = true;
        }
        return;
      }
      const matches = [];
      state.data.interviews.forEach(function (iv) {
        iv.questions.forEach(function (q) {
          const text = q.content.trim();
          const titleMatch = text === note.title ||
            (text.length > 120 && text.slice(0, 117) + '…' === note.title);
          if (!titleMatch) return;
          const answer = q.answer.trim();
          if (note.content && answer && text.length <= 120 && answer !== note.content.trim()) return;
          matches.push({ iv: iv, q: q });
        });
      });
      if (matches.length === 1) {
        note.sourceInterviewId = matches[0].iv.id;
        note.sourceInterviewName = matches[0].iv.name;
        note.sourceQuestionId = matches[0].q.id;
        changed = true;
      }
    });
    if (changed) persist();
  }

  function createKnowledgeCategoryRecord(name) {
    name = String(name || '').trim().slice(0, 30);
    if (!name || name === '未分类') return '';
    const existing = getCategoryByName(name);
    if (existing) return existing.name;
    state.data.knowledgeCategories.push(Store.makeKnowledgeCategory({
      name: name,
      color: nextCategoryColor()
    }));
    persist();
    return name;
  }

  function renameKnowledgeCategoryEverywhere(category, newName) {
    (state.data.knowledge || []).forEach(function (note) {
      if (note.category === category.name) {
        note.category = newName;
        note.updatedAt = Store.now();
      }
    });
    if (state.knowledgeCategory === category.name) state.knowledgeCategory = newName;
    category.name = newName;
    category.updatedAt = Store.now();
  }

  function removeKnowledgeCategory(category) {
    (state.data.knowledge || []).forEach(function (note) {
      if (note.category === category.name) {
        note.category = '';
        note.updatedAt = Store.now();
      }
    });
    if (state.knowledgeCategory === category.name) state.knowledgeCategory = '';
    state.data.knowledgeCategories = state.data.knowledgeCategories.filter(function (item) {
      return item.id !== category.id;
    });
  }

  function allUsedTagNames() {
    const counts = new Map();
    if (!state.data) return counts;
    function add(list) {
      (list || []).forEach(function (name) {
        counts.set(name, (counts.get(name) || 0) + 1);
      });
    }
    state.data.interviews.forEach(function (iv) {
      add(iv.tags);
      iv.questions.forEach(function (q) { add(q.tags); });
    });
    (state.data.knowledge || []).forEach(function (note) { add(note.tags); });
    return counts;
  }

  function nextTagColor() {
    const size = (state.data.tagLibrary || []).length;
    return TAG_COLORS[size % TAG_COLORS.length].key;
  }

  function splitTagNames(text) {
    const seen = new Set();
    return String(text || '')
      .split(/[\n,，、;；]+/)
      .map(function (part) { return part.trim().replace(/^#+/, '').slice(0, 40); })
      .filter(function (part) {
        if (!part || seen.has(part)) return false;
        seen.add(part);
        return true;
      });
  }

  function downloadFile(filename, text, type) {
    const blob = new Blob([text], { type: type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------------- DOM ---------------- */
  const mainEl = document.getElementById('main');
  const sideNavEl = document.getElementById('sideNav');
  const sideStatsEl = document.getElementById('sideStats');
  const searchEl = document.getElementById('searchInput');
  const toastEl = document.getElementById('toast');
  const modalEl = document.getElementById('modal');
  const scrimEl = document.getElementById('scrim');
  const sidebarEl = document.getElementById('sidebar');
  const themeBtn = document.getElementById('themeBtn');
  const importInput = document.getElementById('importFile');

  /* ---------------- 状态 ---------------- */
  const state = {
    data: null,
    view: 'interviews',
    selectedId: null,
    query: '',
    searchType: 'all',
    showDetail: false,
    navStack: [],
    knowledgeCategory: '',
    cardTagEditId: '',
    draggingNoteId: '',
    status: 'all',
    tag: '',
    quickTags: '',
    expanded: new Set()
  };

  let toastTimer = null;
  let saving = false;
  let saveAgain = false;
  let persistWarned = false;
  let reviewPool = [];
  let reviewCurrent = null;
  let editorScrollY = 0;

  /* ---------------- 提示条 ---------------- */
  function toast(message, options) {
    options = options || {};
    clearTimeout(toastTimer);
    toastEl.innerHTML = '';
    const text = document.createElement('span');
    text.textContent = message;
    toastEl.appendChild(text);

    if (options.action && typeof options.onAction === 'function') {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'toast-action';
      action.textContent = options.action;
      action.addEventListener('click', function () {
        hideToast();
        options.onAction();
      });
      toastEl.appendChild(action);
    }

    toastEl.classList.add('show');
    if (options.duration !== 0) {
      toastTimer = setTimeout(hideToast, options.duration || 2800);
    }
  }

  function hideToast() {
    clearTimeout(toastTimer);
    toastEl.classList.remove('show');
  }

  /* ---------------- 保存状态 ---------------- */
  function setSaveStatus(kind, text) {
    const el = document.getElementById('saveStatus');
    if (!el) return;
    el.className = 'save-status is-' + kind;
    const span = el.querySelector('span');
    if (span) span.textContent = text;
  }

  function updateStorageMeta() {
    const note = document.getElementById('storageNote');
    const status = document.getElementById('saveStatus');
    if (Store.mode === 'server') {
      if (note) note.textContent = '数据文件：data/mianjing.json';
      if (status) status.title = '每次修改都会写入 data/mianjing.json';
    } else {
      if (note) note.textContent = '浏览器存储 · 运行「启动.bat」可改为文件保存';
      if (status) status.title = '数据保存在当前浏览器，换浏览器或清理缓存会丢失';
    }
  }

  async function queueSave() {
    if (!state.data) return;
    if (saving) {
      saveAgain = true;
      return;
    }
    saving = true;
    setSaveStatus('saving', '保存中…');
    const result = await Store.save(state.data);
    saving = false;

    if (!result.ok) {
      const reason = result.error && result.error.message ? result.error.message : '请检查本地服务是否仍在运行';
      setSaveStatus('error', '保存失败');
      if (!persistWarned) {
        persistWarned = true;
        toast('保存失败：' + reason, { duration: 5200 });
      }
      return;
    }

    setSaveStatus('saved', Store.mode === 'server' ? '已保存到本地文件' : '已保存到浏览器');
    if (saveAgain) {
      saveAgain = false;
      queueSave();
    }
  }

  function persist() {
    queueSave();
  }

  /* ---------------- 数据读取辅助 ---------------- */
  function activeQuery() {
    return state.query.trim();
  }

  function currentInterview() {
    if (!state.data) return null;
    return state.data.interviews.find(function (iv) { return iv.id === state.selectedId; }) || null;
  }

  function getInterview(id) {
    if (!state.data) return null;
    return state.data.interviews.find(function (iv) { return iv.id === id; }) || null;
  }

  function getQuestion(interviewId, questionId) {
    const iv = getInterview(interviewId);
    if (!iv) return null;
    const index = iv.questions.findIndex(function (q) { return q.id === questionId; });
    if (index < 0) return null;
    return { iv: iv, q: iv.questions[index], index: index };
  }

  function getKnowledge(id) {
    return (state.data.knowledge || []).find(function (note) { return note.id === id; }) || null;
  }

  function getTagById(id) {
    return (state.data.tagLibrary || []).find(function (tag) { return tag.id === id; }) || null;
  }

  function tagUsageCount(name) {
    return allUsedTagNames().get(name) || 0;
  }

  function replaceTagInList(list, oldName, newName) {
    let changed = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i] === oldName) {
        list[i] = newName;
        changed = true;
      }
    }
    if (changed) {
      const unique = [];
      list.forEach(function (name) {
        if (unique.indexOf(name) === -1) unique.push(name);
      });
      list.length = 0;
      Array.prototype.push.apply(list, unique);
    }
    return changed;
  }

  function renameTagEverywhere(oldName, newName) {
    state.data.interviews.forEach(function (iv) {
      replaceTagInList(iv.tags, oldName, newName);
      iv.questions.forEach(function (q) { replaceTagInList(q.tags, oldName, newName); });
      iv.updatedAt = Store.now();
    });
    (state.data.knowledge || []).forEach(function (note) {
      replaceTagInList(note.tags, oldName, newName);
    });
    if (state.tag === oldName) state.tag = newName;
  }

  function removeTagEverywhere(name) {
    function clean(list) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i] === name) list.splice(i, 1);
      }
    }
    state.data.interviews.forEach(function (iv) {
      clean(iv.tags);
      iv.questions.forEach(function (q) { clean(q.tags); });
    });
    (state.data.knowledge || []).forEach(function (note) { clean(note.tags); });
    if (state.tag === name) state.tag = '';
  }

  function createTagRecord(name, group, color) {
    const existing = getTagByName(name);
    if (existing) return existing;
    const tag = Store.makeTag({
      name: name,
      group: group || '未分类',
      color: color || nextTagColor()
    });
    state.data.tagLibrary.push(tag);
    persist();
    return tag;
  }

  function sortedInterviews() {
    return state.data.interviews.slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }

  function allQuestions() {
    const out = [];
    state.data.interviews.forEach(function (iv) {
      iv.questions.forEach(function (q) { out.push({ iv: iv, q: q }); });
    });
    return out;
  }

  function searchInterviews(query) {
    const needle = query.toLowerCase();
    return sortedInterviews().filter(function (iv) {
      const haystack = [iv.name, iv.tags.join(' '), iv.notes || '', iv.date || '', iv.sourceUrl || '']
        .join('\n')
        .toLowerCase();
      return haystack.indexOf(needle) > -1;
    });
  }

  function searchQuestions(query) {
    const needle = query.toLowerCase();
    const out = [];
    state.data.interviews.forEach(function (iv) {
      iv.questions.forEach(function (q) {
        const haystack = [q.content, q.answer, q.tags.join(' ')].join('\n').toLowerCase();
        if (haystack.indexOf(needle) > -1) {
          out.push({ iv: iv, q: q });
        }
      });
    });
    return out;
  }

  function searchKnowledge(query) {
    const needle = query.toLowerCase();
    return (state.data.knowledge || []).filter(function (note) {
      const haystack = [note.title, note.content, note.tags.join(' ')].join('\n').toLowerCase();
      return haystack.indexOf(needle) > -1;
    });
  }

  function counts(questions) {
    const c = { all: questions.length, todo: 0, learning: 0, mastered: 0, noAnswer: 0 };
    questions.forEach(function (q) {
      if (q.status === 'mastered') c.mastered++;
      else if (q.status === 'learning') c.learning++;
      else c.todo++;
      if (!q.answer.trim()) c.noAnswer++;
    });
    return c;
  }

  function matchesFilter(q) {
    if (state.status === 'noanswer') {
      if (q.answer.trim()) return false;
    } else if (state.status !== 'all' && q.status !== state.status) {
      return false;
    }
    if (state.tag && q.tags.indexOf(state.tag) === -1) return false;
    return true;
  }

  function filterQuestions(questions) {
    return questions.filter(matchesFilter);
  }

  function tagCounts(questions) {
    const map = new Map();
    questions.forEach(function (q) {
      q.tags.forEach(function (tag) {
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort(function (a, b) {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0], 'zh-CN');
    });
  }

  function clearSearchInput() {
    state.query = '';
    state.searchType = 'all';
    state.showDetail = false;
    state.navStack = [];
    searchEl.value = '';
  }

  function clearListFilters() {
    state.status = 'all';
    state.tag = '';
  }

  function ensureTagLibrary() {
    state.data.tagLibrary = Array.isArray(state.data.tagLibrary) ? state.data.tagLibrary : [];
    const seen = new Set();
    let changed = false;
    state.data.tagLibrary = state.data.tagLibrary.filter(function (tag) {
      if (!tag.name || seen.has(tag.name)) {
        changed = true;
        return false;
      }
      seen.add(tag.name);
      return true;
    });
    allUsedTagNames().forEach(function (count, name) {
      if (seen.has(name)) return;
      state.data.tagLibrary.push(Store.makeTag({
        name: name,
        group: '未分类',
        color: nextTagColor()
      }));
      seen.add(name);
      changed = true;
    });
    if (changed) persist();
  }

  /* ---------------- 初始化 ---------------- */
  async function init() {
    hydrateIcons();
    updateThemeIcon();
    setSaveStatus('loading', '正在读取…');

    let result;
    try {
      result = await Store.init();
    } catch (err) {
      result = { data: Store.emptyData(), mode: 'browser', error: 'load-failed' };
    }

    state.data = result.data;
    state.data.knowledge = state.data.knowledge || [];
    state.data.tagLibrary = state.data.tagLibrary || [];
    ensureTagLibrary();
    ensureKnowledgeCategories();
    ensureKnowledgeSources();
    if (state.data.interviews.length) {
      state.view = 'interviews';
      state.selectedId = null;
    } else if (state.data.knowledge.length) {
      state.view = 'knowledge';
    }

    updateStorageMeta();
    bindEvents();

    if (result.error === 'corrupt') {
      setSaveStatus('error', '读取失败');
      toast('本地数据读取失败，已使用空白数据。建议从备份导入。', { duration: 6000 });
    } else if (result.error === 'storage-unavailable') {
      setSaveStatus('error', '无法保存');
      toast('浏览器禁用了本地存储，数据将无法自动保存', { duration: 6500 });
    } else if (result.error === 'load-failed') {
      setSaveStatus('error', '读取失败');
      toast('数据读取失败，请刷新页面重试', { duration: 5000 });
    } else {
      setSaveStatus(
        Store.mode === 'server' ? 'saved' : 'browser',
        Store.mode === 'server' ? '已保存到本地文件' : '浏览器本地存储'
      );
    }

    render();
  }

  function bindEvents() {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('change', onDocumentChange);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragend', onDragEnd);
    searchEl.addEventListener('input', function () {
      state.query = searchEl.value;
      state.showDetail = false;
      state.navStack = [];
      state.searchType = 'all';
      render();
    });
    searchEl.addEventListener('search', function () {
      state.query = searchEl.value;
      state.showDetail = false;
      state.navStack = [];
      state.searchType = 'all';
      render();
    });
    importInput.addEventListener('change', onImportFile);
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) closeModal();
    });
    modalEl.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeModal();
    });
    scrimEl.addEventListener('click', closeSidebar);
  }

  function onDocumentClick(e) {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      closeModal();
      return;
    }
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    handleAction(actionEl.dataset.action, actionEl);
  }

  function onDocumentChange(e) {
    const select = e.target.closest('[data-action="set-card-category"]');
    if (!select) return;
    const note = getKnowledge(select.dataset.id);
    if (note) assignNoteCategory(note, select.value);
  }

  function assignNoteCategory(note, category) {
    if (!note) return;
    category = category === '__uncategorized' ? '' : category;
    if (note.category === category) {
      toast('已经在这个分类了');
      return;
    }
    note.category = category;
    note.updatedAt = Store.now();
    persist();
    render();
    toast('已归到「' + (category || '未分类') + '」');
  }

  function onDragStart(e) {
    const handle = e.target.closest('[data-note-drag]');
    if (!handle) return;
    const id = handle.dataset.noteDrag;
    state.draggingNoteId = id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
    const card = handle.closest('.note-card');
    if (card) card.classList.add('is-dragging');
    const bar = document.querySelector('.knowledge-cats');
    if (bar) bar.classList.add('is-dragging');
  }

  function onDragOver(e) {
    const chip = e.target.closest('.cat-filter[data-category]');
    if (!chip || !chip.dataset.category) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.cat-filter.drag-over').forEach(function (item) {
      item.classList.remove('drag-over');
    });
    chip.classList.add('drag-over');
  }

  function onDragLeave(e) {
    const chip = e.target.closest('.cat-filter[data-category]');
    if (chip) chip.classList.remove('drag-over');
  }

  function onDrop(e) {
    const chip = e.target.closest('.cat-filter[data-category]');
    if (!chip || !chip.dataset.category) return;
    e.preventDefault();
    const id = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || state.draggingNoteId;
    const note = getKnowledge(id);
    if (note) assignNoteCategory(note, chip.dataset.category);
    clearDragState();
  }

  function onDragEnd() {
    clearDragState();
  }

  function clearDragState() {
    state.draggingNoteId = '';
    document.querySelectorAll('.cat-filter.drag-over').forEach(function (item) {
      item.classList.remove('drag-over');
    });
    document.querySelectorAll('.note-card.is-dragging').forEach(function (item) {
      item.classList.remove('is-dragging');
    });
    const bar = document.querySelector('.knowledge-cats');
    if (bar) bar.classList.remove('is-dragging');
  }

  function onKeyDown(e) {
    if (modalEl.open) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchEl.focus();
      searchEl.select();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target && e.target.id === 'quickAdd') {
      e.preventDefault();
      quickAdd();
      return;
    }

    if (e.key === 'Escape' && document.activeElement === searchEl && searchEl.value) {
      e.preventDefault();
      searchEl.value = '';
      state.query = '';
      state.searchType = 'all';
      state.showDetail = false;
      state.navStack = [];
      render();
      return;
    }

    if (e.key === 'Escape' && state.showDetail) {
      e.preventDefault();
      backFromDetail();
    }
  }

  /* ---------------- 渲染入口 ---------------- */
  function render() {
    renderSidebar();
    renderMain();
    initCardTagEditors();
    updateThemeIcon();
    updateDocumentTitle();
  }

  function updateDocumentTitle() {
    const iv = currentInterview();
    if (activeQuery() && !state.showDetail) {
      document.title = '搜索 · 面经本';
    } else if (state.view === 'interview' && iv) {
      document.title = iv.name + ' · 面经本';
    } else if (state.view === 'interviews') {
      document.title = '面试总览 · 面经本';
    } else if (state.view === 'knowledge') {
      document.title = '知识点 · 面经本';
    } else if (state.view === 'tags') {
      document.title = '标签管理 · 面经本';
    } else if (state.view === 'all') {
      document.title = '全部题目 · 面经本';
    } else {
      document.title = '面经本 · 面试题库与知识点';
    }
  }

  function renderSidebar() {
    const s = Store.stats(state.data);
    const idle = !activeQuery();
    const items = state.data.interviews.map(function (iv) {
      const active = state.view === 'interview' && state.selectedId === iv.id && (idle || state.showDetail);
      const done = iv.questions.filter(function (q) { return q.status === 'mastered'; }).length;
      const sub = [
        iv.date ? fmtShortDate(iv.date) : '未填日期',
        iv.questions.length + ' 题',
        '已掌握 ' + done
      ].join(' · ');
      return '<button class="nav-item' + (active ? ' active' : '') + '" type="button" title="' + esc(iv.name) + '" ' +
        'data-action="select-interview" data-id="' + esc(iv.id) + '">' +
        '<span class="nav-body"><span class="nav-name">' + esc(iv.name) + '</span>' +
        '<span class="nav-sub">' + esc(sub) + '</span></span>' +
        '<span class="nav-count">' + iv.questions.length + '</span></button>';
    }).join('');

    sideNavEl.innerHTML =
      '<button class="nav-item' + (idle && state.view === 'interviews' ? ' active' : '') + '" type="button" data-action="select-interviews">' +
        '<span class="nav-body"><span class="nav-name">面试总览</span><span class="nav-sub">按场次浏览全部面试</span></span>' +
        '<span class="nav-count">' + s.interviews + '</span></button>' +
      '<button class="nav-item' + (idle && state.view === 'all' ? ' active' : '') + '" type="button" data-action="select-all">' +
        '<span class="nav-body"><span class="nav-name">全部题目</span><span class="nav-sub">跨面试汇总与复习</span></span>' +
        '<span class="nav-count">' + s.questions + '</span></button>' +
      '<button class="nav-item' + (idle && state.view === 'knowledge' ? ' active' : '') + '" type="button" data-action="select-knowledge">' +
        '<span class="nav-body"><span class="nav-name">知识点</span><span class="nav-sub">概念、命令与踩坑记录</span></span>' +
        '<span class="nav-count">' + s.knowledge + '</span></button>' +
      '<button class="nav-item' + (idle && state.view === 'tags' ? ' active' : '') + '" type="button" data-action="select-tags">' +
        '<span class="nav-body"><span class="nav-name">标签管理</span><span class="nav-sub">分类、颜色与批量创建</span></span>' +
        '<span class="nav-count">' + s.tagLibrary + '</span></button>' +
      '<div class="nav-label">面试记录 <span>' + s.interviews + '</span></div>' +
      (items || '<p class="side-empty">还没有面试记录，点上面的按钮新建</p>');

    sideStatsEl.innerHTML =
      '<div class="side-stat"><b>' + s.interviews + '</b><span>面试</span></div>' +
      '<div class="side-stat"><b>' + s.questions + '</b><span>题目</span></div>' +
      '<div class="side-stat"><b>' + s.knowledge + '</b><span>知识点</span></div>' +
      '<div class="side-stat"><b>' + s.mastered + '</b><span>已掌握</span></div>';
  }

  function renderMain() {
    const query = activeQuery();
    if (query && !state.showDetail) {
      mainEl.innerHTML = renderSearchPage(query);
      return;
    }
    if (state.view === 'tags') {
      mainEl.innerHTML = renderTagsPage();
      return;
    }
    if (!state.data.interviews.length && !state.data.knowledge.length) {
      mainEl.innerHTML = renderEmptyApp();
      return;
    }
    if (state.view === 'knowledge') {
      mainEl.innerHTML = renderKnowledgePage();
      return;
    }
    if (state.view === 'interviews') {
      mainEl.innerHTML = renderAllInterviewsPage();
      return;
    }
    if (state.view === 'all') {
      mainEl.innerHTML = renderAllPage();
      return;
    }
    if (state.view === 'interview') {
      const iv = currentInterview();
      if (!iv) {
        state.view = 'interviews';
        mainEl.innerHTML = renderAllInterviewsPage();
        return;
      }
      mainEl.innerHTML = renderInterviewPage(iv);
      return;
    }
    mainEl.innerHTML = renderAllInterviewsPage();
  }

  /* ---------------- 页面：空白引导 ---------------- */
  function renderEmptyApp() {
    return '<section class="hero">' +
      '<div class="hero-icon">' + svgIcon('book') + '</div>' +
      '<div class="eyebrow">Interview Notes</div>' +
      '<h1>把面试题和知识点，整理成自己的题库</h1>' +
      '<p>先写下公司 / 岗位，再把题目一条条粘进来。答案不用急着补，平时看到的概念、命令和踩坑，也可以记到知识点里。</p>' +
      '<div class="hero-actions">' +
        '<button class="btn btn-primary btn-lg" type="button" data-action="new-interview">' + svgIcon('plus') + '新建第一场面试</button>' +
        '<button class="btn btn-ghost btn-lg" type="button" data-action="new-knowledge">' + svgIcon('file') + '记录知识点</button>' +
        '<button class="btn btn-ghost btn-lg" type="button" data-action="load-sample">' + svgIcon('book') + '看看示例</button>' +
      '</div>' +
      '<div class="feature-grid">' +
        '<div class="feature"><b>一行一题</b><span>从聊天记录、面经里直接粘贴，自动去掉序号</span></div>' +
        '<div class="feature"><b>答案留空</b><span>先收集题目，之后随时回来补答案</span></div>' +
        '<div class="feature"><b>知识点库</b><span>单独记录概念、命令、踩坑和代码片段</span></div>' +
        '<div class="feature"><b>抽题复习</b><span>随机抽一道，遮住答案自测</span></div>' +
      '</div>' +
      '<p class="hero-hint">当前模式：' + (Store.mode === 'server' ? '本地文件存储' : '浏览器存储') + '。内容都可以随时修改。</p>' +
    '</section>';
  }

  /* ---------------- 页面：面试总览 ---------------- */
  function renderInterviewCard(iv) {
    const done = iv.questions.filter(function (q) { return q.status === 'mastered'; }).length;
    const pct = iv.questions.length ? Math.round((done / iv.questions.length) * 100) : 0;
    const tags = iv.tags.slice(0, 3).map(function (tag) {
      return tagChip(tag);
    }).join('');
    return '<button class="interview-card" type="button" data-action="select-interview" data-id="' + esc(iv.id) + '" ' +
        'title="打开「' + esc(iv.name) + '」">' +
      '<span class="ic-top">' +
        '<span class="ic-date">' + (iv.date ? esc(iv.date) : '未填日期') + '</span>' +
        '<span class="ic-num">' + iv.questions.length + ' 题</span>' +
      '</span>' +
      '<span class="ic-title">' + esc(iv.name) + '</span>' +
      (tags ? '<span class="ic-tags">' + tags + '</span>' : '<span class="ic-tags is-empty">暂无标签</span>') +
      '<span class="ic-progress">' +
        '<span class="ic-bar"><i style="width:' + pct + '%"></i></span>' +
        '<span class="ic-progress-text">' + (iv.questions.length ? '已掌握 ' + done + ' / ' + iv.questions.length : '还没有题目') + '</span>' +
      '</span>' +
      '<span class="ic-open">打开面试 ' + svgIcon('arrow') + '</span>' +
    '</button>';
  }

  function renderAllInterviewsPage() {
    const list = sortedInterviews();
    const questions = allQuestions().map(function (item) { return item.q; });
    const c = counts(questions);
    const s = Store.stats(state.data);
    const cards = list.map(function (iv) { return renderInterviewCard(iv); }).join('');

    return '<section class="page-head">' +
      '<div class="eyebrow">面试总览</div>' +
      '<div class="title-row">' +
        '<h1 class="page-title">全部面试</h1>' +
        '<div class="title-actions">' +
          '<button class="btn btn-primary" type="button" data-action="new-interview">' + svgIcon('plus') + '<span>新建面试</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="meta-row">' +
        '<span class="meta-chip">' + s.interviews + ' 场面试</span>' +
        '<span class="meta-chip">' + s.questions + ' 道题</span>' +
        '<span class="meta-chip">' + s.knowledge + ' 条知识点</span>' +
        (c.noAnswer ? '<span class="meta-chip">' + c.noAnswer + ' 道待补答案</span>' : '') +
      '</div>' +
      (c.all ? renderProgress(c) : '') +
    '</section>' +
    (list.length
      ? '<div class="interview-grid">' + cards + '</div>'
      : '<div class="empty-panel">' +
          '<div class="empty-icon">' + svgIcon('book') + '</div>' +
          '<h3>还没有面试</h3><p>新建一场面试，把题目粘进去。</p>' +
          '<button class="btn btn-primary" type="button" data-action="new-interview">' + svgIcon('plus') + '新建面试</button>' +
        '</div>');
  }

  /* ---------------- 页面：知识点 ---------------- */
  function renderKnowledgePage() {
    const allNotes = (state.data.knowledge || []).slice().sort(function (a, b) {
      return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });
    const categories = (state.data.knowledgeCategories || []).slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    let filter = state.knowledgeCategory;
    if (filter && filter !== '__uncategorized' && !categories.some(function (category) { return category.name === filter; })) {
      state.knowledgeCategory = '';
      filter = '';
    }

    const tagSet = new Set();
    allNotes.forEach(function (note) {
      note.tags.forEach(function (tag) { tagSet.add(tag); });
    });

    const uncategorized = allNotes.filter(function (note) { return !note.category; }).length;
    const categoryCounts = {};
    categories.forEach(function (category) {
      categoryCounts[category.name] = allNotes.filter(function (note) { return note.category === category.name; }).length;
    });
    const notes = allNotes.filter(function (note) {
      if (!filter) return true;
      if (filter === '__uncategorized') return !note.category;
      return note.category === filter;
    });

    const categoryChips =
      '<div class="knowledge-cats" aria-label="知识点分类">' +
        '<button class="cat-filter' + (!filter ? ' active' : '') + '" type="button" ' +
          'data-action="filter-knowledge-category" data-category="">全部<b>' + allNotes.length + '</b></button>' +
        '<button class="cat-filter' + (filter === '__uncategorized' ? ' active' : '') + '" type="button" ' +
          'data-action="filter-knowledge-category" data-category="__uncategorized" ' +
          'title="拖动知识点到这里，归到未分类">未分类<b>' + uncategorized + '</b></button>' +
        categories.map(function (category) {
          return '<button class="cat-filter' + (filter === category.name ? ' active' : '') + '" type="button" ' +
            'data-action="filter-knowledge-category" data-category="' + esc(category.name) + '" ' +
            'title="拖动知识点到这里，归到「' + esc(category.name) + '」">' +
            '<i class="tag-dot" style="background:' + categoryColorHex(category.name) + '"></i>' +
            esc(category.name) + '<b>' + (categoryCounts[category.name] || 0) + '</b></button>';
        }).join('') +
      '</div>';

    let list;
    if (!allNotes.length) {
      list = '<div class="empty-panel">' +
        '<div class="empty-icon">' + svgIcon('file') + '</div>' +
        '<h3>还没有知识点</h3><p>把概念、命令、踩坑和代码片段记在这里，和面经分开管理。</p>' +
        '<button class="btn btn-primary" type="button" data-action="new-knowledge">' + svgIcon('plus') + '记录第一条</button>' +
      '</div>';
    } else if (!notes.length) {
      list = '<div class="empty-panel">' +
        '<div class="empty-icon">' + svgIcon('search') + '</div>' +
        '<h3>这个分类下还没有知识点</h3><p>换个分类，或者把这个知识点归到这个分类。</p>' +
        '<button class="btn btn-ghost" type="button" data-action="clear-knowledge-category">查看全部知识点</button>' +
      '</div>';
    } else {
      list = '<div class="note-list">' + notes.map(renderKnowledgeCard).join('') + '</div>';
    }

    return '<section class="page-head">' +
      '<div class="eyebrow">知识库</div>' +
      '<div class="title-row">' +
        '<h1 class="page-title">知识点</h1>' +
        '<div class="title-actions">' +
          '<button class="btn btn-ghost" type="button" data-action="manage-knowledge-categories">' + svgIcon('edit') + '<span>分类管理</span></button>' +
          '<button class="btn btn-primary" type="button" data-action="new-knowledge">' + svgIcon('plus') + '<span>新建知识点</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="meta-row">' +
        '<span class="meta-chip">' + allNotes.length + ' 条知识点</span>' +
        '<span class="meta-chip">' + categories.length + ' 个分类</span>' +
        (tagSet.size ? '<span class="meta-chip">' + tagSet.size + ' 个标签</span>' : '') +
        (categories.length && allNotes.length ? '<span class="meta-chip">拖动卡片右上角把手到分类，可快速归类</span>' : '') +
      '</div>' +
      categoryChips +
    '</section>' + list;
  }

  function renderCategorySelect(note) {
    const categories = (state.data.knowledgeCategories || []).slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    const current = note.category || '';
    const options = '<option value="">未分类</option>' +
      categories.map(function (category) {
        return '<option value="' + esc(category.name) + '"' +
          (category.name === current ? ' selected' : '') + '>' + esc(category.name) + '</option>';
      }).join('') +
      (current && !categories.some(function (category) { return category.name === current; })
        ? '<option value="' + esc(current) + '" selected>' + esc(current) + '</option>'
        : '');
    return '<select class="note-category-select" data-action="set-card-category" ' +
      'data-id="' + esc(note.id) + '" title="直接切换知识点分类">' + options + '</select>';
  }

  function renderNoteSource(note) {
    if (!note.sourceInterviewId) return '';
    const source = note.sourceInterviewId && note.sourceQuestionId
      ? getQuestion(note.sourceInterviewId, note.sourceQuestionId)
      : null;
    const label = source ? source.iv.name : (note.sourceInterviewName || '原题已删除');
    return '<button class="note-source' + (source ? '' : ' is-missing') + '" type="button" ' +
      'data-action="open-note-source" data-id="' + esc(note.id) + '" ' +
      'title="' + (source ? '回到原题：' + esc(source.iv.name) : '原题已经不存在了') + '">' +
      svgIcon('arrow') + (source ? '原题 · ' + esc(label) : '原题已删除') +
    '</button>';
  }

  function initCardTagEditors() {
    document.querySelectorAll('[data-card-tag-editor]').forEach(function (editor) {
      initTagPicker(editor);
      const input = editor.querySelector('[data-tag-search]');
      if (input) setTimeout(function () { input.focus(); }, 40);
    });
  }

  function saveCardTags() {
    const note = getKnowledge(state.cardTagEditId);
    if (!note) return;
    const editor = document.querySelector('[data-card-tag-editor]');
    if (!editor) return;
    const hidden = editor.querySelector('input[name="tags"]');
    note.tags = Store.parseTags(hidden ? hidden.value : '');
    note.updatedAt = Store.now();
    state.cardTagEditId = '';
    persist();
    render();
    toast('标签已更新');
  }

  function renderKnowledgeCard(note) {
    const tags = note.tags.map(function (tag) {
      return tagChip(tag);
    }).join('');
    const content = note.content
      ? '<div class="note-content md-body">' + mdToHtml(note.content) + '</div>'
      : '<div class="note-content is-empty">还没有内容，点右上角编辑补充。</div>';
    const readButton = note.content
      ? '<button class="link-btn note-read" type="button" data-action="read-knowledge" data-id="' + esc(note.id) + '">专注阅读</button>'
      : '';
    const source = renderNoteSource(note);
    const editingTags = state.cardTagEditId === note.id;
    const dragHandle = state.view === 'knowledge' && !activeQuery()
      ? '<span class="note-drag-handle" draggable="true" data-note-drag="' + esc(note.id) + '" ' +
          'title="拖动到上方分类，快速归类" aria-label="拖动到分类">' + svgIcon('menu') + '</span>'
      : '';
    const tagButton = '<button class="link-btn note-tag-edit" type="button" data-action="edit-card-tags" ' +
      'data-id="' + esc(note.id) + '">' + (editingTags ? '收起标签' : (note.tags.length ? '编辑标签' : '+ 添加标签')) + '</button>';
    const tagEditor = editingTags
      ? '<div class="note-card-tags-editor" data-card-tag-editor>' +
          '<div class="note-card-tags-head">' +
            '<span>直接编辑标签</span>' +
            '<div class="note-card-tags-actions">' +
              '<button class="btn btn-ghost btn-sm" type="button" data-action="cancel-card-tags">取消</button>' +
              '<button class="btn btn-primary btn-sm" type="button" data-action="save-card-tags">完成</button>' +
            '</div>' +
          '</div>' +
          renderTagPicker(note.tags) +
        '</div>'
      : '';

    return '<article class="note-card" data-note-id="' + esc(note.id) + '">' +
      '<div class="note-head">' +
        '<div class="note-title-wrap">' +
          '<h3 class="note-title">' +
            '<button class="note-title-btn" type="button" data-action="read-knowledge" data-id="' + esc(note.id) + '" ' +
              'title="专注阅读：' + esc(note.title) + '">' + esc(note.title) + '</button>' +
          '</h3>' +
          '<div class="note-meta-line">' +
            renderCategorySelect(note) +
            source +
          '</div>' +
        '</div>' +
        '<div class="note-head-tools">' +
          dragHandle +
          '<div class="note-actions">' +
            '<button class="icon-btn sm" type="button" data-action="edit-knowledge" data-id="' + esc(note.id) + '" ' +
              'title="编辑知识点" aria-label="编辑知识点">' + svgIcon('edit') + '</button>' +
            '<button class="icon-btn sm danger" type="button" data-action="delete-knowledge" data-id="' + esc(note.id) + '" ' +
              'title="删除知识点" aria-label="删除知识点">' + svgIcon('trash') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      content +
      '<div class="note-foot">' +
        '<div class="note-tags">' + (tags || '<span class="note-tag-empty">无标签</span>') + '</div>' +
        tagButton +
        readButton +
        '<span class="note-time">' + esc(fmtUpdated(note.updatedAt)) + '</span>' +
      '</div>' +
      tagEditor +
    '</article>';
  }

  /* ---------------- 页面：标签管理 ---------------- */
  function renderTagsPage() {
    const tags = (state.data.tagLibrary || []).slice();
    const used = allUsedTagNames();
    const groups = Array.from(new Set(tags.map(function (tag) { return tag.group || '未分类'; })));
    groups.sort(function (a, b) {
      if (a === '未分类') return 1;
      if (b === '未分类') return -1;
      return a.localeCompare(b, 'zh-CN');
    });

    const sections = groups.map(function (group) {
      const groupTags = tags
        .filter(function (tag) { return (tag.group || '未分类') === group; })
        .sort(function (a, b) { return a.name.localeCompare(b.name, 'zh-CN'); });
      const items = groupTags.map(function (tag) {
        const count = used.get(tag.name) || 0;
        return '<div class="tag-manage-item">' +
          tagChip(tag.name, 'tag tag-lg') +
          '<span class="tag-usage">' + (count ? count + ' 处引用' : '暂未使用') + '</span>' +
          '<div class="tag-manage-actions">' +
            '<button class="icon-btn sm" type="button" data-action="edit-tag" data-id="' + esc(tag.id) + '" ' +
              'title="编辑标签" aria-label="编辑标签">' + svgIcon('edit') + '</button>' +
            '<button class="icon-btn sm danger" type="button" data-action="delete-tag" data-id="' + esc(tag.id) + '" ' +
              'title="删除标签" aria-label="删除标签">' + svgIcon('trash') + '</button>' +
          '</div>' +
        '</div>';
      }).join('');
      return '<section class="tag-group-card">' +
        '<div class="tag-group-head"><h2>' + esc(group) + '</h2><span>' + groupTags.length + ' 个标签</span></div>' +
        '<div class="tag-manage-grid">' + items + '</div>' +
      '</section>';
    }).join('');

    return '<section class="page-head">' +
      '<div class="eyebrow">标签库</div>' +
      '<div class="title-row">' +
        '<h1 class="page-title">标签管理</h1>' +
        '<div class="title-actions">' +
          '<button class="btn btn-primary" type="button" data-action="new-tag">' + svgIcon('plus') + '<span>新建标签</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="meta-row">' +
        '<span class="meta-chip">' + tags.length + ' 个标签</span>' +
        '<span class="meta-chip">' + groups.length + ' 个分类</span>' +
        '<span class="meta-chip">选中标签后可在各处复用</span>' +
      '</div>' +
    '</section>' +
    (tags.length
      ? '<div class="tag-groups">' + sections + '</div>'
      : '<div class="empty-panel">' +
          '<div class="empty-icon">' + svgIcon('file') + '</div>' +
          '<h3>还没有标签</h3><p>先建几个常用标签和分类，之后录入面试、题目、知识点时直接点选。</p>' +
          '<button class="btn btn-primary" type="button" data-action="new-tag">' + svgIcon('plus') + '新建标签</button>' +
        '</div>');
  }

  /* ---------------- 页面：单场面试 ---------------- */
  function getBackInfo(snapshot) {
    if (!snapshot) return null;
    if (snapshot.view === 'interview') {
      const previous = getInterview(snapshot.selectedId);
      return {
        label: '返回上一场面试',
        sub: previous ? previous.name : '',
        title: previous ? '返回「' + previous.name + '」' : '返回上一场面试'
      };
    }
    const query = String(snapshot.query || '').trim();
    if (query) {
      return {
        label: '返回搜索结果',
        sub: '当前搜索：' + query,
        title: '返回「' + query + '」的搜索结果'
      };
    }
    if (snapshot.view === 'interviews') {
      return { label: '返回全部面试', sub: '面试总览', title: '返回全部面试' };
    }
    if (snapshot.view === 'all') {
      return { label: '返回全部题目', sub: '全部题目', title: '返回全部题目' };
    }
    if (snapshot.view === 'knowledge') {
      return { label: '返回知识点', sub: '知识点', title: '返回知识点' };
    }
    return { label: '返回上一页', sub: '', title: '返回上一页' };
  }

  function renderInterviewPage(iv) {
    const questions = iv.questions;
    const visible = filterQuestions(questions);
    const c = counts(questions);
    const tags = tagCounts(questions);
    const metaTags = iv.tags.map(function (tag) {
      return tagChip(tag, 'meta-tag');
    }).join('');
    const sourceUrl = safeHttpUrl(iv.sourceUrl);
    const backInfo = getBackInfo(state.navStack[state.navStack.length - 1] || null);

    return (backInfo
      ? '<div class="search-return">' +
          '<button class="search-return-btn" type="button" data-action="back-from-detail" ' +
            'title="' + esc(backInfo.title) + '">← ' + esc(backInfo.label) + '</button>' +
          (backInfo.sub ? '<span class="search-return-query">' + esc(backInfo.sub) + '</span>' : '') +
        '</div>'
      : '') +
      '<section class="page-head">' +
      '<div class="eyebrow">面试记录</div>' +
      '<div class="title-row">' +
        '<h1 class="page-title">' + esc(iv.name) + '</h1>' +
        '<div class="title-actions">' +
          '<button class="btn btn-ghost" type="button" data-action="review" title="随机抽一道题">' + svgIcon('dice') + '<span>抽题复习</span></button>' +
          '<button class="icon-btn" type="button" data-action="edit-interview" title="编辑面试信息" aria-label="编辑面试信息">' + svgIcon('edit') + '</button>' +
          '<button class="icon-btn danger" type="button" data-action="delete-interview" title="删除这场面试" aria-label="删除这场面试">' + svgIcon('trash') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="meta-row">' +
        (iv.date ? '<span class="meta-chip">' + svgIcon('calendar') + esc(iv.date) + '</span>' : '') +
        '<span class="meta-chip">' + questions.length + ' 道题</span>' +
        metaTags +
        (sourceUrl ? '<a class="meta-chip meta-link" href="' + esc(sourceUrl) + '" target="_blank" rel="noopener noreferrer">原始面经 ↗</a>' : '') +
      '</div>' +
      (iv.notes ? '<div class="notes md-body">' + mdToHtml(iv.notes) + '</div>' : '') +
      (questions.length ? renderProgress(c) : '') +
    '</section>' +
    renderQuickAdd(iv) +
    '<section class="q-section" aria-label="题目列表">' +
      renderFilterBar(visible.length, c) +
      (tags.length ? renderTagRow(tags) : '') +
      '<div class="q-list">' + (
        visible.length
          ? visible.map(function (q) { return renderQuestionCard(q, iv, false); }).join('')
          : renderEmptyQuestions(questions.length > 0)
      ) + '</div>' +
    '</section>';
  }

  function renderQuickAdd(iv) {
    return '<section class="quick-add" aria-label="添加题目">' +
      '<div class="qa-head">' +
        '<div class="qa-title"><h2>加题目</h2><span>一行一题，可直接从聊天记录 / 面经里粘贴</span></div>' +
        '<button class="btn btn-ghost qa-full-btn" type="button" data-action="new-question" data-iv="' + esc(iv.id) + '">' +
          svgIcon('edit') + '全屏写一题' +
        '</button>' +
      '</div>' +
      '<textarea id="quickAdd" rows="2" spellcheck="false" ' +
        'placeholder="例如：\nRedis 为什么快？\nMySQL 索引为什么用 B+ 树？"></textarea>' +
      '<div class="qa-foot">' +
        '<input id="quickTags" type="text" autocomplete="off" placeholder="本次标签（可选，逗号分隔）" value="' + esc(state.quickTags) + '">' +
        '<button class="btn btn-primary" type="button" data-action="quick-add">' + svgIcon('plus') + '添加</button>' +
      '</div>' +
      '<p class="qa-hint">Ctrl + Enter 快速添加；想写答案或写长题目，点右上角「全屏写一题」。</p>' +
    '</section>';
  }

  function renderProgress(c) {
    const pct = c.all ? Math.round((c.mastered / c.all) * 100) : 0;
    return '<div class="progress-wrap">' +
      '<div class="progress-top"><span>掌握进度</span><b>' + c.mastered + ' / ' + c.all + '</b></div>' +
      '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<i style="width:' + pct + '%"></i></div>' +
      '<div class="progress-legend">' +
        '<span><i class="dot todo"></i>待复习 <b>' + c.todo + '</b></span>' +
        '<span><i class="dot learning"></i>复习中 <b>' + c.learning + '</b></span>' +
        '<span><i class="dot mastered"></i>已掌握 <b>' + c.mastered + '</b></span>' +
        '<span><i class="dot empty"></i>待补答案 <b>' + c.noAnswer + '</b></span>' +
      '</div>' +
    '</div>';
  }

  function renderFilterBar(visibleCount, c) {
    const defs = [
      ['all', '全部', c.all],
      ['todo', '待复习', c.todo],
      ['learning', '复习中', c.learning],
      ['mastered', '已掌握', c.mastered],
      ['noanswer', '待补答案', c.noAnswer]
    ];
    const chips = defs.map(function (def) {
      return '<button class="chip' + (state.status === def[0] ? ' active' : '') + '" type="button" ' +
        'data-action="filter-status" data-status="' + def[0] + '">' + def[1] +
        '<b>' + def[2] + '</b></button>';
    }).join('');
    return '<div class="filter-bar"><div class="chips">' + chips + '</div>' +
      '<span class="list-count">显示 ' + visibleCount + ' / ' + c.all + ' 题</span></div>';
  }

  function renderTagRow(tags) {
    const list = tags.slice(0, 16);
    if (state.tag && !list.some(function (item) { return item[0] === state.tag; })) {
      list.push([state.tag, 1]);
    }
    let html = '<div class="tag-filter" aria-label="按标签筛选">' +
      '<button class="tag-chip' + (!state.tag ? ' active' : '') + '" type="button" data-action="filter-tag" data-tag="">全部标签</button>';
    list.forEach(function (item) {
      html += '<button class="tag-chip' + (state.tag === item[0] ? ' active' : '') + '" type="button" ' +
        'data-action="filter-tag" data-tag="' + esc(item[0]) + '">' +
        '<i class="tag-dot" style="background:' + tagColorHex(item[0]) + '"></i>#' + esc(item[0]) +
        '<b>' + item[1] + '</b></button>';
    });
    return html + '</div>';
  }

  function renderQuestionCard(q, iv, showSource) {
    const expanded = state.expanded.has(q.id);
    const tags = q.tags.slice(0, 3).map(function (tag) {
      return tagChip(tag);
    }).join('');
    const more = q.tags.length > 3 ? '<span class="tag more">+' + (q.tags.length - 3) + '</span>' : '';
    const difficulty = q.difficulty ? '<span class="diff d' + q.difficulty + '">' + DIFF_LABEL[q.difficulty] + '</span>' : '';
    const source = showSource
      ? '<button class="q-source" type="button" data-action="go-interview" data-id="' + esc(iv.id) + '" ' +
          'title="打开面试">' + esc(iv.name) + '</button>'
      : '';
    const answerBlock = q.answer
      ? '<div class="answer-block' + (expanded ? ' open' : '') + '" id="answer-' + esc(q.id) + '">' +
          '<div class="answer-body md-body">' + mdToHtml(q.answer) + '</div></div>'
      : '';
    const answerToggle = q.answer
      ? '<button class="link-btn" type="button" data-action="toggle-answer" data-qid="' + esc(q.id) + '" ' +
          'aria-controls="answer-' + esc(q.id) + '" aria-expanded="' + (expanded ? 'true' : 'false') + '">' +
          (expanded ? '收起答案' : '查看答案') + '</button>'
      : '<button class="link-btn muted" type="button" data-action="add-answer" data-iv="' + esc(iv.id) + '" ' +
          'data-qid="' + esc(q.id) + '">+ 补充答案</button>';
    const convertButton = '<button class="link-btn" type="button" data-action="question-to-knowledge" ' +
      'data-iv="' + esc(iv.id) + '" data-qid="' + esc(q.id) + '">转为知识点</button>';

    return '<article class="q-card status-' + q.status + '" data-qcard-id="' + esc(q.id) + '">' +
      '<div class="q-head">' +
        '<button class="status-pill s-' + q.status + '" type="button" data-action="cycle-status" ' +
          'data-iv="' + esc(iv.id) + '" data-qid="' + esc(q.id) + '" title="点击切换：待复习 → 复习中 → 已掌握">' +
          '<i class="status-dot"></i>' + STATUS_LABEL[q.status] + '</button>' +
        source +
        '<div class="q-tags">' + tags + more + '</div>' +
        '<div class="q-actions">' +
          '<button class="icon-btn sm" type="button" data-action="edit-question" data-iv="' + esc(iv.id) + '" ' +
            'data-qid="' + esc(q.id) + '" title="编辑题目" aria-label="编辑题目">' + svgIcon('edit') + '</button>' +
          '<button class="icon-btn sm danger" type="button" data-action="delete-question" data-iv="' + esc(iv.id) + '" ' +
            'data-qid="' + esc(q.id) + '" title="删除题目" aria-label="删除题目">' + svgIcon('trash') + '</button>' +
        '</div>' +
      '</div>' +
      '<h3 class="q-text">' + esc(q.content) + '</h3>' +
      answerBlock +
      '<div class="q-foot">' + difficulty + answerToggle + convertButton +
        '<span class="q-time">' + esc(fmtAdded(q.createdAt)) + '</span>' +
      '</div>' +
    '</article>';
  }

  function convertQuestionToKnowledge(interviewId, questionId) {
    const found = getQuestion(interviewId, questionId);
    if (!found) return;
    const question = found.q;
    const rawTitle = question.content.trim();
    const title = rawTitle.length > 120 ? rawTitle.slice(0, 117) + '…' : rawTitle;
    const answer = question.answer.trim();
    let content = answer;
    if (rawTitle.length > 120) {
      content = '原始题目：\n' + rawTitle + (answer ? '\n\n' + answer : '');
    }

    state.data.knowledge = state.data.knowledge || [];
    const existing = state.data.knowledge.find(function (note) { return note.title === title; });
    if (existing) {
      let changed = false;
      if (!existing.content && content) {
        existing.content = content;
        changed = true;
      }
      if (!existing.sourceInterviewId || !existing.sourceQuestionId) {
        existing.sourceInterviewId = found.iv.id;
        existing.sourceInterviewName = found.iv.name;
        existing.sourceQuestionId = question.id;
        changed = true;
      }
      question.tags.forEach(function (tag) {
        if (existing.tags.indexOf(tag) === -1) {
          existing.tags.push(tag);
          changed = true;
        }
      });
      if (changed) {
        existing.updatedAt = Store.now();
        persist();
        render();
        toast('已更新已有知识点', {
          action: '查看',
          duration: 5000,
          onAction: function () { openKnowledgeReader(existing); }
        });
      } else {
        toast('这个题目已经转成知识点了', {
          action: '查看',
          duration: 5000,
          onAction: function () { openKnowledgeReader(existing); }
        });
      }
      return;
    }

    const note = Store.makeKnowledge({
      title: title,
      content: content,
      tags: question.tags,
      sourceInterviewId: found.iv.id,
      sourceInterviewName: found.iv.name,
      sourceQuestionId: question.id
    });
    state.data.knowledge.unshift(note);
    persist();
    render();
    toast(answer ? '已转为知识点' : '已转为知识点，答案为空', {
      action: '查看',
      duration: 5000,
      onAction: function () { openKnowledgeReader(note); }
    });
  }

  function renderEmptyQuestions(filtered) {
    if (filtered) {
      return '<div class="empty-panel">' +
        '<div class="empty-icon">' + svgIcon('search') + '</div>' +
        '<h3>这个筛选下没有题目</h3><p>换个状态或标签看看。</p>' +
        '<button class="btn btn-ghost" type="button" data-action="clear-filters">清除筛选</button></div>';
    }
    return '<div class="empty-panel">' +
      '<div class="empty-icon">' + svgIcon('plus') + '</div>' +
      '<h3>还没有题目</h3><p>在上方输入框里粘贴题目，一行一题即可。</p></div>';
  }

  /* ---------------- 页面：全部题目 ---------------- */
  function renderAllPage() {
    const items = allQuestions();
    const questions = items.map(function (item) { return item.q; });
    const c = counts(questions);
    const visible = items.filter(function (item) { return matchesFilter(item.q); });
    const tags = tagCounts(questions);

    let list;
    if (!questions.length) {
      const first = state.data.interviews[0];
      list = '<div class="empty-panel">' +
        '<div class="empty-icon">' + svgIcon('book') + '</div>' +
        '<h3>题库还是空的</h3><p>进入任意一场面试，在「加题目」里粘贴题目即可。</p>' +
        (first ? '<button class="btn btn-ghost" type="button" data-action="select-interview" data-id="' + esc(first.id) + '">去「' + esc(first.name) + '」添加</button>' : '') +
        '</div>';
    } else if (!visible.length) {
      list = renderEmptyQuestions(true);
    } else {
      list = visible.map(function (item) { return renderQuestionCard(item.q, item.iv, true); }).join('');
    }

    return '<section class="page-head">' +
      '<div class="eyebrow">题库总览</div>' +
      '<div class="title-row">' +
        '<h1 class="page-title">全部题目</h1>' +
        '<div class="title-actions">' +
          '<button class="btn btn-ghost" type="button" data-action="new-interview">' + svgIcon('plus') + '<span>新建面试</span></button>' +
          '<button class="btn btn-ghost" type="button" data-action="review" title="随机抽一道题">' + svgIcon('dice') + '<span>抽题复习</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="meta-row">' +
        '<span class="meta-chip">' + c.all + ' 道题</span>' +
        '<span class="meta-chip">' + state.data.interviews.length + ' 场面试</span>' +
        (c.noAnswer ? '<span class="meta-chip">' + c.noAnswer + ' 道待补答案</span>' : '') +
      '</div>' +
      (questions.length ? renderProgress(c) : '') +
    '</section>' +
    '<section class="q-section" aria-label="全部题目">' +
      (questions.length ? renderFilterBar(visible.length, c) : '') +
      (tags.length ? renderTagRow(tags) : '') +
      '<div class="q-list">' + list + '</div>' +
    '</section>';
  }

  /* ---------------- 页面：搜索 ---------------- */
  function renderSearchEmptyType(label) {
    return '<div class="empty-panel">' +
      '<div class="empty-icon">' + svgIcon('search') + '</div>' +
      '<h3>没有匹配的' + label + '</h3><p>其他分类里还有结果。</p>' +
      '<button class="btn btn-ghost" type="button" data-action="search-type" data-type="all">查看全部结果</button></div>';
  }

  function renderSearchPage(query) {
    const interviews = searchInterviews(query);
    const questions = searchQuestions(query);
    const notes = searchKnowledge(query);
    const total = interviews.length + questions.length + notes.length;
    const allowedTypes = ['all', 'interviews', 'questions', 'knowledge'];
    const type = allowedTypes.indexOf(state.searchType) > -1 ? state.searchType : 'all';
    if (state.searchType !== type) state.searchType = type;

    const typeDefs = [
      ['all', '全部', total],
      ['interviews', '面试', interviews.length],
      ['questions', '题目', questions.length],
      ['knowledge', '知识点', notes.length]
    ];
    const tabs = '<div class="chips search-tabs" role="tablist" aria-label="搜索结果分类">' +
      typeDefs.map(function (def) {
        return '<button class="chip' + (type === def[0] ? ' active' : '') + '" type="button" role="tab" ' +
          'aria-selected="' + (type === def[0] ? 'true' : 'false') + '" ' +
          'data-action="search-type" data-type="' + def[0] + '">' + def[1] +
          '<b>' + def[2] + '</b></button>';
      }).join('') +
    '</div>';

    let body = '';
    if (!total) {
      body = '<div class="empty-panel">' +
        '<div class="empty-icon">' + svgIcon('search') + '</div>' +
        '<h3>没有找到相关内容</h3><p>换个关键词，或者清空搜索回到列表。</p>' +
        '<button class="btn btn-ghost" type="button" data-action="clear-search">清除搜索</button></div>';
    } else {
      if (type === 'all' || type === 'interviews') {
        if (interviews.length) {
          body += '<section class="search-section">' +
            '<div class="search-section-head"><h2>面试 <span>' + interviews.length + '</span></h2></div>' +
            '<div class="interview-grid">' + interviews.map(function (iv) { return renderInterviewCard(iv); }).join('') + '</div>' +
          '</section>';
        } else if (type === 'interviews') {
          body += renderSearchEmptyType('面试');
        }
      }
      if (type === 'all' || type === 'questions') {
        if (questions.length) {
          body += '<section class="search-section">' +
            '<div class="search-section-head"><h2>题目 <span>' + questions.length + '</span></h2></div>' +
            '<div class="q-list">' +
              questions.map(function (item) { return renderQuestionCard(item.q, item.iv, true); }).join('') +
            '</div></section>';
        } else if (type === 'questions') {
          body += renderSearchEmptyType('题目');
        }
      }
      if (type === 'all' || type === 'knowledge') {
        if (notes.length) {
          body += '<section class="search-section">' +
            '<div class="search-section-head"><h2>知识点 <span>' + notes.length + '</span></h2></div>' +
            '<div class="note-list">' + notes.map(renderKnowledgeCard).join('') + '</div></section>';
        } else if (type === 'knowledge') {
          body += renderSearchEmptyType('知识点');
        }
      }
    }

    return '<section class="page-head">' +
      '<div class="eyebrow">搜索结果</div>' +
      '<div class="title-row">' +
        '<h1 class="page-title search-title">“' + esc(query) + '”</h1>' +
        '<div class="title-actions">' +
          '<button class="btn btn-ghost" type="button" data-action="clear-search">清除搜索</button>' +
          (questions.length
            ? '<button class="btn btn-ghost" type="button" data-action="review" title="从搜索结果里抽题">' + svgIcon('dice') + '<span>抽题复习</span></button>'
            : '') +
        '</div>' +
      '</div>' +
      '<div class="meta-row">' +
        '<span class="meta-chip">' + interviews.length + ' 场面试</span>' +
        '<span class="meta-chip">' + questions.length + ' 道题</span>' +
        '<span class="meta-chip">' + notes.length + ' 条知识点</span>' +
      '</div>' +
      (total ? tabs : '') +
    '</section>' +
    '<div class="search-results">' + body + '</div>';
  }

  /* ---------------- 动作分发 ---------------- */
  function handleAction(action, el) {
    switch (action) {
      case 'new-interview':
        openInterviewModal();
        break;
      case 'select-interview':
      case 'go-interview':
        openInterview(el.dataset.id);
        break;
      case 'back-from-detail':
        backFromDetail();
        break;
      case 'select-all':
        selectAll();
        break;
      case 'select-interviews':
        selectInterviews();
        break;
      case 'select-knowledge':
        selectKnowledge();
        break;
      case 'filter-knowledge-category':
        state.knowledgeCategory = el.dataset.category || '';
        if (activeQuery()) {
          clearSearchInput();
          state.view = 'knowledge';
          state.selectedId = null;
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
        render();
        break;
      case 'clear-knowledge-category':
        state.knowledgeCategory = '';
        render();
        break;
      case 'manage-knowledge-categories':
        openCategoryManager();
        break;
      case 'save-knowledge-category':
        saveKnowledgeCategoryName(el.dataset.id);
        break;
      case 'delete-knowledge-category':
        askDeleteKnowledgeCategory(el.dataset.id);
        break;
      case 'select-tags':
        selectTags();
        break;
      case 'new-tag':
        openTagModal();
        break;
      case 'edit-tag':
        openTagModal(getTagById(el.dataset.id));
        break;
      case 'delete-tag':
        askDeleteTag(el.dataset.id);
        break;
      case 'search-type':
        state.searchType = el.dataset.type || 'all';
        render();
        break;
      case 'new-knowledge':
        openKnowledgeModal();
        break;
      case 'new-question':
        openQuestionModal({ interviewId: el.dataset.iv });
        break;
      case 'edit-knowledge':
        openKnowledgeModal(getKnowledge(el.dataset.id));
        break;
      case 'delete-knowledge':
        deleteKnowledge(el.dataset.id);
        break;
      case 'read-knowledge':
        openKnowledgeReader(getKnowledge(el.dataset.id));
        break;
      case 'open-note-source':
        openNoteSource(el.dataset.id);
        break;
      case 'toggle-md-preview':
        toggleMarkdownPreview(el);
        break;
      case 'edit-card-tags':
        state.cardTagEditId = state.cardTagEditId === el.dataset.id ? '' : el.dataset.id;
        render();
        break;
      case 'save-card-tags':
        saveCardTags();
        break;
      case 'cancel-card-tags':
        state.cardTagEditId = '';
        render();
        break;
      case 'question-to-knowledge':
        convertQuestionToKnowledge(el.dataset.iv, el.dataset.qid);
        break;
      case 'edit-interview':
        openInterviewModal(currentInterview());
        break;
      case 'delete-interview':
        askDeleteInterview();
        break;
      case 'review':
        openReview();
        break;
      case 'theme':
        toggleTheme();
        break;
      case 'export-json':
        exportJson();
        break;
      case 'export-md':
        exportMarkdown();
        break;
      case 'import-json':
        importInput.click();
        break;
      case 'quick-add':
        quickAdd();
        break;
      case 'filter-status':
        state.status = el.dataset.status;
        render();
        break;
      case 'filter-tag':
        state.tag = state.tag === (el.dataset.tag || '') ? '' : (el.dataset.tag || '');
        render();
        break;
      case 'clear-filters':
        clearListFilters();
        render();
        break;
      case 'clear-search':
        clearSearchInput();
        render();
        break;
      case 'cycle-status':
        cycleStatus(el.dataset.iv, el.dataset.qid);
        break;
      case 'toggle-answer':
        toggleAnswer(el.dataset.qid, el);
        break;
      case 'add-answer':
        openQuestionModal({ interviewId: el.dataset.iv, questionId: el.dataset.qid, focusAnswer: true });
        break;
      case 'edit-question':
        openQuestionModal({ interviewId: el.dataset.iv, questionId: el.dataset.qid });
        break;
      case 'delete-question':
        deleteQuestion(el.dataset.iv, el.dataset.qid);
        break;
      case 'toggle-sidebar':
        toggleSidebar();
        break;
      case 'load-sample':
        loadSample();
        break;
      case 'review-reveal':
        toggleReviewAnswer(el);
        break;
      case 'review-next':
        nextReview();
        break;
      case 'review-master':
        masterReview();
        break;
      case 'review-edit':
        editReviewQuestion();
        break;
      default:
        break;
    }
  }

  function captureViewState() {
    return {
      view: state.view,
      selectedId: state.selectedId,
      query: state.query,
      searchType: state.searchType,
      showDetail: state.showDetail,
      status: state.status,
      tag: state.tag,
      knowledgeCategory: state.knowledgeCategory,
      scrollY: window.scrollY || 0
    };
  }

  function pushViewState() {
    state.navStack.push(captureViewState());
    if (state.navStack.length > 30) state.navStack.shift();
  }

  function restoreViewState(snapshot) {
    state.view = snapshot.view;
    state.selectedId = snapshot.selectedId || null;
    state.query = snapshot.query || '';
    state.searchType = snapshot.searchType || 'all';
    state.showDetail = !!snapshot.showDetail;
    state.status = snapshot.status || 'all';
    state.tag = snapshot.tag || '';
    state.knowledgeCategory = snapshot.knowledgeCategory || '';
    searchEl.value = state.query;
    closeSidebar();
    render();
    const top = snapshot.scrollY || 0;
    setTimeout(function () {
      window.scrollTo({ top: top, behavior: 'auto' });
    }, 0);
  }

  function openInterview(id) {
    const iv = getInterview(id);
    if (!iv) return;
    if (state.view === 'interview' && state.selectedId === id && state.showDetail) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    pushViewState();
    state.view = 'interview';
    state.selectedId = id;
    state.showDetail = true;
    state.status = 'all';
    state.tag = '';
    closeSidebar();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function backFromDetail() {
    const snapshot = state.navStack.pop();
    if (!snapshot) {
      state.view = 'interviews';
      state.selectedId = null;
      clearSearchInput();
      clearListFilters();
      closeSidebar();
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    restoreViewState(snapshot);
  }

  function openNoteSource(noteId) {
    const note = getKnowledge(noteId);
    if (!note) return;
    if (!note.sourceInterviewId || !note.sourceQuestionId) {
      toast('这条知识点还没有关联原题');
      return;
    }
    const source = getQuestion(note.sourceInterviewId, note.sourceQuestionId);
    if (!source) {
      toast('原题已经不存在了');
      return;
    }
    const same = state.view === 'interview' && state.selectedId === source.iv.id && state.showDetail;
    if (!same) pushViewState();
    state.view = 'interview';
    state.selectedId = source.iv.id;
    state.showDetail = true;
    state.status = 'all';
    state.tag = '';
    state.query = '';
    state.cardTagEditId = '';
    searchEl.value = '';
    state.expanded.add(source.q.id);
    closeSidebar();
    render();
    setTimeout(function () {
      const card = document.querySelector('[data-qcard-id="' + source.q.id + '"]');
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('q-highlight');
      setTimeout(function () { card.classList.remove('q-highlight'); }, 2400);
    }, 60);
  }

  function selectAll() {
    state.view = 'all';
    clearSearchInput();
    clearListFilters();
    closeSidebar();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function selectInterviews() {
    state.view = 'interviews';
    state.selectedId = null;
    clearSearchInput();
    clearListFilters();
    closeSidebar();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function selectKnowledge() {
    state.view = 'knowledge';
    state.selectedId = null;
    state.knowledgeCategory = '';
    state.cardTagEditId = '';
    clearSearchInput();
    clearListFilters();
    closeSidebar();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function selectTags() {
    state.view = 'tags';
    state.selectedId = null;
    clearSearchInput();
    clearListFilters();
    closeSidebar();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function deleteKnowledge(id) {
    const list = state.data.knowledge || [];
    const index = list.findIndex(function (note) { return note.id === id; });
    if (index < 0) return;
    const removed = list.splice(index, 1)[0];
    persist();
    render();
    toast('已删除知识点', {
      action: '撤销',
      duration: 5000,
      onAction: function () {
        const target = state.data.knowledge || [];
        target.splice(Math.min(index, target.length), 0, removed);
        persist();
        render();
        toast('已恢复');
      }
    });
  }

  function cycleStatus(interviewId, questionId) {
    const found = getQuestion(interviewId, questionId);
    if (!found) return;
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(found.q.status) + 1) % STATUS_ORDER.length];
    found.q.status = next;
    found.q.updatedAt = Store.now();
    found.iv.updatedAt = Store.now();
    persist();
    render();
    toast('已标记为「' + STATUS_LABEL[next] + '」', { duration: 1400 });
  }

  function toggleAnswer(questionId, btn) {
    const block = document.getElementById('answer-' + questionId);
    if (!block) return;
    const open = block.classList.toggle('open');
    if (open) state.expanded.add(questionId);
    else state.expanded.delete(questionId);
    if (btn) {
      btn.textContent = open ? '收起答案' : '查看答案';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function quickAdd() {
    const iv = currentInterview();
    if (!iv) return;
    const textarea = document.getElementById('quickAdd');
    const tagInput = document.getElementById('quickTags');
    if (!textarea) return;

    const seen = new Set();
    const texts = [];
    textarea.value.split(/\r?\n/).forEach(function (line) {
      const cleaned = cleanLine(line);
      if (!cleaned || seen.has(cleaned)) return;
      seen.add(cleaned);
      texts.push(cleaned);
    });

    if (!texts.length) {
      textarea.focus();
      toast('先输入题目内容');
      return;
    }

    const tags = Store.parseTags(tagInput ? tagInput.value : '');
    texts.forEach(function (text) {
      iv.questions.push(Store.makeQuestion({ content: text, tags: tags }));
    });
    iv.updatedAt = Store.now();
    state.quickTags = tagInput ? tagInput.value : '';
    persist();
    render();
    toast('已添加 ' + texts.length + ' 道题目');
    const next = document.getElementById('quickAdd');
    if (next) next.focus();
  }

  function deleteQuestion(interviewId, questionId) {
    const found = getQuestion(interviewId, questionId);
    if (!found) return;
    const removed = found.iv.questions.splice(found.index, 1)[0];
    found.iv.updatedAt = Store.now();
    persist();
    render();
    toast('已删除 1 道题目', {
      action: '撤销',
      duration: 5000,
      onAction: function () {
        const iv = getInterview(found.iv.id);
        if (!iv) return;
        iv.questions.splice(Math.min(found.index, iv.questions.length), 0, removed);
        iv.updatedAt = Store.now();
        persist();
        render();
        toast('已恢复');
      }
    });
  }

  function askDeleteInterview() {
    const iv = currentInterview();
    if (!iv) return;
    openConfirm({
      title: '删除这场面试？',
      message: '「' + iv.name + '」以及其中 ' + iv.questions.length + ' 道题目将被删除，此操作不可撤销。',
      confirmText: '删除',
      danger: true,
      onConfirm: function () {
        const idx = state.data.interviews.findIndex(function (item) { return item.id === iv.id; });
        if (idx < 0) return;
        state.data.interviews.splice(idx, 1);
        state.selectedId = null;
        state.view = 'interviews';
        clearListFilters();
        clearSearchInput();
        persist();
        render();
        toast('面试已删除');
      }
    });
  }

  function loadSample() {
    if (state.data.interviews.length || state.data.knowledge.length) {
      openConfirm({
        title: '载入示例数据？',
        message: '当前所有面试、题目和知识点会被示例数据覆盖。建议先导出备份。',
        confirmText: '载入示例',
        danger: true,
        onConfirm: applySample
      });
      return;
    }
    applySample();
  }

  function applySample() {
    state.data = Store.sampleData();
    state.selectedId = null;
    state.view = 'interviews';
    clearListFilters();
    clearSearchInput();
    ensureTagLibrary();
    ensureKnowledgeCategories();
    ensureKnowledgeSources();
    persist();
    render();
    toast('示例已载入，可以直接改或删');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ---------------- 导出 / 导入 ---------------- */
  function exportJson() {
    if (!state.data) return;
    downloadFile(
      '面经备份-' + Store.today() + '.json',
      JSON.stringify(state.data, null, 2),
      'application/json;charset=utf-8'
    );
    toast('备份文件已导出');
  }

  function exportMarkdown() {
    if (!state.data.interviews.length && !state.data.knowledge.length) {
      toast('还没有内容可以导出');
      return;
    }
    const iv = state.view === 'interview' && !activeQuery() ? currentInterview() : null;
    const name = iv ? iv.name : '全部内容';
    downloadFile(
      '面经-' + safeName(name) + '-' + Store.today() + '.md',
      Store.toMarkdown(state.data, iv),
      'text/markdown;charset=utf-8'
    );
    toast('Markdown 已导出');
  }

  async function onImportFile() {
    const file = importInput.files && importInput.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = Store.normalizeData(parsed);
      const questionCount = data.interviews.reduce(function (sum, iv) {
        return sum + iv.questions.length;
      }, 0);
      const knowledgeCount = data.knowledge.length;
      importInput.value = '';

      if (!data.interviews.length && !knowledgeCount) {
        toast('文件里没有可导入的数据');
        return;
      }

      openConfirm({
        title: '导入备份？',
        message: '将导入 ' + data.interviews.length + ' 场面试、' + questionCount + ' 道题目、' +
          knowledgeCount + ' 条知识点，并覆盖当前全部数据。',
        confirmText: '覆盖并导入',
        danger: true,
        onConfirm: function () {
          state.data = data;
          state.selectedId = null;
          state.view = data.interviews.length ? 'interviews' : 'knowledge';
          clearListFilters();
          clearSearchInput();
          ensureTagLibrary();
          ensureKnowledgeCategories();
    ensureKnowledgeSources();
          persist();
          render();
          toast('已导入 ' + questionCount + ' 道题、' + knowledgeCount + ' 条知识点');
        }
      });
    } catch (err) {
      importInput.value = '';
      toast('导入失败：' + (err && err.message ? err.message : '文件格式不正确'), { duration: 5000 });
    }
  }

  /* ---------------- 主题 ---------------- */
  function toggleTheme() {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(Store.THEME_KEY, next);
    } catch (e) { /* ignore */ }
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const holder = themeBtn.querySelector('[data-icon]');
    if (!holder) return;
    holder.innerHTML = svgIcon(document.documentElement.dataset.theme === 'light' ? 'moon' : 'sun');
  }

  /* ---------------- 侧边栏（移动端） ---------------- */
  function toggleSidebar() {
    if (sidebarEl.classList.contains('open')) closeSidebar();
    else openSidebar();
  }

  function openSidebar() {
    sidebarEl.classList.add('open');
    scrimEl.classList.add('show');
  }

  function closeSidebar() {
    sidebarEl.classList.remove('open');
    scrimEl.classList.remove('show');
  }

  /* ---------------- 对话框 ---------------- */
  function openModal(html, options) {
    if (modalEl.open) modalEl.close();
    modalEl.classList.toggle('modal-wide', !!(options && options.wide));
    modalEl.classList.toggle('modal-full', !!(options && options.full));
    modalEl.innerHTML = html;
    modalEl.showModal();
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (modalEl.open) modalEl.close();
    modalEl.innerHTML = '';
    modalEl.classList.remove('modal-wide');
    modalEl.classList.remove('modal-full');
    document.body.classList.remove('modal-open');
  }

  function rememberEditorScroll() {
    editorScrollY = window.scrollY || 0;
  }

  function restoreEditorScroll(top) {
    setTimeout(function () {
      window.scrollTo({ top: typeof top === 'number' ? top : editorScrollY, behavior: 'auto' });
    }, 0);
  }

  function openConfirm(options) {
    openModal(
      '<div class="modal-card confirm-card">' +
        '<header class="modal-head">' +
          '<div><div class="eyebrow">请确认</div><h2>' + esc(options.title) + '</h2></div>' +
          '<button class="icon-btn" type="button" data-close aria-label="关闭">' + svgIcon('close') + '</button>' +
        '</header>' +
        '<div class="modal-body"><p class="confirm-text">' + esc(options.message) + '</p></div>' +
        '<footer class="modal-foot">' +
          '<button class="btn btn-ghost" type="button" data-close>取消</button>' +
          '<button class="btn ' + (options.danger ? 'btn-danger' : 'btn-primary') + '" type="button" id="confirmBtn">' +
            esc(options.confirmText || '确认') + '</button>' +
        '</footer>' +
      '</div>'
    );
    const btn = document.getElementById('confirmBtn');
    if (btn) {
      btn.addEventListener('click', function () {
        closeModal();
        options.onConfirm();
      });
    }
  }

  function openInterviewModal(iv) {
    const editing = !!iv;
    openModal(
      '<form class="modal-card" id="interviewForm" novalidate>' +
        '<header class="modal-head">' +
          '<div><div class="eyebrow">' + (editing ? '编辑面试' : '新建面试') + '</div>' +
          '<h2>' + (editing ? '修改面试信息' : '这场面试叫什么？') + '</h2></div>' +
          '<button class="icon-btn" type="button" data-close aria-label="关闭">' + svgIcon('close') + '</button>' +
        '</header>' +
        '<div class="modal-body">' +
          '<label class="field"><span>面试名称 <em>*</em></span>' +
            '<input name="name" type="text" maxlength="80" autocomplete="off" placeholder="例如：字节跳动 · 后端开发一面" value="' + esc(editing ? iv.name : '') + '">' +
          '</label>' +
          '<div class="field-row">' +
            '<label class="field"><span>日期</span><input name="date" type="date" value="' + esc(editing ? iv.date : Store.today()) + '"></label>' +
          '</div>' +
          '<div class="field"><span>标签</span>' + renderTagPicker(editing ? iv.tags : []) + '</div>' +
          '<label class="field"><span>备注</span><textarea name="notes" rows="3" placeholder="面试时长、形式、感受…">' + esc(editing ? iv.notes : '') + '</textarea></label>' +
        '</div>' +
        '<footer class="modal-foot">' +
          '<button class="btn btn-ghost" type="button" data-close>取消</button>' +
          '<button class="btn btn-primary" type="submit">' + (editing ? '保存修改' : '创建面试') + '</button>' +
        '</footer>' +
      '</form>'
    );

    const form = document.getElementById('interviewForm');
    const nameInput = form.querySelector('[name="name"]');
    initTagPicker(form);
    setTimeout(function () { nameInput.focus(); }, 40);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        toast('请填写面试名称');
        return;
      }
      const payload = {
        name: name,
        date: form.querySelector('[name="date"]').value || Store.today(),
        tags: form.querySelector('[name="tags"]').value,
        notes: normalizeText(form.querySelector('[name="notes"]').value)
      };

      if (editing && iv) {
        iv.name = payload.name;
        iv.date = payload.date;
        iv.tags = Store.parseTags(payload.tags);
        iv.notes = payload.notes;
        iv.updatedAt = Store.now();
        persist();
        closeModal();
        render();
        toast('面试信息已更新');
      } else {
        const created = Store.makeInterview(payload);
        state.data.interviews.unshift(created);
        state.selectedId = created.id;
        state.view = 'interview';
        state.status = 'all';
        state.tag = '';
        clearSearchInput();
        persist();
        closeModal();
        render();
        window.scrollTo({ top: 0, behavior: 'auto' });
        toast('面试已创建，开始加题目吧');
        setTimeout(function () {
          const ta = document.getElementById('quickAdd');
          if (ta) ta.focus();
        }, 80);
      }
    });
  }

  function openQuestionModal(options) {
    options = options || {};
    const iv = options.interviewId ? getInterview(options.interviewId) : currentInterview();
    if (!iv) return;
    const existing = options.questionId
      ? iv.questions.find(function (q) { return q.id === options.questionId; })
      : null;
    const editing = !!existing;

    const difficultyOptions = [0, 1, 2, 3].map(function (value) {
      const label = value ? DIFF_LABEL[value] : '未标注';
      return '<option value="' + value + '"' + (existing && existing.difficulty === value ? ' selected' : '') + '>' + label + '</option>';
    }).join('');

    const statusOptions = STATUS_ORDER.map(function (value) {
      return '<option value="' + value + '"' + (existing && existing.status === value ? ' selected' : '') + '>' + STATUS_LABEL[value] + '</option>';
    }).join('');

    rememberEditorScroll();
    openModal(
      '<form class="modal-card editor-card" id="questionForm" novalidate>' +
        '<header class="editor-head">' +
          '<button class="editor-back" type="button" data-close>← 返回</button>' +
          '<div class="editor-heading">' +
            '<div class="eyebrow">' + (editing ? '编辑题目' : '新题目') + '</div>' +
            '<h2>' + (editing ? '修改题目与答案' : '写一道新题') + '</h2>' +
          '</div>' +
          '<div class="editor-actions">' +
            '<span class="editor-kbd">Ctrl / ⌘ + Enter 保存 · Esc 退出</span>' +
            '<button class="btn btn-primary" type="submit">保存并退出</button>' +
          '</div>' +
        '</header>' +
        '<div class="editor-body">' +
          '<div class="editor-inner">' +
            '<div class="editor-main">' +
              '<label class="editor-field"><span class="editor-label">题目 <em>*</em></span>' +
                '<textarea name="content" id="qContent" class="editor-question" rows="3" ' +
                  'placeholder="例如：Redis 为什么快？">' + esc(existing ? existing.content : '') + '</textarea>' +
              '</label>' +
              '<label class="editor-field editor-field-grow"><span class="editor-label">答案 <small>可留空 · 支持 Markdown</small></span>' +
                '<div class="md-editor-bar"><span>Markdown</span>' +
                  '<button class="md-preview-btn" type="button" data-action="toggle-md-preview" data-target="qAnswer">预览</button>' +
                '</div>' +
                '<textarea name="answer" id="qAnswer" class="editor-answer" rows="12" ' +
                  'placeholder="可以先留空，之后点题目上的「补充答案」随时回来写。支持 Markdown。">' + esc(existing ? existing.answer : '') + '</textarea>' +
                '<div class="md-preview md-body" data-md-preview="qAnswer" hidden></div>' +
              '</label>' +
            '</div>' +
            '<aside class="editor-side">' +
              '<div class="field"><span>标签</span>' + renderTagPicker(existing ? existing.tags : []) + '</div>' +
              '<label class="field"><span>难度</span><select name="difficulty">' + difficultyOptions + '</select></label>' +
              '<label class="field"><span>掌握状态</span><select name="status">' + statusOptions + '</select></label>' +
              '<p class="editor-tip">先写题目，答案可以留空。保存后自动回到题目列表。</p>' +
            '</aside>' +
          '</div>' +
        '</div>' +
      '</form>',
      { full: true }
    );

    const form = document.getElementById('questionForm');
    const contentEl = document.getElementById('qContent');
    const answerEl = document.getElementById('qAnswer');
    initTagPicker(form);
    setTimeout(function () {
      if (options.focusAnswer) answerEl.focus();
      else contentEl.focus();
    }, 60);

    form.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const content = normalizeText(contentEl.value);
      if (!content) {
        contentEl.focus();
        toast('题目不能为空');
        return;
      }
      const payload = {
        content: content,
        answer: normalizeText(answerEl.value),
        tags: Store.parseTags(form.querySelector('[name="tags"]').value),
        difficulty: Number(form.querySelector('[name="difficulty"]').value) || 0,
        status: form.querySelector('[name="status"]').value
      };

      if (editing) {
        Object.assign(existing, payload);
        existing.updatedAt = Store.now();
      } else {
        iv.questions.push(Store.makeQuestion(payload));
      }
      iv.updatedAt = Store.now();
      persist();
      closeModal();
      render();
      restoreEditorScroll(editorScrollY);
      toast(editing ? '题目已更新' : '题目已添加');
    });
  }

  /* ---------------- 知识点 ---------------- */
  function openKnowledgeModal(note) {
    const editing = !!note;
    const categories = (state.data.knowledgeCategories || []).slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    const filterCategory = state.knowledgeCategory && state.knowledgeCategory !== '__uncategorized'
      ? state.knowledgeCategory
      : '';
    const selectedCategory = editing ? (note.category || '') : filterCategory;
    const categoryOptions = '<option value="">未分类</option>' +
      categories.map(function (category) {
        return '<option value="' + esc(category.name) + '"' +
          (category.name === selectedCategory ? ' selected' : '') + '>' + esc(category.name) + '</option>';
      }).join('') +
      (selectedCategory && !categories.some(function (category) { return category.name === selectedCategory; })
        ? '<option value="' + esc(selectedCategory) + '" selected>' + esc(selectedCategory) + '</option>'
        : '') +
      '<option value="__new__">＋ 新建分类…</option>';

    rememberEditorScroll();
    openModal(
      '<form class="modal-card editor-card editor-note" id="knowledgeForm" novalidate>' +
        '<header class="editor-head">' +
          '<button class="editor-back" type="button" data-close>← 返回</button>' +
          '<div class="editor-heading">' +
            '<div class="eyebrow">知识库</div>' +
            '<h2>' + (editing ? '编辑知识点' : '记录一个知识点') + '</h2>' +
          '</div>' +
          '<div class="editor-actions">' +
            '<span class="editor-kbd">Ctrl / ⌘ + Enter 保存 · Esc 退出</span>' +
            '<button class="btn btn-primary" type="submit">保存并退出</button>' +
          '</div>' +
        '</header>' +
        '<div class="editor-body">' +
          '<div class="editor-inner editor-note-inner">' +
            '<label class="editor-field">' +
              '<span class="editor-label">标题 <em>*</em></span>' +
              '<input name="title" class="editor-note-title" type="text" maxlength="120" autocomplete="off" ' +
                'placeholder="例如：Redis 缓存穿透的处理方式" value="' + esc(editing ? note.title : '') + '">' +
            '</label>' +
            '<div class="editor-note-taxonomy">' +
              '<label class="field"><span>大分类</span>' +
                '<select name="category" id="knowledgeCategorySelect">' + categoryOptions + '</select>' +
                '<input name="newCategory" id="newKnowledgeCategory" class="new-category-input" type="text" ' +
                  'maxlength="30" placeholder="输入新分类名称，例如：内网渗透" hidden>' +
              '</label>' +
              '<div class="field"><span>标签</span>' +
                renderTagPicker(editing ? note.tags : [], { collapsed: true }) +
              '</div>' +
            '</div>' +
            '<label class="editor-field editor-field-grow">' +
              '<span class="editor-label">内容 <small>可留空 · 支持 Markdown</small></span>' +
              '<div class="md-editor-bar"><span>Markdown</span>' +
                '<button class="md-preview-btn" type="button" data-action="toggle-md-preview" data-target="knowledgeContent">预览</button>' +
              '</div>' +
              '<textarea name="content" id="knowledgeContent" class="editor-note-content" rows="16" ' +
                'placeholder="概念、命令、踩坑、代码片段都可以记在这里。支持 Markdown。">' + esc(editing ? note.content : '') + '</textarea>' +
              '<div class="md-preview md-body" data-md-preview="knowledgeContent" hidden></div>' +
            '</label>' +
            '<p class="editor-tip editor-note-tip">保存后自动退出，回到知识点列表。标题和内容都可以之后再改。</p>' +
          '</div>' +
        '</div>' +
      '</form>',
      { full: true }
    );

    const form = document.getElementById('knowledgeForm');
    const titleInput = form.querySelector('[name="title"]');
    const contentEl = form.querySelector('[name="content"]');
    const categorySelect = form.querySelector('[name="category"]');
    const newCategoryInput = form.querySelector('[name="newCategory"]');
    initTagPicker(form);
    categorySelect.addEventListener('change', function () {
      const isNew = categorySelect.value === '__new__';
      newCategoryInput.hidden = !isNew;
      if (isNew) newCategoryInput.focus();
    });
    setTimeout(function () { titleInput.focus(); }, 60);

    titleInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        contentEl.focus();
      }
    });

    form.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = titleInput.value.trim();
      if (!title) {
        titleInput.focus();
        toast('请填写知识点标题');
        return;
      }
      let category = categorySelect.value;
      if (category === '__new__') {
        const name = newCategoryInput.value.trim().slice(0, 30);
        if (!name) {
          newCategoryInput.focus();
          toast('请输入新分类名称');
          return;
        }
        category = name === '未分类' ? '' : createKnowledgeCategoryRecord(name);
      }
      const payload = {
        title: title,
        content: normalizeText(contentEl.value),
        category: category,
        tags: Store.parseTags(form.querySelector('[name="tags"]').value)
      };

      if (editing) {
        note.title = payload.title;
        note.content = payload.content;
        note.category = payload.category;
        note.tags = payload.tags;
        note.updatedAt = Store.now();
        persist();
        closeModal();
        render();
        restoreEditorScroll(editorScrollY);
        toast('知识点已更新');
      } else {
        const created = Store.makeKnowledge(payload);
        state.data.knowledge = state.data.knowledge || [];
        state.data.knowledge.unshift(created);
        state.view = 'knowledge';
        state.selectedId = null;
        clearListFilters();
        clearSearchInput();
        persist();
        closeModal();
        render();
        restoreEditorScroll(0);
        toast('知识点已保存');
      }
    });
  }

  function openCategoryManager() {
    const categories = (state.data.knowledgeCategories || []).slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    const notes = state.data.knowledge || [];
    const rows = categories.map(function (category) {
      const count = notes.filter(function (note) { return note.category === category.name; }).length;
      return '<div class="cat-manage-row" data-cat-id="' + esc(category.id) + '">' +
        '<i class="tag-dot" style="background:' + categoryColorHex(category.name) + '"></i>' +
        '<input class="cat-name-input" type="text" maxlength="30" value="' + esc(category.name) + '" aria-label="分类名称">' +
        '<span class="cat-usage">' + count + ' 条</span>' +
        '<button class="icon-btn sm" type="button" data-action="save-knowledge-category" data-id="' + esc(category.id) + '" ' +
          'title="保存分类名称" aria-label="保存分类名称">' + svgIcon('check') + '</button>' +
        '<button class="icon-btn sm danger" type="button" data-action="delete-knowledge-category" data-id="' + esc(category.id) + '" ' +
          'title="删除分类" aria-label="删除分类">' + svgIcon('trash') + '</button>' +
      '</div>';
    }).join('');

    openModal(
      '<div class="modal-card cat-manager-card">' +
        '<header class="modal-head">' +
          '<div><div class="eyebrow">知识点</div><h2>分类管理</h2></div>' +
          '<button class="icon-btn" type="button" data-close aria-label="关闭">' + svgIcon('close') + '</button>' +
        '</header>' +
        '<div class="modal-body">' +
          '<form class="cat-add-row" id="categoryAddForm">' +
            '<input name="name" type="text" maxlength="30" autocomplete="off" placeholder="新分类，例如：内网渗透、Java、免杀">' +
            '<button class="btn btn-primary" type="submit">添加</button>' +
          '</form>' +
          (rows ? '<div class="cat-manage-list">' + rows + '</div>' :
            '<p class="cat-manage-empty">还没有分类。先添加一个，再在知识点里选择。</p>') +
          '<p class="editor-tip">分类改名会同步更新所有知识点；删除分类会把知识点归到「未分类」。</p>' +
        '</div>' +
      '</div>',
      { wide: true }
    );

    const form = document.getElementById('categoryAddForm');
    const input = form.querySelector('[name="name"]');
    setTimeout(function () { input.focus(); }, 40);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = input.value.trim().slice(0, 30);
      if (!name) {
        input.focus();
        return;
      }
      if (name === '未分类') {
        toast('「未分类」是系统默认分类，换一个名称吧');
        return;
      }
      if (getCategoryByName(name)) {
        toast('已经有同名分类了');
        return;
      }
      createKnowledgeCategoryRecord(name);
      render();
      openCategoryManager();
      toast('分类已添加');
    });
  }

  function saveKnowledgeCategoryName(id) {
    const category = (state.data.knowledgeCategories || []).find(function (item) { return item.id === id; });
    if (!category) return;
    const row = Array.from(document.querySelectorAll('.cat-manage-row')).find(function (item) {
      return item.dataset.catId === id;
    });
    if (!row) return;
    const input = row.querySelector('.cat-name-input');
    const newName = input.value.trim().slice(0, 30);
    if (!newName) {
      input.focus();
      toast('分类名称不能为空');
      return;
    }
    if (newName === '未分类') {
      toast('「未分类」是系统默认分类，换一个名称吧');
      return;
    }
    const duplicate = (state.data.knowledgeCategories || []).some(function (item) {
      return item.id !== id && item.name === newName;
    });
    if (duplicate) {
      toast('已经有同名分类了');
      return;
    }
    if (newName !== category.name) renameKnowledgeCategoryEverywhere(category, newName);
    else category.updatedAt = Store.now();
    persist();
    closeModal();
    render();
    toast('分类名称已更新');
  }

  function askDeleteKnowledgeCategory(id) {
    const category = (state.data.knowledgeCategories || []).find(function (item) { return item.id === id; });
    if (!category) return;
    const count = (state.data.knowledge || []).filter(function (note) { return note.category === category.name; }).length;
    closeModal();
    openConfirm({
      title: '删除分类？',
      message: '「' + category.name + '」会从分类列表删除' +
        (count ? '，其中 ' + count + ' 条知识点会归到「未分类」。' : '。'),
      confirmText: '删除',
      danger: true,
      onConfirm: function () {
        removeKnowledgeCategory(category);
        persist();
        render();
        toast('分类已删除');
      }
    });
  }

  function openKnowledgeReader(note) {
    if (!note) return;
    const tags = note.tags.map(function (tag) {
      return tagChip(tag);
    }).join('');
    const category = '<span class="note-category">' +
      '<i class="tag-dot" style="background:' + categoryColorHex(note.category) + '"></i>' +
      esc(note.category || '未分类') +
    '</span>';
    openModal(
      '<div class="modal-card reader-card">' +
        '<header class="editor-head">' +
          '<button class="editor-back" type="button" data-close>← 返回知识点</button>' +
          '<div class="editor-heading">' +
            '<div class="eyebrow">知识库</div>' +
            '<h2>专注阅读</h2>' +
          '</div>' +
          '<div class="editor-actions">' +
            '<span class="editor-kbd">Esc 退出</span>' +
            '<button class="btn btn-ghost" type="button" data-action="edit-knowledge" data-id="' + esc(note.id) + '">编辑</button>' +
          '</div>' +
        '</header>' +
        '<div class="reader-body">' +
          '<article class="reader-inner">' +
            '<h1 class="reader-title">' + esc(note.title) + '</h1>' +
            '<div class="reader-meta">' + category + tags + '<span>' + esc(fmtUpdated(note.updatedAt)) + '</span></div>' +
            '<div class="reader-content md-body">' +
              (note.content ? mdToHtml(note.content) : '<span class="reader-empty">还没有内容</span>') +
            '</div>' +
          '</article>' +
        '</div>' +
      '</div>',
      { full: true }
    );
  }

  function askDeleteTag(id) {
    const tag = getTagById(id);
    if (!tag) return;
    const count = tagUsageCount(tag.name);
    openConfirm({
      title: '删除标签？',
      message: '「#' + tag.name + '」会从标签库删除' +
        (count ? '，并从 ' + count + ' 处内容中移除。' : '。'),
      confirmText: '删除',
      danger: true,
      onConfirm: function () {
        removeTagEverywhere(tag.name);
        state.data.tagLibrary = state.data.tagLibrary.filter(function (item) { return item.id !== tag.id; });
        persist();
        render();
        toast('标签已删除');
      }
    });
  }

  function openTagModal(tag) {
    const editing = !!tag;
    const groups = Array.from(new Set((state.data.tagLibrary || []).map(function (item) { return item.group || '未分类'; })));
    groups.sort(function (a, b) {
      if (a === '未分类') return 1;
      if (b === '未分类') return -1;
      return a.localeCompare(b, 'zh-CN');
    });
    const groupOptions = groups.map(function (group) {
      return '<option value="' + esc(group) + '"></option>';
    }).join('');
    const selectedColor = editing ? tag.color : 'blue';
    const colorOptions = TAG_COLORS.map(function (item) {
      return '<label class="color-option">' +
        '<input type="radio" name="color" value="' + item.key + '"' + (selectedColor === item.key ? ' checked' : '') + '>' +
        '<i class="color-dot" style="background:' + item.color + '"></i>' +
        '<span>' + item.label + '</span>' +
      '</label>';
    }).join('');

    openModal(
      '<form class="modal-card" id="tagForm" novalidate>' +
        '<header class="modal-head">' +
          '<div><div class="eyebrow">标签库</div><h2>' + (editing ? '编辑标签' : '新建标签') + '</h2></div>' +
          '<button class="icon-btn" type="button" data-close aria-label="关闭">' + svgIcon('close') + '</button>' +
        '</header>' +
        '<div class="modal-body">' +
          (editing
            ? '<label class="field"><span>标签名称 <em>*</em></span>' +
                '<input name="name" type="text" maxlength="40" autocomplete="off" value="' + esc(tag.name) + '"></label>'
            : '<label class="field"><span>标签名称 <em>*</em></span>' +
                '<textarea name="names" rows="5" placeholder="一行一个，可一次创建多个，例如：&#10;Redis&#10;MySQL&#10;Kafka"></textarea>' +
                '<small class="field-hint">每行自动成为一个标签，最多一次创建 50 个。</small></label>') +
          '<div class="field-row">' +
            '<label class="field"><span>分类 / 类型</span>' +
              '<input name="group" type="text" maxlength="20" list="tagGroupOptions" autocomplete="off" ' +
                'placeholder="技术栈、公司、方向…" value="' + esc(editing ? tag.group : '未分类') + '">' +
              '<datalist id="tagGroupOptions">' + groupOptions + '</datalist>' +
            '</label>' +
            '<div class="field"><span>颜色</span><div class="color-picker">' + colorOptions + '</div></div>' +
          '</div>' +
        '</div>' +
        '<footer class="modal-foot">' +
          '<button class="btn btn-ghost" type="button" data-close>取消</button>' +
          '<button class="btn btn-primary" type="submit">' + (editing ? '保存修改' : '创建标签') + '</button>' +
        '</footer>' +
      '</form>'
    );

    const form = document.getElementById('tagForm');
    const nameInput = form.querySelector('[name="name"]') || form.querySelector('[name="names"]');
    const groupInput = form.querySelector('[name="group"]');
    setTimeout(function () { nameInput.focus(); }, 40);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const group = groupInput.value.trim().slice(0, 20) || '未分类';
      const color = form.querySelector('[name="color"]:checked').value;

      if (editing) {
        const newName = form.querySelector('[name="name"]').value.trim().replace(/^#+/, '').slice(0, 40);
        if (!newName) {
          form.querySelector('[name="name"]').focus();
          toast('请填写标签名称');
          return;
        }
        const duplicate = (state.data.tagLibrary || []).some(function (item) {
          return item.id !== tag.id && item.name === newName;
        });
        if (duplicate) {
          toast('已经有同名标签了');
          return;
        }
        if (newName !== tag.name) renameTagEverywhere(tag.name, newName);
        tag.name = newName;
        tag.group = group;
        tag.color = color;
        tag.updatedAt = Store.now();
        persist();
        closeModal();
        render();
        toast('标签已更新');
        return;
      }

      const names = splitTagNames(form.querySelector('[name="names"]').value).slice(0, 50);
      if (!names.length) {
        form.querySelector('[name="names"]').focus();
        toast('先输入标签名称');
        return;
      }
      const existing = new Set((state.data.tagLibrary || []).map(function (item) { return item.name; }));
      let created = 0;
      names.forEach(function (name) {
        if (existing.has(name)) return;
        state.data.tagLibrary.push(Store.makeTag({ name: name, group: group, color: color }));
        existing.add(name);
        created++;
      });
      if (!created) {
        toast('这些标签都已经存在了');
        return;
      }
      persist();
      closeModal();
      render();
      toast('已创建 ' + created + ' 个标签');
    });
  }

  function renderTagPicker(selected, options) {
    options = options || {};
    const value = (selected || []).join(',');
    const body = '<div class="tag-picker-search-row">' +
        '<input type="text" data-tag-search autocomplete="off" placeholder="搜索标签，回车新建…">' +
        '<button class="tag-batch-toggle" type="button" data-tag-batch-toggle>批量添加</button>' +
      '</div>' +
      '<div class="tag-batch-panel" data-tag-batch-panel hidden>' +
        '<textarea data-tag-batch-text rows="3" placeholder="一行一个标签，例如：&#10;内网渗透&#10;Java&#10;免杀"></textarea>' +
        '<div class="tag-batch-foot">' +
          '<span data-tag-batch-status>每行一个，自动创建并选中</span>' +
          '<button class="btn btn-primary tag-batch-add" type="button" data-tag-batch-add>批量添加</button>' +
        '</div>' +
      '</div>' +
      '<div class="tag-picker-options" data-tag-options></div>';
    return '<div class="tag-picker' + (options.collapsed ? ' is-collapsed' : '') + '" data-tag-picker>' +
      '<div class="tag-picker-selected" data-tag-selected></div>' +
      (options.collapsed
        ? '<button class="tag-picker-toggle" type="button" data-tag-toggle>+ 添加 / 管理标签</button>' +
          '<div class="tag-picker-body" data-tag-body hidden>' + body + '</div>'
        : body) +
      '<input type="hidden" name="tags" value="' + esc(value) + '">' +
    '</div>';
  }

  function initTagPicker(form) {
    const root = form.querySelector('[data-tag-picker]');
    if (!root) return;
    const hidden = root.querySelector('input[name="tags"]');
    const selectedEl = root.querySelector('[data-tag-selected]');
    const optionsEl = root.querySelector('[data-tag-options]');
    const searchEl = root.querySelector('[data-tag-search]');
    const toggle = root.querySelector('[data-tag-toggle]');
    const body = root.querySelector('[data-tag-body]');
    const batchToggle = root.querySelector('[data-tag-batch-toggle]');
    const batchPanel = root.querySelector('[data-tag-batch-panel]');
    const batchText = root.querySelector('[data-tag-batch-text]');
    const batchAdd = root.querySelector('[data-tag-batch-add]');
    const batchStatus = root.querySelector('[data-tag-batch-status]');
    const selected = new Set(
      String(hidden.value || '').split(',').map(function (name) { return name.trim(); }).filter(Boolean)
    );
    let query = '';

    selected.forEach(function (name) {
      if (!getTagByName(name)) createTagRecord(name, '未分类', nextTagColor());
    });

    if (toggle && body) {
      toggle.addEventListener('click', function () {
        const willOpen = body.hidden;
        body.hidden = !willOpen;
        toggle.textContent = willOpen ? '收起标签选择' : '+ 添加 / 管理标签';
        if (willOpen) searchEl.focus();
      });
    }

    if (batchToggle && batchPanel) {
      batchToggle.addEventListener('click', function () {
        const willOpen = batchPanel.hidden;
        batchPanel.hidden = !willOpen;
        batchToggle.textContent = willOpen ? '收起批量' : '批量添加';
        if (willOpen) batchText.focus();
      });
    }

    if (batchAdd) {
      batchAdd.addEventListener('click', function () {
        const names = splitTagNames(batchText.value).slice(0, 100);
        if (!names.length) {
          batchText.focus();
          if (batchStatus) batchStatus.textContent = '先粘贴标签，每行一个';
          return;
        }
        let created = 0;
        names.forEach(function (name) {
          if (!getTagByName(name)) {
            state.data.tagLibrary.push(Store.makeTag({
              name: name,
              group: '未分类',
              color: nextTagColor()
            }));
            created++;
          }
          selected.add(name);
        });
        if (created) persist();
        batchText.value = '';
        query = '';
        searchEl.value = '';
        renderSelected();
        renderOptions();
        if (batchStatus) {
          batchStatus.textContent = '已新增 ' + created + ' 个，选中 ' + selected.size + ' 个';
        }
        batchText.focus();
      });
    }

    function tagDot(name) {
      return '<i class="tag-dot" style="background:' + tagColorHex(name) + '"></i>';
    }

    function renderSelected() {
      if (!selected.size) {
        selectedEl.innerHTML = '<span class="tag-picker-empty">暂未选择标签</span>';
      } else {
        selectedEl.innerHTML = Array.from(selected).map(function (name) {
          return '<button class="tag tag-picked" type="button" data-remove-tag="' + esc(name) + '" title="移除标签">' +
            tagDot(name) + '#' + esc(name) + '<span class="tag-remove">×</span></button>';
        }).join('');
      }
      hidden.value = Array.from(selected).join(',');
    }

    function renderOptions() {
      const all = (state.data.tagLibrary || []).slice().sort(function (a, b) {
        return a.name.localeCompare(b.name, 'zh-CN');
      });
      const matched = query
        ? all.filter(function (tag) { return tag.name.toLowerCase().indexOf(query.toLowerCase()) > -1; })
        : all;
      const groupNames = Array.from(new Set(matched.map(function (tag) { return tag.group || '未分类'; })));
      groupNames.sort(function (a, b) {
        if (a === '未分类') return 1;
        if (b === '未分类') return -1;
        return a.localeCompare(b, 'zh-CN');
      });

      let html = '';
      groupNames.forEach(function (group) {
        const groupTags = matched.filter(function (tag) { return (tag.group || '未分类') === group; });
        html += '<div class="tag-picker-group"><span class="tag-picker-group-label">' + esc(group) + '</span>' +
          groupTags.map(function (tag) {
            return '<button class="tag-option' + (selected.has(tag.name) ? ' active' : '') + '" type="button" ' +
              'data-tag="' + esc(tag.name) + '">' + tagDot(tag.name) + '#' + esc(tag.name) + '</button>';
          }).join('') +
        '</div>';
      });

      const trimmed = query.trim();
      const exact = trimmed ? all.some(function (tag) { return tag.name === trimmed; }) : false;
      if (trimmed && !exact) {
        html += '<button class="tag-option tag-option-create" type="button" data-create-tag="' + esc(trimmed) + '">' +
          svgIcon('plus') + '新建「' + esc(trimmed) + '」</button>';
      }
      if (!html) {
        html = '<span class="tag-picker-hint">没有匹配的标签，输入名称后回车新建。</span>';
      }
      optionsEl.innerHTML = html;
    }

    function addTag(name) {
      name = String(name || '').trim().replace(/^#+/, '').slice(0, 40);
      if (!name) return;
      if (!getTagByName(name)) createTagRecord(name, '未分类', nextTagColor());
      selected.add(name);
      query = '';
      searchEl.value = '';
      renderSelected();
      renderOptions();
    }

    function toggleTag(name) {
      if (selected.has(name)) selected.delete(name);
      else selected.add(name);
      renderSelected();
      renderOptions();
    }

    optionsEl.addEventListener('click', function (e) {
      const createBtn = e.target.closest('[data-create-tag]');
      if (createBtn) {
        addTag(createBtn.dataset.createTag);
        return;
      }
      const option = e.target.closest('[data-tag]');
      if (option) toggleTag(option.dataset.tag);
    });

    selectedEl.addEventListener('click', function (e) {
      const remove = e.target.closest('[data-remove-tag]');
      if (!remove) return;
      selected.delete(remove.dataset.removeTag);
      renderSelected();
      renderOptions();
    });

    searchEl.addEventListener('input', function () {
      query = searchEl.value;
      renderOptions();
    });

    searchEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag(searchEl.value);
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        searchEl.value = '';
        query = '';
        renderOptions();
      }
    });

    renderSelected();
    renderOptions();
  }

  /* ---------------- 随机抽题 ---------------- */
  function openReview() {
    const query = activeQuery();
    let pool;
    if (query) {
      pool = searchQuestions(query);
    } else if (state.view === 'interview') {
      const iv = currentInterview();
      pool = iv ? iv.questions.map(function (q) { return { iv: iv, q: q }; }) : [];
    } else {
      pool = allQuestions();
    }

    pool = pool.filter(function (item) { return matchesFilter(item.q); });
    if (!pool.length) {
      toast('当前范围没有可复习的题目');
      return;
    }

    reviewPool = pool;
    reviewCurrent = null;
    openModal(
      '<div class="modal-card review-card">' +
        '<header class="modal-head">' +
          '<div><div class="eyebrow">随机抽题</div><h2 id="reviewName">—</h2>' +
          '<p class="modal-sub" id="reviewSub"></p></div>' +
          '<button class="icon-btn" type="button" data-close aria-label="关闭">' + svgIcon('close') + '</button>' +
        '</header>' +
        '<div class="modal-body review-body" id="reviewBody"></div>' +
        '<footer class="modal-foot review-foot">' +
          '<button class="btn btn-ghost" type="button" data-action="review-next">' + svgIcon('refresh') + '换一题</button>' +
          '<button class="btn btn-primary" type="button" data-action="review-master">' + svgIcon('check') + '记住了</button>' +
        '</footer>' +
      '</div>',
      { wide: true }
    );
    paintReview(pickReviewItem());
  }

  function pickReviewItem() {
    let list = reviewPool.slice();
    if (reviewCurrent) {
      const rest = list.filter(function (item) { return item.q.id !== reviewCurrent.q.id; });
      if (rest.length) list = rest;
    }
    const unmastered = list.filter(function (item) { return item.q.status !== 'mastered'; });
    if (unmastered.length) list = unmastered;
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  function paintReview(item) {
    if (!item) return;
    reviewCurrent = item;
    const iv = item.iv;
    const q = item.q;

    const nameEl = document.getElementById('reviewName');
    if (!nameEl) return;
    nameEl.textContent = iv.name;

    const subEl = document.getElementById('reviewSub');
    if (subEl) {
      const done = reviewPool.filter(function (entry) { return entry.q.status === 'mastered'; }).length;
      subEl.textContent = [iv.date, '共 ' + reviewPool.length + ' 题', '已掌握 ' + done + ' 题']
        .filter(Boolean).join(' · ');
    }

    const bodyEl = document.getElementById('reviewBody');
    const tags = q.tags.map(function (tag) {
      return tagChip(tag);
    }).join('');
    const difficulty = q.difficulty
      ? '<span class="diff d' + q.difficulty + '">' + DIFF_LABEL[q.difficulty] + '</span>'
      : '';

    bodyEl.innerHTML =
      '<div class="review-tags">' + tags + difficulty + '</div>' +
      '<div class="review-question">' + esc(q.content) + '</div>' +
      (q.answer
        ? '<button class="btn btn-ghost review-reveal" type="button" data-action="review-reveal" ' +
            'aria-controls="reviewAnswer" aria-expanded="false">' + svgIcon('eye') + '显示答案</button>' +
          '<div class="review-answer" id="reviewAnswer" hidden><div class="answer-body md-body">' + mdToHtml(q.answer) + '</div></div>'
        : '<div class="review-noanswer">这道题还没有答案。可以先跳过，或者现在就补上。</div>' +
          '<button class="link-btn review-edit-link" type="button" data-action="review-edit">去补充答案 →</button>');
  }

  function toggleReviewAnswer(btn) {
    const answer = document.getElementById('reviewAnswer');
    if (!answer) return;
    const willShow = answer.hidden;
    answer.hidden = !willShow;
    if (btn) {
      btn.innerHTML = svgIcon('eye') + (willShow ? '收起答案' : '显示答案');
      btn.setAttribute('aria-expanded', willShow ? 'true' : 'false');
    }
  }

  function nextReview() {
    paintReview(pickReviewItem());
  }

  function masterReview() {
    if (!reviewCurrent) return;
    const iv = reviewCurrent.iv;
    const q = reviewCurrent.q;
    q.status = 'mastered';
    q.updatedAt = Store.now();
    iv.updatedAt = Store.now();
    persist();
    render();
    paintReview(pickReviewItem());
  }

  function editReviewQuestion() {
    if (!reviewCurrent) return;
    const iv = reviewCurrent.iv;
    const q = reviewCurrent.q;
    closeModal();
    setTimeout(function () {
      openQuestionModal({ interviewId: iv.id, questionId: q.id, focusAnswer: true });
    }, 60);
  }

  /* ---------------- 启动 ---------------- */
  init();
})();
