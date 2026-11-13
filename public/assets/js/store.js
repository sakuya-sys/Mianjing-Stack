/* 面经本 · 数据层
 * 两种模式：
 *  - server：通过本地 Node 服务读写 data/mianjing.json（启动.bat）
 *  - browser：直接打开 HTML 时，退回 localStorage
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'mianjing.data.v1';
  const THEME_KEY = 'mianjing.theme';
  const VERSION = 1;
  const STATUSES = ['todo', 'learning', 'mastered'];
  const STATUS_LABEL = { todo: '待复习', learning: '复习中', mastered: '已掌握' };
  const DIFF_LABEL = { 1: '简单', 2: '中等', 3: '困难' };
  const TAG_COLORS = ['blue', 'violet', 'green', 'amber', 'red', 'cyan', 'pink', 'gray'];

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function now() {
    return new Date().toISOString();
  }

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function uid(prefix) {
    let rand;
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      rand = global.crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    } else {
      rand = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    }
    return prefix + '_' + rand;
  }

  function parseTags(input) {
    if (Array.isArray(input)) input = input.join(',');
    const seen = Object.create(null);
    return String(input || '')
      .split(/[,，、;；]+/)
      .map(function (t) { return t.trim().replace(/^#+/, ''); })
      .filter(function (t) {
        if (!t || t.length > 40 || seen[t]) return false;
        seen[t] = true;
        return true;
      })
      .slice(0, 20);
  }

  function normalizeContent(text) {
    return String(text == null ? '' : text)
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  function normalizeSourceUrl(value) {
    const url = String(value == null ? '' : value).trim();
    return /^https?:\/\//i.test(url) ? url.slice(0, 500) : '';
  }

  function makeQuestion(raw) {
    raw = raw || {};
    const t = now();
    const diff = Number(raw.difficulty);
    return {
      id: uid('q'),
      content: normalizeContent(raw.content != null ? raw.content : (raw.title || raw.question)),
      answer: normalizeContent(raw.answer),
      tags: parseTags(raw.tags),
      difficulty: [0, 1, 2, 3].indexOf(diff) > -1 ? diff : 0,
      status: STATUSES.indexOf(raw.status) > -1 ? raw.status : 'todo',
      createdAt: t,
      updatedAt: t
    };
  }

  function normalizeQuestion(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const q = makeQuestion(raw);
    if (!q.content) return null;
    if (raw.id) q.id = String(raw.id);
    if (raw.createdAt) q.createdAt = String(raw.createdAt);
    if (raw.updatedAt) q.updatedAt = String(raw.updatedAt);
    return q;
  }

  function makeInterview(raw) {
    raw = raw || {};
    const t = now();
    return {
      id: uid('iv'),
      name: String(raw.name || '').trim(),
      date: /^\d{4}-\d{2}-\d{2}$/.test(String(raw.date || '')) ? raw.date : today(),
      tags: parseTags(raw.tags),
      notes: normalizeContent(raw.notes),
      sourceUrl: normalizeSourceUrl(raw.sourceUrl),
      questions: Array.isArray(raw.questions)
        ? raw.questions.map(normalizeQuestion).filter(Boolean)
        : [],
      createdAt: t,
      updatedAt: t
    };
  }

  function normalizeInterview(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!String(raw.name || '').trim()) return null;
    const iv = makeInterview(raw);
    if (raw.id) iv.id = String(raw.id);
    if (raw.createdAt) iv.createdAt = String(raw.createdAt);
    if (raw.updatedAt) iv.updatedAt = String(raw.updatedAt);
    return iv;
  }

  function makeKnowledge(raw) {
    raw = raw || {};
    const t = now();
    return {
      id: uid('kn'),
      title: String(raw.title || '').trim().slice(0, 120),
      content: normalizeContent(raw.content),
      category: String(raw.category || '').trim().slice(0, 30),
      tags: parseTags(raw.tags),
      sourceInterviewId: String(raw.sourceInterviewId || '').slice(0, 40),
      sourceInterviewName: String(raw.sourceInterviewName || '').trim().slice(0, 120),
      sourceQuestionId: String(raw.sourceQuestionId || '').slice(0, 40),
      createdAt: t,
      updatedAt: t
    };
  }

  function normalizeKnowledge(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!String(raw.title || '').trim()) return null;
    const note = makeKnowledge(raw);
    if (raw.id) note.id = String(raw.id);
    if (raw.createdAt) note.createdAt = String(raw.createdAt);
    if (raw.updatedAt) note.updatedAt = String(raw.updatedAt);
    return note;
  }

  function makeTag(raw) {
    raw = raw || {};
    const t = now();
    const group = String(raw.group || '未分类').trim().slice(0, 20) || '未分类';
    return {
      id: uid('tg'),
      name: String(raw.name || '').trim().replace(/^#+/, '').slice(0, 40),
      group: group,
      color: TAG_COLORS.indexOf(raw.color) > -1 ? raw.color : 'gray',
      createdAt: t,
      updatedAt: t
    };
  }

  function normalizeTag(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!String(raw.name || '').trim().replace(/^#+/, '')) return null;
    const tag = makeTag(raw);
    if (raw.id) tag.id = String(raw.id);
    if (raw.createdAt) tag.createdAt = String(raw.createdAt);
    if (raw.updatedAt) tag.updatedAt = String(raw.updatedAt);
    return tag;
  }

  function makeKnowledgeCategory(raw) {
    raw = raw || {};
    const t = now();
    return {
      id: uid('kc'),
      name: String(raw.name || '').trim().slice(0, 30),
      color: TAG_COLORS.indexOf(raw.color) > -1 ? raw.color : 'blue',
      createdAt: t,
      updatedAt: t
    };
  }

  function normalizeKnowledgeCategory(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!String(raw.name || '').trim()) return null;
    const category = makeKnowledgeCategory(raw);
    if (raw.id) category.id = String(raw.id);
    if (raw.createdAt) category.createdAt = String(raw.createdAt);
    if (raw.updatedAt) category.updatedAt = String(raw.updatedAt);
    return category;
  }

  function emptyData() {
    return {
      version: VERSION,
      interviews: [],
      knowledge: [],
      knowledgeCategories: [],
      tagLibrary: [],
      updatedAt: now()
    };
  }

  function normalizeData(input) {
    let list = [];
    let knowledge = [];
    let knowledgeCategories = [];
    let tagLibrary = [];
    if (Array.isArray(input)) {
      list = input;
    } else if (input && typeof input === 'object' &&
      (Array.isArray(input.interviews) || Array.isArray(input.knowledge) || Array.isArray(input.tagLibrary))) {
      list = Array.isArray(input.interviews) ? input.interviews : [];
      knowledge = Array.isArray(input.knowledge) ? input.knowledge : [];
      knowledgeCategories = Array.isArray(input.knowledgeCategories) ? input.knowledgeCategories : [];
      tagLibrary = Array.isArray(input.tagLibrary) ? input.tagLibrary : [];
    } else {
      throw new Error('文件格式不正确：没有找到 interviews 或 knowledge 数组');
    }
    const out = emptyData();
    out.interviews = list.map(normalizeInterview).filter(Boolean);
    out.knowledge = knowledge.map(normalizeKnowledge).filter(Boolean);
    out.knowledgeCategories = knowledgeCategories.map(normalizeKnowledgeCategory).filter(Boolean);
    out.tagLibrary = tagLibrary.map(normalizeTag).filter(Boolean);
    if (input && !Array.isArray(input) && input.updatedAt) out.updatedAt = input.updatedAt;
    return out;
  }

  function storageAvailable() {
    try {
      const key = '__mianjing_probe__';
      global.localStorage.setItem(key, '1');
      global.localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadLocal() {
    if (!storageAvailable()) {
      return { data: emptyData(), mode: 'browser', error: 'storage-unavailable' };
    }
    let raw = null;
    try {
      raw = global.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return { data: emptyData(), mode: 'browser', error: 'storage-unavailable' };
    }
    if (!raw) return { data: emptyData(), mode: 'browser', error: null };
    try {
      return { data: normalizeData(JSON.parse(raw)), mode: 'browser', error: null };
    } catch (e) {
      return { data: emptyData(), mode: 'browser', error: 'corrupt' };
    }
  }

  function saveLocal(data) {
    try {
      data.updatedAt = now();
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  const Store = {
    mode: 'browser',

    async init() {
      const isHttp = /^https?:$/.test(global.location.protocol);
      if (isHttp) {
        try {
          const controller = typeof AbortController === 'function' ? new AbortController() : null;
          const timer = controller ? setTimeout(function () { controller.abort(); }, 2500) : null;
          const res = await fetch('/api/data', {
            cache: 'no-store',
            signal: controller ? controller.signal : undefined
          });
          if (timer) clearTimeout(timer);
          if (res.ok) {
            const parsed = await res.json();
            const data = normalizeData(parsed);
            Store.mode = 'server';
            return { data: data, mode: 'server', error: null };
          }
        } catch (e) {
          /* 没有本地服务时退回浏览器存储 */
        }
      }
      return loadLocal();
    },

    async save(data) {
      if (Store.mode === 'server') {
        try {
          data.updatedAt = now();
          const res = await fetch('/api/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) {
            let message = 'HTTP ' + res.status;
            try {
              const body = await res.json();
              if (body && body.error) message = body.error;
            } catch (e) { /* ignore */ }
            throw new Error(message);
          }
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e };
        }
      }
      return saveLocal(data);
    },

    stats(data) {
      const s = {
        interviews: data.interviews.length,
        questions: 0,
        todo: 0,
        learning: 0,
        mastered: 0,
        noAnswer: 0,
        knowledge: Array.isArray(data.knowledge) ? data.knowledge.length : 0,
        knowledgeCategories: Array.isArray(data.knowledgeCategories) ? data.knowledgeCategories.length : 0,
        tagLibrary: Array.isArray(data.tagLibrary) ? data.tagLibrary.length : 0,
        tags: 0
      };
      const tagSet = Object.create(null);
      data.interviews.forEach(function (iv) {
        iv.tags.forEach(function (t) { tagSet[t] = true; });
        iv.questions.forEach(function (q) {
          s.questions++;
          if (q.status === 'mastered') s.mastered++;
          else if (q.status === 'learning') s.learning++;
          else s.todo++;
          if (!q.answer.trim()) s.noAnswer++;
          q.tags.forEach(function (t) { tagSet[t] = true; });
        });
      });
      (data.knowledge || []).forEach(function (note) {
        note.tags.forEach(function (t) { tagSet[t] = true; });
      });
      s.tags = Object.keys(tagSet).length;
      return s;
    },

    toMarkdown(data, onlyInterview) {
      const list = onlyInterview ? [onlyInterview] : data.interviews;
      const out = [];
      list.forEach(function (iv, ivIndex) {
        if (ivIndex > 0) out.push('', '---', '');
        out.push('# ' + iv.name, '');
        const meta = [];
        if (iv.date) meta.push('日期：' + iv.date);
        if (iv.tags.length) meta.push('标签：' + iv.tags.map(function (t) { return '#' + t; }).join(' '));
        if (meta.length) out.push(meta.join(' · '), '');
        if (iv.sourceUrl) out.push('来源：' + iv.sourceUrl, '');
        if (iv.notes) out.push('> ' + iv.notes.split('\n').join('\n> '), '');

        if (!iv.questions.length) {
          out.push('_（这场面试还没有题目）_', '');
        } else {
          const done = iv.questions.filter(function (q) { return q.status === 'mastered'; }).length;
          out.push('进度：已掌握 ' + done + ' / ' + iv.questions.length, '');
          iv.questions.forEach(function (q, i) {
            out.push('## ' + (i + 1) + '. ' + q.content, '');
            const tags = q.tags.length ? ' · ' + q.tags.map(function (t) { return '#' + t; }).join(' ') : '';
            const diff = q.difficulty ? ' · 难度：' + DIFF_LABEL[q.difficulty] : '';
            out.push('*' + STATUS_LABEL[q.status] + diff + tags + '*', '');
            if (q.answer) {
              out.push(q.answer, '');
            } else {
              out.push('_（答案待补充）_', '');
            }
          });
        }
      });

      if (!onlyInterview && data.knowledge && data.knowledge.length) {
        if (out.length) out.push('', '---', '');
        out.push('# 知识点', '');
        data.knowledge.forEach(function (note, i) {
          out.push('## ' + (i + 1) + '. ' + note.title, '');
          if (note.tags.length) {
            out.push(note.tags.map(function (t) { return '#' + t; }).join(' '), '');
          }
          out.push(note.content || '_（暂无内容）_', '');
        });
      }

      return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
    },

    sampleData() {
      const data = emptyData();

      data.interviews.push(makeInterview({
        name: '字节跳动 · 后端开发一面',
        date: daysAgo(3),
        tags: ['后端', '字节跳动'],
        notes: '45 分钟：项目追问 + 八股 + 手撕。面试官很关注底层原理，答案最好能说到「为什么」。',
        questions: [
          {
            content: '介绍一下你最有挑战的一个项目，难点是什么，怎么解决的？',
            answer: [
              '项目背景：校园二手交易平台，日均 2k 访问、峰值 QPS 约 300。',
              '',
              '难点一：图片上传慢。原来的同步上传 + 压缩导致接口 P99 超过 3s。改成前端直传对象存储（预签名 URL），后端只接收回调落库，P99 降到 400ms 左右。',
              '',
              '难点二：下单超卖。用 Redis Lua 脚本扣库存，再用数据库唯一索引兜底；压测 500 并发没有出现超卖。',
              '',
              '追问「为什么用 Lua」：把「判断库存 + 扣减」放在一次原子执行里，避免并发竞争。'
            ].join('\n'),
            tags: ['项目'],
            difficulty: 2,
            status: 'mastered'
          },
          {
            content: 'Redis 为什么快？',
            answer: [
              '1. 纯内存操作，避免磁盘 IO；',
              '2. 单线程处理命令，没有锁竞争和线程切换开销（网络 IO 用多路复用）；',
              '3. 数据结构高效：SDS、跳表、压缩列表、哈希表；',
              '4. 全局哈希表渐进式 rehash，避免一次性扩容卡顿。',
              '',
              '补充：Redis 6.0 起网络 IO 可以多线程，但命令执行仍然是单线程。'
            ].join('\n'),
            tags: ['Redis', '缓存'],
            difficulty: 2,
            status: 'learning'
          },
          {
            content: 'MySQL 索引为什么用 B+ 树，而不是 B 树或红黑树？',
            answer: '',
            tags: ['MySQL', '索引'],
            difficulty: 2,
            status: 'todo'
          },
          {
            content: '手撕：反转链表，分别写迭代和递归。',
            answer: [
              '迭代写法：',
              '',
              'def reverse_list(head):',
              '    prev = None',
              '    while head:',
              '        nxt = head.next',
              '        head.next = prev',
              '        prev = head',
              '        head = nxt',
              '    return prev',
              '',
              '递归写法：先递归到链表尾部，回溯时逐层反转 next 指针，返回新的头节点。',
              '',
              '时间复杂度 O(n)；迭代空间 O(1)，递归空间 O(n)（递归栈）。'
            ].join('\n'),
            tags: ['算法', '手撕'],
            difficulty: 1,
            status: 'mastered'
          },
          {
            content: '进程和线程的区别？协程又是什么？',
            answer: '',
            tags: ['操作系统'],
            difficulty: 1,
            status: 'todo'
          }
        ]
      }));

      data.interviews.push(makeInterview({
        name: '美团 · 后端二面',
        date: daysAgo(10),
        tags: ['后端', '美团'],
        notes: '偏场景设计，问了限流、消息队列和分布式锁。',
        questions: [
          {
            content: '设计一个秒杀系统，如何防止超卖和刷单？',
            answer: '',
            tags: ['系统设计', '场景题'],
            difficulty: 3,
            status: 'todo'
          },
          {
            content: 'Kafka 如何保证消息不丢失？',
            answer: [
              '分三个阶段看：',
              '1. 生产者：acks=all，开启重试，保证消息写入所有 ISR 副本；',
              '2. Broker：replication.factor >= 3、min.insync.replicas >= 2，并关闭 unclean.leader.election；',
              '3. 消费者：关闭自动提交，业务处理成功后再手动提交 offset。',
              '',
              '代价：吞吐会下降，需要按业务在可靠性和性能之间取舍。'
            ].join('\n'),
            tags: ['Kafka', '消息队列'],
            difficulty: 2,
            status: 'learning'
          },
          {
            content: '分布式锁有哪些实现？Redisson 看门狗的原理是什么？',
            answer: '',
            tags: ['分布式', 'Redis'],
            difficulty: 3,
            status: 'todo'
          }
        ]
      }));

      data.knowledge.push(makeKnowledge({
        title: 'Redis 缓存穿透、击穿、雪崩',
        content: [
          '穿透：查询根本不存在的数据，请求每次落到数据库。',
          '处理：缓存空值（短 TTL）、布隆过滤器、参数校验。',
          '',
          '击穿：热点 key 过期瞬间，大量请求同时打到数据库。',
          '处理：互斥锁重建缓存、逻辑过期 + 异步刷新。',
          '',
          '雪崩：大量 key 同时过期，或 Redis 整体不可用。',
          '处理：过期时间加随机值、多级缓存、熔断降级、集群高可用。'
        ].join('\n'),
        tags: ['Redis', '缓存']
      }));

      data.knowledge.push(makeKnowledge({
        title: 'SQL 注入：预编译为什么能防注入',
        content: [
          '预编译把 SQL 结构先交给数据库解析，参数位置只传值，不参与 SQL 语法解析。',
          '所以用户输入里的引号、OR 1=1 只会被当成普通字符串。',
          '',
          '注意：表名、列名、ORDER BY 字段不能用占位符，需要白名单校验。',
          'LIKE 查询要拼接通配符时，仍应限制输入长度和转义。'
        ].join('\n'),
        tags: ['SQL注入', '安全']
      }));

      data.knowledge[0].category = '缓存';
      data.knowledge[1].category = 'Web安全';
      data.knowledgeCategories.push(
        makeKnowledgeCategory({ name: '缓存', color: 'red' }),
        makeKnowledgeCategory({ name: 'Web安全', color: 'violet' })
      );

      data.tagLibrary.push(
        makeTag({ name: '后端', group: '方向', color: 'blue' }),
        makeTag({ name: '安全', group: '方向', color: 'violet' }),
        makeTag({ name: 'Redis', group: '技术栈', color: 'red' }),
        makeTag({ name: 'MySQL', group: '技术栈', color: 'amber' }),
        makeTag({ name: '字节跳动', group: '公司', color: 'cyan' }),
        makeTag({ name: '美团', group: '公司', color: 'green' }),
        makeTag({ name: '项目', group: '面试', color: 'pink' }),
        makeTag({ name: '算法', group: '面试', color: 'gray' })
      );

      return data;
    },

    today: today,
    now: now,
    parseTags: parseTags,
    makeQuestion: makeQuestion,
    makeInterview: makeInterview,
    makeKnowledge: makeKnowledge,
    makeKnowledgeCategory: makeKnowledgeCategory,
    makeTag: makeTag,
    TAG_COLORS: TAG_COLORS,
    emptyData: emptyData,
    normalizeData: normalizeData,
    storageAvailable: storageAvailable,
    STORAGE_KEY: STORAGE_KEY,
    THEME_KEY: THEME_KEY,
    STATUS_LABEL: STATUS_LABEL,
    DIFF_LABEL: DIFF_LABEL
  };

  global.Store = Store;
})(window);
