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
  const recipeSearch = document.getElementById("recipe-search");
  if (recipeSearch) {
    recipeSearch.addEventListener("input", function () {
      const query = this.value.toLowerCase().trim();

      // 1. Filtrar recetas estáticas (en la rejilla principal)
      const staticCards = document.querySelectorAll(".recipes-section .recipe-card");
      staticCards.forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const desc = card.querySelector("p").textContent.toLowerCase();

        if (title.includes(query) || desc.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });

      // 2. Filtrar recetas personalizadas (SQLite)
      const customCards = document.querySelectorAll(".custom-recipe-card");
      customCards.forEach((card) => {
        const title = card.querySelector("h4").textContent.toLowerCase();
        const ingredients = card.getAttribute("data-ingredients").toLowerCase();

        if (title.includes(query) || ingredients.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
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

  // Ejecutar al iniciar
  runConverter();
  loadCustomRecipes();

  // --- Integración con Supabase (PostgreSQL en la Nube) ---
  // Reemplaza estas credenciales con las de tu proyecto en el panel de Supabase
  const SUPABASE_URL = 'TU_SUPABASE_URL';
  const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

  let supabaseClient = null;
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'TU_SUPABASE_URL') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Obtener y listar recetas guardadas en Supabase
  async function loadCustomRecipes() {
    const listContainer = document.getElementById("custom-recipes-list");
    if (!listContainer) return;

    if (!supabaseClient) {
      listContainer.innerHTML = `
        <p class="no-recipes">
          <i class="fa-solid fa-triangle-exclamation" style="color: #4A2E20; margin-bottom: 0.5rem; font-size: 2rem;"></i><br>
          Supabase no ha sido configurado.<br>
          <span style="font-size: 1.3rem; opacity: 0.8;">Por favor, edita las constantes <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> al final de <code>script.js</code> con tus credenciales de Supabase.</span>
        </p>
      `;
      return;
    }

    try {
      const { data: recipes, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      renderCustomRecipes(recipes);
    } catch (err) {
      console.error("Error al cargar recetas desde Supabase:", err);
      listContainer.innerHTML = `
        <p class="no-recipes">
          <i class="fa-solid fa-triangle-exclamation" style="color: #4A2E20; margin-bottom: 0.5rem; font-size: 2rem;"></i><br>
          Error al conectar con Supabase:<br>
          <span style="font-size: 1.3rem; opacity: 0.8;">${err.message}</span>
        </p>
      `;
    }
  }

  // Renderizar las tarjetas de recetas de Supabase en la interfaz
  function renderCustomRecipes(recipes) {
    const listContainer = document.getElementById("custom-recipes-list");
    if (!listContainer) return;

    if (!recipes || recipes.length === 0) {
      listContainer.innerHTML = `
        <p class="no-recipes">
          Aún no has guardado ninguna receta personalizada.<br>¡Crea la primera usando el formulario!
        </p>
      `;
      return;
    }

    listContainer.innerHTML = "";
    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "custom-recipe-card";
      // Atributos de búsqueda e identificación
      card.setAttribute("data-id", recipe.id);
      card.setAttribute("data-ingredients", recipe.ingredients);

      const prepTimeText = recipe.prep_time ? `${recipe.prep_time} min` : "";
      const tempText = recipe.temperature ? `${recipe.temperature}°C` : "";
      const separator = (recipe.prep_time && recipe.temperature) ? " &nbsp;|&nbsp; " : "";

      card.innerHTML = `
        <button class="btn-delete" title="Eliminar receta"><i class="fa-solid fa-trash-can"></i></button>
        <div>
          <h4>${recipe.title}</h4>
          <div class="card-meta">
            ${prepTimeText ? `<i class="fa-regular fa-clock"></i> ${prepTimeText}` : ""}
            ${separator}
            ${tempText ? `<i class="fa-solid fa-fire-burner"></i> ${tempText}` : ""}
          </div>
        </div>
        <div class="card-footer">
          <span>Ver receta</span>
          <i class="fa-solid fa-circle-chevron-right"></i>
        </div>
      `;

      // Evento para borrar receta de Supabase
      const btnDelete = card.querySelector(".btn-delete");
      btnDelete.addEventListener("click", (e) => {
        e.stopPropagation(); // Evitar abrir el modal al presionar borrar
        if (confirm(`¿Estás seguro de que deseas eliminar la receta "${recipe.title}" de Supabase?`)) {
          deleteRecipe(recipe.id);
        }
      });

      // Evento para abrir el modal con la info detallada
      card.addEventListener("click", () => {
        openCustomModal(recipe);
      });

      listContainer.appendChild(card);
    });

    // Si hay un filtro de búsqueda activo, reaplicarlo tras cargar
    const searchVal = recipeSearch ? recipeSearch.value : "";
    if (searchVal) {
      recipeSearch.dispatchEvent(new Event("input"));
    }
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
      const tip = document.getElementById("recipe-tip").value.trim();

      const newRecipe = {
        title,
        prep_time,
        temperature,
        ingredients,
        instructions,
        tip
      };

      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .insert([newRecipe]);

        if (error) throw error;

        // Éxito: Limpiar formulario y recargar
        addRecipeForm.reset();
        loadCustomRecipes();
        alert("¡Receta guardada exitosamente en la base de datos PostgreSQL de Supabase!");
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

  // Rellenar y abrir el modal dinámico para recetas SQLite / Supabase
  function openCustomModal(recipe) {
    const modal = document.getElementById("modal-custom");
    if (!modal) return;

    // Llenar campos de texto
    document.getElementById("custom-modal-title").textContent = recipe.title;
    document.getElementById("custom-modal-desc").textContent = recipe.tip 
      ? `Consejo: ${recipe.tip}` 
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
    document.getElementById("custom-modal-tip").textContent = recipe.tip 
      ? recipe.tip 
      : "Hornear con mucho amor y paciencia";

    // Mostrar modal con animación
    currentOpenModal = modal;
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
    document.body.style.overflow = "hidden";
  }
});
