(function() {
  const h = React.createElement;

  /* ─── mm → px helper (1 mm = 3.7795 px at 96 dpi) ─── */
  const mm = (n) => Math.round(n * 3.7795);

  /* ─── Print design tokens ─── */
  const PRINT = {
    bg:        '#1a1108',
    bgDeep:    '#0e0903',
    bgInk:     '#060401',
    bgWarm:    '#231508',
    paper:     '#ede1c8',
    paperLt:   '#f7eed8',
    paperDim:  '#d9c9a7',
    gold:      '#d4a843',
    goldLt:    '#e8c470',
    goldDeep:  '#b08830',
    goldDim:   'rgba(212,168,67,0.55)',
    goldMute:  'rgba(212,168,67,0.32)',
    goldFaint: 'rgba(212,168,67,0.18)',
    goldHair:  'rgba(212,168,67,0.1)',
    red:       '#d4543e',
    redDeep:   '#b03a28',
    redLt:     '#e06650',
    cream:     '#f4e8cc',
    creamDim:  'rgba(244,232,204,0.78)',
    creamMute: 'rgba(244,232,204,0.52)',
    creamFaint:'rgba(244,232,204,0.32)',
    brown:     '#f4e8cc',
    brownDim:  'rgba(244,232,204,0.7)',
  };

  /* ─── Typography atoms ─── */
  function PMono({ children, color, size, track, weight, style }) {
    return h('span', {
      style: {
        fontFamily: "'Noto Sans TC',sans-serif",
        fontSize: `${size !== undefined ? size : 7}pt`,
        letterSpacing: track || '0.32em',
        textTransform: 'uppercase',
        color: color || PRINT.brown,
        fontWeight: weight || 600,
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum","palt"',
        ...style,
      }
    }, children);
  }

  function PSerif({ children, size, weight, italic, color, track, style }) {
    return h('span', {
      style: {
        fontFamily: "'Noto Serif TC',serif",
        fontSize: `${size !== undefined ? size : 16}pt`,
        fontWeight: weight || 400,
        fontStyle: italic ? 'italic' : 'normal',
        letterSpacing: track || '0.04em',
        color: color || PRINT.brown,
        fontFeatureSettings: '"palt"',
        ...style,
      }
    }, children);
  }

  function PSans({ children, size, weight, color, track, style }) {
    return h('span', {
      style: {
        fontFamily: "'Noto Sans TC',sans-serif",
        fontSize: `${size !== undefined ? size : 10}pt`,
        fontWeight: weight || 400,
        letterSpacing: track || '0.04em',
        color: color || PRINT.brown,
        fontFeatureSettings: '"palt"',
        ...style,
      }
    }, children);
  }

  /* ─── Gold gradient text ─── */
  function GoldText({ children, soft, style, as }) {
    const As = as || 'span';
    const grad = soft
      ? 'linear-gradient(135deg, #8e6b22 0%, #c4a24a 50%, #8e6b22 100%)'
      : 'linear-gradient(135deg, #8e6b22 0%, #c4a24a 35%, #f0d684 50%, #c4a24a 65%, #8e6b22 100%)';
    return h(As, {
      style: {
        background: grad,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        ...style,
      }
    }, children);
  }

  /* ─── Paper grain overlay ─── */
  function PaperGrain({ opacity }) {
    return h('div', {
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E"),
          radial-gradient(circle at 20% 30%, rgba(212,168,67,0.04) 0.5px, transparent 1.5px),
          radial-gradient(circle at 80% 70%, rgba(212,168,67,0.05) 0.5px, transparent 1.5px)
        `,
        backgroundSize: '180px 180px, 70px 70px, 90px 90px',
        mixBlendMode: 'overlay',
        opacity: opacity !== undefined ? opacity : 0.5,
      }
    });
  }

  /* ─── Corner ticks ─── */
  function PTick({ pos, len, color, opacity, flipX, flipY, weight }) {
    const t = `${flipX ? 'scaleX(-1)' : ''} ${flipY ? 'scaleY(-1)' : ''}`.trim();
    const l = len !== undefined ? len : 6;
    const w = weight !== undefined ? weight : 0.5;
    return h('div', {
      style: {
        position: 'absolute',
        ...pos,
        width: l,
        height: l,
        transform: t,
        opacity: opacity !== undefined ? opacity : 0.55,
      }
    }, [
      h('div', { key: 'h-tick', style: { position: 'absolute', top: 0, left: 0, width: l, height: w, background: color || PRINT.gold } }),
      h('div', { key: 'v-tick', style: { position: 'absolute', top: 0, left: 0, width: w, height: l, background: color || PRINT.gold } }),
    ]);
  }

  /* ─── Crop marks ─── */
  function PCropMarks({ color, len, inset }) {
    const c = color || 'rgba(196,162,74,0.3)';
    const l = len !== undefined ? len : 8;
    const i = inset !== undefined ? inset : 3;
    const s = (pos) => ({ position: 'absolute', ...pos, background: c, pointerEvents: 'none' });
    return h(React.Fragment, null, [
      h('div', { key: 'tl-h', style: s({ top: i, left: i, width: l, height: 0.5 }) }),
      h('div', { key: 'tl-v', style: s({ top: i, left: i, width: 0.5, height: l }) }),
      h('div', { key: 'tr-h', style: s({ top: i, right: i, width: l, height: 0.5 }) }),
      h('div', { key: 'tr-v', style: s({ top: i, right: i, width: 0.5, height: l }) }),
      h('div', { key: 'bl-h', style: s({ bottom: i, left: i, width: l, height: 0.5 }) }),
      h('div', { key: 'bl-v', style: s({ bottom: i, left: i, width: 0.5, height: l }) }),
      h('div', { key: 'br-h', style: s({ bottom: i, right: i, width: l, height: 0.5 }) }),
      h('div', { key: 'br-v', style: s({ bottom: i, right: i, width: 0.5, height: l }) }),
    ]);
  }

  /* ─── Page frame ─── */
  function PPage({ wMm, hMm, bg, children, marks, grain, style }) {
    const showMarks = marks !== undefined ? marks : true;
    const showGrain = grain !== undefined ? grain : true;
    return h('div', {
      className: 'dc-artboard-frame',
      style: {
        width: `${wMm}mm`,
        height: `${hMm}mm`,
        background: bg || `linear-gradient(160deg, ${PRINT.bgWarm} 0%, ${PRINT.bg} 50%, ${PRINT.bgDeep} 100%)`,
        color: PRINT.cream,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Noto Sans TC',sans-serif",
        ...style,
      }
    }, [
      showGrain && h(PaperGrain, { key: 'grain', opacity: 0.45 }),
      children,
      showMarks && h(PCropMarks, { key: 'marks' }),
    ]);
  }

  /* ─── Thin rule ─── */
  function PRule({ width, color, height, style }) {
    return h('div', {
      style: {
        width: width || '24mm',
        height: height !== undefined ? height : 0.5,
        background: color || PRINT.goldFaint,
        ...style,
      }
    });
  }

  /* ─── Watermark ─── */
  function PWatermark({ ch, size, color, pos, italic }) {
    return h('div', {
      style: {
        position: 'absolute',
        ...(pos || { left: '50%', top: '50%' }),
        transform: `translate(-50%, -50%) ${italic ? 'skewX(-6deg)' : ''}`,
        fontFamily: "'Noto Serif TC',serif",
        fontWeight: 500,
        fontSize: size || 480,
        lineHeight: 0.78,
        color: color || 'rgba(196,162,74,0.05)',
        letterSpacing: '-0.06em',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        fontStyle: italic ? 'italic' : 'normal',
      }
    }, ch || '8');
  }

  /* ─── Pill label ─── */
  function PillLabel({ children, sparkle, size, gap, padding }) {
    const showSparkle = sparkle !== undefined ? sparkle : true;
    const s = size || 7;
    return h('div', {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: gap || 4,
        padding: padding || '3pt 9pt',
        border: `0.6pt solid ${PRINT.goldDim}`,
        background: 'rgba(196,162,74,0.04)',
        borderRadius: 999,
      }
    }, [
      showSparkle && h('svg', {
        key: 'sparkle-svg',
        width: s + 1,
        height: s + 1,
        viewBox: '0 0 16 16',
        style: { flex: '0 0 auto' }
      }, [
        h('path', { key: 'sparkle-path', d: 'M8 0 L9 6 L15 8 L9 10 L8 16 L7 10 L1 8 L7 6 Z', fill: PRINT.gold }),
        h('circle', { key: 'c1', cx: '3', cy: '3', r: '0.8', fill: PRINT.gold, opacity: '0.6' }),
        h('circle', { key: 'c2', cx: '13', cy: '13', r: '0.8', fill: PRINT.gold, opacity: '0.6' }),
      ]),
      h(PMono, { key: 'text', size: s, color: PRINT.gold, track: '0.32em', weight: 700 }, children)
    ]);
  }

  /* ─── Title block ─── */
  function TitleBlock({ en, zh, size, align, italic }) {
    const s = size || 1;
    const fs = 36 * s;
    const alignVal = align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center');
    return h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: alignVal,
      }
    }, [
      h('div', {
        key: 'en-title',
        style: {
          fontFamily: "'Noto Serif TC',serif",
          fontSize: `${fs}pt`,
          fontWeight: 400,
          color: PRINT.brown,
          fontStyle: italic || italic === undefined ? 'italic' : 'normal',
          letterSpacing: '0.01em',
          lineHeight: 1.05,
        }
      }, en || 'Mark Journal'),
      zh && h('div', {
        key: 'zh-title',
        style: {
          marginTop: 4 * s,
          fontFamily: "'Noto Serif TC',serif",
          fontWeight: 300,
          fontSize: `${fs * 0.32}pt`,
          color: PRINT.brown,
          letterSpacing: '0.42em',
          paddingLeft: '0.4em',
        }
      }, zh)
    ]);
  }

  /* ─── Icon mask (recolor SVG) ─── */
  function PMaskIcon({ src, size, color, opacity, style }) {
    const s = size || 40;
    return h('span', {
      style: {
        display: 'inline-block',
        width: s,
        height: s,
        backgroundColor: color || PRINT.brown,
        opacity: opacity !== undefined ? opacity : 1,
        WebkitMaskImage: `url('${src}')`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url('${src}')`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        ...style,
      }
    });
  }

  /* ─── Infinity badge (double ring) ─── */
  function InfinityBadge({ size, fg, accent, stroke, inner }) {
    const W = 200, H = 100;
    const s = size || 80;
    const r = 42, cy = 50, cx1 = 55, cx2 = 145;
    const str = stroke || 1.4;
    const fColor = fg || PRINT.gold;
    const aColor = accent || PRINT.gold;
    const hasInner = inner !== undefined ? inner : true;
    return h('svg', {
      width: s,
      height: s * (H / W),
      viewBox: `0 0 ${W} ${H}`,
      overflow: 'visible'
    }, [
      h('circle', { key: 'bg1', cx: cx1, cy: cy, r: r + 5, fill: 'none', stroke: fColor, strokeWidth: str * 0.4, opacity: 0.32 }),
      h('circle', { key: 'bg2', cx: cx2, cy: cy, r: r + 5, fill: 'none', stroke: fColor, strokeWidth: str * 0.4, opacity: 0.32 }),
      h('circle', { key: 'ring1', cx: cx1, cy: cy, r: r, fill: 'none', stroke: fColor, strokeWidth: str, strokeLinecap: 'round' }),
      h('circle', { key: 'ring2', cx: cx2, cy: cy, r: r, fill: 'none', stroke: fColor, strokeWidth: str, strokeLinecap: 'round' }),
      h('g', { key: 'center', transform: 'translate(100 50)' }, [
        h('circle', { key: 'dot', r: 2.6, fill: aColor }),
        hasInner && h('circle', { key: 'inner-ring', r: 7, fill: 'none', stroke: aColor, strokeWidth: 0.6, opacity: 0.5 })
      ])
    ]);
  }

  /* ─── Co-brand lockup ─── */
  function PCoBrand({ height, gap }) {
    const hVal = height || 11;
    const filt = 'brightness(0) invert(1) opacity(0.88)';
    return h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: gap || 8
      }
    }, [
      h('img', { key: 'tsutaya', src: '../assets/tsutaya-logo.svg', alt: 'TSUTAYA', style: { height: hVal * 1.1, filter: filt, display: 'block' } }),
      h('span', { key: 'cross', style: { fontFamily: "'Noto Sans TC',sans-serif", fontSize: `${hVal * 0.85}pt`, color: 'rgba(244,232,204,0.45)' } }, '×'),
      h('img', { key: 'wired', src: '../assets/wired-tokyo-logo.svg', alt: 'WIRED TOKYO', style: { height: hVal * 1.25, filter: filt, display: 'block' } })
    ]);
  }

  /* ─── Nexus Life wordmark (SVG mask) ─── */
  function NexusWordmark({ width, color, sub, align }) {
    const wVal = width || 140;
    const aspect = 862.33 / 150.7;
    const hVal = wVal / aspect;
    const alignVal = align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center');
    const showSub = sub !== undefined ? sub : true;
    return h('div', {
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: alignVal,
        gap: 4,
      }
    }, [
      h('span', {
        key: 'wordmark-logo',
        style: {
          display: 'block',
          width: wVal,
          height: hVal,
          backgroundColor: color || PRINT.brown,
          WebkitMaskImage: `url('../assets/nexus-life-logo.svg')`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url('../assets/nexus-life-logo.svg')`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }
      }),
      showSub && h('div', {
        key: 'sub-text',
        style: {
          fontFamily: "'Noto Sans TC',sans-serif",
          fontSize: `${Math.max(5, hVal * 0.22)}pt`,
          color: PRINT.brown,
          fontWeight: 600,
          letterSpacing: '0.42em',
          paddingLeft: '0.42em',
          lineHeight: 1.2,
        }
      }, '8TH\u00A0ANNIVERSARY')
    ]);
  }

  /* ─── Nexus Life inline mark ─── */
  function PNexusMark({ size, align }) {
    const s = size || 1;
    const fs = 28 * s;
    const alignVal = align === 'left' ? 'left' : 'center';
    const alignFlex = align === 'left' ? 'flex-start' : 'center';
    return h('div', {
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: alignFlex,
      }
    }, [
      h('h1', {
        key: 'nexus-h1',
        style: {
          fontFamily: "'Noto Serif TC',serif",
          fontSize: `${fs}pt`,
          lineHeight: 0.88,
          letterSpacing: '-0.02em',
          fontWeight: 500,
          margin: 0,
          textAlign: alignVal,
          color: PRINT.brown,
        }
      }, [
        h(GoldText, { key: 'nexus-text' }, 'Nexus'),
        h('span', { key: 'life-text', style: { fontStyle: 'italic', color: PRINT.brown, fontWeight: 400 } }, ' Life.')
      ])
    ]);
  }

  /* ─── Simulated QR code ─── */
  function PBigQR({ size, label, seed, withBrackets }) {
    const N = 25;
    const cells = [];
    let sVal = seed || 7;
    const rand = () => { sVal = (sVal * 9301 + 49297) % 233280; return sVal / 233280; };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) cells.push(rand() > 0.5);
    const setBlock = (cx, cy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const edge = x===0||x===6||y===0||y===6;
        const inner = x>=2&&x<=4&&y>=2&&y<=4;
        cells[(cy+y)*N+(cx+x)] = edge||inner;
      }
      for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) {
        if (x===-1||x===7||y===-1||y===7) {
          if (cx+x>=0&&cx+x<N&&cy+y>=0&&cy+y<N) cells[(cy+y)*N+(cx+x)] = false;
        }
      }
    };
    setBlock(0,0); setBlock(N-7,0); setBlock(0,N-7);
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      const edge = x===0||x===4||y===0||y===4;
      const inner = x===2&&y===2;
      cells[(N-7+y)*N+(N-7+x)] = edge||inner;
    }
    const hasBrackets = withBrackets !== undefined ? withBrackets : true;
    return h('div', {
      style: {
        width: size || '50mm',
        height: size || '50mm',
        background: `radial-gradient(circle at 30% 25%, ${PRINT.paperLt} 0%, ${PRINT.paper} 65%, ${PRINT.paperDim} 100%)`,
        padding: '4mm',
        position: 'relative',
        border: `0.6pt solid ${PRINT.goldDim}`,
        boxShadow: '0 1pt 2pt rgba(255,255,255,0.4) inset, 0 -1pt 2pt rgba(58,42,29,0.15) inset, 0 6mm 18mm -6mm rgba(0,0,0,0.55)',
      }
    }, [
      h('div', {
        key: 'noise',
        style: {
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.35,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
        }
      }),
      hasBrackets && h(React.Fragment, { key: 'ticks' }, [
        h(PTick, { key: 'tl', pos: { top: '-1.5mm', left: '-1.5mm' }, len: 9, color: PRINT.gold, opacity: 0.85, weight: 0.8 }),
        h(PTick, { key: 'tr', pos: { top: '-1.5mm', right: '-1.5mm' }, len: 9, color: PRINT.gold, opacity: 0.85, flipX: true, weight: 0.8 }),
        h(PTick, { key: 'bl', pos: { bottom: '-1.5mm', left: '-1.5mm' }, len: 9, color: PRINT.gold, opacity: 0.85, flipY: true, weight: 0.8 }),
        h(PTick, { key: 'br', pos: { bottom: '-1.5mm', right: '-1.5mm' }, len: 9, color: PRINT.gold, opacity: 0.85, flipX: true, flipY: true, weight: 0.8 }),
      ]),
      h('svg', {
        key: 'qr-svg',
        width: "100%",
        height: "100%",
        viewBox: `0 0 ${N} ${N}`,
        style: { display: 'block', position: 'relative' }
      }, cells.map((on, i) => on ? h('rect', { key: i, x: i%N, y: Math.floor(i/N), width: "1", height: "1", fill: PRINT.brown }) : null))
    ]);
  }

  /* ─── Stamp emblem (cream circular stamp face) ─── */
  function StampEmblem({ icon, size, iconColor, ticks }) {
    const s = size || 60;
    const hasTicks = ticks !== undefined ? ticks : true;
    return h('div', {
      style: {
        position: 'relative',
        width: s,
        height: s,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    }, [
      h('div', {
        key: 'circle-face',
        style: {
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 25%, ${PRINT.paperLt} 0%, ${PRINT.paper} 55%, ${PRINT.paperDim} 100%)`,
          border: `0.6pt solid ${PRINT.goldDim}`,
          boxShadow: `inset 0 1pt 2pt rgba(255,255,255,0.5), inset 0 -1pt 2pt rgba(58,42,29,0.18), 0 1pt 3pt rgba(0,0,0,0.35)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }
      }, [
        h('div', {
          key: 'noise',
          style: {
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.4,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`,
            mixBlendMode: 'multiply',
          }
        }),
        icon && h(PMaskIcon, { key: 'icon', src: icon, color: iconColor || PRINT.red, opacity: 0.92, style: { width: '58%', height: '58%' } })
      ]),
      hasTicks && h(React.Fragment, { key: 'ticks' }, [
        h(PTick, { key: 'tl', pos: { top: -2, left: -2 }, len: 5, color: PRINT.gold, opacity: 0.75, weight: 0.6 }),
        h(PTick, { key: 'tr', pos: { top: -2, right: -2 }, len: 5, color: PRINT.gold, opacity: 0.75, flipX: true, weight: 0.6 }),
        h(PTick, { key: 'bl', pos: { bottom: -2, left: -2 }, len: 5, color: PRINT.gold, opacity: 0.75, flipY: true, weight: 0.6 }),
        h(PTick, { key: 'br', pos: { bottom: -2, right: -2 }, len: 5, color: PRINT.gold, opacity: 0.75, flipX: true, flipY: true, weight: 0.6 }),
      ])
    ]);
  }

  /* ─── Station data ─── */
  const STAMP_POINTS = [
    { n: '01', area: '靈感補給站',   element: '無限', icon: '../assets/icon-01-infinity.svg', loc: '入口主題陳列區（2F）',
      copy: '從這裡走出去，8 與 ∞ 同時開始。' },
    { n: '02', area: '日常儀式感',   element: '陶杯', icon: '../assets/icon-02-cup.svg',      loc: '職人雜貨區（2F）',
      copy: '手溫傳過陶杯，8 年的 ∞ 就在掌心。' },
    { n: '03', area: '都市放空點',   element: '風',   icon: '../assets/icon-03-wind.svg',     loc: '戶外座位區（3F）',
      copy: '露台吹來 ∞ 的風，繞了 8 個年頭才停。' },
    { n: '04', area: '白日夢實驗室', element: '橡實', icon: '../assets/icon-04-acorn.svg',    loc: '兒童繪本書櫃（3F）',
      copy: '一顆橡實用 8 年 ∞ 生長，長成整片森林。' },
    { n: '05', area: '打卡神級背景', element: '書',   icon: '../assets/icon-05-book.svg',     loc: '樓梯書牆（3F）',
      copy: '8 層書牆向 ∞ 展開，每格都是新世界。' },
    { n: '06', area: '放鬆充電站',   element: '咖啡', icon: '../assets/icon-06-coffee.svg',   loc: '吧檯區（2F）',
      copy: '一杯咖啡，8 年的 ∞ 日常，從未厭倦。' },
    { n: '07', area: '絕美光影濾鏡', element: '光點', icon: '../assets/icon-07-flare.svg',    loc: '天井吊燈區（3F）',
      copy: '光從天井 ∞ 落，你離第 8 枚只剩一步。' },
    { n: '08', area: '情報交流道',   element: '花朵', icon: '../assets/icon-08-flower.svg',   loc: '告示牌（1F）',
      copy: '8 年 ∞ 循環，每天都有一朵花記住你。' },
  ];

  const HIDDEN_EGGS = [
    { id: 'A', area: '夥伴', element: '墨鏡松鼠 ∞', icon: '../assets/icon-04-acorn.svg', loc: '員工身上（隨機）',
      copy: '牠等了你 8 分鐘，或者是 ∞ 分鐘，松鼠自己也數不清。' },
    { id: 'B', area: '野生小夥伴', element: '墨鏡蜂鳥 ∞', icon: '../assets/icon-03-wind.svg', loc: '戶外座位桌上',
      copy: '這個位子空著。蜂鳥只停在不趕路的人身邊。' },
    { id: 'C', area: '野生大夥伴', element: '墨鏡麋鹿 ∞', icon: '../assets/icon-08-flower.svg', loc: '電梯告示',
      copy: '電梯只有上下，沒有 ∞。麋鹿選擇住在這裡，等一個看得懂的人。' },
  ];

  // Export to global scope
  window.PrintCommon = {
    mm, PRINT, PMono, PSerif, PSans, GoldText, PaperGrain, PTick, PCropMarks, PPage, PRule, PWatermark, PillLabel, TitleBlock, PMaskIcon, InfinityBadge, PCoBrand, NexusWordmark, PNexusMark, PBigQR, StampEmblem, STAMP_POINTS, HIDDEN_EGGS
  };
})();
