import { createOptions } from "./createOptions.js";

const optionsWrapper = document.getElementById("options-wrapper");
const body = document.body;
const eye = document.getElementById("eyeSvg");

// Clase para el efecto scramble text
class ScrambleText {
    constructor(element) {
        this.element = element;
        this.originalText = element.dataset.text || element.textContent;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        this.interval = null;
        this.isScrambling = false;
        
        this.init();
    }
    
    init() {
        this.element.addEventListener('mouseenter', () => this.startScramble());
        this.element.addEventListener('mouseleave', () => this.stopScramble());
    }
    
    startScramble() {
        if (this.isScrambling) return;
        this.isScrambling = true;
        
        let iterations = 0;
        const maxIterations = 20;
        
        this.interval = setInterval(() => {
            this.element.textContent = this.originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return this.originalText[index];
                    }
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');
            
            if (iterations >= this.originalText.length) {
                clearInterval(this.interval);
                this.isScrambling = false;
            }
            
            iterations += 1 / 2;
        }, 30);
    }
    
    stopScramble() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.element.textContent = this.originalText;
        this.isScrambling = false;
    }
}

// Función para aplicar scramble text a elementos existentes
function applyScrambleText() {
    const scrambleElements = document.querySelectorAll('.option-label');
    scrambleElements.forEach(element => {
        // Solo aplicar si no tiene ya el efecto
        if (!element.scrambleTextApplied) {
            new ScrambleText(element);
            element.scrambleTextApplied = true;
        }
    });
}

// Función para forzar transparencia en todo
function forceAllTransparency() {
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
  document.body.style.backgroundColor = 'transparent';
  
  // Forzar en todos los elementos excepto option-container
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (!el.classList.contains('option-container')) {
      el.style.background = 'transparent';
      el.style.backgroundColor = 'transparent';
    }
  });
}

window.addEventListener("message", (event) => {
  optionsWrapper.innerHTML = "";
  
  // Forzar transparencia en cada evento
  forceAllTransparency();

  switch (event.data.event) {
    case "visible": {
      body.style.visibility = event.data.state ? "visible" : "hidden";
      body.style.background = "transparent";
      return eye.classList.remove("eye-hover");
    }

    case "leftTarget": {
      return eye.classList.remove("eye-hover");
    }

    case "setTarget": {
      eye.classList.add("eye-hover");
      body.style.background = "transparent";

      if (event.data.options) {
        for (const type in event.data.options) {
          event.data.options[type].forEach((data, id) => {
            createOptions(type, data, id + 1);
          });
        }
      }

      if (event.data.zones) {
        for (let i = 0; i < event.data.zones.length; i++) {
          event.data.zones[i].forEach((data, id) => {
            createOptions("zones", data, id + 1, i + 1);
          });
        }
      }
      
      // Aplicar scramble text después de crear las opciones
      setTimeout(() => {
        applyScrambleText();
      }, 100);
    }
  }
});
