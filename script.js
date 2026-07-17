// Inicializa scripts al cargar el DOM.
document.addEventListener("DOMContentLoaded", () => {
  // Selecciona secciones y enlaces de navegación.
  const sections = document.querySelectorAll("section, header");
  const navLinks = document.querySelectorAll(".nav-links a");

  // Detecta scroll para actualizar menú activo.
  window.addEventListener("scroll", () => {
    let current = "";

    // Encuentra la sección visible actual.
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    // Resalta el enlace del menú correspondiente.
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (current && link.getAttribute("href").includes(current)) {
        link.classList.add("active");
      }
    });

    // Añade sombra al navbar al bajar.
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
    } else {
      navbar.style.boxShadow = "none";
    }
  });

  // Diccionario de traducción de consultas de búsqueda (Español -> Inglés)
  const esToEnDictionary = {
    "manzana": "apple",
    "fresa": "strawberry",
    "chocolate": "chocolate",
    "platano": "banana",
    "banano": "banana",
    "limon": "lemon",
    "naranja": "orange",
    "tarta": "tart",
    "pastel": "cake",
    "torta": "cake",
    "bizcocho": "cake",
    "dona": "donut",
    "donas": "donut",
    "postre": "dessert",
    "galleta": "cookie",
    "galletas": "cookie",
    "queso": "cheese",
    "crema": "cream",
    "fruta": "fruit",
    "frutos rojos": "berry",
    "mora": "blackberry",
    "frambuesa": "raspberry",
    "arándano": "blueberry",
    "zanahoria": "carrot"
  };

  async function translateToEnglish(text) {
    const clean = text.toLowerCase().trim();
    if (!clean) return "";
    if (esToEnDictionary[clean]) return esToEnDictionary[clean];
    for (const key in esToEnDictionary) {
      if (clean.includes(key)) {
        return esToEnDictionary[key];
      }
    }
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=es|en`);
      if (res.ok) {
        const data = await res.json();
        if (data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText.toLowerCase().trim();
        }
      }
    } catch (e) {
      console.warn("Error translating to English:", e);
    }
    return clean;
  }

  async function translateToSpanish(text) {
    const clean = text.trim();
    if (!clean) return "";
    const localDict = {
      "Apfelstrudel": "Apfelstrudel (Estrudel de Manzana)",
      "Apple & Blackberry Crumble": "Crumble de Manzana y Mora",
      "Apple Frangipan Tart": "Tarta de Frangipane de Manzana",
      "Bakewell Tart": "Tarta Bakewell",
      "Banana Split": "Banana Split",
      "Battenberg Cake": "Pastel Battenberg",
      "BeaverTails": "Colas de Castor (BeaverTails)",
      "Blackberry Fool": "Fool de Zarzamora",
      "Bread and Butter Pudding": "Pudín de Pan y Mantequilla",
      "Budino di Ricotta": "Budín de Ricotta",
      "Canadian Butter Tarts": "Tartas de Mantequilla Canadienses",
      "Carrot Cake": "Pastel de Zanahoria",
      "Chelsea Buns": "Bollos de Chelsea",
      "Chinon Apple Tart": "Tarta de Manzana de Chinon",
      "Choc Chip Pecan Pie": "Tarta de Pecanas y Chispas de Chocolate",
      "Chocolate Avocado Mousse": "Mousse de Chocolate y Aguacate",
      "Chocolate Gateau": "Gâteau de Chocolate",
      "Chocolate Raspberry Brownies": "Brownie de Chocolate y Frambuesa",
      "Madeira Cake": "Bizcocho Clásico (Madeira Cake)",
      "Dutch doughnuts": "Mini Donas Holandesas",
      "Sticky Toffee Pudding": "Pudín de Caramelo Pegajoso",
      "Treacle Tart": "Tarta de Melaza",
      "Christmas Pudding": "Pudín de Navidad",
      "Key Lime Pie": "Tarta de Lima Key",
      "Peach Cobbler": "Cobbler de Melocotón",
      "Pumpkin Pie": "Tarta de Calabaza",
      "Jam Roly-Poly": "Rollo de Mermelada",
      "Summer Pudding": "Pudín de Verano",
      "Apple Pie": "Tarta de Manzana",
      "Tart": "Tarta",
      "Cake": "Pastel / Torta",
      "Pudding": "Pudín",
      "Doughnuts": "Donas",
      "Mousse": "Mousse",
      "Brownies": "Brownies"
    };
    if (localDict[clean]) return localDict[clean];
    for (const key in localDict) {
      if (clean.includes(key) && key.length > 4) {
        return clean.replace(key, localDict[key]);
      }
    }
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|es`);
      if (res.ok) {
        const data = await res.json();
        if (data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText;
        }
      }
    } catch (e) {
      console.warn("Error translating to Spanish:", e);
    }
    return clean;
  }

  function sortRecipesDOM() {
    const mainGrid = document.querySelector(".recipes-grid");
    if (!mainGrid) return;
    const cards = Array.from(mainGrid.children);
    cards.sort((a, b) => {
      const getOrder = (el) => {
        if (el.classList.contains("local-recipe-card")) return 1;
        if (el.classList.contains("custom-recipe-card")) return 2;
        if (el.classList.contains("themealdb-recipe-card")) return 3;
        return 4;
      };
      return getOrder(a) - getOrder(b);
    });
    cards.forEach(card => mainGrid.appendChild(card));
  }

  // Elementos para la lógica de modales.
  const recipeCards = document.querySelectorAll(".recipe-card");
  const modals = document.querySelectorAll(".modal");

  // Guarda el modal actualmente abierto.
  let currentOpenModal = null;

  // Abre el modal según su ID, es decir, la receta que se seleccione.
  function openModal(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (!modal) return;

    currentOpenModal = modal;
    modal.style.display = "flex";

    // Pequeño retraso para animar el modal.
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);

    // Bloquea scroll del fondo al abrir.
    document.body.style.overflow = "hidden";
  }

  // Cierra el modal que esté abierto.
  function closeModal() {
    if (!currentOpenModal) return;

    currentOpenModal.classList.remove("show");

    const modalToClose = currentOpenModal;

    // Espera la animación para ocultarlo totalmente.
    setTimeout(() => {
      modalToClose.style.display = "none";
    }, 300);

    currentOpenModal = null;

    // Reactiva scroll del fondo al cerrar.
    document.body.style.overflow = "auto";
  }

  // Abre modal al clickear una receta.
  recipeCards.forEach((card) => {
    card.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      openModal(id);
    });
  });

  // Cierra modal al clickear el botón de cierre (X).
  const closeButtons = document.querySelectorAll(".modal-close");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  // Cierra modal al clickear el fondo.
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal();
    }
  });

  // Cierra modal al presionar tecla Escape.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentOpenModal) {
      closeModal();
    }
  });

  // Lógica del Buscador / Filtro de Recetas
  let searchTimeout = null;
  const recipeSearch = document.getElementById("recipe-search");
  if (recipeSearch) {
    recipeSearch.addEventListener("input", function () {
      const query = this.value.toLowerCase().trim();

      // 1. Filtrar localmente todas las tarjetas actuales
      const allCards = document.querySelectorAll(".recipes-grid .recipe-card");
      allCards.forEach((card) => {
        // Ignorar los resultados temporales de búsqueda de TheMealDB
        if (card.classList.contains("themeald-search-result")) return;

        const h3 = card.querySelector("h3");
        const title = h3 ? h3.textContent.toLowerCase() : "";
        
        // Buscar en el título, descripción o ingredientes (data-ingredients)
        const ingredients = card.getAttribute("data-ingredients") ? card.getAttribute("data-ingredients").toLowerCase() : "";
        const descP = card.querySelector(".recipe-info p") ? card.querySelector(".recipe-info p").textContent.toLowerCase() : "";

        if (title.includes(query) || ingredients.includes(query) || descP.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });

      // Ordenar las recetas locales y de Supabase
      sortRecipesDOM();

      // 2. Buscar dinámicamente en TheMealDB API (con debounce)
      clearTimeout(searchTimeout);
      
      // Eliminar resultados de búsqueda previos de TheMealDB
      const oldSearchResults = document.querySelectorAll(".themeald-search-result");
      oldSearchResults.forEach(card => card.remove());

      if (query.length < 3) {
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          // Traducir consulta de español a inglés para TheMealDB
          const englishQuery = await translateToEnglish(query);

          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${englishQuery}`);
          if (!response.ok) return;
          const data = await response.json();
          if (!data.meals) return;

          const mainGrid = document.querySelector(".recipes-grid");
          if (!mainGrid) return;

          // Añadir las recetas encontradas en TheMealDB a la rejilla principal
          for (const meal of data.meals) {
            // Evitar duplicar si por casualidad ya está en las estáticas de la página
            if (meal.idMeal === "52860" || meal.idMeal === "52900" || meal.idMeal === "53393") continue;

            const card = document.createElement("div");
            card.className = "recipe-card themealdb-recipe-card themeald-search-result";
            card.setAttribute("data-id", meal.idMeal);

            const initialTitle = translateMealTitle(meal.strMeal);

            card.innerHTML = `
              <div class="recipe-image" style="background-image: url('${meal.strMealThumb}');"></div>
              <div class="recipe-info">
                <h3 class="recipe-title-text">${initialTitle}</h3>
                <p style="margin-top: 0.5rem; opacity: 0.85;">
                  <i class="fa-solid fa-globe"></i> Encontrado en TheMealDB
                </p>
                <span style="display: inline-block; margin-top: 1rem; font-weight: bold; text-decoration: underline; font-size: 1.4rem; cursor: pointer;">Ver receta</span>
              </div>
            `;

            // Evento para abrir el modal dinámico de TheMealDB
            card.addEventListener("click", () => {
              openTheMealDBModal(meal.idMeal);
            });

            mainGrid.appendChild(card);

            // Traducir dinámicamente si no estaba en el diccionario local
            if (initialTitle === meal.strMeal) {
              translateToSpanish(meal.strMeal).then(translated => {
                const titleEl = card.querySelector(".recipe-title-text");
                if (titleEl) titleEl.textContent = translated;
              });
            }
          }

          // Ordenar físicamente la rejilla para posicionar las de TheMealDB al final
          sortRecipesDOM();

        } catch (err) {
          console.error("Error al buscar en TheMealDB:", err);
        }
      }, 400); // 400ms de retraso
    });
  }

  // Lógica del Conversor de Unidades.
  const recipeSelect = document.getElementById("recipe-select");
  const unitSelect = document.getElementById("unit-select");
  const portionSelect = document.getElementById("portion-select");
  const converterLoading = document.getElementById("converter-loading");
  const converterContent = document.getElementById("converter-content");
  const recipeApiImg = document.getElementById("recipe-api-img");
  const recipeApiTitle = document.getElementById("recipe-api-title");
  const convertedIngredientsList = document.getElementById("converted-ingredients-list");

  // Diccionario de traducción de ingredientes al español
  const translateIngredient = (ing) => {
    const key = ing.toLowerCase().trim();
    const dictionary = {
      "dark chocolate": "Chocolate negro",
      "milk chocolate": "Chocolate con leche",
      "salted butter": "Mantequilla con sal",
      "light brown soft sugar": "Azúcar moreno suave",
      "eggs": "Huevos",
      "plain flour": "Harina común",
      "cocoa": "Cacao en polvo",
      "raspberries": "Frambuesas",
      "butter": "Mantequilla",
      "caster sugar": "Azúcar glass / fina",
      "self-raising flour": "Harina leudante",
      "milk": "Leche",
      "lemon": "Limón",
      "mixed peel": "Cáscaras de cítricos confitadas",
      "flour": "Harina de trigo todo uso",
      "instant yeast": "Levadura instantánea",
      "salt": "Sal",
      "sugar": "Azúcar",
      "yeast": "Levadura",
      "water": "Agua",
      "canola oil": "Aceite de canola",
      "vanilla": "Esencia de vainilla",
      "boiling water": "Agua hirviendo"
    };
    return dictionary[key] || ing;
  };

  // Diccionario de traducción de medidas no numéricas
  const translateMeasure = (measure) => {
    const key = measure.toLowerCase().trim();
    if (key === "to glaze") return "Para glasear";
    if (key.includes("zest of")) {
      const num = parseFloat(key.replace(/[^\d.]/g, "")) || 1;
      return `Ralladura de ${num}`;
    }
    return measure;
  };

  // Cache para almacenar las recetas ya descargadas y evitar peticiones repetidas
  const recipeCache = {};

  // Función asíncrona para obtener datos de la receta desde TheMealDB
  async function loadRecipe(mealId) {
    if (recipeCache[mealId]) {
      return recipeCache[mealId];
    }

    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      if (!response.ok) throw new Error("Error en la respuesta de la red");
      
      const data = await response.json();
      if (!data.meals || data.meals.length === 0) throw new Error("No se encontró la receta");
      
      const meal = data.meals[0];
      
      // Estructuramos la receta extraída
      const parsedRecipe = {
        title: meal.strMeal,
        img: meal.strMealThumb,
        ingredients: []
      };

      // Recorremos los ingredientes del 1 al 20
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== "") {
          parsedRecipe.ingredients.push({
            name: ingredient.trim(),
            rawMeasure: measure ? measure.trim() : ""
          });
        }
      }

      // Guardamos en cache
      recipeCache[mealId] = parsedRecipe;
      return parsedRecipe;
    } catch (error) {
      console.error("Error al cargar la receta desde la API:", error);
      return null;
    }
  }

  // Analiza la cantidad y unidad de una medida
  function parseMeasure(rawMeasure) {
    if (!rawMeasure) return { value: 0, unit: "unidad", isText: true, text: "" };

    const cleanMeasure = rawMeasure.toLowerCase().trim();
    
    // Casos especiales de texto no convertible
    if (cleanMeasure === "to glaze") {
      return { value: null, unit: "text", isText: true, text: "Para glasear" };
    }
    if (cleanMeasure.includes("zest of")) {
      const num = parseFloat(cleanMeasure.replace(/[^\d.]/g, "")) || 1;
      return { value: num, unit: "text", isText: true, text: `Ralladura de ${num}` };
    }

    // Intentamos extraer fracciones (ej. 1/2, 1/4)
    let value = 0;
    const fractionRegex = /(\d+)\s+(\d+)\/(\d+)/; // Ej: "1 1/2"
    const simpleFractionRegex = /(\d+)\/(\d+)/; // Ej: "1/2"
    const decimalRegex = /(\d+\.\d+)|(\d+)/; // Ej: "1.5" o "200"

    let match;
    if ((match = cleanMeasure.match(fractionRegex))) {
      value = parseInt(match[1]) + (parseInt(match[2]) / parseInt(match[3]));
    } else if ((match = cleanMeasure.match(simpleFractionRegex))) {
      value = parseInt(match[1]) / parseInt(match[2]);
    } else if ((match = cleanMeasure.match(decimalRegex))) {
      value = parseFloat(match[0]);
    } else {
      // Si no hay números detectados, tratar como texto
      return { value: null, unit: "text", isText: true, text: rawMeasure };
    }

    // Determinar la unidad
    let unit = "unidad";
    if (cleanMeasure.includes("g") && !cleanMeasure.includes("glass") && !cleanMeasure.includes("glaze")) {
      unit = "g";
    } else if (cleanMeasure.includes("ml")) {
      unit = "ml";
    } else if (cleanMeasure.includes("tbsp") || cleanMeasure.includes("tbs") || cleanMeasure.includes("tbls") || cleanMeasure.includes("tablespoon")) {
      unit = "cda";
    } else if (cleanMeasure.includes("tsp") || cleanMeasure.includes("teaspoon")) {
      unit = "cdta";
    } else if (cleanMeasure.includes("cup")) {
      unit = "taza";
    } else if (cleanMeasure.includes("ounce") || cleanMeasure.includes("oz")) {
      unit = "oz";
    }

    return { value, unit, isText: false };
  }

  // Formatea fracciones culinarias amigables
  function formatValue(val) {
    if (val === null || val === undefined || isNaN(val)) return "";
    
    // Redondear a 3 decimales para evitar problemas de coma flotante
    const rounded = Math.round(val * 1000) / 1000;
    const integerPart = Math.floor(rounded);
    const decimalPart = rounded - integerPart;

    let fractionStr = "";
    if (Math.abs(decimalPart - 0.25) < 0.05) fractionStr = "1/4";
    else if (Math.abs(decimalPart - 0.5) < 0.05) fractionStr = "1/2";
    else if (Math.abs(decimalPart - 0.75) < 0.05) fractionStr = "3/4";
    else if (Math.abs(decimalPart - 0.33) < 0.05) fractionStr = "1/3";
    else if (Math.abs(decimalPart - 0.67) < 0.05) fractionStr = "2/3";
    else if (Math.abs(decimalPart - 0.125) < 0.02) fractionStr = "1/8";

    if (fractionStr !== "") {
      return integerPart > 0 ? `${integerPart} ${fractionStr}` : fractionStr;
    }

    // Si es entero, devolver entero, si no, limitar a 2 decimales
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
  }

  // Realiza los cálculos de conversión y actualiza el DOM
  function updateConverter(recipeData) {
    if (!recipeData) return;

    // Actualiza datos de cabecera de la tarjeta
    recipeApiImg.src = recipeData.img;
    recipeApiImg.alt = recipeData.title;
    
    // Traducir títulos para la calculadora
    let titleEs = recipeData.title;
    if (recipeData.title.includes("Chocolate Raspberry Brownies")) titleEs = "Brownie de Chocolate y Frambuesa";
    if (recipeData.title.includes("Madeira Cake")) titleEs = "Bizcocho Clásico (Madeira Cake)";
    if (recipeData.title.includes("Dutch doughnuts")) titleEs = "Mini Donas Holandesas";
    recipeApiTitle.textContent = titleEs;

    const unitSystem = unitSelect.value;
    const multiplier = parseFloat(portionSelect.value) || 1;

    // Limpia la lista anterior
    convertedIngredientsList.innerHTML = "";

    recipeData.ingredients.forEach(ing => {
      const parsed = parseMeasure(ing.rawMeasure);
      const ingNameEs = translateIngredient(ing.name);
      
      let displayQuantity = "";
      
      if (parsed.isText) {
        // Para textos especiales como "Ralladura de 1", escalamos la cantidad si corresponde
        if (parsed.text.includes("Ralladura de")) {
          const num = parseFloat(parsed.text.replace(/[^\d.]/g, "")) || 1;
          displayQuantity = `Ralladura de ${formatValue(num * multiplier)} limón/naranja`;
        } else {
          displayQuantity = translateMeasure(parsed.text);
        }
      } else {
        const scaledValue = parsed.value * multiplier;

        if (unitSystem === "metric") {
          // Mostrar en gramos o ml
          if (parsed.unit === "g") {
            displayQuantity = `${Math.round(scaledValue)} g`;
          } else if (parsed.unit === "ml") {
            displayQuantity = `${Math.round(scaledValue)} ml`;
          } else if (parsed.unit === "cda") {
            displayQuantity = `${formatValue(scaledValue)} cda`;
          } else if (parsed.unit === "cdta") {
            displayQuantity = `${formatValue(scaledValue)} cdta`;
          } else if (parsed.unit === "taza") {
            displayQuantity = `${formatValue(scaledValue)} tazas`;
          } else if (parsed.unit === "oz") {
            displayQuantity = `${formatValue(scaledValue)} oz`;
          } else {
            displayQuantity = `${formatValue(scaledValue)}`;
          }
        } 
        else if (unitSystem === "cups") {
          // Convertir de g/ml a tazas o cucharadas según equivalencias del sitio
          if (parsed.unit === "g") {
            if (scaledValue >= 100) {
              displayQuantity = `${formatValue(scaledValue / 200)} taza${scaledValue / 200 !== 1 ? 's' : ''}`;
            } else if (scaledValue >= 15) {
              displayQuantity = `${formatValue(scaledValue / 15)} cda`;
            } else {
              displayQuantity = `${formatValue(scaledValue / 5)} cdta`;
            }
          } else if (parsed.unit === "ml") {
            if (scaledValue >= 120) {
              displayQuantity = `${formatValue(scaledValue / 240)} taza${scaledValue / 240 !== 1 ? 's' : ''}`;
            } else if (scaledValue >= 15) {
              displayQuantity = `${formatValue(scaledValue / 15)} cda`;
            } else {
              displayQuantity = `${formatValue(scaledValue / 5)} cdta`;
            }
          } else if (parsed.unit === "cda" || parsed.unit === "cdta" || parsed.unit === "taza") {
            const unitName = parsed.unit === "taza" ? "taza" : parsed.unit;
            displayQuantity = `${formatValue(scaledValue)} ${unitName}${scaledValue !== 1 && unitName === 'taza' ? 's' : ''}`;
          } else {
            displayQuantity = `${formatValue(scaledValue)}`;
          }
        } 
        else if (unitSystem === "ounces") {
          // Convertir a onzas (oz o fl oz)
          if (parsed.unit === "g") {
            displayQuantity = `${formatValue(scaledValue * 0.0353)} oz`;
          } else if (parsed.unit === "ml") {
            displayQuantity = `${formatValue(scaledValue * 0.0338)} fl oz`;
          } else if (parsed.unit === "cda") {
            displayQuantity = `${formatValue(scaledValue * 0.5)} fl oz`;
          } else if (parsed.unit === "cdta") {
            displayQuantity = `${formatValue(scaledValue * 0.167)} fl oz`;
          } else if (parsed.unit === "taza") {
            displayQuantity = `${formatValue(scaledValue * 8.12)} fl oz`;
          } else if (parsed.unit === "oz") {
            displayQuantity = `${formatValue(scaledValue)} oz`;
          } else {
            displayQuantity = `${formatValue(scaledValue)}`;
          }
        }
      }

      // Creamos el elemento li y lo insertamos
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="ing-name">${ingNameEs}</span>
        <span class="ing-quantity">${displayQuantity}</span>
      `;
      convertedIngredientsList.appendChild(li);
    });
  }

  // Carga inicial y controladores de eventos
  async function runConverter() {
    const mealId = recipeSelect.value;
    
    // Mostrar spinner de carga
    converterLoading.style.display = "flex";
    converterContent.style.display = "none";
    
    const recipeData = await loadRecipe(mealId);
    
    if (recipeData) {
      updateConverter(recipeData);
      converterLoading.style.display = "none";
      converterContent.style.display = "block";
    } else {
      converterLoading.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> Hubo un error al cargar la receta desde la API de TheMealDB.";
    }
  }

  recipeSelect.addEventListener("change", runConverter);
  unitSelect.addEventListener("change", () => {
    const mealId = recipeSelect.value;
    if (recipeCache[mealId]) {
      updateConverter(recipeCache[mealId]);
    }
  });
  portionSelect.addEventListener("change", () => {
    const mealId = recipeSelect.value;
    if (recipeCache[mealId]) {
      updateConverter(recipeCache[mealId]);
    }
  });

  // --- Integración con Supabase (PostgreSQL en la Nube) ---
  // Reemplaza estas credenciales con las de tu proyecto en el panel de Supabase
  const SUPABASE_URL = 'https://pwlscfffczfkdzapekto.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bHNjZmZmY3pma2R6YXBla3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjcwMTgsImV4cCI6MjA5OTc0MzAxOH0.We--QMux31kf5ug2yamKHKTsDzQlWyYJOqG-CJB2RLE';

  let supabaseClient = null;
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'TU_SUPABASE_URL') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      }
    });
  }

  // Recetas semilla locales por si falla Supabase o RLS bloquea la siembra
  const seedRecipesLocal = [
    {
      title: "Tarta de Limón y Merengue",
      prep_time: "50",
      temperature: "175",
      ingredients: "1 Base de tarta dulce\n4 Limones (ralladura y jugo)\n150g Azúcar\n4 Yemas de huevo\n50g Mantequilla\n4 Claras de huevo\n200g Azúcar blanca (para el merengue)",
      instructions: "1. Cocinar la base de tarta a blanco.\n2. En una olla, calentar el jugo de limón, la ralladura, el azúcar and las yemas hasta espesar. Añadir mantequilla.\n3. Rellenar la tarta con la crema de limón.\n4. Batir las claras a punto de nieve con el azúcar para el merengue y decorar la tarta.\n5. Hornear a 175°C hasta dorar el merengue.",
      tip: "||https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80||Dejar enfriar en el refrigerador por al menos 3 horas antes de cortar para que el relleno tome consistencia."
    },
    {
      title: "Galletas con Chispas de Chocolate",
      prep_time: "25",
      temperature: "180",
      ingredients: "150g Mantequilla a temp. ambiente\n100g Azúcar morena\n80g Azúcar blanca\n1 Huevo grande\n1 cdta Esencia de vainilla\n225g Harina de trigo\n1/2 cdta Bicarbonato de sodio\n150g Chispas de chocolate negro",
      instructions: "1. Batir la mantequilla con ambos azúcares hasta cremar.\n2. Añadir el huevo y la vainilla, mezclar bien.\n3. Incorporar la harina y el bicarbonato cernidos.\n4. Agregar las chispas de chocolate y mezclar con espátula.\n5. Formar bolitas y colocarlas espaciadas en una bandeja con papel de horno.\n6. Hornear a 180°C por 10-12 minutos.",
      tip: "||https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80||Sácalas cuando los bordes estén dorados pero el centro siga blando. Se endurecerán al enfriarse."
    },
    {
      title: "Flan de Vainilla Casero",
      prep_time: "60",
      temperature: "160",
      ingredients: "5 Huevos grandes\n500ml Leche entera\n150g Azúcar\n1 cdta Esencia de Vainilla\n100g Azúcar (para el caramelo)\n3 cdas Agua (para el caramelo)",
      instructions: "1. En una sartén, derretir el azúcar con el agua hasta obtener un caramelo dorado y bañar la flanera.\n2. Batir ligeramente los huevos con el azúcar y la esencia de vainilla.\n3. Calentar la leche ligeramente e incorporarla lentamente a la mezcla de huevos sin dejar de revolver.\n4. Colar la mezcla y verter en la flanera caramelizada.\n5. Cocinar a baño maría en el horno a 160°C durante 50-60 minutos.",
      tip: "||https://www.themealdb.com/images/media/meals/0s80wo1764374393.jpg||Inserta un cuchillo en el centro; si sale limpio, el flan está listo. Deja enfriar por completo antes de desmoldar."
    },
    {
      title: "Torta de Tres Leches",
      prep_time: "45",
      temperature: "180",
      ingredients: "1 Bizcochuelo de vainilla\n1 lata Leche condensada\n1 lata Leche evaporada\n1 taza Crema de leche\n2 tazas Crema batida (Chantilly) (para decorar)\n1 cdta Canela en polvo",
      instructions: "1. Hornear el bizcochuelo y dejar enfriar.\n2. Licuar la leche condensada, leche evaporada y crema de leche.\n3. Pinchar todo el bizcochuelo con un tenedor y verter la mezcla de tres leches poco a poco hasta que la absorba completamente.\n4. Cubrir con la crema batida Chantilly y espolvorear la canela en polvo.",
      tip: "||https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80||Mantener en refrigeración durante al menos 4 horas antes de servir para obtener la máxima esponjosidad y frescura."
    }
  ];

  // Obtener y listar recetas guardadas en Supabase
  async function loadCustomRecipes() {
    const mainGrid = document.querySelector(".recipes-grid");
    if (!mainGrid) return;

    // Renderizar recetas locales de respaldo inmediatamente para evitar esperas
    renderCustomRecipes(seedRecipesLocal);

    if (!supabaseClient) {
      console.warn("Supabase no ha sido configurado en script.js. Usando recetas locales de respaldo.");
      return;
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase query timed out after 5s")), 5000)
      );
      const queryPromise = supabaseClient
        .from('recipes')
        .select('*')
        .order('id', { ascending: false });

      const { data: recipes, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) throw error;
      
      // Si la base de datos está vacía, intentamos sembrarla en segundo plano
      if (!recipes || recipes.length === 0) {
        try {
          await seedDatabase();
        } catch (seedErr) {
          console.warn("Error al sembrar la base de datos (posiblemente por políticas RLS).");
        }
        return;
      }

      // Si se recuperan recetas de Supabase, reemplazamos las locales con las de la BD
      renderCustomRecipes(recipes);
    } catch (err) {
      console.error("Error al cargar recetas desde Supabase:", err);
      // Las recetas locales ya están renderizadas, así que no hacemos nada
    }
  }

  // Sembrar recetas por defecto en Supabase si la base de datos está vacía (4 Recetas)
  async function seedDatabase() {
    if (!supabaseClient) return;

    try {
      console.log("Sembrando 4 recetas iniciales en Supabase...");
      const { error } = await supabaseClient
        .from('recipes')
        .insert(seedRecipesLocal);

      if (error) throw error;
      
      console.log("Sembrado de base de datos exitoso.");
      
      // Recargar lista después de sembrar
      const { data: recipes } = await supabaseClient
        .from('recipes')
        .select('*')
        .order('id', { ascending: false });
      
      if (recipes) {
        renderCustomRecipes(recipes);
      }
    } catch (err) {
      console.error("Error al sembrar la base de datos:", err);
      throw err; // Rethrow para que loadCustomRecipes maneje la excepción
    }
  }

  // Renderizar las tarjetas de recetas de Supabase en la interfaz (rejilla principal unificada)
  function renderCustomRecipes(recipes) {
    const mainGrid = document.querySelector(".recipes-grid");
    if (!mainGrid) return;

    // 1. Eliminar las tarjetas personalizadas anteriores (para evitar duplicados al recargar)
    const oldCustomCards = mainGrid.querySelectorAll(".custom-recipe-card");
    oldCustomCards.forEach(card => card.remove());

    if (!recipes || recipes.length === 0) return;

    // 2. Crear y añadir las nuevas tarjetas personalizadas
    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "recipe-card custom-recipe-card"; // hereda todos los estilos de .recipe-card
      card.setAttribute("data-id", recipe.id || "");
      card.setAttribute("data-ingredients", recipe.ingredients || "");

      const prepTimeText = recipe.prep_time ? `${recipe.prep_time} min` : "";
      const tempText = recipe.temperature ? `${recipe.temperature}°C` : "";
      const separator = (recipe.prep_time && recipe.temperature) ? " &nbsp;|&nbsp; " : "";

      // Decodificar imagen y tip del campo 'tip'
      let imageUrl = "";
      let actualTip = recipe.tip || "";
      if (recipe.tip && recipe.tip.startsWith("||")) {
        const parts = recipe.tip.split("||");
        if (parts.length >= 3) {
          imageUrl = parts[1];
          actualTip = parts.slice(2).join("||");
        }
      }

      // Habilitar botón de eliminar solo para recetas reales con ID en base de datos
      const deleteButtonHtml = recipe.id ? `
        <button class="btn-delete" title="Eliminar receta" style="position: absolute; top: 1rem; right: 1rem; background: rgba(74, 46, 32, 0.85); border: 2px solid var(--bg-cream); color: var(--bg-cream); width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;"><i class="fa-solid fa-trash-can" style="font-size: 1.4rem;"></i></button>
      ` : "";

      let imageHtml = "";
      if (imageUrl) {
        imageHtml = `
          <div class="recipe-image" style="background-image: url('${imageUrl}'); height: 250px; border-radius: 15px; background-size: cover; background-position: center; margin-bottom: 1.5rem; position: relative;">
            ${deleteButtonHtml}
          </div>
        `;
      } else {
        imageHtml = `
          <div class="recipe-image img-custom-placeholder" style="height: 250px; border-radius: 15px; background: var(--bg-brown); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; position: relative;">
            <i class="fa-solid fa-utensils" style="font-size: 5rem; color: var(--bg-cream); opacity: 0.6;"></i>
            ${deleteButtonHtml}
          </div>
        `;
      }

      card.innerHTML = `
        ${imageHtml}
        <div class="recipe-info">
          <h3>${recipe.title}</h3>
          <p style="margin-top: 0.5rem; opacity: 0.85;">
            ${prepTimeText ? `<i class="fa-regular fa-clock"></i> ${prepTimeText}` : ""}
            ${separator}
            ${tempText ? `<i class="fa-solid fa-fire-burner"></i> ${tempText}` : ""}
          </p>
          <span style="display: inline-block; margin-top: 1rem; font-weight: bold; text-decoration: underline; font-size: 1.4rem; cursor: pointer;">Ver receta</span>
        </div>
      `;

      // Evento para borrar receta de Supabase (solo si tiene ID)
      const btnDelete = card.querySelector(".btn-delete");
      if (btnDelete) {
        btnDelete.addEventListener("click", (e) => {
          e.stopPropagation(); // Evitar abrir el modal al presionar borrar
          if (confirm(`¿Estás seguro de que deseas eliminar la receta "${recipe.title}" de Supabase?`)) {
            deleteRecipe(recipe.id);
          }
        });
      }

      // Evento para abrir el modal con la info detallada
      card.addEventListener("click", () => {
        openCustomModal(recipe);
      });

      mainGrid.appendChild(card);
    });

    // Ordenar físicamente la cuadrícula al finalizar la renderización
    sortRecipesDOM();

    // Si hay un filtro de búsqueda activo, reaplicarlo tras cargar
    const searchVal = recipeSearch ? recipeSearch.value : "";
    if (searchVal) {
      recipeSearch.dispatchEvent(new Event("input"));
    }
  }

  // Lógica de detección de imágenes y previsualización en el formulario
  const recipeTitleInput = document.getElementById("recipe-title");
  const imgPreviewContainer = document.getElementById("recipe-image-preview-container");
  const imgPreview = document.getElementById("recipe-image-preview");
  const manualImageInputs = document.getElementById("manual-image-inputs");
  const btnChangeImage = document.getElementById("btn-change-image");
  const recipeImageUrlInput = document.getElementById("recipe-image-url");
  const recipeImageFileInput = document.getElementById("recipe-image-file");

  let selectedImageUrl = ""; // Almacenará la URL o Base64 final
  let usingAutoImage = false; // Indica si usamos la de TheMealDB

  if (recipeTitleInput) {
    let titleTimeout = null;
    recipeTitleInput.addEventListener("input", function () {
      clearTimeout(titleTimeout);
      const title = this.value.trim();

      if (title.length < 3) {
        resetImageSelection();
        return;
      }

      titleTimeout = setTimeout(async () => {
        try {
          // Traducir el título al inglés para buscar en TheMealDB
          const englishTitle = await translateToEnglish(title);

          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${englishTitle}`);
          if (!response.ok) throw new Error();
          const data = await response.json();

          if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];
            selectedImageUrl = meal.strMealThumb;
            usingAutoImage = true;

            // Mostrar previsualización e inhabilitar inputs manuales
            imgPreview.src = selectedImageUrl;
            imgPreviewContainer.style.display = "block";
            manualImageInputs.style.display = "none";
          } else {
            resetImageSelection();
          }
        } catch (e) {
          console.warn("Error obteniendo imagen de TheMealDB:", e);
          resetImageSelection();
        }
      }, 500);
    });
  }

  function resetImageSelection() {
    selectedImageUrl = "";
    usingAutoImage = false;
    if (imgPreviewContainer) imgPreviewContainer.style.display = "none";
    if (manualImageInputs) manualImageInputs.style.display = "block";
    if (recipeImageFileInput) recipeImageFileInput.value = "";
  }

  if (btnChangeImage) {
    btnChangeImage.addEventListener("click", resetImageSelection);
  }

  if (recipeImageFileInput) {
    recipeImageFileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          selectedImageUrl = e.target.result; // Base64
          if (recipeImageUrlInput) recipeImageUrlInput.value = ""; // Limpiar el input de URL
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Guardar receta en Supabase mediante API
  const addRecipeForm = document.getElementById("add-recipe-form");
  if (addRecipeForm) {
    addRecipeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!supabaseClient) {
        alert("Por favor, configura las credenciales de Supabase en script.js antes de intentar guardar recetas.");
        return;
      }

      const title = document.getElementById("recipe-title").value.trim();
      const prep_time = document.getElementById("recipe-time").value.trim();
      const temperature = document.getElementById("recipe-temp").value.trim();
      const ingredients = document.getElementById("recipe-ingredients").value.trim();
      const instructions = document.getElementById("recipe-instructions").value.trim();
      const rawTip = document.getElementById("recipe-tip").value.trim();

      // Determinar la imagen a guardar
      let finalImageUrl = "";
      if (usingAutoImage) {
        finalImageUrl = selectedImageUrl;
      } else {
        const manualUrl = recipeImageUrlInput ? recipeImageUrlInput.value.trim() : "";
        if (manualUrl) {
          finalImageUrl = manualUrl;
        } else if (selectedImageUrl && selectedImageUrl.startsWith("data:image")) {
          finalImageUrl = selectedImageUrl;
        }
      }

      // Guardar el enlace de la imagen serializado junto al tip
      const combinedTip = `||${finalImageUrl}||${rawTip}`;

      const newRecipe = {
        title,
        prep_time,
        temperature,
        ingredients,
        instructions,
        tip: combinedTip
      };

      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .insert([newRecipe]);

        if (error) throw error;

        // Éxito: Limpiar formulario, restablecer y recargar
        addRecipeForm.reset();
        resetImageSelection();
        loadCustomRecipes();
        alert("¡Receta guardada exitosamente!");
      } catch (err) {
        console.error("Error al guardar receta:", err);
        alert(`No se pudo guardar la receta: ${err.message}`);
      }
    });
  }

  // Eliminar receta de Supabase
  async function deleteRecipe(id) {
    if (!supabaseClient) return;

    try {
      const { error } = await supabaseClient
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Recargar lista
      loadCustomRecipes();
    } catch (err) {
      console.error("Error al borrar receta:", err);
      alert("No se pudo eliminar la receta de la base de datos.");
    }
  }

  // Rellenar y abrir el modal dinámico para recetas Supabase
  function openCustomModal(recipe) {
    const modal = document.getElementById("modal-custom");
    if (!modal) return;

    // Decodificar imagen y tip
    let imageUrl = "";
    let actualTip = recipe.tip || "";
    if (recipe.tip && recipe.tip.startsWith("||")) {
      const parts = recipe.tip.split("||");
      if (parts.length >= 3) {
        imageUrl = parts[1];
        actualTip = parts.slice(2).join("||");
      }
    }

    // Llenar campos de texto
    document.getElementById("custom-modal-title").textContent = recipe.title;
    document.getElementById("custom-modal-desc").textContent = actualTip 
      ? `Consejo: ${actualTip}` 
      : "Receta personalizada cargada con mucho cariño.";

    // Renderizar lista de ingredientes
    const ingList = document.getElementById("custom-modal-ingredients");
    ingList.innerHTML = "";
    recipe.ingredients.split("\n").forEach((ing) => {
      const cleanIng = ing.trim();
      if (cleanIng) {
        const li = document.createElement("li");
        li.textContent = cleanIng;
        ingList.appendChild(li);
      }
    });

    // Renderizar lista de preparación
    const instList = document.getElementById("custom-modal-instructions");
    instList.innerHTML = "";
    recipe.instructions.split("\n").forEach((inst) => {
      const cleanInst = inst.trim();
      if (cleanInst) {
        const li = document.createElement("li");
        li.textContent = cleanInst;
        instList.appendChild(li);
      }
    });

    // Actualizar metadatos
    document.getElementById("custom-modal-time").textContent = recipe.prep_time 
      ? `${recipe.prep_time} minutos` 
      : "No especificado";
    document.getElementById("custom-modal-temp").textContent = recipe.temperature 
      ? `${recipe.temperature}°C` 
      : "No especificada";
    document.getElementById("custom-modal-tip").textContent = actualTip 
      ? actualTip 
      : "Hornear con mucho amor y paciencia";

    // Actualizar imagen en el modal
    const imgContainer = modal.querySelector(".img-custom-placeholder");
    if (imgContainer) {
      if (imageUrl) {
        imgContainer.style.backgroundImage = `url('${imageUrl}')`;
        imgContainer.style.backgroundSize = "cover";
        imgContainer.style.backgroundPosition = "center";
        imgContainer.innerHTML = ""; // Limpiar icono de tenedor
      } else {
        imgContainer.style.backgroundImage = "none";
        imgContainer.style.background = "#66453A";
        imgContainer.innerHTML = `<i class="fa-solid fa-utensils" style="font-size: 5rem; color: #FDFCEE; opacity: 0.6;"></i>`;
      }
    }

    // Mostrar modal con animación
    currentOpenModal = modal;
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
    document.body.style.overflow = "hidden";
  }

  // --- Cargar Recetas Adicionales de TheMealDB ---
  async function loadTheMealDBRecipes() {
    const mainGrid = document.querySelector(".recipes-grid");
    if (!mainGrid) return;

    try {
      // Descargamos postres de TheMealDB
      const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert");
      if (!response.ok) throw new Error("Error en la respuesta de TheMealDB");
      
      const data = await response.json();
      if (!data.meals) return;

      // Tomamos 6 recetas de postres populares (excluyendo el índice 0 para evitar los brownies)
      const meals = data.meals.slice(3, 9);

      meals.forEach((meal) => {
        const card = document.createElement("div");
        card.className = "recipe-card themealdb-recipe-card"; // hereda todos los estilos de .recipe-card
        card.setAttribute("data-id", meal.idMeal);
        card.setAttribute("data-ingredients", ""); // Se llenará en la búsqueda si hiciera falta, se busca por título

        card.innerHTML = `
          <div class="recipe-image" style="background-image: url('${meal.strMealThumb}');"></div>
          <div class="recipe-info">
            <h3>${translateMealTitle(meal.strMeal)}</h3>
            <p style="margin-top: 0.5rem; opacity: 0.85;">
              <i class="fa-solid fa-globe"></i> Receta de TheMealDB
            </p>
            <span style="display: inline-block; margin-top: 1rem; font-weight: bold; text-decoration: underline; font-size: 1.4rem; cursor: pointer;">Ver receta</span>
          </div>
        `;

        // Evento para abrir el modal dinámico de TheMealDB
        card.addEventListener("click", () => {
          openTheMealDBModal(meal.idMeal);
        });

        mainGrid.appendChild(card);
      });
    } catch (err) {
      console.error("Error al cargar recetas de TheMealDB:", err);
    }
  }

  // Traducción de títulos populares de TheMealDB
  function translateMealTitle(title) {
    const dictionary = {
      "Apfelstrudel": "Apfelstrudel (Estrudel de Manzana)",
      "Apple & Blackberry Crumble": "Crumble de Manzana y Mora",
      "Apple Frangipan Tart": "Tarta de Frangipane de Manzana",
      "Bakewell Tart": "Tarta Bakewell",
      "Banana Split": "Banana Split",
      "Battenberg Cake": "Pastel Battenberg",
      "BeaverTails": "Colas de Castor (BeaverTails)",
      "Blackberry Fool": "Fool de Zarzamora",
      "Bread and Butter Pudding": "Pudín de Pan y Mantequilla",
      "Budino di Ricotta": "Budín de Ricotta",
      "Canadian Butter Tarts": "Tartas de Mantequilla Canadienses",
      "Carrot Cake": "Pastel de Zanahoria",
      "Chelsea Buns": "Bollos de Chelsea",
      "Chinon Apple Tart": "Tarta de Manzana de Chinon",
      "Choc Chip Pecan Pie": "Tarta de Pecanas y Chispas de Chocolate",
      "Chocolate Avocado Mousse": "Mousse de Chocolate y Aguacate",
      "Chocolate Gateau": "Gâteau de Chocolate"
    };
    return dictionary[title] || title;
  }

  // Abrir modal dinámico para recetas externas de TheMealDB
  async function openTheMealDBModal(mealId) {
    const modal = document.getElementById("modal-custom");
    if (!modal) return;

    // Cambiar a estado "Cargando..."
    document.getElementById("custom-modal-title").textContent = "Cargando receta...";
    document.getElementById("custom-modal-desc").textContent = "Descargando ingredientes y preparación desde TheMealDB...";
    document.getElementById("custom-modal-ingredients").innerHTML = "<li>Cargando...</li>";
    document.getElementById("custom-modal-instructions").innerHTML = "<li>Cargando...</li>";
    document.getElementById("custom-modal-time").textContent = "-";
    document.getElementById("custom-modal-temp").textContent = "-";
    document.getElementById("custom-modal-tip").textContent = "-";

    currentOpenModal = modal;
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
    document.body.style.overflow = "hidden";

    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      if (!response.ok) throw new Error("Error al obtener receta");
      const data = await response.json();
      if (!data.meals || data.meals.length === 0) throw new Error("Receta no encontrada");
      
      const meal = data.meals[0];
      
      // Título y descripción
      document.getElementById("custom-modal-title").textContent = translateMealTitle(meal.strMeal);
      document.getElementById("custom-modal-desc").textContent = "Receta cargada dinámicamente de TheMealDB.";

      // Cargar imagen
      const imgContainer = modal.querySelector(".img-custom-placeholder");
      if (imgContainer) {
        imgContainer.style.backgroundImage = `url('${meal.strMealThumb}')`;
        imgContainer.style.backgroundSize = "cover";
        imgContainer.style.backgroundPosition = "center";
        imgContainer.innerHTML = ""; // Quitar el icono de tenedor
      }

      // Ingredientes
      const ingList = document.getElementById("custom-modal-ingredients");
      ingList.innerHTML = "";
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          const li = document.createElement("li");
          li.textContent = `${measure ? measure.trim() + ' ' : ''}${translateIngredient(ingredient)}`;
          ingList.appendChild(li);
        }
      }

      // Instrucciones
      const instList = document.getElementById("custom-modal-instructions");
      instList.innerHTML = "";
      const instructions = meal.strInstructions;
      instructions.split("\r\n").forEach(step => {
        const cleanStep = step.trim();
        if (cleanStep && cleanStep.length > 3) {
          const li = document.createElement("li");
          li.textContent = cleanStep;
          instList.appendChild(li);
        }
      });

      // Metadatos ficticios/estimados ya que la API no da tiempo ni temperatura exacta
      document.getElementById("custom-modal-time").textContent = "45-60 min";
      document.getElementById("custom-modal-temp").textContent = "180°C";
      document.getElementById("custom-modal-tip").textContent = meal.strSource 
        ? `Receta original disponible en: ${meal.strSource}` 
        : "Preparar con mucho cariño y disfrutar.";

    } catch (err) {
      console.error("Error al poblar modal de TheMealDB:", err);
      document.getElementById("custom-modal-title").textContent = "Error";
      document.getElementById("custom-modal-desc").textContent = "No se pudo descargar la receta.";
    }
  }

  // Ejecutar al iniciar
  runConverter();
  loadCustomRecipes();
  // loadTheMealDBRecipes(); // Desact
});
