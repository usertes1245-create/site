let currentVerificationCode = '';
let currentTab = 0;
let startY = 0;
let currentY = 0;
let initialY = 0;
let isQRMenuOpen = false;

function toggleMenu() {
  const menu = document.getElementById('dropdownMenu');
  menu.classList.toggle('show');
}

// Закрыть меню при клике вне его
window.addEventListener('click', function(e) {
  const menu = document.getElementById('dropdownMenu');
  const menuBtn = document.querySelector('.menu-btn');
  if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.classList.remove('show');
  }
});

// Функции для управления слайд-меню QR-кода
function showSlideQR() {
  if (isQRMenuOpen) return;
  
  currentVerificationCode = generateVerificationCode();
  const fullname = document.getElementById('fullnameField').value;
  const iin = document.getElementById('iinField').value;
  const passport = document.getElementById('passportField').value;
  const qrText = `Удостоверение личности\nКод проверки: ${currentVerificationCode}\nФИО: ${fullname || 'не указано'}\nИИН: ${iin || 'не указан'}\nНомер документа: ${passport || 'не указан'}\nСгенерировано: ${formatDate()}`;
  
  document.getElementById("slideCodeNumber").textContent = currentVerificationCode;
  
  const qrContainer = document.getElementById("slideQrcode");
  qrContainer.innerHTML = '';
  
  // Используем библиотеку для генерации правильного QR-кода
  QRCode.toCanvas(qrText, { 
    width: 180,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  }, function (err, canvas) {
    if (err) console.error(err);
    qrContainer.appendChild(canvas);
  });
  
  const menu = document.getElementById('qrSlideMenu');
  const overlay = document.getElementById('qrOverlay');
  
  // Сброс позиции перед открытием
  menu.style.transform = '';
  
  menu.classList.add('show');
  overlay.classList.add('show');
  isQRMenuOpen = true;
  
  // Добавляем обработчики для overlay чтобы предотвратить скролл
  overlay.addEventListener('touchmove', preventDefault, { passive: false });
}

function hideSlideQR() {
  if (!isQRMenuOpen) return;
  
  const menu = document.getElementById('qrSlideMenu');
  const overlay = document.getElementById('qrOverlay');

  // Плавное закрытие вниз
  menu.style.transition = 'transform 0.3s ease';
  menu.style.transform = 'translateY(100%)'; // смещаем вниз

  overlay.classList.remove('show');

  setTimeout(() => {
    menu.classList.remove('show');
    menu.style.transition = '';
    menu.style.transform = ''; // сброс transform
    isQRMenuOpen = false;
  }, 300);

  overlay.removeEventListener('touchmove', preventDefault);
}
function preventDefault(e) {
  e.preventDefault();
}

// Обработчики для свайпа QR-меню
document.getElementById('qrSlideMenu').addEventListener('touchstart', function(e) {
  startY = e.touches[0].clientY;
  initialY = parseInt(getComputedStyle(this).transform.split(',')[5] || 0);
}, { passive: true });

document.getElementById('qrSlideMenu').addEventListener('touchmove', function(e) {
  if (!isQRMenuOpen) return;
  
  currentY = e.touches[0].clientY;
  const diff = currentY - startY;
  
  // Если свайп вниз, перемещаем меню
  if (diff > 0) {
    this.style.transform = `translateY(${initialY + diff}px)`;
    e.preventDefault();
  }
}, { passive: false });

document.getElementById('qrSlideMenu').addEventListener('touchend', function(e) {
  if (!isQRMenuOpen) return;
  
  const diff = currentY - startY;
  
  // Если свайп достаточно большой, закрываем меню
  if (diff > 10) {
    hideSlideQR();
  } else {
    // Иначе возвращаем на место
    this.style.transform = '';
  }
}, { passive: true });

// Обработчики для drag-handle QR-меню
document.getElementById('qrDragHandle').addEventListener('touchstart', function(e) {
  startY = e.touches[0].clientY;
  initialY = parseInt(getComputedStyle(document.getElementById('qrSlideMenu')).transform.split(',')[5] || 0);
  e.stopPropagation();
}, { passive: true });

document.getElementById('qrDragHandle').addEventListener('touchmove', function(e) {
  if (!isQRMenuOpen) return;
  
  currentY = e.touches[0].clientY;
  const diff = currentY - startY;
  const menu = document.getElementById('qrSlideMenu');
  
  // Если тянем вниз, перемещаем меню
  if (diff > 0) {
    menu.style.transform = `translateY(${initialY + diff}px)`;
    e.preventDefault();
  }
  e.stopPropagation();
}, { passive: false });

