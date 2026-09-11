// Gera a imagem da nota de falecimento (canvas, formato retrato) para download.

function desenharPlaceholder(ctx, cx, cy, r) {
  ctx.fillStyle = '#25366b';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
}

function quebrarLinhas(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function escreverBloco(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = quebrarLinhas(ctx, text, maxWidth);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length * lineHeight;
}

export function gerarNotaFalecimento({ nome, nascimento, falecimento, fotoUrl }) {
  return new Promise((resolve) => {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const finalizar = () => {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(W / 2, 380, 220, 0, Math.PI * 2); ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#9fb3dd';
      ctx.font = '700 32px "Segoe UI", Arial, sans-serif';
      ctx.fillText('NOTA DE FALECIMENTO', W / 2, 690);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 58px "Segoe UI", Arial, sans-serif';
      const alturaNome = escreverBloco(ctx, nome || 'Nome não informado', W / 2, 780, W - 140, 66);

      const yLinha1 = 780 + alturaNome + 40;
      ctx.fillStyle = '#c3d1ee';
      ctx.font = '400 30px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Nascimento: ${nascimento || '—'}`, W / 2, yLinha1);
      ctx.fillText(`Falecimento: ${falecimento || '—'}`, W / 2, yLinha1 + 44);

      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.moveTo(W / 2 - 120, yLinha1 + 90); ctx.lineTo(W / 2 + 120, yLinha1 + 90); ctx.stroke();

      ctx.fillStyle = '#c3d1ee';
      ctx.font = '400 28px "Segoe UI", Arial, sans-serif';
      escreverBloco(
        ctx,
        'Comunicamos, com pesar, o falecimento. A família agradece as mensagens de carinho e conforto recebidas neste momento.',
        W / 2, yLinha1 + 150, W - 260, 42,
      );

      ctx.fillStyle = '#7f93c4';
      ctx.font = '600 26px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Funerária Canaã · funerariacanaa.com', W / 2, H - 70);

      resolve(canvas.toDataURL('image/png'));
    };

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#16225E');
    grad.addColorStop(1, '#0A1230');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = 380;
    const r = 220;

    if (fotoUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
        const iw = img.width * scale;
        const ih = img.height * scale;
        ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
        ctx.restore();
        finalizar();
      };
      img.onerror = () => { desenharPlaceholder(ctx, cx, cy, r); finalizar(); };
      img.src = fotoUrl;
    } else {
      desenharPlaceholder(ctx, cx, cy, r);
      finalizar();
    }
  });
}
