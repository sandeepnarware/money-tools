/*
 * Shared hover-tooltip engine for the hand-drawn <canvas> charts used across
 * all calculators. Charts stay canvas-drawn; this only adds a hover layer.
 *
 * Usage from a calculator's script.js, AFTER computing the chart geometry
 * (angles / bar rects), in CSS-pixel coordinates matching the canvas display
 * size (i.e. the same units you pass to fillRect / arc before ctx.scale(dpr)):
 *
 *   ChartTooltip.bind(canvas, [
 *     { type: 'arc',  cx, cy, rInner, rOuter, start, end, label, value, color },
 *     { type: 'rect', x, y, w, h, label, value, color },
 *     { type: 'point', x, y, r, label, value, color },
 *   ]);
 *
 * `value` is a pre-formatted string (e.g. '₹ 6,00,000' or '42%'). Re-calling
 * bind() on the same canvas just swaps the regions; listeners attach once.
 */
(function () {
  'use strict';

  var tipEl = null;

  function getTip() {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'chart-tooltip';
      tipEl.style.cssText = [
        'position:fixed',
        'pointer-events:none',
        'z-index:9999',
        'background:rgba(25,28,30,0.95)',
        'color:#fff',
        'padding:6px 10px',
        'border-radius:6px',
        'font:12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'line-height:1.35',
        'white-space:nowrap',
        'box-shadow:0 2px 10px rgba(0,0,0,0.28)',
        'opacity:0',
        'transition:opacity 0.12s ease',
        'transform:translate(-50%, -125%)',
        'left:0',
        'top:0',
      ].join(';');
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }

  function render(region) {
    var dot = region.color
      ? '<span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:' +
        region.color + ';margin-right:6px;vertical-align:middle;"></span>'
      : '';
    var label = region.label != null ? region.label : '';
    var value = region.value != null ? region.value : '';
    if (label && value) {
      return '<div style="opacity:0.85;">' + dot + label + '</div>' +
        '<div style="font-weight:600;margin-top:2px;">' + value + '</div>';
    }
    return dot + '<span style="font-weight:600;">' + (value || label) + '</span>';
  }

  function showTip(clientX, clientY, region) {
    var t = getTip();
    t.innerHTML = render(region);
    t.style.left = clientX + 'px';
    t.style.top = clientY + 'px';
    t.style.opacity = '1';
  }

  function hideTip() {
    if (tipEl) tipEl.style.opacity = '0';
  }

  var TWO_PI = Math.PI * 2;

  function norm(a) {
    return ((a % TWO_PI) + TWO_PI) % TWO_PI;
  }

  function hitArc(px, py, r) {
    var dx = px - r.cx;
    var dy = py - r.cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var rInner = r.rInner || 0;
    if (dist < rInner || dist > r.rOuter) return false;
    var a = norm(Math.atan2(dy, dx));
    var s = norm(r.start);
    var e = norm(r.end);
    if (Math.abs(r.end - r.start) >= TWO_PI - 1e-6) return true; // full circle
    if (s <= e) return a >= s && a <= e;
    return a >= s || a <= e; // segment wraps past the +x axis
  }

  function hitRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  function hitPoint(px, py, r) {
    var dx = px - r.x;
    var dy = py - r.y;
    return Math.sqrt(dx * dx + dy * dy) <= (r.r || 8);
  }

  function bind(canvas, regions) {
    if (!canvas) return;
    canvas.__ctRegions = regions || [];

    if (!canvas.__ctBound) {
      canvas.__ctBound = true;

      canvas.addEventListener('mousemove', function (ev) {
        var rect = canvas.getBoundingClientRect();
        var px = ev.clientX - rect.left;
        var py = ev.clientY - rect.top;
        var regs = canvas.__ctRegions || [];
        var hit = null;
        // Iterate last-to-first so later (foreground) regions win.
        for (var i = regs.length - 1; i >= 0; i--) {
          var rg = regs[i];
          var ok = rg.type === 'rect' ? hitRect(px, py, rg)
            : rg.type === 'point' ? hitPoint(px, py, rg)
              : hitArc(px, py, rg);
          if (ok) { hit = rg; break; }
        }
        if (hit) {
          showTip(ev.clientX, ev.clientY, hit);
          canvas.style.cursor = 'pointer';
        } else {
          hideTip();
          canvas.style.cursor = 'default';
        }
      });

      canvas.addEventListener('mouseleave', function () {
        hideTip();
        canvas.style.cursor = 'default';
      });
    }
  }

  window.ChartTooltip = { bind: bind };
})();
