/**
 * Google Calendar Booking System
 * Integração de agendamento com Google Calendar no formulário de contacto
 */

class GoogleCalendarBooking {
  constructor() {
    this.currentUser = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.availableSlots = [];
    this.init();
  }

  async init() {
    // Verificar se o utilizador está autenticado
    this.checkAuth();
    this.attachEventListeners();
  }

  async checkAuth() {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        this.currentUser = await response.json();
        this.updateAuthUI();
      }
    } catch (error) {
      console.log('Utilizador não autenticado');
    }
  }

  updateAuthUI() {
    const authBtn = document.getElementById('googleAuthBtn');
    if (authBtn) {
      if (this.currentUser) {
        authBtn.textContent = `✓ Autenticado (${this.currentUser.email})`;
        authBtn.disabled = true;
        authBtn.style.background = '#4CAF50';
      } else {
        authBtn.textContent = 'Autenticar com Google';
        authBtn.onclick = () => window.location.href = '/auth/google';
      }
    }
  }

  attachEventListeners() {
    // Detectar quando o utilizador chega ao passo 6 (calendário)
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('change', (e) => {
        if (e.target.name === 'step' || e.target.type === 'radio') {
          this.handleStepChange(form);
        }
      });
    }

    // Botões de navegação nos cards de serviços
    this.attachServiceCardButtons();
  }

  handleStepChange(form) {
    // Verificar se há um campo oculto de step ou similar
    const currentStep = this.getCurrentFormStep(form);
    if (currentStep === 6) {
      this.initializeCalendarPicker();
    }
  }

  getCurrentFormStep(form) {
    // Esta função depende da estrutura do seu formulário
    // Adapte conforme necessário
    return 6; // Placeholder
  }

  attachServiceCardButtons() {
    // Adicionar botões "Fale Conosco" nos cards de serviços
    const serviceCards = document.querySelectorAll('.servico-card');
    serviceCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // O modal já abre, mas vamos melhorar a navegação
        const modal = document.getElementById('servicoModal');
        if (modal && modal.classList.contains('is-open')) {
          this.addModalContactButton(modal);
        }
      });
    });
  }

  addModalContactButton(modal) {
    // Verificar se o botão já existe
    if (modal.querySelector('.modal-nav-button')) return;

    const closeBtn = modal.querySelector('.servico-modal-close');
    if (closeBtn) {
      const navBtn = document.createElement('button');
      navBtn.className = 'modal-nav-button';
      navBtn.textContent = '→ Fale Conosco';
      navBtn.onclick = (e) => {
        e.preventDefault();
        closeBtn.click();
        
        // Rolar para a secção de contactos
        setTimeout(() => {
          const contactosSection = document.getElementById('contactos');
          if (contactosSection) {
            const header = contactosSection.querySelector('.accordion-header');
            if (header && !header.classList.contains('active')) {
              header.click();
            }
            contactosSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      };
      
      // Estilo do botão
      navBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 50px;
        background: #d4af37;
        color: #070e18;
        border: none;
        padding: 10px 18px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        z-index: 10;
      `;
      
      navBtn.onmouseover = function() {
        this.style.background = '#e6c65a';
        this.style.transform = 'translateY(-1px)';
      };
      
      navBtn.onmouseout = function() {
        this.style.background = '#d4af37';
        this.style.transform = 'translateY(0)';
      };
      
      closeBtn.parentElement.appendChild(navBtn);
    }
  }

  initializeCalendarPicker() {
    // Criar o picker de calendário para o formulário
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Encontrar ou criar container para o calendário
    let calendarContainer = form.querySelector('.calendar-picker-container');
    if (!calendarContainer) {
      calendarContainer = document.createElement('div');
      calendarContainer.className = 'calendar-picker-container';
      
      // Inserir antes do botão submit
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.parentElement.insertBefore(calendarContainer, submitBtn);
      }
    }

    this.renderCalendarPicker(calendarContainer);
  }

  renderCalendarPicker(container) {
    if (!this.currentUser) {
      container.innerHTML = `
        <div class="calendar-alert">
          <p>⚠️ Para agendar uma reunião, é necessário autenticar-se com a sua conta Google.</p>
          <a href="/auth/google" class="btn-auth-google">Autenticar com Google</a>
        </div>
      `;
      return;
    }

    const today = moment().tz('Europe/Lisbon');
    const maxDate = today.clone().add(30, 'days');

    container.innerHTML = `
      <div class="calendar-picker">
        <h4>📅 Escolha a Data e Hora para a Reunião</h4>
        
        <div class="calendar-controls">
          <input 
            type="date" 
            id="meetingDate" 
            class="meeting-date-input"
            min="${today.format('YYYY-MM-DD')}"
            max="${maxDate.format('YYYY-MM-DD')}"
            style="padding: 10px; border: 1px solid #d4af37; border-radius: 6px; width: 100%;"
          />
        </div>

        <div class="time-slots-container" style="display: none; margin-top: 20px;">
          <h5>Horários Disponíveis</h5>
          <div class="time-slots-grid" id="timeSlotsGrid"></div>
        </div>

        <div id="selectedSlot" style="margin-top: 15px; padding: 12px; background: rgba(212, 175, 55, 0.1); border-radius: 6px; display: none;">
          <p id="selectedSlotText"></p>
        </div>

        <input type="hidden" id="meetingDateTime" name="meetingDateTime" />
      </div>
    `;

    this.attachCalendarListeners();
  }

  attachCalendarListeners() {
    const dateInput = document.getElementById('meetingDate');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.loadAvailableSlots(e.target.value);
      });
    }
  }

  async loadAvailableSlots(dateString) {
    try {
      if (!this.currentUser) {
        alert('Por favor, autentique-se com Google primeiro.');
        return;
      }

      const response = await fetch('/api/calendar/available-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateString,
          accessToken: this.currentUser.accessToken
        })
      });

      if (!response.ok) throw new Error('Erro ao carregar horários');

      const data = await response.json();
      this.availableSlots = data.availableSlots;
      this.renderTimeSlots();

    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      alert('Erro ao carregar horários disponíveis. Tente novamente.');
    }
  }

  renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    const container = document.querySelector('.time-slots-container');
    
    if (!grid) return;

    if (this.availableSlots.length === 0) {
      grid.innerHTML = '<p style="color: #aeb6c0; grid-column: 1/-1;">Nenhum horário disponível nesta data.</p>';
      container.style.display = 'block';
      return;
    }

    grid.innerHTML = this.availableSlots.map(slot => `
      <button 
        type="button" 
        class="time-slot-btn" 
        data-start="${slot.startDateTime}"
        data-end="${slot.endDateTime}"
        style="
          padding: 12px 16px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.5);
          color: #ffffff;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 600;
        "
        onmouseover="this.style.background='rgba(212, 175, 55, 0.25)'; this.style.borderColor='#d4af37';"
        onmouseout="this.style.background='rgba(212, 175, 55, 0.12)'; this.style.borderColor='rgba(212, 175, 55, 0.5)';"
      >
        ${slot.startTime}
      </button>
    `).join('');

    container.style.display = 'block';

    // Adicionar event listeners aos botões de horário
    grid.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectTimeSlot(btn.dataset.start, btn.dataset.end, btn.textContent);
      });
    });
  }

  selectTimeSlot(startDateTime, endDateTime, timeText) {
    this.selectedTime = { startDateTime, endDateTime };
    
    // Atualizar UI
    const selectedDiv = document.getElementById('selectedSlot');
    const selectedText = document.getElementById('selectedSlotText');
    const dateInput = document.getElementById('meetingDate');
    const datetimeInput = document.getElementById('meetingDateTime');

    const dateFormatted = moment(startDateTime).format('DD/MM/YYYY');
    selectedText.textContent = `✓ Reunião agendada para ${dateFormatted} às ${timeText}`;
    selectedDiv.style.display = 'block';
    datetimeInput.value = startDateTime;

    // Destacar botão selecionado
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.style.background = 'rgba(212, 175, 55, 0.12)';
      btn.style.borderColor = 'rgba(212, 175, 55, 0.5)';
    });

    event.target.style.background = 'rgba(76, 175, 80, 0.3)';
    event.target.style.borderColor = '#4CAF50';
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new GoogleCalendarBooking();
});

/**
 * Função auxiliar para rolar até a secção de contactos a partir dos cards de serviços
 */
function navigateToContactForm() {
  const contactosSection = document.getElementById('contactos');
  if (contactosSection) {
    const header = contactosSection.querySelector('.accordion-header');
    if (header && !header.classList.contains('active')) {
      header.click();
    }
    setTimeout(() => {
      contactosSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
