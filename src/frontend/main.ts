document.getElementById('year')!.textContent = new Date().getFullYear().toString();

interface Evento {
  data: string;
  tipo: string;
  horario: string;
  vagas_disponiveis: number;
}

(function () {
  const chip = document.querySelector('.hours');
  if (!chip) return;
  const hour = new Date().getHours();
  const open = hour >= 17 && hour < 23;
  if (!open) {
    chip.querySelector('span:last-child')!.innerHTML =
      '<strong>Fechado agora</strong> · abre às 17h';
    (chip.querySelector('.pulse') as HTMLElement).style.background = '#8a7d68';
    (chip.querySelector('.pulse') as HTMLElement).style.animation = 'none';
  }
})();

(async function () {
  const list = document.getElementById('course-list')!;

  try {
    const res = await fetch('/eventos');
    const eventos: Evento[] = await res.json();

    if (!eventos || eventos.length === 0) {
      list.innerHTML = '<li class="course" style="justify-content:center;color:var(--text-muted);font-size:14px;">Nenhum evento disponível no momento.</li>';
      return;
    }

    list.innerHTML = eventos.map(e => {
      const partes = e.data.split('/');
      const dia = partes[0] || '--';
      const mes = partes[1]
        ? new Date(0, parseInt(partes[1]) - 1).toLocaleString('pt-BR', { month: 'short' })
        : '--';

      return `
        <li class="course">
          <div class="course-date">
            <span class="day">${dia}</span>
            <span class="mon">${mes}</span>
          </div>
          <div class="course-body">
            <p class="course-title">${e.tipo}</p>
            <p class="course-meta">${e.horario} · ${e.vagas_disponiveis} vaga(s)</p>
          </div>
        </li>
      `;
    }).join('');

  } catch (err) {
    list.innerHTML = '<li class="course" style="justify-content:center;color:var(--text-muted);font-size:14px;">Erro ao carregar eventos.</li>';
  }
})();
