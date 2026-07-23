(function () {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  const mouse = { x: null, y: null, radius: 120 };

  function resizeCanvas() {
    const hero = document.querySelector('.hero');
    const rect = hero ? hero.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    initParticles(rect.width, rect.height);
  }

  function initParticles(width, height) {
    particles = [];
    const count = Math.max(40, Math.floor(width / 18));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1
      });
    }
  }

  function draw() {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(74,158,255,${0.18 - dist / 900})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      if (mouse.x !== null && mouse.y !== null) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.radius) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(212,175,55,0.18)';
          ctx.lineWidth = 3;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId);
    resizeCanvas();
    draw();
  });

  resizeCanvas();
  draw();
})();

document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('.accordion-header');
  const bodies = document.querySelectorAll('.accordion-body');
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  function closeAllAccordion() {
    headers.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-expanded', 'false');
    });
    bodies.forEach((item) => {
      item.classList.remove('open');
    });
  }

  headers.forEach((header) => {
    header.setAttribute('aria-expanded', 'false');

    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const isOpen = header.classList.contains('active');

      closeAllAccordion();

      if (!isOpen && body && body.classList.contains('accordion-body')) {
        header.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        body.classList.add('open');
      }
    });
  });

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetHeader = target.querySelector('.accordion-header');
      const targetBody = target.querySelector('.accordion-body');

      if (targetHeader && targetBody) {
        closeAllAccordion();
        targetHeader.classList.add('active');
        targetHeader.setAttribute('aria-expanded', 'true');
        targetBody.classList.add('open');
      }

      const nav = document.querySelector('nav');
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 18;

      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    });
  });

  // SERVICOS MODAL
  const servicosSection = document.getElementById('servicos');
  if (servicosSection) {
    const servicosData = [
      {
        titulo: 'Gestão de Redes Sociais',
        imagem: 'https://i.postimg.cc/Ssn4t4hQ/Gestao-de-redes-sociais.png',
        descricao: 'Planeamento, organização e publicação de conteúdos alinhados com a identidade da marca.',
        detalhe: 'A gestão profissional de redes sociais transforma perfis dispersos em canais consistentes...'
      },
      {
        titulo: 'Criação de Conteúdo',
        imagem: 'https://i.postimg.cc/nzXxwxJK/content-creation.png',
        descricao: 'Produção de imagens, textos e criativos pensados para captar atenção e gerar interação.',
        detalhe: 'A criação de conteúdo profissional é o motor que alimenta toda a comunicação digital...'
      },
      {
        titulo: 'Estratégia Digital',
        imagem: 'https://i.postimg.cc/857GnGSv/Estrategia-de-Marketing.png',
        descricao: 'Definição de objetivos, posicionamento e comunicação para crescimento sustentado online.',
        detalhe: 'Uma estratégia digital bem definida é o mapa que orienta todas as ações...'
      },
      {
        titulo: 'Publicidade Online',
        imagem: 'https://i.postimg.cc/C1R060gk/Campanhas-meta-e-google.png',
        descricao: 'Campanhas com foco em alcance, notoriedade e conversão para atrair mais clientes.',
        detalhe: 'A publicidade online profissional permite à marca chegar a públicos altamente segmentados...'
      },
      {
        titulo: 'Criação e Otimização de Sites e Landing Pages',
        imagem: 'https://i.postimg.cc/k42ChCm4/Site-e-landing-pages.png',
        descricao: 'Desenvolvimento de páginas mais rápidas, claras e orientadas para conversão.',
        detalhe: 'O site e as landing pages são, muitas vezes, o ponto de decisão do cliente...'
      },
      {
        titulo: 'Planeamento de Eventos',
        imagem: 'https://i.postimg.cc/bJZPFPhw/Planeamento-de-eventos.png',
        descricao: 'Organização estratégica de eventos e ações promocionais para reforçar a marca.',
        detalhe: 'O planeamento estratégico de eventos permite que cada iniciativa presencial funcione...'
      },
      {
        titulo: 'Formação de Colaboradores',
        imagem: 'https://i.postimg.cc/gJMKVdxG/Formacao-de-colaboradores.png',
        descricao: 'Formação em vendas e atendimento ao público para melhorar a comunicação.',
        detalhe: 'Formar colaboradores em vendas e atendimento ao público é investir diretamente...'
      },
      {
        titulo: 'Relatórios e Acompanhamento',
        imagem: 'https://i.postimg.cc/XJrWDWb7/Analise-de-resultados.png',
        descricao: 'Análise contínua de resultados para medir desempenho e ajustar a estratégia.',
        detalhe: 'Relatórios e acompanhamento profissional são o que transformam dados soltos...'
      }
    ];

    const cards = servicosSection.querySelectorAll('.servicos-grid .servico-card');
    cards.forEach((card, index) => {
      const data = servicosData[index];
      if (!data) return;
      card.dataset.titulo = data.titulo;
      card.dataset.imagem = data.imagem;
      card.dataset.descricao = data.descricao;
      card.dataset.detalhe = data.detalhe;
    });

    let modal = document.getElementById('servicoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'servico-modal';
      modal.id = 'servicoModal';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="servico-modal-overlay" data-close-modal></div>
        <div class="servico-modal-box" role="dialog" aria-modal="true">
          <button class="servico-modal-close" type="button" aria-label="Fechar" data-close-modal>×</button>
          <div class="servico-modal-media">
            <img id="servicoModalImagem" src="" alt="">
          </div>
          <div class="servico-modal-content">
            <h3 id="servicoModalTitulo"></h3>
            <p id="servicoModalDescricao"></p>
            <div id="servicoModalDetalhe"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const modalImagem = modal.querySelector('#servicoModalImagem');
    const modalTitulo = modal.querySelector('#servicoModalTitulo');
    const modalDescricao = modal.querySelector('#servicoModalDescricao');
    const modalDetalhe = modal.querySelector('#servicoModalDetalhe');
    const closeTriggers = modal.querySelectorAll('[data-close-modal]');

    function openServicoModal(card) {
      modalTitulo.textContent = card.dataset.titulo || '';
      modalDescricao.textContent = card.dataset.descricao || '';
      modalDetalhe.innerHTML = (card.dataset.detalhe || '').split('\n\n').map((p) => `<p>${p}</p>`).join('');
      modalImagem.src = card.dataset.imagem || '';
      modalImagem.alt = card.dataset.titulo || '';

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }

    function closeServicoModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => openServicoModal(card));
    });

    closeTriggers.forEach((item) => {
      item.addEventListener('click', closeServicoModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeServicoModal();
    });
  }

  // FORM SUBMISSION
  const form = document.getElementById('contactForm');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const servicosHidden = document.getElementById('servicosSelecionados');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (servicosHidden) {
        const checked = [...document.querySelectorAll('input[name="servicos"]:checked')];
        servicosHidden.value = checked.map((i) => i.value).join(', ');
      }

      const formData = new FormData(form);
      const originalText = submitBtn ? submitBtn.textContent : 'Agendar Contacto';

      if (submitBtn) {
        submitBtn.textContent = 'A enviar...';
        submitBtn.disabled = true;
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
        if (response.ok) {
          alert('Sucesso! O seu pedido foi enviado.');
          form.reset();
          if (servicosHidden) servicosHidden.value = '';
        } else {
          alert('Erro ao enviar formulário.');
        }
      } catch {
        alert('Ocorreu um erro. Tente novamente.');
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }

  // COLLAB TOGGLES
  document.querySelectorAll('.collab-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.closest('.collab-category');
      category.classList.toggle('is-open');
      button.setAttribute('aria-expanded', category.classList.contains('is-open'));
    });
  });

  // COLECAO CAROUSEL
  document.querySelectorAll('[data-colecao]').forEach((colecao) => {
    const track = colecao.querySelector('.colecao-track');
    const slides = Array.from(track.querySelectorAll('img'));
    const prevBtn = colecao.querySelector('.prev');
    const nextBtn = colecao.querySelector('.next');

    let index = 0;
    let interval;

    function updateSlide() {
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
      index = (index + 1) % slides.length;
      updateSlide();
    }

    function prevSlide() {
      index = (index - 1 + slides.length) % slides.length;
      updateSlide();
    }

    function startAuto() {
      interval = setInterval(nextSlide, 3500);
    }

    function stopAuto() {
      clearInterval(interval);
    }

    nextBtn.addEventListener('click', () => {
      stopAuto();
      nextSlide();
      startAuto();
    });

    prevBtn.addEventListener('click', () => {
      stopAuto();
      prevSlide();
      startAuto();
    });

    colecao.addEventListener('mouseenter', stopAuto);
    colecao.addEventListener('mouseleave', startAuto);

    updateSlide();
    startAuto();
  });
});
