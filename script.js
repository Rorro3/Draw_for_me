const primera_parte = document.getElementById('primera_parte');
const segunda_parte = document.getElementById('segunda_parte');
const primer_boton = document.getElementById('primer_boton');
const boton_enviar = document.getElementById('boton_enviar');
const input_nombre = document.getElementById('nombre');
const canvas = document.getElementById("lienzo");
const botonGoma = document.getElementById('boton_goma');
const botonLimpiar = document.getElementById('boton_limpiar');
const colorPicker = document.getElementById('colorPicker');
const ctx = canvas.getContext("2d");
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOdghpszVZXACT2UiMy7SvJnfwpxtQAY73hzx5rsujhKV7lnqkYRZygiZEep34_sLr4w/exec'

let dibujando = false;
let historial = [];
let colorActual = '#000000';

// oculta la primera parte
segunda_parte.style.display = 'none';

// muestra la segunda parte
primer_boton.addEventListener('click', () => {
  primera_parte.style.display = 'none';
  segunda_parte.style.display = 'flex';
});

// evento dibujar cuando tenes el mouse clickeando
canvas.addEventListener("mousedown", (e) => {
  dibujando = true;
  // guarda estado actual para poder deshacer
  historial.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

// evento parar cuando soltas
canvas.addEventListener("mouseup", () => {
  dibujando = false;
  ctx.beginPath();
});

// evento cuando moves mouse
canvas.addEventListener("mousemove", (e) => {
  if (!dibujando) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineWidth = colorActual === '#FFFFFF' ? 20 : 2; // si pongo la goma 
  ctx.lineCap = "round";
  ctx.strokeStyle = colorActual;

  ctx.lineTo(x, y);
  ctx.stroke();
});

// ctrl z
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    if (historial.length > 0) {
      const imagenAnterior = historial.pop();
      ctx.putImageData(imagenAnterior, 0, 0);
    }
  }
});

//selector color
colorPicker.addEventListener('input', (e) => {
  colorActual = e.target.value;
});

// goma
botonGoma.addEventListener('click', () => {
  colorActual = '#FFFFFF';
});

// lipoar
botonLimpiar.addEventListener('click', () => {
  // guardo antes
  historial.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

  // chau
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// envia dibujo y nomre a tg TODO HECHO POR GEMINI SOY UNA FARSA Y UNA DECEPCION PARA LA SOCIEDAD
boton_enviar.addEventListener('click', (e) => {
  e.preventDefault();

  if (input_nombre.value.trim() === '') {
    alert('Escribí tu nombre o apodo antes de enviar.');
    input_nombre.focus();
    return;
  }

  const nombre = input_nombre.value.trim();

  // esto lo habia hecho antes para guardar el dibujo en base64
  const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

  boton_enviar.disabled = true;
  boton_enviar.textContent = 'Enviando...';

  // envia como JSON
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      dibujo: base64Data,
      nombre: nombre
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        alert(`Gracias, ${nombre}! Tu dibujo fue enviado a Telegram.`);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        input_nombre.value = '';
        primera_parte.style.display = 'flex';
        segunda_parte.style.display = 'none';
        historial = [];
      } else {
        console.error('Error desde el servidor:', data);
        alert('Hubo un error en el servidor de Apps Script.');
      }
    })
    .catch(err => {
      console.error('Error de conexión:', err);
      alert('Error de conexión al enviar el dibujo.');
    })
    .finally(() => {
      boton_enviar.disabled = false;
      boton_enviar.textContent = 'Enviar';
    });
});