document.getElementById('qrDragHandle').addEventListener('touchend', function(e) {
  if (!isQRMenuOpen) return;
  
  const diff = currentY - startY;
  
  // Если движение вниз достаточно большое, закрываем меню
  if (diff > 100) {
    hideSlideQR();
  } else {
    // Иначе возвращаем на место
    document.getElementById('qrSlideMenu').style.transform = '';
  }
  e.stopPropagation();
}, { passive: true });

// Обработчик для контента внутри меню - разрешаем скролл
document.querySelector('.qr-slide-content').addEventListener('touchmove', function(e) {
  // Разрешаем скролл контента внутри меню
  if (this.scrollHeight > this.clientHeight) {
    e.preventDefault();
    return; // Разрешаем нативное поведение для скролла
  }
  e.preventDefault();
}, { passive: false });

function switchTab(index) {
  currentTab = index;
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.section');
  
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    sections[i].classList.toggle('active', i === index);
  });
  
  // Показываем/скрываем кнопки в зависимости от вкладки
  if (index === 0) {
    document.getElementById('presentBtn').classList.remove('hidden');
    document.getElementById('sendDetailsBtn').classList.remove('hidden');
  } else {
    document.getElementById('presentBtn').classList.add('hidden');
    document.getElementById('sendDetailsBtn').classList.remove('hidden');
  }
}

const imageInput = document.getElementById('imageInput');
const idImage = document.getElementById('idImage');
const savedImage = localStorage.getItem('customIdImage');

if (savedImage) {
  idImage.src = savedImage;
  idImage.style.display = 'block'; 
  imageInput.style.display = "none";
}

imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      idImage.src = e.target.result;
      idImage.style.display = 'block'; 
      imageInput.style.display = "none";
      localStorage.setItem('customIdImage', e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

function resetPhoto() {
  localStorage.removeItem('customIdImage');
  idImage.style.display = 'none';
  idImage.src = '';
  imageInput.style.display = 'block';
  imageInput.value = '';
  alert('Фото документа сброшено!');
  document.getElementById('dropdownMenu').classList.remove('show');
}

const fields = ["fullnameField", "iinField", "dobField", "passportField", "issueField", "expiryField"];

// Загрузка данных из localStorage
fields.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.value = localStorage.getItem(id) || "";
    el.addEventListener("input", () => {
      localStorage.setItem(id, el.value);
    });
  }
});

function copyToClipboard(fieldId) {
  const field = document.getElementById(fieldId);
  field.select();
  document.execCommand('copy');
  
  // Визуальная обратная связь
  const btn = field.nextElementSibling;
  const originalInnerHTML = btn.innerHTML;
  btn.innerHTML = '<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4caf50" stroke="#4caf50" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>';
  
  setTimeout(() => {
    btn.innerHTML = originalInnerHTML;
  }, 2000);
}

function sendDetails() {
  if (navigator.share) {
    navigator.share({
      text: "Посмотри этот сайт!",
      url: "https://youtu.be/dQw4w9WgXcQ?feature=shared"
    });
  } else {
    alert("Реквизиты отправлены!");
  }
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

function formatDate() {
  const now = new Date();
  return now.toLocaleString('ru-RU');
}
window.OneSignal = window.OneSignal || [];

OneSignal.push(function() {
  OneSignal.init({
    appId: "f34e4bdc-a8b8-464f-9ee9-d2925580f598", // вставь сюда свой appId
    notifyButton: { enable: false } // отключаем стандартную кнопку
  });

  // Проверяем, включены ли уведомления
  OneSignal.isPushNotificationsEnabled(function(isEnabled) {
    if (!isEnabled) {
      // Показываем кастомный баннер
      const banner = document.getElementById('notify-banner');
      if (banner) banner.style.display = 'block';
    }
  });
});

// Обработчик кнопки на баннере
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('notify-btn');
  if (btn) {
    btn.addEventListener('click', function() {
      OneSignal.push(function() {
        OneSignal.registerForPushNotifications({ modalPrompt: true });
      });
      const banner = document.getElementById('notify-banner');
      if (banner) banner.style.display = 'none';
    });
  }
});
// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  switchTab(0); // Активируем первую вкладку
});
