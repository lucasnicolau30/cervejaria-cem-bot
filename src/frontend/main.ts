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

  const now  = new Date();
  const day  = now.getDay(); // 0=dom, 1=seg, ..., 6=sab
  const hour = now.getHours();

  const label = chip.querySelector('span:last-child')!;
  const pulse = chip.querySelector('.pulse') as HTMLElement;

  // seg-sex: 10h-18h | sab: 14h-20h | dom: fechado
  let open = false;
  let fechaAs = '';

  if(day >= 1 && day <= 5){
    open    = hour >= 10 && hour < 18;
    fechaAs = '18h';
  } 
  else if(day === 6){
    open    = hour >= 14 && hour < 20;
    fechaAs = '20h';
  }

  if(open){
    label.innerHTML = `<strong>Aberto agora</strong> · fecha às ${fechaAs}`;
  } 
  else{
    const proximo = day === 0 || day === 6
      ? 'abre segunda às 10h'
      : 'abre às 10h';
    label.innerHTML = `<strong>Fechado agora</strong> · ${proximo}`;
    pulse.style.background = '#e53e3e';
    pulse.style.animation  = 'none';
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
