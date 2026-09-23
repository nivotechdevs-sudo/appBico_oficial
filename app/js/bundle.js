(() => {
  // js/dom.js
  function h(tag, props, ...children) {
    const parts = tag.split(".");
    const tagName = parts[0] || "div";
    const classes = parts.slice(1);
    const el = document.createElement(tagName);
    if (classes.length) el.className = classes.join(" ");
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === "class" || k === "className") {
          el.className = el.className ? el.className + " " + v : v;
        } else if (k.startsWith("on") && typeof v === "function") {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === "style" && typeof v === "object") {
          Object.assign(el.style, v);
        } else if (k === "html") {
          el.innerHTML = v;
        } else if (k === "value" || k === "checked" || k === "disabled" || k === "selected") {
          el[k] = v;
        } else {
          el.setAttribute(k, v);
        }
      }
    }
    appendChildren(el, children);
    return el;
  }
  function appendChildren(el, children) {
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
  }
  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
  function mount(el, ...children) {
    clear(el);
    appendChildren(el, children);
    return el;
  }
  function cx(...parts) {
    return parts.filter(Boolean).join(" ");
  }
  function rem(px) {
    return px / 16 + "rem";
  }

  // js/router.js
  var routes = [];
  var onChange = null;
  var backStack = [];
  function route(pattern, handler) {
    const keys = [];
    const regexStr = pattern.replace(/:[^/]+/g, (m) => {
      keys.push(m.slice(1));
      return "([^/]+)";
    });
    routes.push({ pattern, handler, regex: new RegExp("^" + regexStr + "$"), keys });
  }
  function onRouteChange(fn) {
    onChange = fn;
  }
  function currentPath() {
    const h2 = location.hash.slice(1);
    return h2 || "/";
  }
  function match(path) {
    for (const r of routes) {
      const m = r.regex.exec(path);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => {
          params[k] = decodeURIComponent(m[i + 1]);
        });
        return { handler: r.handler, params, pattern: r.pattern };
      }
    }
    return null;
  }
  function navigate(path, { replace = false } = {}) {
    if (!replace) {
      const from = currentPath();
      if (from !== path) backStack.push(from);
    }
    if (replace) {
      history.replaceState(null, "", location.pathname + location.search + "#" + path);
      dispatch();
    } else {
      location.hash = path;
    }
  }
  function goBack(fallback = "/mural") {
    const prev = backStack.pop();
    navigate(prev || fallback, { replace: true });
  }
  function dispatch() {
    const path = currentPath();
    const m = match(path);
    if (onChange) onChange(m, path);
  }
  function startRouter() {
    window.addEventListener("hashchange", dispatch);
    dispatch();
  }

  // js/data/seed.js
  var CURRENT_COMPANY_ID = "meridiano";
  var CURRENT_WORKER_ID = "jorge";
  var COMPANIES = {
    meridiano: {
      id: "meridiano",
      name: "Construtora Meridiano",
      cnpj: "18.402.551/0001-07",
      tipoObra: "Residencial e reforma",
      location: "Zona Leste, SP",
      whatsapp: "(11) 98842-3310",
      rating: 4.7,
      reviewCount: 31,
      verified: true,
      verifiedSince: "12 ago",
      sinceLabel: "Na Bicos desde mar\xE7o de 2025",
      respondTime: "Responde em 1h20, em m\xE9dia",
      paidCount: 128,
      reviews: [
        { author: "Marcos A. \xB7 servente", value: 5, text: "Pagou em PIX no fim da di\xE1ria, como combinado.", date: "2 set" },
        { author: "Jorge M. \xB7 pedreiro", value: 4, text: "Obra organizada e EPI no local. Come\xE7ou 30 min atrasado.", date: "25 ago" },
        { author: "Edson B. \xB7 pedreiro", value: 5, text: "J\xE1 trabalhei com eles tr\xEAs vezes. Sempre no hor\xE1rio certo.", date: "18 ago" }
      ]
    },
    alvorada: {
      id: "alvorada",
      name: "Construtora Alvorada",
      location: "Mooca, SP",
      rating: 4.5,
      reviewCount: 18,
      verified: true,
      reviews: [{ author: "Caio N. \xB7 pedreiro", value: 4, text: "Bom acabamento, chegou 20 min atrasado.", date: "30 jul" }]
    },
    "vila-formosa": { id: "vila-formosa", name: "Instala\xE7\xF5es Vila Formosa", location: "Vila Formosa, SP", rating: 4.6, reviewCount: 9, verified: false, reviews: [] },
    "serra-braganca": {
      id: "serra-braganca",
      name: "Reforma Serra de Bragan\xE7a",
      location: "Tatuap\xE9, SP",
      rating: 4.8,
      reviewCount: 14,
      verified: true,
      reviews: [{ author: "Nelson A. \xB7 azulejista", value: 5, text: "Assentamento impec\xE1vel, obra organizada.", date: "22 ago" }]
    },
    "vila-prudente": {
      id: "vila-prudente",
      name: "Obra Vila Prudente",
      location: "Vila Prudente, SP",
      rating: 4.4,
      reviewCount: 7,
      verified: false,
      reviews: [{ author: "Bruno T. \xB7 servente", value: 5, text: "Trabalhador de confian\xE7a. J\xE1 chamei tr\xEAs vezes.", date: "27 ago" }]
    },
    belem: { id: "belem", name: "Obra Bel\xE9m", location: "Bel\xE9m, SP", rating: 4.3, reviewCount: 5, verified: false, reviews: [] },
    aricanduva: { id: "aricanduva", name: "Obra Aricanduva", location: "Aricanduva, SP", rating: 4.2, reviewCount: 4, verified: false, reviews: [] },
    cangaiba: { id: "cangaiba", name: "Obra Canga\xEDba", location: "Canga\xEDba, SP", rating: 4.3, reviewCount: 6, verified: false, reviews: [] }
  };
  var WORKERS = {
    jorge: {
      id: "jorge",
      name: "Jorge Mendes",
      initials: "JM",
      role: "Pedreiro de acabamento",
      region: "Tatuap\xE9, SP",
      distance: "3,2 km",
      rating: 4.8,
      jobsDone: 23,
      verified: true,
      specialties: ["Acabamento", "Alvenaria", "Reboco", "Assentamento"],
      facts: ["23 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 12 ago", "Responde em 40 min, em m\xE9dia", "Nunca faltou a uma di\xE1ria combinada"],
      reviews: [
        { company: "Obra Vila Prudente", value: 5, text: "Trabalhou o dia todo sem reclamar. Deixou a \xE1rea limpa.", date: "14 ago" },
        { company: "Reforma Serra de Bragan\xE7a", value: 5, text: "Chegou no hor\xE1rio, acabamento bem feito.", date: "2 ago" },
        { company: "Construtora Meridiano", value: 5, text: "Chegou no hor\xE1rio, acabamento bem feito. Chamo de novo.", date: "28 ago" }
      ]
    },
    rafael: {
      id: "rafael",
      name: "Rafael Duarte",
      initials: "RD",
      role: "Servente de obra",
      region: "Vila Prudente, SP",
      distance: "1,8 km",
      rating: 4.5,
      jobsDone: 17,
      verified: true,
      specialties: ["Carga de material", "Limpeza de obra"],
      facts: ["17 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 5 ago", "Responde em 55 min, em m\xE9dia"],
      reviews: [{ company: "Obra Bel\xE9m", value: 4, text: "Fez o servi\xE7o direito. Saiu 20 min mais cedo.", date: "19 ago" }]
    },
    nelson: {
      id: "nelson",
      name: "Nelson Aquino",
      initials: "NA",
      role: "Azulejista",
      region: "Tatuap\xE9, SP",
      distance: "1,6 km",
      rating: 4.9,
      jobsDone: 52,
      verified: true,
      specialties: ["Porcelanato 60x60", "Rejunte", "Nivelamento"],
      facts: ["52 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 8 abr", "Responde em 15 min, em m\xE9dia"],
      reviews: [{ company: "Reforma Serra de Bragan\xE7a", value: 5, text: "Assentamento impec\xE1vel. Levou as pr\xF3prias ferramentas.", date: "22 ago" }]
    },
    bruno: {
      id: "bruno",
      name: "Bruno Tavares",
      initials: "BT",
      role: "Servente de obra",
      region: "Vila Prudente, SP",
      distance: "2,9 km",
      rating: 4.8,
      jobsDone: 28,
      verified: true,
      specialties: ["Carga de material", "Massa"],
      facts: ["28 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 15 jun", "Nunca faltou a uma di\xE1ria combinada"],
      reviews: [{ company: "Obra Vila Prudente", value: 5, text: "Trabalhador de confian\xE7a. J\xE1 chamei tr\xEAs vezes.", date: "27 ago" }]
    },
    marcos: {
      id: "marcos",
      name: "Marcos Aur\xE9lio",
      initials: "MA",
      role: "Servente e ajudante",
      region: "Penha, SP",
      distance: "5,1 km",
      rating: 4.6,
      jobsDone: 41,
      verified: true,
      specialties: ["Carga de material", "Limpeza de obra", "Massa"],
      facts: ["41 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 30 jul", "Responde em 1h10, em m\xE9dia"],
      reviews: [{ company: "Construtora Alvorada", value: 5, text: "Pegou no pesado o dia todo. Chamo de novo.", date: "21 ago" }]
    },
    silas: {
      id: "silas",
      name: "Silas Pereira",
      initials: "SP",
      role: "Azulejista",
      region: "Mooca, SP",
      distance: "2,4 km",
      rating: 0,
      jobsDone: 0,
      novo: true,
      verified: false,
      specialties: ["Porcelanato", "Rejunte"],
      facts: ["11 anos de obra, primeiro bico pela plataforma", "Documentos enviados, em confer\xEAncia", "Telefone confirmado por SMS"],
      reviews: []
    },
    vitor: {
      id: "vitor",
      name: "Vitor Camargo",
      initials: "VC",
      role: "Pedreiro",
      region: "Tatuap\xE9, SP",
      distance: "2,1 km",
      rating: 4.7,
      jobsDone: 31,
      verified: true,
      specialties: ["Reboco", "Contrapiso"],
      facts: ["31 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 21 jul", "Responde em 35 min, em m\xE9dia"],
      reviews: [{ company: "Obra Bel\xE9m", value: 5, text: "Servi\xE7o limpo e no prazo combinado.", date: "12 ago" }]
    },
    caio: {
      id: "caio",
      name: "Caio Nogueira",
      initials: "CN",
      role: "Pedreiro de acabamento",
      region: "Penha, SP",
      distance: "7,4 km",
      rating: 4.2,
      jobsDone: 9,
      verified: true,
      specialties: ["Massa corrida", "Acabamento"],
      facts: ["9 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 2 set", "Faltou a 1 di\xE1ria combinada em julho"],
      reviews: [{ company: "Construtora Alvorada", value: 4, text: "Bom acabamento, chegou 20 min atrasado.", date: "30 jul" }]
    },
    edson: {
      id: "edson",
      name: "Edson Batista",
      initials: "EB",
      role: "Pedreiro",
      region: "Bel\xE9m, SP",
      distance: "6,8 km",
      rating: 4.9,
      jobsDone: 64,
      verified: true,
      specialties: ["Alvenaria estrutural", "Contrapiso", "Reboco"],
      facts: ["64 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 4 mar", "Responde em 25 min, em m\xE9dia"],
      reviews: [{ company: "Construtora Meridiano", value: 5, text: "J\xE1 trabalhou com a gente tr\xEAs vezes. Sempre pontual.", date: "18 ago" }]
    },
    joel: {
      id: "joel",
      name: "Joel Ribeiro",
      initials: "JR",
      role: "Ajudante geral",
      region: "Bel\xE9m, SP",
      distance: "6,1 km",
      rating: 0,
      jobsDone: 0,
      novo: true,
      verified: false,
      specialties: ["Carga de material"],
      facts: ["6 anos de obra, primeiro bico pela plataforma", "Documentos enviados, em confer\xEAncia", "Telefone confirmado por SMS"],
      reviews: []
    },
    antonio: {
      id: "antonio",
      name: "Ant\xF4nio Ferraz",
      initials: "AF",
      role: "Servente de obra",
      region: "Vila Prudente, SP",
      distance: "4,0 km",
      rating: 4.6,
      jobsDone: 19,
      verified: true,
      specialties: ["Carga de material", "Limpeza de obra"],
      facts: ["19 di\xE1rias pagas pela plataforma", "RG e CPF conferidos em 3 mai"],
      reviews: []
    }
  };
  var JOBS = {
    "BC-4821": {
      id: "BC-4821",
      companyId: "meridiano",
      role: "Pedreiro de acabamento",
      pay: 220,
      location: "Tatuap\xE9, SP",
      address: "Rua Serra de Bragan\xE7a, 1240",
      distance: "3,2 km",
      date: "Hoje",
      dateLong: "Hoje \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "1 di\xE1ria, com 1h de almo\xE7o",
      urgent: true,
      boosted: true,
      slots: 4,
      description: "Reboco e regulariza\xE7\xE3o de duas paredes externas e acabamento em massa corrida numa reforma residencial. Material j\xE1 est\xE1 no canteiro.",
      requirements: ["Experi\xEAncia com reboco e massa corrida", "Botina e capacete pr\xF3prios", "Chegar 10 minutos antes"]
    },
    "BC-4822": {
      id: "BC-4822",
      companyId: "alvorada",
      role: "Pintor",
      pay: null,
      location: "Mooca, SP",
      address: "Rua da Mooca, 3180",
      distance: "4,4 km",
      date: "Hoje",
      dateLong: "Hoje \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      urgent: true,
      slots: 1,
      description: "Pintura interna em parede lisa de apartamento rec\xE9m-reformado, duas dem\xE3os de tinta acr\xEDlica branca.",
      requirements: ["Pintura interna, parede lisa", "Rolo e pincel pr\xF3prios", "Tinta e lixa fornecidas pela obra"]
    },
    "BC-4855": {
      id: "BC-4855",
      companyId: "vila-formosa",
      role: "Eletricista",
      pay: null,
      location: "Vila Formosa, SP",
      address: "Rua Vila Formosa, 210",
      distance: "5,6 km",
      date: "Seg, 14 set",
      dateLong: "Seg, 14 set \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      description: "Instala\xE7\xE3o el\xE9trica residencial em casa em reforma: troca de disjuntores, tomadas e pontos de luz em tr\xEAs c\xF4modos.",
      requirements: ["Instala\xE7\xE3o el\xE9trica residencial", "Ferramentas pr\xF3prias", "Combine o valor direto com a construtora"]
    },
    "BC-4830": {
      id: "BC-4830",
      companyId: "vila-prudente",
      role: "Servente de obra",
      pay: 150,
      location: "Vila Prudente, SP",
      address: "Av. Vila Ema, 2790",
      distance: "6,8 km",
      date: "Qua, 9 set",
      dateLong: "Qua, 9 set \xB7 7h\u201316h",
      hours: "7h\u201316h",
      duration: "2 di\xE1rias seguidas",
      slots: 1,
      description: "Carga e descarga de material de constru\xE7\xE3o e limpeza do piso ao fim do expediente, em obra residencial de dois pavimentos.",
      requirements: ["Carregar material e limpar o piso", "Botina pr\xF3pria", "Capacete fornecido pela obra"]
    },
    "BC-4835": {
      id: "BC-4835",
      companyId: "serra-braganca",
      role: "Azulejista",
      pay: 260,
      location: "Tatuap\xE9, SP",
      address: "Rua Serra de Bragan\xE7a, 640",
      distance: "4,1 km",
      date: "Qui, 10 set",
      dateLong: "Qui, 10 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      description: "Assentamento de porcelanato 60x60 em sala e cozinha, com nivelamento e rejunte inclu\xEDdos.",
      requirements: ["Assentamento de porcelanato 60x60", "Desempenadeira e n\xEDvel pr\xF3prios", "Argamassa fornecida pela obra"]
    },
    "BC-4841": {
      id: "BC-4841",
      companyId: "meridiano",
      role: "Armador",
      pay: 240,
      location: "Penha, SP",
      address: "Rua Cantagalo, 890",
      distance: "5,0 km",
      date: "Sex, 11 set",
      dateLong: "Sex, 11 set \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "3 di\xE1rias",
      slots: 1,
      description: "Montagem da ferragem de laje de um pavimento, seguindo projeto estrutural fornecido pela construtora.",
      requirements: ["Montagem de ferragem de laje", "Botina, capacete e luva pr\xF3prios", "Experi\xEAncia com vergalh\xE3o"]
    },
    "BC-4848": {
      id: "BC-4848",
      companyId: "belem",
      role: "Ajudante geral",
      pay: 140,
      location: "Bel\xE9m, SP",
      address: "Rua Padre Adelino, 410",
      distance: "7,2 km",
      date: "S\xE1b, 12 set",
      dateLong: "S\xE1b, 12 set \xB7 8h\u201314h",
      hours: "8h\u201314h",
      duration: "Meia di\xE1ria",
      slots: 1,
      description: "Descarregar um caminh\xE3o de material de constru\xE7\xE3o e organizar no canteiro. Servi\xE7o de meio per\xEDodo.",
      requirements: ["Descarregar caminh\xE3o de material", "Botina pr\xF3pria", "Sem experi\xEAncia exigida"]
    },
    "BC-4998": {
      id: "BC-4998",
      companyId: "meridiano",
      role: "Servente de obra",
      pay: 150,
      location: "Vila Prudente, SP",
      address: "Av. Vila Ema, 2790",
      distance: "6,8 km",
      date: "Qua, 9 set",
      dateLong: "Qua, 9 set \xB7 7h\u201316h",
      hours: "7h\u201316h",
      duration: "2 di\xE1rias seguidas",
      slots: 2,
      description: "Carga e descarga de material de constru\xE7\xE3o e limpeza do piso ao fim do expediente, em obra residencial de dois pavimentos.",
      requirements: ["Carregar material e limpar o piso", "Botina pr\xF3pria"]
    },
    "BC-4995": {
      id: "BC-4995",
      companyId: "meridiano",
      role: "Azulejista",
      pay: 260,
      location: "Tatuap\xE9, SP",
      address: "Rua Serra de Bragan\xE7a, 640",
      distance: "4,1 km",
      date: "Qui, 10 set",
      dateLong: "Qui, 10 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      description: "Assentamento de porcelanato 60x60 em sala e cozinha, com nivelamento e rejunte inclu\xEDdos.",
      requirements: ["Assentamento de porcelanato 60x60", "Desempenadeira e n\xEDvel pr\xF3prios"]
    },
    "BC-5010": {
      id: "BC-5010",
      companyId: "alvorada",
      role: "Eletricista",
      pay: 250,
      location: "Mooca, SP",
      address: "Rua Taquari, 1180",
      distance: "4,4 km",
      date: "Amanh\xE3",
      dateLong: "Amanh\xE3 \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      urgent: true,
      slots: 1,
      description: "Troca da fia\xE7\xE3o de um apartamento de dois quartos e instala\xE7\xE3o de quadro de distribui\xE7\xE3o novo.",
      requirements: ["NR-10 em dia", "Ferramentas pr\xF3prias", "Material fornecido pela obra"]
    },
    "BC-5011": {
      id: "BC-5011",
      companyId: "serra-braganca",
      role: "Pintor",
      pay: 200,
      location: "Tatuap\xE9, SP",
      address: "Rua Tuiuti, 2210",
      distance: "2,6 km",
      date: "Sex, 25 set",
      dateLong: "Sex, 25 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "2 di\xE1rias",
      slots: 2,
      description: "Pintura de fachada de sobrado, com andaime j\xE1 montado pela obra.",
      requirements: ["Experi\xEAncia com pintura externa", "Rolo, pincel e trincha pr\xF3prios", "EPI fornecido pela obra"]
    },
    "BC-5012": {
      id: "BC-5012",
      companyId: "vila-prudente",
      role: "Encanador",
      pay: null,
      location: "Vila Prudente, SP",
      address: "Rua Ibitirama, 845",
      distance: "5,9 km",
      date: "Hoje",
      dateLong: "Hoje \xB7 9h\u201318h",
      hours: "9h\u201318h",
      duration: "1 di\xE1ria",
      urgent: true,
      slots: 1,
      description: "Vazamento na prumada do banheiro. Trocar a tubula\xE7\xE3o de \xE1gua fria e testar a press\xE3o.",
      requirements: ["Experi\xEAncia com PVC e PPR", "Ferramentas pr\xF3prias"]
    },
    "BC-5013": {
      id: "BC-5013",
      companyId: "belem",
      role: "Servente de obra",
      pay: 150,
      location: "Bel\xE9m, SP",
      address: "Rua Siqueira Bueno, 1320",
      distance: "6,5 km",
      date: "S\xE1b, 26 set",
      dateLong: "S\xE1b, 26 set \xB7 7h\u201316h",
      hours: "7h\u201316h",
      duration: "1 di\xE1ria",
      slots: 2,
      description: "Apoio ao pedreiro no preparo de massa e transporte de blocos para o segundo andar.",
      requirements: ["Botina pr\xF3pria", "Capacete e luvas fornecidos pela obra"]
    },
    "BC-5014": {
      id: "BC-5014",
      companyId: "alvorada",
      role: "Azulejista",
      pay: 280,
      location: "Mooca, SP",
      address: "Rua Javari, 540",
      distance: "4,8 km",
      date: "Seg, 28 set",
      dateLong: "Seg, 28 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "2 di\xE1rias",
      slots: 1,
      description: "Revestimento de banheiro inteiro com porcelanato 60x120, incluindo recortes para nichos.",
      requirements: ["Experi\xEAncia com pe\xE7a grande", "Cortador e n\xEDvel a laser pr\xF3prios"]
    },
    "BC-5015": {
      id: "BC-5015",
      companyId: "vila-formosa",
      role: "Carpinteiro",
      pay: 260,
      location: "Vila Formosa, SP",
      address: "Av. Renata, 910",
      distance: "5,2 km",
      date: "Ter, 29 set",
      dateLong: "Ter, 29 set \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "3 di\xE1rias",
      slots: 2,
      description: "Montagem de f\xF4rmas de madeira para a laje do t\xE9rreo.",
      requirements: ["Experi\xEAncia com f\xF4rma de laje", "Serrote, martelo e trena pr\xF3prios"]
    },
    "BC-5016": {
      id: "BC-5016",
      companyId: "cangaiba",
      role: "Pedreiro",
      pay: 230,
      location: "Canga\xEDba, SP",
      address: "Rua Pedro \xC1lvares, 77",
      distance: "8,1 km",
      date: "Amanh\xE3",
      dateLong: "Amanh\xE3 \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "2 di\xE1rias",
      slots: 1,
      description: "Levantamento de muro de divisa com bloco de concreto, cerca de 20 metros.",
      requirements: ["Experi\xEAncia com alvenaria", "Colher e prumo pr\xF3prios"]
    },
    "BC-5017": {
      id: "BC-5017",
      companyId: "aricanduva",
      role: "Ajudante geral",
      pay: 130,
      location: "Aricanduva, SP",
      address: "Rua Olga Fadel Abarca, 300",
      distance: "9,0 km",
      date: "Hoje",
      dateLong: "Hoje \xB7 8h\u201314h",
      hours: "8h\u201314h",
      duration: "Meia di\xE1ria",
      urgent: true,
      slots: 1,
      description: "Limpeza p\xF3s-obra de uma casa t\xE9rrea: retirada de entulho e varri\xE7\xE3o.",
      requirements: ["Sem experi\xEAncia exigida", "Botina pr\xF3pria"]
    },
    "BC-5018": {
      id: "BC-5018",
      companyId: "serra-braganca",
      role: "Gesseiro",
      pay: 240,
      location: "Tatuap\xE9, SP",
      address: "Rua Apucarana, 1450",
      distance: "3,0 km",
      date: "Qua, 30 set",
      dateLong: "Qua, 30 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "2 di\xE1rias",
      slots: 1,
      description: "Instala\xE7\xE3o de forro de gesso em sala e dois quartos, com sanca aberta na sala.",
      requirements: ["Experi\xEAncia com forro e sanca", "Ferramentas pr\xF3prias"]
    },
    "BC-5019": {
      id: "BC-5019",
      companyId: "vila-prudente",
      role: "Pintor",
      pay: 190,
      location: "Vila Prudente, SP",
      address: "Av. Paes de Barros, 3100",
      distance: "6,1 km",
      date: "Sex, 25 set",
      dateLong: "Sex, 25 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      description: "Pintura interna de apartamento de 60 m\xB2, com massa corrida nos pontos danificados.",
      requirements: ["Rolo e pincel pr\xF3prios", "Tinta fornecida pela obra"]
    },
    "BC-5020": {
      id: "BC-5020",
      companyId: "belem",
      role: "Eletricista",
      pay: null,
      location: "Bel\xE9m, SP",
      address: "Av. \xC1lvaro Ramos, 890",
      distance: "6,9 km",
      date: "Seg, 28 set",
      dateLong: "Seg, 28 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      description: "Instala\xE7\xE3o de ilumina\xE7\xE3o em LED e tomadas numa loja de 80 m\xB2.",
      requirements: ["NR-10 em dia", "Ferramentas pr\xF3prias"]
    },
    "BC-5021": {
      id: "BC-5021",
      companyId: "alvorada",
      role: "Mestre de obras",
      pay: 380,
      location: "Mooca, SP",
      address: "Rua dos Trilhos, 1600",
      distance: "4,4 km",
      date: "Qui, 1 out",
      dateLong: "Qui, 1 out \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "5 di\xE1rias",
      slots: 1,
      description: "Coordenar uma equipe de quatro pessoas na reforma completa de um apartamento.",
      requirements: ["Experi\xEAncia comprovada como mestre", "Leitura de projeto"]
    },
    "BC-5022": {
      id: "BC-5022",
      companyId: "cangaiba",
      role: "Servente de obra",
      pay: 140,
      location: "Canga\xEDba, SP",
      address: "Rua Dr. Assis Ribeiro, 2200",
      distance: "7,7 km",
      date: "Hoje",
      dateLong: "Hoje \xB7 7h\u201316h",
      hours: "7h\u201316h",
      duration: "1 di\xE1ria",
      urgent: true,
      slots: 2,
      description: "Carga e descarga de sacos de cimento e areia para a concretagem de s\xE1bado.",
      requirements: ["Botina pr\xF3pria"]
    },
    "BC-5023": {
      id: "BC-5023",
      companyId: "vila-formosa",
      role: "Encanador",
      pay: 220,
      location: "Vila Formosa, SP",
      address: "Rua Itapeti, 60",
      distance: "5,4 km",
      date: "S\xE1b, 26 set",
      dateLong: "S\xE1b, 26 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      description: "Instala\xE7\xE3o de aquecedor a g\xE1s e liga\xE7\xE3o das tubula\xE7\xF5es de \xE1gua quente.",
      requirements: ["Experi\xEAncia com aquecedor a g\xE1s", "Ferramentas pr\xF3prias"]
    },
    "BC-5024": {
      id: "BC-5024",
      companyId: "serra-braganca",
      role: "Pedreiro de acabamento",
      pay: 240,
      location: "Tatuap\xE9, SP",
      address: "Rua Cantagalo, 1220",
      distance: "2,2 km",
      date: "Ter, 29 set",
      dateLong: "Ter, 29 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      description: "Assentamento de rodap\xE9 e soleiras de granito, com acabamento em rejunte ep\xF3xi.",
      requirements: ["Experi\xEAncia com granito", "N\xEDvel e esquadro pr\xF3prios"]
    },
    "BC-5025": {
      id: "BC-5025",
      companyId: "meridiano",
      role: "Telhadista",
      pay: 250,
      location: "Penha, SP",
      address: "Rua Padre Jo\xE3o, 480",
      distance: "5,0 km",
      date: "Qua, 30 set",
      dateLong: "Qua, 30 set \xB7 7h\u201316h",
      hours: "7h\u201316h",
      duration: "1 di\xE1ria",
      slots: 2,
      description: "Troca de telhas quebradas e revis\xE3o das calhas de um galp\xE3o.",
      requirements: ["Experi\xEAncia em altura", "Cinto de seguran\xE7a fornecido pela obra"]
    },
    "BC-5026": {
      id: "BC-5026",
      companyId: "meridiano",
      role: "Pintor",
      pay: 210,
      location: "Tatuap\xE9, SP",
      address: "Rua Itapura, 900",
      distance: "3,4 km",
      date: "Sex, 25 set",
      dateLong: "Sex, 25 set \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "2 di\xE1rias",
      slots: 3,
      description: "Pintura das \xE1reas comuns de um condom\xEDnio: escadas e corredores de quatro andares.",
      requirements: ["Rolo e pincel pr\xF3prios", "Tinta fornecida pela obra"]
    },
    // closed / historical
    "BC-4712": {
      id: "BC-4712",
      companyId: "aricanduva",
      role: "Ajudante geral",
      pay: 140,
      location: "Aricanduva, SP",
      address: "Av. Aricanduva, 5200",
      distance: "9,4 km",
      date: "Ter, 26 ago",
      dateLong: "Ter, 26 ago \xB7 8h\u201314h",
      hours: "8h\u201314h",
      duration: "Meia di\xE1ria",
      slots: 1,
      closed: true,
      description: "Descarregar material de constru\xE7\xE3o na entrada da obra e organizar no canteiro.",
      requirements: ["Descarregar material", "Botina pr\xF3pria"]
    },
    "BC-4703": {
      id: "BC-4703",
      companyId: "cangaiba",
      role: "Servente de obra",
      pay: 150,
      location: "Canga\xEDba, SP",
      address: "Rua Cachoeira Tijuco Preto, 75",
      distance: "8,5 km",
      date: "S\xE1b, 30 ago",
      dateLong: "S\xE1b, 30 ago \xB7 8h\u201314h",
      hours: "8h\u201314h",
      duration: "1 di\xE1ria",
      slots: 1,
      closed: true,
      description: "Limpeza geral do piso e carga de material de constru\xE7\xE3o durante a di\xE1ria.",
      requirements: ["Limpeza de piso e carga de material", "Botina pr\xF3pria"]
    },
    "BC-4698": {
      id: "BC-4698",
      companyId: "alvorada",
      role: "Pintor",
      pay: 190,
      location: "Mooca, SP",
      address: "Rua da Mooca, 3180",
      distance: "4,4 km",
      date: "Qui, 21 ago",
      dateLong: "Qui, 21 ago \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      closed: true,
      description: "Pintura interna em parede lisa, duas dem\xE3os de tinta acr\xEDlica.",
      requirements: ["Pintura interna", "Rolo e pincel pr\xF3prios"]
    },
    "BC-4960": {
      id: "BC-4960",
      companyId: "meridiano",
      role: "Pintor",
      pay: 190,
      location: "Mooca, SP",
      address: "Rua da Mooca, 3180",
      distance: "4,4 km",
      date: "Qui, 21 ago",
      dateLong: "Qui, 21 ago \xB7 8h\u201317h",
      hours: "8h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      closed: true,
      description: "Pintura interna em parede lisa, duas dem\xE3os de tinta acr\xEDlica.",
      requirements: ["Pintura interna", "Rolo e pincel pr\xF3prios"]
    },
    "BC-4944": {
      id: "BC-4944",
      companyId: "meridiano",
      role: "Armador",
      pay: 240,
      location: "Penha, SP",
      address: "Rua Cantagalo, 890",
      distance: "5,0 km",
      date: "Sex, 15 ago",
      dateLong: "Sex, 15 ago \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "3 di\xE1rias",
      slots: 2,
      closed: true,
      semContratacao: true,
      description: "Montagem da ferragem de laje de um pavimento, seguindo projeto estrutural fornecido pela construtora.",
      requirements: ["Montagem de ferragem de laje"]
    },
    "BC-4918": {
      id: "BC-4918",
      companyId: "meridiano",
      role: "Pedreiro de acabamento",
      pay: 220,
      location: "Tatuap\xE9, SP",
      address: "Rua Serra de Bragan\xE7a, 1240",
      distance: "3,2 km",
      date: "18 ago",
      dateLong: "18 ago \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      closed: true,
      description: "Reboco e regulariza\xE7\xE3o de parede externa numa reforma residencial.",
      requirements: ["Experi\xEAncia com reboco e massa corrida"]
    },
    "BC-4899": {
      id: "BC-4899",
      companyId: "meridiano",
      role: "Pedreiro de acabamento",
      pay: 220,
      location: "Tatuap\xE9, SP",
      address: "Rua Serra de Bragan\xE7a, 1240",
      distance: "3,2 km",
      date: "14 ago",
      dateLong: "14 ago \xB7 7h\u201317h",
      hours: "7h\u201317h",
      duration: "1 di\xE1ria",
      slots: 1,
      closed: true,
      description: "Acabamento em massa corrida antes da pintura, numa reforma residencial.",
      requirements: ["Experi\xEAncia com reboco e massa corrida"]
    },
    "BC-4870": {
      id: "BC-4870",
      companyId: "meridiano",
      role: "Servente de obra",
      pay: 150,
      location: "Vila Prudente, SP",
      address: "Av. Vila Ema, 2790",
      distance: "6,8 km",
      date: "9 ago",
      dateLong: "9 ago \xB7 7h\u201316h",
      hours: "7h\u201316h",
      duration: "1 di\xE1ria",
      slots: 1,
      closed: true,
      description: "Carga de material de constru\xE7\xE3o e limpeza do piso ao fim do expediente.",
      requirements: ["Carregar material e limpar o piso"]
    }
  };
  var APPLICATIONS = [
    { id: "a1", jobId: "BC-4821", workerId: "jorge", status: "pre_selecionado" },
    { id: "a2", jobId: "BC-4821", workerId: "edson", status: "em_analise" },
    { id: "a3", jobId: "BC-4821", workerId: "marcos", status: "em_analise" },
    { id: "a4", jobId: "BC-4821", workerId: "vitor", status: "em_analise" },
    { id: "a5", jobId: "BC-4821", workerId: "caio", status: "em_analise" },
    { id: "a6", jobId: "BC-4830", workerId: "jorge", status: "em_analise" },
    { id: "a7", jobId: "BC-4835", workerId: "jorge", status: "enviada" },
    { id: "a8", jobId: "BC-4712", workerId: "jorge", status: "contratado" },
    { id: "a9", jobId: "BC-4703", workerId: "jorge", status: "concluida" },
    { id: "a10", jobId: "BC-4698", workerId: "jorge", status: "nao_selecionado" },
    { id: "a11", jobId: "BC-4998", workerId: "rafael", status: "em_analise" },
    { id: "a12", jobId: "BC-4998", workerId: "bruno", status: "em_analise" },
    { id: "a13", jobId: "BC-4998", workerId: "joel", status: "em_analise" },
    { id: "a14", jobId: "BC-4995", workerId: "nelson", status: "em_analise" },
    { id: "a15", jobId: "BC-4995", workerId: "silas", status: "em_analise" },
    { id: "a16", jobId: "BC-4960", workerId: "marcos", status: "concluida" },
    { id: "a17", jobId: "BC-4918", workerId: "edson", status: "concluida" },
    { id: "a18", jobId: "BC-4899", workerId: "jorge", status: "concluida" },
    { id: "a19", jobId: "BC-4870", workerId: "antonio", status: "concluida" }
  ];
  var SAVED_JOB_IDS = ["BC-4841", "BC-4848", "BC-4712", "BC-4698"];
  var CARGOS_TRABALHADOR = ["Pedreiro de acabamento", "Servente de obra", "Pintor", "Eletricista", "Azulejista", "Armador", "Ajudante geral", "Encanador"];
  var REGIOES_TRABALHADOR = ["Tatuap\xE9, SP", "Mooca, SP", "Penha, SP", "Vila Prudente, SP", "Bel\xE9m, SP", "Vila Formosa, SP"];
  var ESPECIALIDADES = ["Acabamento", "Alvenaria", "Reboco", "Assentamento", "Pintura", "El\xE9trica", "Hidr\xE1ulica"];
  var TIPOS_OBRA = ["Residencial", "Comercial", "Reforma", "Residencial e reforma", "Industrial"];
  var REGIOES_RECRUTADOR = ["Zona Leste, SP", "Zona Norte, SP", "Zona Sul, SP", "Zona Oeste, SP", "Centro, SP"];
  var TIPOS_SERVICO = ["Pedreiro", "Servente", "Azulejista", "Pintor", "Armador", "Ajudante geral"];
  var REQUISITOS_OPCOES = ["Botina e capacete pr\xF3prios", "Ferramenta pr\xF3pria", "Experi\xEAncia comprovada", "Chegar 10 min antes", "EPI fornecido pela obra"];
  var LOCAIS_BAIRRO = ["Tatuap\xE9, SP", "Mooca, SP", "Penha, SP", "Vila Prudente, SP", "Bel\xE9m, SP"];
  var WORKER_POSTS = [
    { id: "wp1", workerId: "jorge", mediaUrl: null, mediaType: "image", caption: "Reboco e regulariza\xE7\xE3o de parede externa, obra em Tatuap\xE9. Dois dias de servi\xE7o.", date: "2026-09-10" },
    { id: "wp2", workerId: "jorge", mediaUrl: null, mediaType: "image", caption: "Acabamento em massa corrida antes da pintura. Cliente pediu prazo curto e entreguei em 1 di\xE1ria.", date: "2026-08-22" },
    { id: "wp3", workerId: "jorge", mediaUrl: null, mediaType: "image", caption: "Assentamento de contrapiso em \xE1rea externa.", date: "2026-08-05" }
  ];

  // js/store.js
  function clone(x) {
    return JSON.parse(JSON.stringify(x));
  }
  var state = {
    role: "trabalhador",
    // demo account switch — which side of the marketplace is "logged in"
    db: {
      jobs: clone(JOBS),
      applications: clone(APPLICATIONS),
      savedJobIds: [...SAVED_JOB_IDS],
      deletedJobIds: [],
      workerPosts: clone(WORKER_POSTS)
    },
    ui: {}
  };
  var listeners = /* @__PURE__ */ new Set();
  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function notify() {
    listeners.forEach((fn) => fn());
  }
  function getRole() {
    return state.role;
  }
  function setRole(role) {
    state.role = role;
    notify();
  }
  function getUI(key, defaults) {
    if (!(key in state.ui)) state.ui[key] = typeof defaults === "function" ? defaults() : Object.assign({}, defaults);
    return state.ui[key];
  }
  function setUI(key, patch) {
    const cur = state.ui[key] || {};
    state.ui[key] = Object.assign({}, cur, typeof patch === "function" ? patch(cur) : patch);
    notify();
  }
  function resetUI(key) {
    delete state.ui[key];
    notify();
  }
  function getCompany(id) {
    return COMPANIES[id];
  }
  function allCompanies() {
    return Object.values(COMPANIES);
  }
  function currentCompany() {
    return COMPANIES[CURRENT_COMPANY_ID];
  }
  function currentCompanyId() {
    return CURRENT_COMPANY_ID;
  }
  function getWorker(id) {
    return WORKERS[id];
  }
  function allWorkers() {
    return Object.values(WORKERS);
  }
  function currentWorker() {
    return WORKERS[CURRENT_WORKER_ID];
  }
  function currentWorkerId() {
    return CURRENT_WORKER_ID;
  }
  function allJobs() {
    return Object.values(state.db.jobs);
  }
  function getJob(id) {
    return state.db.jobs[id];
  }
  function activeJobs() {
    return allJobs().filter((j) => state.db.deletedJobIds.indexOf(j.id) < 0);
  }
  function isMine(job) {
    return job.companyId === CURRENT_COMPANY_ID;
  }
  function successfulJobsForCompany(companyId) {
    return allJobs().filter((j) => j.companyId === companyId && j.closed && !j.semContratacao).length;
  }
  function createJob(job) {
    state.db.jobs[job.id] = job;
    notify();
    return job.id;
  }
  function deleteJobPost(jobId) {
    state.db.deletedJobIds.push(jobId);
    notify();
  }
  function updateJob(jobId, patch) {
    const job = state.db.jobs[jobId];
    if (job) {
      Object.assign(job, patch);
      notify();
    }
  }
  function closeJob(jobId) {
    const job = getJob(jobId);
    if (!job) return;
    const hired = approvedCount(jobId) > 0;
    job.closed = true;
    if (!hired) job.semContratacao = true;
    applicationsForJob(jobId).forEach((a) => {
      if (a.status === "enviada" || a.status === "em_analise") a.status = "nao_selecionado";
    });
    notify();
  }
  function applicationsForJob(jobId) {
    return state.db.applications.filter((a) => a.jobId === jobId);
  }
  function applicationsForWorker(workerId) {
    return state.db.applications.filter((a) => a.workerId === workerId);
  }
  function applicationFor(jobId, workerId) {
    return state.db.applications.find((a) => a.jobId === jobId && a.workerId === workerId) || null;
  }
  function approvedCount(jobId) {
    return state.db.applications.filter((a) => a.jobId === jobId && (a.status === "pre_selecionado" || a.status === "contratado")).length;
  }
  function pendingCount(jobId) {
    return state.db.applications.filter((a) => a.jobId === jobId && (a.status === "enviada" || a.status === "em_analise")).length;
  }
  function isJobFull(job) {
    return approvedCount(job.id) >= (job.slots || 1);
  }
  function isJobClosed(job) {
    return Boolean(job.closed) || isJobFull(job);
  }
  function applyToJob(jobId, workerId) {
    if (!applicationFor(jobId, workerId)) {
      state.db.applications.push({ id: "a" + Date.now(), jobId, workerId, status: "enviada" });
    }
    notify();
  }
  function cancelApplication(jobId, workerId) {
    const i = state.db.applications.findIndex((a) => a.jobId === jobId && a.workerId === workerId);
    if (i >= 0) {
      state.db.applications.splice(i, 1);
      notify();
    }
  }
  function decideApplication(jobId, workerId, decision) {
    const app = applicationFor(jobId, workerId);
    if (!app) return;
    app.status = decision === "aprovado" ? "pre_selecionado" : decision === "recusado" ? "nao_selecionado" : "em_analise";
    const job = getJob(jobId);
    if (decision === "aprovado" && job && approvedCount(jobId) >= (job.slots || 1)) {
      applicationsForJob(jobId).forEach((a) => {
        if (a.status === "enviada" || a.status === "em_analise") a.status = "nao_selecionado";
      });
    }
    notify();
  }
  function markReviewed(jobId, workerId) {
    const app = applicationFor(jobId, workerId);
    if (app) {
      app.status = "avaliada";
      notify();
    }
  }
  function isJobSaved(jobId) {
    return state.db.savedJobIds.indexOf(jobId) >= 0;
  }
  function toggleSavedJob(jobId) {
    const i = state.db.savedJobIds.indexOf(jobId);
    if (i >= 0) state.db.savedJobIds.splice(i, 1);
    else state.db.savedJobIds.push(jobId);
    notify();
  }
  function savedJobs() {
    return state.db.savedJobIds.map((id) => getJob(id)).filter(Boolean);
  }
  function postsForWorker(workerId) {
    return state.db.workerPosts.filter((p) => p.workerId === workerId).sort((a, b) => a.date < b.date ? 1 : -1);
  }
  function addWorkerPost(workerId, { mediaUrl, mediaType, caption }) {
    state.db.workerPosts.unshift({ id: "wp" + Date.now(), workerId, mediaUrl, mediaType, caption, date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    notify();
  }
  function deleteWorkerPost(postId) {
    const i = state.db.workerPosts.findIndex((p) => p.id === postId);
    if (i >= 0) {
      state.db.workerPosts.splice(i, 1);
      notify();
    }
  }

  // js/utils/iconData.js
  var ICON_DATA = {
    "arrow-left": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-arrow-left%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m12%2019-7-7%207-7%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M19%2012H5%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "arrow-right": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-arrow-right%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M5%2012h14%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m12%205%207%207-7%207%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "bell": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-bell%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M10.268%2021a2%202%200%200%200%203.464%200%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3.262%2015.326A1%201%200%200%200%204%2017h16a1%201%200%200%200%20.74-1.673C19.41%2013.956%2018%2012.499%2018%208A6%206%200%200%200%206%208c0%204.499-1.411%205.956-2.738%207.326%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "bookmark-solid": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-bookmark-solid%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22%23000%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M17%203a2%202%200%200%201%202%202v15a1%201%200%200%201-1.496.868l-4.512-2.578a2%202%200%200%200-1.984%200l-4.512%202.578A1%201%200%200%201%205%2020V5a2%202%200%200%201%202-2z%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "bookmark-x": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-bookmark-x%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m14.5%207.5-5%205%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M17%203a2%202%200%200%201%202%202v15a1%201%200%200%201-1.496.868l-4.512-2.578a2%202%200%200%200-1.984%200l-4.512%202.578A1%201%200%200%201%205%2020V5a2%202%200%200%201%202-2z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m9.5%207.5%205%205%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "bookmark": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-bookmark%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M17%203a2%202%200%200%201%202%202v15a1%201%200%200%201-1.496.868l-4.512-2.578a2%202%200%200%200-1.984%200l-4.512%202.578A1%201%200%200%201%205%2020V5a2%202%200%200%201%202-2z%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "brick-wall": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-brick-wall%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Crect%20width%3D%2218%22%20height%3D%2218%22%20x%3D%223%22%20y%3D%223%22%20rx%3D%222%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%209v6%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M16%2015v6%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M16%203v6%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%2015h18%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%209h18%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M8%2015v6%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M8%203v6%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "building-2": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-building-2%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M10%2012h4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M10%208h4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M14%2021v-3a2%202%200%200%200-4%200v3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M6%2010H4a2%202%200%200%200-2%202v7a2%202%200%200%200%202%202h16a2%202%200%200%200%202-2V9a2%202%200%200%200-2-2h-2%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M6%2021V5a2%202%200%200%201%202-2h8a2%202%200%200%201%202%202v16%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "calendar": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-calendar%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M8%202v3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M16%202v3%22%20%2F%3E%0A%20%20%3Crect%20x%3D%223%22%20y%3D%223%22%20width%3D%2218%22%20height%3D%2218%22%20rx%3D%222%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%209h18%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "camera": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-camera%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M13.997%204a2%202%200%200%201%201.76%201.05l.486.9A2%202%200%200%200%2018.003%207H20a2%202%200%200%201%202%202v9a2%202%200%200%201-2%202H4a2%202%200%200%201-2-2V9a2%202%200%200%201%202-2h1.997a2%202%200%200%200%201.759-1.048l.489-.904A2%202%200%200%201%2010.004%204z%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2213%22%20r%3D%223%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "check": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-check%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M20%206%209%2017l-5-5%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "chevron-down": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-chevron-down%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m6%209%206%206%206-6%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "chevron-left": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-chevron-left%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m15%2018-6-6%206-6%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "chevron-right": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-chevron-right%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m9%2018%206-6-6-6%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "circle-alert": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-circle-alert%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20%2F%3E%0A%20%20%3Cline%20x1%3D%2212%22%20x2%3D%2212%22%20y1%3D%228%22%20y2%3D%2212%22%20%2F%3E%0A%20%20%3Cline%20x1%3D%2212%22%20x2%3D%2212.01%22%20y1%3D%2216%22%20y2%3D%2216%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "circle-check": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-circle-check%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m16%209-5.5%205.5L8%2012%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "circle-x": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-circle-x%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m15%209-6%206%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m9%209%206%206%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "circle": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-circle%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "clock": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-clock%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%206v6l4%202%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "construction": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-construction%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Crect%20x%3D%222%22%20y%3D%226%22%20width%3D%2220%22%20height%3D%228%22%20rx%3D%221%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M17%2014v7%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M7%2014v7%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M17%203v3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M7%203v3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M10%2014%202.3%206.3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m14%206%207.7%207.7%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m8%206%208%208%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "download": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-download%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M12%2015V3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M21%2015v4a2%202%200%200%201-2%202H5a2%202%200%200%201-2-2v-4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m7%2010%205%205%205-5%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "droplets": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-droplets%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M7%2016.3c2.2%200%204-1.83%204-4.05%200-1.16-.57-2.26-1.71-3.19S7.29%206.75%207%205.3c-.29%201.45-1.14%202.84-2.29%203.76S3%2011.1%203%2012.25c0%202.22%201.8%204.05%204%204.05z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12.56%206.6A10.97%2010.97%200%200%200%2014%203.02c.5%202.5%202%204.9%204%206.5s3%203.5%203%205.5a6.98%206.98%200%200%201-11.91%204.97%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "file-check": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-file-check%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M6%2022a2%202%200%200%201-2-2V4a2%202%200%200%201%202-2h8a2.4%202.4%200%200%201%201.704.706l3.588%203.588A2.4%202.4%200%200%201%2020%208v12a2%202%200%200%201-2%202z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M14%202v5a1%201%200%200%200%201%201h5%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m9%2015%202%202%204-4%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "globe": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-globe%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%202a14.5%2014.5%200%200%200%200%2020%2014.5%2014.5%200%200%200%200-20%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M2%2012h20%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "hammer": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-hammer%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m15%2012-9.373%209.373a1%201%200%200%201-3.001-3L12%209%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m18%2015%204-4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m21.5%2011.5-1.914-1.914A2%202%200%200%201%2019%208.172v-.344a2%202%200%200%200-.586-1.414l-1.657-1.657A6%206%200%200%200%2012.516%203H9l1.243%201.243A6%206%200%200%201%2012%208.485V10l2%202h1.172a2%202%200%200%201%201.414.586L18.5%2014.5%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "hand-coins": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-hand-coins%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M11%2015h2a2%202%200%201%200%200-4h-3c-.6%200-1.1.2-1.4.6L3%2017%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m7%2021%201.6-1.4c.3-.4.8-.6%201.4-.6h4c1.1%200%202.1-.4%202.8-1.2l4.6-4.4a2%202%200%200%200-2.75-2.91l-4.2%203.9%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m2%2016%206%206%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2216%22%20cy%3D%229%22%20r%3D%222.9%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%226%22%20cy%3D%225%22%20r%3D%223%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "handshake": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-handshake%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m11%2017%202%202a1%201%200%201%200%203-3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m14%2014%202.5%202.5a1%201%200%201%200%203-3l-3.88-3.88a3%203%200%200%200-4.24%200l-.88.88a1%201%200%201%201-3-3l2.81-2.81a5.79%205.79%200%200%201%207.06-.87l.47.28a2%202%200%200%200%201.42.25L21%204%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m21%203%201%2011h-2%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%203%202%2014l6.5%206.5a1%201%200%201%200%203-3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%204h8%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "hard-hat": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-hard-hat%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M10%2010V5a1%201%200%200%201%201-1h2a1%201%200%200%201%201%201v5%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M14%206a6%206%200%200%201%206%206v3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M4%2015v-3a6%206%200%200%201%206-6%22%20%2F%3E%0A%20%20%3Crect%20x%3D%222%22%20y%3D%2215%22%20width%3D%2220%22%20height%3D%224%22%20rx%3D%221%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "history": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-history%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M3%2012a9%209%200%201%200%209-9%209.75%209.75%200%200%200-6.74%202.74L3%208%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%203v5h5%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%207v5l4%202%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "house": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-house%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M15%2021v-8a1%201%200%200%200-1-1h-4a1%201%200%200%200-1%201v8%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%2010a2%202%200%200%201%20.709-1.528l7-6a2%202%200%200%201%202.582%200l7%206A2%202%200%200%201%2021%2010v9a2%202%200%200%201-2%202H5a2%202%200%200%201-2-2z%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "id-card": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-id-card%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M13%2019a4%204%200%2000-8%200%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M16%2010h2%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M16%2014h2%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%229%22%20cy%3D%2212%22%20r%3D%223%22%20%2F%3E%0A%20%20%3Crect%20x%3D%222%22%20y%3D%225%22%20width%3D%2220%22%20height%3D%2214%22%20rx%3D%222%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "images": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-images%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m22%2011-1.296-1.296a2.4%202.4%200%200%200-3.408%200L11%2016%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M4%208a2%202%200%200%200-2%202v10a2%202%200%200%200%202%202h10a2%202%200%200%200%202-2%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2213%22%20cy%3D%227%22%20r%3D%221%22%20fill%3D%22currentColor%22%20%2F%3E%0A%20%20%3Crect%20x%3D%228%22%20y%3D%222%22%20width%3D%2214%22%20height%3D%2214%22%20rx%3D%222%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "layout-grid": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-layout-grid%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Crect%20width%3D%227%22%20height%3D%227%22%20x%3D%223%22%20y%3D%223%22%20rx%3D%221%22%20%2F%3E%0A%20%20%3Crect%20width%3D%227%22%20height%3D%227%22%20x%3D%2214%22%20y%3D%223%22%20rx%3D%221%22%20%2F%3E%0A%20%20%3Crect%20width%3D%227%22%20height%3D%227%22%20x%3D%2214%22%20y%3D%2214%22%20rx%3D%221%22%20%2F%3E%0A%20%20%3Crect%20width%3D%227%22%20height%3D%227%22%20x%3D%223%22%20y%3D%2214%22%20rx%3D%221%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "locate-fixed": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-locate-fixed%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cline%20x1%3D%222%22%20x2%3D%225%22%20y1%3D%2212%22%20y2%3D%2212%22%20%2F%3E%0A%20%20%3Cline%20x1%3D%2219%22%20x2%3D%2222%22%20y1%3D%2212%22%20y2%3D%2212%22%20%2F%3E%0A%20%20%3Cline%20x1%3D%2212%22%20x2%3D%2212%22%20y1%3D%222%22%20y2%3D%225%22%20%2F%3E%0A%20%20%3Cline%20x1%3D%2212%22%20x2%3D%2212%22%20y1%3D%2219%22%20y2%3D%2222%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%227%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%223%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "lock": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-lock%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Crect%20width%3D%2218%22%20height%3D%2211%22%20x%3D%223%22%20y%3D%2211%22%20rx%3D%222%22%20ry%3D%222%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M7%2011V7a5%205%200%200%201%2010%200v4%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "log-out": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-log-out%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m16%2017%205-5-5-5%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M21%2012H9%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M9%2021H5a2%202%200%200%201-2-2V5a2%202%200%200%201%202-2h4%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "mail-check": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-mail-check%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M22%2013V6a2%202%200%200%200-2-2H4a2%202%200%200%200-2%202v12c0%201.1.9%202%202%202h8%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m22%207-8.97%205.7a1.94%201.94%200%200%201-2.06%200L2%207%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m16%2019%202%202%204-4%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "mail": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-mail%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m22%207-8.991%205.727a2%202%200%200%201-2.009%200L2%207%22%20%2F%3E%0A%20%20%3Crect%20x%3D%222%22%20y%3D%224%22%20width%3D%2220%22%20height%3D%2216%22%20rx%3D%222%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "map-pin": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-map-pin%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M20%2010c0%204.993-5.539%2010.193-7.399%2011.799a1%201%200%200%201-1.202%200C9.539%2020.193%204%2014.993%204%2010a8%208%200%200%201%2016%200%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2210%22%20r%3D%223%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "menu": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-menu%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M4%205h16%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M4%2012h16%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M4%2019h16%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "message-circle": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-message-circle%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M2.992%2016.342a2%202%200%200%201%20.094%201.167l-1.065%203.29a1%201%200%200%200%201.236%201.168l3.413-.998a2%202%200%200%201%201.099.092%2010%2010%200%201%200-4.777-4.719%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "paint-roller": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-paint-roller%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Crect%20width%3D%2216%22%20height%3D%226%22%20x%3D%222%22%20y%3D%222%22%20rx%3D%222%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M10%2016v-2a2%202%200%200%201%202-2h8a2%202%200%200%200%202-2V7a2%202%200%200%200-2-2h-2%22%20%2F%3E%0A%20%20%3Crect%20width%3D%224%22%20height%3D%226%22%20x%3D%228%22%20y%3D%2216%22%20rx%3D%221%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "pencil": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-pencil%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M21.174%206.812a1%201%200%200%200-3.986-3.987L3.842%2016.174a2%202%200%200%200-.5.83l-1.321%204.352a.5.5%200%200%200%20.623.622l4.353-1.32a2%202%200%200%200%20.83-.497z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m15%205%204%204%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "phone-call": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-phone-call%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M13%202a9%209%200%200%201%209%209%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M13%206a5%205%200%200%201%205%205%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M13.832%2016.568a1%201%200%200%200%201.213-.303l.355-.465A2%202%200%200%201%2017%2015h3a2%202%200%200%201%202%202v3a2%202%200%200%201-2%202A18%2018%200%200%201%202%204a2%202%200%200%201%202-2h3a2%202%200%200%201%202%202v3a2%202%200%200%201-.8%201.6l-.468.351a1%201%200%200%200-.292%201.233%2014%2014%200%200%200%206.392%206.384%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "phone": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-phone%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M13.832%2016.568a1%201%200%200%200%201.213-.303l.355-.465A2%202%200%200%201%2017%2015h3a2%202%200%200%201%202%202v3a2%202%200%200%201-2%202A18%2018%200%200%201%202%204a2%202%200%200%201%202-2h3a2%202%200%200%201%202%202v3a2%202%200%200%201-.8%201.6l-.468.351a1%201%200%200%200-.292%201.233%2014%2014%200%200%200%206.392%206.384%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "plug-zap": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-plug-zap%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M6.3%2020.3a2.4%202.4%200%200%200%203.4%200L12%2018l-6-6-2.3%202.3a2.4%202.4%200%200%200%200%203.4Z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m2%2022%203-3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M7.5%2013.5%2010%2011%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M10.5%2016.5%2013%2014%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m18%203-4%204h6l-4%204%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "plus": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-plus%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M5%2012h14%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%205v14%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "ruler": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-ruler%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M21.3%2015.3a2.4%202.4%200%200%201%200%203.4l-2.6%202.6a2.4%202.4%200%200%201-3.4%200L2.7%208.7a2.41%202.41%200%200%201%200-3.4l2.6-2.6a2.41%202.41%200%200%201%203.4%200Z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m14.5%2012.5%202-2%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m11.5%209.5%202-2%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m8.5%206.5%202-2%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m17.5%2015.5%202-2%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "search-x": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-search-x%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m13.5%208.5-5%205%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m8.5%208.5%205%205%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2211%22%20cy%3D%2211%22%20r%3D%228%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m21%2021-4.3-4.3%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "search": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-search%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m21%2021-4.34-4.34%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2211%22%20cy%3D%2211%22%20r%3D%228%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "send": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-send%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M14.536%2021.686a.5.5%200%200%200%20.937-.024l6.5-19a.496.496%200%200%200-.635-.635l-19%206.5a.5.5%200%200%200-.024.937l7.93%203.18a2%202%200%200%201%201.112%201.11z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m21.854%202.147-10.94%2010.939%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "settings": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-settings%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M9.671%204.136a2.34%202.34%200%200%201%204.659%200%202.34%202.34%200%200%200%203.319%201.915%202.34%202.34%200%200%201%202.33%204.033%202.34%202.34%200%200%200%200%203.831%202.34%202.34%200%200%201-2.33%204.033%202.34%202.34%200%200%200-3.319%201.915%202.34%202.34%200%200%201-4.659%200%202.34%202.34%200%200%200-3.32-1.915%202.34%202.34%200%200%201-2.33-4.033%202.34%202.34%200%200%200%200-3.831A2.34%202.34%200%200%201%206.35%206.051a2.34%202.34%200%200%200%203.319-1.915%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%223%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "shield-check": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-shield-check%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M20%2013c0%205-3.5%207.5-7.66%208.95a1%201%200%200%201-.67-.01C7.5%2020.5%204%2018%204%2013V6a1%201%200%200%201%201-1c2%200%204.5-1.2%206.24-2.72a1.17%201.17%200%200%201%201.52%200C14.51%203.81%2017%205%2019%205a1%201%200%200%201%201%201z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m9%2012%202%202%204-4%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "shovel": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-shovel%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M21.56%204.56a1.5%201.5%200%200%201%200%202.122l-.47.47a3%203%200%200%201-4.212-.03%203%203%200%200%201%200-4.243l.44-.44a1.5%201.5%200%200%201%202.121%200z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%2022a1%201%200%200%201-1-1v-3.586a1%201%200%200%201%20.293-.707l3.355-3.355a1.205%201.205%200%200%201%201.704%200l3.296%203.296a1.205%201.205%200%200%201%200%201.704l-3.355%203.355a1%201%200%200%201-.707.293z%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m9%2015%207.879-7.878%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "sliders-horizontal": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-sliders-horizontal%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M10%205H3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%2019H3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M14%203v4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M16%2017v4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M21%2012h-9%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M21%2019h-5%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M21%205h-7%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M8%2010v4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M8%2012H3%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "smartphone": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-smartphone%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Crect%20width%3D%2214%22%20height%3D%2220%22%20x%3D%225%22%20y%3D%222%22%20rx%3D%222%22%20ry%3D%222%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%2018h.01%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "star": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-star%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M11.525%202.295a.53.53%200%200%201%20.95%200l2.31%204.679a2.123%202.123%200%200%200%201.595%201.16l5.166.756a.53.53%200%200%201%20.294.904l-3.736%203.638a2.123%202.123%200%200%200-.611%201.878l.882%205.14a.53.53%200%200%201-.771.56l-4.618-2.428a2.122%202.122%200%200%200-1.973%200L6.396%2021.01a.53.53%200%200%201-.77-.56l.881-5.139a2.122%202.122%200%200%200-.611-1.879L2.16%209.795a.53.53%200%200%201%20.294-.906l5.165-.755a2.122%202.122%200%200%200%201.597-1.16z%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "trash-2": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-trash-2%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M10%2011v6%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M14%2011v6%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M19%206v14a2%202%200%200%201-2%202H7a2%202%200%200%201-2-2V6%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M3%206h18%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M8%206V4a2%202%200%200%201%202-2h4a2%202%200%200%201%202%202v2%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "triangle-alert": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-triangle-alert%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22m21.73%2018-8-14a2%202%200%200%200-3.48%200l-8%2014A2%202%200%200%200%204%2021h16a2%202%200%200%200%201.73-3%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%209v4%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%2017h.01%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "user": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-user%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M19%2021v-2a4%204%200%200%200-4-4H9a4%204%200%200%200-4%204v2%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%227%22%20r%3D%224%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "users": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-users%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M16%2021v-2a4%204%200%200%200-4-4H6a4%204%200%200%200-4%204v2%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M16%203.128a4%204%200%200%201%200%207.744%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M22%2021v-2a4%204%200%200%200-3-3.87%22%20%2F%3E%0A%20%20%3Ccircle%20cx%3D%229%22%20cy%3D%227%22%20r%3D%224%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "wifi-off": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-wifi-off%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M12%2020h.01%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M8.5%2016.429a5%205%200%200%201%207%200%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M5%2012.859a10%2010%200%200%201%205.17-2.69%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M19%2012.859a10%2010%200%200%200-2.007-1.523%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M2%208.82a15%2015%200%200%201%204.177-2.643%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22M22%208.82a15%2015%200%200%200-11.288-3.764%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m2%202%2020%2020%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "x": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-x%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M18%206%206%2018%22%20%2F%3E%0A%20%20%3Cpath%20d%3D%22m6%206%2012%2012%22%20%2F%3E%0A%3C%2Fsvg%3E",
    "zap": "data:image/svg+xml,%3C!--%20%40license%20lucide-static%20v1.46.0%20-%20ISC%20--%3E%0A%3Csvg%0A%20%20class%3D%22lucide%20lucide-zap%22%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpath%20d%3D%22M15.914%204a1.5%201.5%200%2000-2.474-1.561l-9%209A1.5%201.5%200%20005.5%2014h4.002a.5.5%200%2001.471.666L8.086%2020a1.5%201.5%200%20002.475%201.56l9-9A1.5%201.5%200%200018.5%2010h-3.997a.5.5%200%2001-.472-.667z%22%20%2F%3E%0A%3C%2Fsvg%3E"
  };

  // js/utils/icons.js
  var GOOGLE_G_SVG = `<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
  <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.6154z"/>
  <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"/>
  <path fill="#FBBC05" d="M3.9641 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9641 10.71z"/>
  <path fill="#EA4335" d="M9 3.5782c1.3214 0 2.5077.4541 3.4405 1.346l2.5818-2.5818C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6718 5.1627 6.6559 3.5782 9 3.5782z"/>
</svg>`;
  function GoogleIcon({ size = 20 } = {}) {
    const el = h("span", { class: "shrink-0 inline-flex", style: { width: rem(size), height: rem(size) } });
    el.innerHTML = GOOGLE_G_SVG;
    el.firstElementChild.setAttribute("width", "100%");
    el.firstElementChild.setAttribute("height", "100%");
    return el;
  }
  function Icon(name, { size = 20, color, className = "", label } = {}) {
    const url = ICON_DATA[name];
    const el = h("span", {
      class: `icon shrink-0 ${className}`,
      style: {
        width: rem(size),
        height: rem(size),
        WebkitMaskImage: url ? `url("${url}")` : "none",
        maskImage: url ? `url("${url}")` : "none",
        color: color || "currentColor"
      }
    });
    if (!url) el.style.backgroundColor = "transparent";
    if (label) {
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", label);
    } else {
      el.setAttribute("aria-hidden", "true");
    }
    return el;
  }

  // js/components/AppNav.js
  var ITEMS = {
    trabalhador: [
      { id: "mural", icon: "hammer", label: "Vagas", path: "/mural" },
      { id: "minhas-candidaturas", icon: "file-check", label: "Minhas", desktopLabel: "Candidaturas", path: "/minhas-candidaturas" },
      { id: "perfil", icon: "user", label: "Perfil", path: "/perfil" }
    ],
    recrutador: [
      { id: "mural", icon: "hammer", label: "In\xEDcio", path: "/mural" },
      { id: "criar-vaga", icon: "plus", label: "Publicar", desktopLabel: "Publicar vaga", path: "/criar-vaga" },
      { id: "empresa", icon: "building-2", label: "Perfil", path: "/empresa" }
    ]
  };
  var MENU = {
    trabalhador: [
      { icon: "user", label: "Meu perfil", path: "/perfil" },
      { icon: "bookmark", label: "Vagas salvas", path: "/vagas-salvas" },
      { icon: "bell", label: "Notifica\xE7\xF5es", path: "/notificacoes" },
      { icon: "settings", label: "Configura\xE7\xF5es", path: "/configuracoes" }
    ],
    recrutador: [
      { icon: "building-2", label: "Minha empresa", path: "/empresa" },
      { icon: "history", label: "Bicos fechados", path: "/historico" },
      { icon: "bell", label: "Notifica\xE7\xF5es", path: "/notificacoes" },
      { icon: "settings", label: "Configura\xE7\xF5es", path: "/configuracoes" }
    ]
  };
  var MENU_KEY = "app-nav";
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      const header = document.querySelector(".app-header");
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && getUI(MENU_KEY, { menuOpen: false }).menuOpen) setUI(MENU_KEY, { menuOpen: false });
    });
  }
  function AppNav({ role, active, navigate: navigate2, badges = {}, showMobilePill = true, flush = false, notifications = 0, account = {} }) {
    const items = ITEMS[role] || ITEMS.trabalhador;
    const mobile = showMobilePill ? h("nav", {
      "aria-label": "Navega\xE7\xE3o principal",
      class: "lg:hidden fixed left-1/2 -translate-x-1/2 z-30 flex items-center gap-3.5 rounded-full px-5 py-2 shadow-raised border border-white/60",
      style: { bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))", backgroundColor: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px) saturate(1.6)", WebkitBackdropFilter: "blur(16px) saturate(1.6)" }
    }, ...items.map((it) => navPill(it, active, navigate2, badges))) : null;
    return h("div", { class: "contents" }, mobile, topBar({ role, items, active, navigate: navigate2, badges, flush, notifications, account }));
  }
  function navPill(it, active, navigate2, badges) {
    const isActive = active === it.id;
    return h(
      "button",
      {
        type: "button",
        "aria-label": it.label,
        "aria-current": isActive ? "page" : null,
        class: "inline-flex items-center justify-center w-11 h-11 shrink-0",
        onClick: () => navigate2(it.path)
      },
      h(
        "span",
        { class: cx("relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors", isActive ? "bg-brand-500" : "") },
        Icon(it.icon, { size: 22, color: isActive ? "#fff" : "var(--gray-500)" }),
        badges[it.id] ? h("span", { class: "absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 rounded-full bg-danger-500 text-white text-[0.625rem] font-bold leading-4 text-center" }, String(badges[it.id])) : null
      )
    );
  }
  function topBar({ role, items, active, navigate: navigate2, badges, flush, notifications, account }) {
    const menu = getUI(MENU_KEY, { menuOpen: false });
    const go = (path) => {
      setUI(MENU_KEY, { menuOpen: false });
      navigate2(path);
    };
    const logo = h(
      "button",
      { type: "button", class: "inline-flex items-center gap-2.5 rounded-control", "aria-label": "Bicos, ir para o in\xEDcio", onClick: () => go("/mural") },
      h("span", { class: "inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 shadow-raised" }, Icon("hammer", { size: 21, color: "#fff" })),
      h("span", { class: "font-display font-bold text-[1.625rem] leading-none tracking-tight text-brand-500" }, "Bicos")
    );
    const tabs = h(
      "nav",
      { "aria-label": "Navega\xE7\xE3o principal", class: "flex items-stretch self-stretch gap-1 xl:gap-3" },
      ...items.map((it) => topTab(it, active, go, badges))
    );
    const bell = h(
      "button",
      {
        type: "button",
        "aria-label": notifications ? `Notifica\xE7\xF5es, ${notifications} novas` : "Notifica\xE7\xF5es",
        title: "Notifica\xE7\xF5es",
        class: "relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-concrete-100 text-concrete-900 transition-colors hover:bg-concrete-200",
        onClick: () => go("/notificacoes")
      },
      Icon("bell", { size: 18 }),
      notifications ? h("span", { class: "absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-danger-500 text-white text-[0.625rem] font-bold leading-[1.125rem] text-center ring-2 ring-white" }, String(notifications)) : null
    );
    const avatar = h(
      "span",
      { class: cx("inline-flex items-center justify-center w-8 h-8 rounded-full overflow-hidden text-xs font-bold", role === "recrutador" ? "bg-brand-50" : "bg-accent-50 text-accent-600") },
      account.photo ? h("img", { src: account.photo, alt: "", class: "w-full h-full object-cover" }) : role === "recrutador" ? Icon("building-2", { size: 16, color: "var(--brand)" }) : account.initials || ""
    );
    const menuButton = h("button", {
      type: "button",
      "aria-label": "Menu da conta",
      "aria-haspopup": "menu",
      "aria-expanded": menu.menuOpen ? "true" : "false",
      class: cx("inline-flex items-center gap-2.5 h-11 pl-3.5 pr-1.5 rounded-full border bg-white transition-shadow hover:shadow-raised", menu.menuOpen ? "border-concrete-300 shadow-raised" : "border-concrete-200"),
      onClick: () => setUI(MENU_KEY, { menuOpen: !menu.menuOpen })
    }, Icon("menu", { size: 18, color: "var(--gray-700)" }), avatar);
    const dropdown = menu.menuOpen ? [
      h("div", { class: "fixed inset-0 z-40", "aria-hidden": "true", onClick: () => setUI(MENU_KEY, { menuOpen: false }) }),
      h(
        "div",
        { role: "menu", class: "absolute right-0 top-full mt-3 z-50 w-72 py-2 bg-white rounded-2xl border border-concrete-200 shadow-float animate-fade-in" },
        h(
          "div",
          { class: "flex items-center gap-3 px-4 pt-2 pb-3" },
          h(
            "span",
            { class: cx("inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shrink-0 text-sm font-bold", role === "recrutador" ? "bg-brand-50" : "bg-accent-50 text-accent-600") },
            account.photo ? h("img", { src: account.photo, alt: "", class: "w-full h-full object-cover" }) : role === "recrutador" ? Icon("building-2", { size: 20, color: "var(--brand)" }) : account.initials || ""
          ),
          h(
            "div",
            { class: "flex flex-col min-w-0" },
            h("span", { class: "font-semibold text-concrete-900 truncate" }, account.name || ""),
            h("span", { class: "text-sm text-concrete-500 truncate" }, role === "recrutador" ? "Conta de recrutador" : "Conta de trabalhador")
          )
        ),
        h("div", { class: "h-px bg-concrete-200 my-1" }),
        ...(MENU[role] || MENU.trabalhador).map((m) => menuItem(m, () => go(m.path))),
        h("div", { class: "h-px bg-concrete-200 my-1" }),
        menuItem({ icon: "log-out", label: "Sair da conta", danger: true }, () => go("/login"))
      )
    ] : [];
    return h(
      "header",
      { class: cx("app-header hidden lg:block sticky top-0 z-30 bg-white transition-shadow", flush ? "" : "border-b border-concrete-200", window.scrollY > 8 ? "is-scrolled" : "") },
      h(
        "div",
        { class: "page-x h-20 flex items-center gap-6" },
        h("div", { class: "flex-1 min-w-0 flex items-center" }, logo),
        tabs,
        h(
          "div",
          { class: "flex-1 flex items-center justify-end gap-2.5" },
          bell,
          h("div", { class: "relative" }, menuButton, ...dropdown)
        )
      )
    );
  }
  function topTab(it, active, go, badges) {
    const isActive = active === it.id;
    return h(
      "button",
      {
        type: "button",
        "aria-current": isActive ? "page" : null,
        class: cx("group relative inline-flex items-center gap-2.5 px-3 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors", isActive ? "text-concrete-900" : "text-concrete-500 hover:text-concrete-900"),
        onClick: () => go(it.path)
      },
      h(
        "span",
        {
          class: cx(
            "relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all",
            isActive ? "bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-raised" : "bg-concrete-100 text-concrete-600 group-hover:bg-concrete-200"
          )
        },
        Icon(it.icon, { size: 19 }),
        badges[it.id] ? h("span", { class: "absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-danger-500 text-white text-[0.625rem] font-bold leading-[1.125rem] text-center ring-2 ring-white" }, String(badges[it.id])) : null
      ),
      it.desktopLabel || it.label,
      h("span", { class: cx("absolute left-3 right-3 bottom-0 h-[3px] rounded-t-full transition-colors", isActive ? "bg-brand-500" : "bg-transparent group-hover:bg-concrete-200") })
    );
  }
  function menuItem(m, onClick) {
    return h("button", {
      type: "button",
      role: "menuitem",
      class: cx("w-full flex items-center gap-3 px-4 h-11 text-left text-[0.9375rem] transition-colors hover:bg-concrete-50", m.danger ? "text-danger-500 font-semibold" : "text-concrete-800"),
      onClick
    }, Icon(m.icon, { size: 18, color: m.danger ? "var(--red-500)" : "var(--gray-500)" }), m.label);
  }

  // js/utils/applicationStatus.js
  function statusInfo(status, jobId) {
    switch (status) {
      case "enviada":
      case "em_analise":
        return { label: "Em an\xE1lise", tone: "warning", icon: "clock", hint: "Ver a vaga", to: "/vaga/" + jobId };
      case "pre_selecionado":
        return { label: "Pr\xE9-selecionado", tone: "brand", icon: "message-circle", hint: "Falar no WhatsApp", to: "/selecionado/" + jobId };
      case "contratado":
        return { label: "Contratado", tone: "success", icon: "circle-check", hint: "Falar no WhatsApp", to: "/selecionado/" + jobId };
      case "concluida":
        return { label: "Di\xE1ria conclu\xEDda", tone: "accent", icon: "star", hint: "Avaliar a obra", to: "/avaliar/" + jobId };
      case "avaliada":
        return { label: "Avalia\xE7\xE3o enviada", tone: "neutral", icon: "circle-check", hint: "Ver o bico", to: "/vaga/" + jobId };
      case "nao_selecionado":
        return { label: "N\xE3o foi essa vez", tone: "danger", icon: "circle-x", hint: "Ver a vaga", to: "/vaga/" + jobId };
      default:
        return { label: status, tone: "neutral", icon: "circle", hint: "Ver a vaga", to: "/vaga/" + jobId };
    }
  }
  var IN_PROGRESS = /* @__PURE__ */ new Set(["enviada", "em_analise", "pre_selecionado", "contratado"]);
  var CLOSED = /* @__PURE__ */ new Set(["concluida", "avaliada", "nao_selecionado"]);

  // js/components/Button.js
  var VARIANTS = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 border border-transparent",
    secondary: "bg-white text-concrete-900 border border-concrete-300 hover:bg-concrete-50",
    ghost: "bg-transparent text-brand-600 border border-transparent hover:bg-brand-50",
    accent: "bg-accent-500 text-white border border-transparent hover:bg-accent-600",
    danger: "bg-white text-danger-500 border border-danger-100 hover:bg-danger-50",
    inverse: "bg-transparent text-white border border-white/40 hover:bg-white/10"
  };
  var SIZES = {
    sm: "h-11 px-3 text-sm gap-1.5",
    md: "h-12 px-4 text-base gap-2",
    lg: "h-14 px-5 text-base gap-2"
  };
  function Button(props) {
    const {
      label,
      variant = "primary",
      size = "md",
      fullWidth = false,
      iconLeft,
      iconRight,
      iconLeftEl,
      disabled = false,
      loading = false,
      onClick,
      type = "button",
      className = ""
    } = props;
    const btn = h("button", {
      type,
      disabled: disabled || loading,
      "aria-busy": loading ? "true" : null,
      class: cx(
        "inline-flex items-center justify-center rounded-control font-body font-bold whitespace-nowrap select-none",
        "transition-colors duration-150 ease-out active:scale-[0.98]",
        "disabled:bg-concrete-100 disabled:text-concrete-400 disabled:border-concrete-200 disabled:cursor-not-allowed disabled:active:scale-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? "w-full" : "",
        className
      ),
      onClick: disabled || loading ? null : onClick
    });
    if (loading) {
      btn.appendChild(h("span.animate-spin-token", {
        style: { width: "1.1rem", height: "1.1rem", border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "9999px" }
      }));
    } else {
      if (iconLeftEl) btn.appendChild(iconLeftEl);
      else if (iconLeft) btn.appendChild(Icon(iconLeft, { size: 20 }));
      btn.appendChild(h("span", {}, label));
      if (iconRight) btn.appendChild(Icon(iconRight, { size: 20 }));
    }
    return btn;
  }

  // js/screens/shared/Splash.js
  function renderSplash(navigate2) {
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-brand-500" },
      h(
        "div",
        { class: "flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center" },
        h("span", { class: "font-display font-bold text-5xl sm:text-6xl text-white tracking-tight" }, "Bicos"),
        h("p", { class: "max-w-xs sm:max-w-sm text-base sm:text-lg text-white/85" }, "Di\xE1rias de obra perto de voc\xEA. Sem taxa para o trabalhador.")
      ),
      h(
        "div",
        { class: "flex flex-col gap-3 px-6 pb-10 sm:pb-14 w-full max-w-app mx-auto" },
        Button({ label: "Entrar", size: "lg", fullWidth: true, variant: "secondary", onClick: () => navigate2("/login") }),
        Button({ label: "Criar minha conta", size: "lg", fullWidth: true, variant: "inverse", onClick: () => navigate2("/escolha-perfil") })
      )
    );
  }

  // js/components/Radio.js
  var uid = 0;
  function RadioCard({ id, name, icon, label, description, checked = false, onChange: onChange2 }) {
    const fieldId = id || "radio-" + uid++;
    return h(
      "label",
      {
        for: fieldId,
        class: cx(
          "flex items-center gap-3.5 min-h-[5.5rem] p-4 rounded-card border cursor-pointer transition-colors",
          checked ? "bg-brand-50 border-brand-500" : "bg-white border-concrete-300 hover:bg-concrete-50"
        )
      },
      h("input", { id: fieldId, type: "radio", name, checked, class: "sr-only", onchange: onChange2 ? () => onChange2() : null }),
      h("span", {
        class: cx("inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0", checked ? "bg-brand-500 text-white" : "bg-concrete-100 text-concrete-600")
      }, Icon(icon, { size: 22 })),
      h(
        "span",
        { class: "flex flex-col gap-0.5 min-w-0" },
        h("span", { class: cx("text-base font-bold", checked ? "text-brand-600" : "text-concrete-900") }, label),
        h("span", { class: "text-sm text-concrete-500" }, description)
      )
    );
  }
  function Switch({ id, label, description, checked = false, onChange: onChange2 }) {
    const fieldId = id || "switch-" + uid++;
    return h(
      "label",
      { for: fieldId, class: "flex items-center gap-3 min-h-12 py-2 cursor-pointer select-none" },
      h(
        "span",
        { class: "flex-1 min-w-0 flex flex-col gap-0.5" },
        h("span", { class: "text-sm font-semibold text-concrete-900" }, label),
        description ? h("span", { class: "text-sm text-concrete-500" }, description) : null
      ),
      h("input", { id: fieldId, type: "checkbox", checked, class: "sr-only", onchange: onChange2 ? (e) => onChange2(e.target.checked) : null }),
      h(
        "span",
        {
          class: cx("relative inline-flex items-center w-11 h-6 rounded-full shrink-0 transition-colors", checked ? "bg-brand-500" : "bg-concrete-300")
        },
        h("span", {
          class: cx("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform", checked ? "translate-x-[1.375rem]" : "translate-x-0.5")
        })
      )
    );
  }

  // js/components/IconButton.js
  var VARIANTS2 = {
    ghost: "bg-transparent text-concrete-700 hover:bg-concrete-100",
    solid: "bg-white text-concrete-700 shadow-card hover:bg-concrete-50",
    brand: "bg-brand-50 text-brand-600 hover:bg-brand-100"
  };
  var SIZES2 = { sm: "w-10 h-10", md: "w-11 h-11", lg: "w-12 h-12" };
  function IconButton({ icon, label, variant = "ghost", size = "md", onClick, className = "", badge }) {
    const sizeClass = SIZES2[size] || SIZES2.md;
    const btn = h("button", {
      type: "button",
      "aria-label": label,
      title: label,
      class: cx(
        "relative inline-flex items-center justify-center rounded-full shrink-0 transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        VARIANTS2[variant] || VARIANTS2.ghost,
        sizeClass,
        className
      ),
      onClick
    }, Icon(icon, { size: 20 }));
    if (badge) {
      btn.appendChild(h("span", {
        class: "absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 rounded-full bg-danger-500 text-white text-[0.625rem] font-bold leading-4 text-center pointer-events-none"
      }, String(badge)));
    }
    return btn;
  }

  // js/components/TopBar.js
  function BackBar({ title, onBack, actions = [] }) {
    return h(
      "header",
      {
        class: "sticky top-0 z-20 flex items-center gap-1.5 min-h-14 px-2 bg-white border-b border-concrete-200 lg:static lg:bg-transparent lg:border-0 lg:-ml-3 lg:px-0 lg:pb-4 lg:mb-2"
      },
      onBack ? IconButton({ icon: "arrow-left", label: "Voltar", onClick: onBack }) : null,
      h("h1", { class: "flex-1 min-w-0 font-display font-semibold text-xl text-concrete-900 truncate" }, title),
      ...actions.map((a) => IconButton(a))
    );
  }
  function NotificationBell({ count = 0, onClick }) {
    return IconButton({ icon: "bell", label: "Notifica\xE7\xF5es", onClick, badge: count > 0 ? count : null });
  }

  // js/screens/shared/ChooseProfile.js
  var KEY = "escolhaPerfil";
  function renderChooseProfile(navigate2) {
    const ui = getUI(KEY, { role: "trabalhador" });
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50" },
      BackBar({ title: "Criar minha conta", onBack: () => goBack("/login") }),
      h(
        "div",
        { class: "flex-1 max-w-app w-full mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-8 flex flex-col gap-7" },
        h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Criar conta"),
          h("h1", { class: "font-display font-bold text-3xl text-concrete-900" }, "Como voc\xEA vai usar o Bicos?"),
          h("p", { class: "text-base text-concrete-700" }, "D\xE1 para trocar depois no seu perfil.")
        ),
        h(
          "div",
          { class: "flex flex-col gap-3" },
          RadioCard({
            name: "perfil-cadastro",
            icon: "hard-hat",
            label: "Quero pegar bico",
            description: "Sou pedreiro, servente, pintor ou eletricista",
            checked: ui.role === "trabalhador",
            onChange: () => setUI(KEY, { role: "trabalhador" })
          }),
          RadioCard({
            name: "perfil-cadastro",
            icon: "building-2",
            label: "Quero contratar",
            description: "Represento uma construtora ou uma obra",
            checked: ui.role === "recrutador",
            onChange: () => setUI(KEY, { role: "recrutador" })
          })
        )
      ),
      h(
        "div",
        { class: "max-w-app w-full mx-auto px-5 sm:px-8 py-3 sticky bottom-0 bg-white shadow-bar sm:static sm:bg-transparent sm:shadow-none" },
        Button({ label: "Continuar", size: "lg", fullWidth: true, iconRight: "arrow-right", onClick: () => navigate2("/cadastro/" + ui.role) })
      )
    );
  }

  // js/components/Input.js
  var uid2 = 0;
  function Input(props) {
    const {
      id,
      label,
      placeholder = "",
      icon,
      value = "",
      onInput,
      error,
      hint,
      type = "text",
      inputMode,
      mono = false,
      suffix,
      disabled = false,
      autoFocus = false
    } = props;
    const fieldId = id || "field-" + uid2++;
    const wrap = h("div", { class: "flex flex-col gap-1.5 w-full" });
    if (label) wrap.appendChild(h("label", { for: fieldId, class: "text-sm font-semibold text-concrete-900" }, label));
    const row = h("div", {
      class: cx(
        "flex items-center gap-2 min-h-12 px-3 bg-white rounded-control border transition-colors duration-150",
        error ? "border-danger-500" : "border-concrete-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
      )
    });
    if (icon) row.appendChild(Icon(icon, { size: 20, color: "var(--text-subtle)" }));
    const inputEl = h("input", {
      id: fieldId,
      "data-focus-id": fieldId,
      type,
      placeholder,
      inputmode: inputMode || null,
      disabled,
      autofocus: autoFocus ? true : null,
      class: cx("flex-1 min-w-0 h-11 bg-transparent outline-none text-base text-concrete-900 placeholder:text-concrete-400", mono ? "font-mono" : ""),
      value,
      oninput: onInput ? (e) => onInput(e.target.value, e) : null
    });
    row.appendChild(inputEl);
    if (suffix) row.appendChild(h("span", { class: "text-sm text-concrete-500 font-semibold shrink-0" }, suffix));
    wrap.appendChild(row);
    if (error) {
      wrap.appendChild(h("span", { class: "flex items-center gap-1.5 text-sm text-danger-500" }, Icon("circle-alert", { size: 14 }), error));
    } else if (hint) {
      wrap.appendChild(h("span", { class: "text-sm text-concrete-500" }, hint));
    }
    return wrap;
  }
  function PasswordInput(props) {
    const { id, label = "Senha", placeholder = "Sua senha", value = "", onInput, error, visible, onToggleVisible } = props;
    const fieldId = id || "field-" + uid2++;
    const wrap = h("div", { class: "flex flex-col gap-1.5 w-full" });
    wrap.appendChild(h("label", { for: fieldId, class: "text-sm font-semibold text-concrete-900" }, label));
    const row = h(
      "div",
      {
        class: cx(
          "flex items-center gap-2 min-h-12 pl-3 pr-1.5 bg-white rounded-control border transition-colors duration-150",
          error ? "border-danger-500" : "border-concrete-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
        )
      },
      h("input", {
        id: fieldId,
        "data-focus-id": fieldId,
        type: visible ? "text" : "password",
        placeholder,
        value,
        class: "flex-1 min-w-0 h-11 bg-transparent outline-none text-base text-concrete-900 placeholder:text-concrete-400",
        oninput: onInput ? (e) => onInput(e.target.value, e) : null
      }),
      h("button", {
        type: "button",
        class: "inline-flex items-center justify-center w-9 h-9 rounded-full text-concrete-500 hover:bg-concrete-100 shrink-0",
        "aria-label": visible ? "Ocultar senha" : "Mostrar senha",
        onClick: onToggleVisible
      }, Icon(visible ? "eye-off" : "eye", { size: 22 }))
    );
    wrap.appendChild(row);
    if (error) wrap.appendChild(h("span", { class: "flex items-center gap-1.5 text-sm text-danger-500" }, Icon("circle-alert", { size: 14 }), error));
    return wrap;
  }

  // js/components/Checkbox.js
  var uid3 = 0;
  function Checkbox({ id, label, checked = false, error = false, onChange: onChange2 }) {
    const fieldId = id || "chk-" + uid3++;
    return h(
      "label",
      { for: fieldId, class: "flex items-center gap-3 min-h-12 py-2 cursor-pointer select-none" },
      h("input", {
        id: fieldId,
        type: "checkbox",
        checked,
        class: "sr-only peer",
        onchange: onChange2 ? (e) => onChange2(e.target.checked, e) : null
      }),
      h("span", {
        class: cx(
          "inline-flex items-center justify-center w-6 h-6 rounded shrink-0 border-2 transition-colors",
          checked ? "bg-brand-500 border-brand-500" : error ? "border-danger-500" : "border-concrete-400 bg-white"
        )
      }, checked ? Icon("check", { size: 16, color: "#fff" }) : null),
      h("span", { class: "text-sm text-concrete-900" }, label)
    );
  }

  // js/utils/format.js
  function maskCPF(v) {
    const d = String(v || "").replace(/\D/g, "").slice(0, 11);
    if (d.length > 9) return d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6, 9) + "-" + d.slice(9);
    if (d.length > 6) return d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6);
    if (d.length > 3) return d.slice(0, 3) + "." + d.slice(3);
    return d;
  }
  function maskCNPJ(v) {
    const d = String(v || "").replace(/\D/g, "").slice(0, 14);
    if (d.length > 12) return d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5, 8) + "/" + d.slice(8, 12) + "-" + d.slice(12);
    if (d.length > 8) return d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5, 8) + "/" + d.slice(8);
    if (d.length > 5) return d.slice(0, 2) + "." + d.slice(2, 5) + "." + d.slice(5);
    if (d.length > 2) return d.slice(0, 2) + "." + d.slice(2);
    return d;
  }
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }
  function passwordStrength(v) {
    const s = String(v || "");
    if (!s) return 0;
    let n = 1;
    if (s.length >= 8 && /[a-zA-Z]/.test(s) && /[0-9]/.test(s)) n = 2;
    if (n === 2 && (s.length >= 12 || /[^a-zA-Z0-9]/.test(s))) n = 3;
    return n;
  }
  var STRENGTH_LABEL = [null, "Senha fraca", "Senha m\xE9dia", "Senha forte"];
  function formatBRL(n) {
    const v = Math.round(Number(n) || 0);
    return "R$ " + v.toLocaleString("pt-BR");
  }
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function formatPostDate(isoDate) {
    const [y, m, d] = String(isoDate).split("-").map(Number);
    if (!y || !m || !d) return isoDate;
    return `${d} de ${MESES[m - 1]} de ${y}`;
  }

  // js/screens/shared/Signup.js
  var COMUM_EMAIL = { id: "email", label: "E-mail", question: "Qual \xE9 o seu e-mail?", placeholder: "voce@email.com", icon: "mail", type: "email" };
  var COMUM_SENHA = { id: "senha", label: "Senha", question: "Crie uma senha", help: "Use 8 caracteres ou mais, misturando letras e n\xFAmeros.", placeholder: "Sua senha", isPassword: true };
  var PERFIS = {
    trabalhador: {
      overline: "Cadastro de trabalhador",
      fields: [
        { id: "nome", label: "Nome completo", question: "Como voc\xEA se chama?", help: "Escreva o nome completo, igual ao do seu RG ou CNH.", placeholder: "Jorge Mendes da Silva", icon: "user" },
        { id: "doc", label: "CPF", question: "Qual \xE9 o seu CPF?", help: "Serve para conferir sua identidade. A construtora n\xE3o v\xEA esse n\xFAmero.", placeholder: "000.000.000-00", icon: "id-card", mask: "cpf", mono: true },
        Object.assign({}, COMUM_EMAIL, { help: "\xC9 por aqui que avisamos quando uma construtora escolher voc\xEA." }),
        COMUM_SENHA
      ]
    },
    recrutador: {
      overline: "Cadastro de recrutador",
      fields: [
        { id: "razao", label: "Nome da empresa", question: "Qual \xE9 o nome da empresa?", help: "\xC9 esse nome que aparece no seu perfil e nas vagas que voc\xEA publicar.", placeholder: "Meridiano Constru\xE7\xF5es", icon: "building-2" },
        { id: "doc", label: "CNPJ", question: "Qual \xE9 o CNPJ da empresa?", help: "Conferimos o CNPJ antes de liberar a publica\xE7\xE3o de vagas.", placeholder: "00.000.000/0000-00", icon: "id-card", mask: "cnpj", mono: true },
        Object.assign({}, COMUM_EMAIL, { help: "\xC9 por aqui que avisamos cada novo candidato da sua vaga." }),
        COMUM_SENHA
      ]
    }
  };
  var TAKEN_DOC = ["111.111.111-11", "11.111.111/1111-11"];
  function validateField(field, values, role) {
    const v = String(values[field.id] || "").trim();
    if (field.id === "nome") {
      if (!v) return "Informe o nome completo.";
      if (v.split(/\s+/).length < 2) return "Informe nome e sobrenome.";
      return null;
    }
    if (field.id === "razao") return v.length < 3 ? "Informe o nome da empresa." : null;
    if (field.id === "doc") {
      const digits2 = v.replace(/\D/g, "");
      const need = role === "recrutador" ? 14 : 11;
      if (digits2.length !== need) return role === "recrutador" ? "CNPJ inv\xE1lido. Confira os 14 n\xFAmeros." : "CPF inv\xE1lido. Confira os 11 n\xFAmeros.";
      return null;
    }
    if (field.id === "email") return isValidEmail(v) ? null : "E-mail inv\xE1lido. Confira se tem @ e o dom\xEDnio.";
    if (field.id === "senha") {
      if (v.length < 8) return "Senha curta. Use 8 caracteres ou mais.";
      if (!/[a-zA-Z]/.test(v) || !/[0-9]/.test(v)) return "Misture letras e n\xFAmeros na senha.";
      return null;
    }
    return null;
  }
  function renderSignup(navigate2, params) {
    const role = params.role === "recrutador" ? "recrutador" : "trabalhador";
    const key = "cadastro-" + role;
    const cfg = PERFIS[role];
    const ui = getUI(key, () => ({ step: 0, values: {}, errors: {}, generalError: false, submitting: false, passwordVisible: false, confirmPassword: "", confirmError: null, accepted: false, acceptError: false }));
    const step = Math.max(0, Math.min(ui.step, cfg.fields.length - 1));
    const field = cfg.fields[step];
    const isLast = step === cfg.fields.length - 1;
    function goBack2() {
      if (step > 0) setUI(key, { step: step - 1, generalError: false });
      else goBack("/escolha-perfil");
    }
    function setValue(v) {
      let value = v;
      if (field.mask === "cpf") value = maskCPF(v);
      if (field.mask === "cnpj") value = maskCNPJ(v);
      setUI(key, (s) => ({ values: Object.assign({}, s.values, { [field.id]: value }), errors: Object.assign({}, s.errors, { [field.id]: null }), generalError: false }));
    }
    function continueStep() {
      const err = validateField(field, ui.values, role);
      if (err) {
        setUI(key, (s) => ({ errors: Object.assign({}, s.errors, { [field.id]: err }) }));
        return;
      }
      if (!isLast) {
        setUI(key, { step: step + 1 });
        return;
      }
      if (ui.confirmPassword !== ui.values.senha) {
        setUI(key, { confirmError: "As senhas n\xE3o s\xE3o iguais. Confira os dois campos." });
        return;
      }
      if (!ui.accepted) {
        setUI(key, { acceptError: true });
        return;
      }
      setUI(key, { submitting: true, acceptError: false });
      setTimeout(() => {
        if (TAKEN_DOC.indexOf(ui.values.doc) >= 0) {
          const docStep = cfg.fields.findIndex((f) => f.id === "doc");
          setUI(key, { submitting: false, step: docStep, generalError: true });
          return;
        }
        setUI(key, { submitting: false });
        setUI("authFlow", { role, email: ui.values.email || "voce@email.com" });
        resetUI(key);
        navigate2("/verificar-email");
      }, 700);
    }
    const strength = passwordStrength(ui.values.senha);
    const strengthColor = strength === 3 ? "bg-success-500" : strength ? "bg-warning-500" : "bg-concrete-200";
    const strengthTextColor = strength === 3 ? "text-success-500" : strength ? "text-warning-500" : "text-concrete-500";
    const header = h(
      "div",
      { class: "sticky top-0 z-10 bg-white border-b border-concrete-200 px-2 pb-3" },
      h(
        "div",
        { class: "flex items-center gap-1.5 min-h-14" },
        IconButton({ icon: "arrow-left", label: "Voltar", onClick: goBack2 }),
        h("span", { class: "flex-1 text-sm font-semibold text-concrete-500" }, `Passo ${step + 1} de ${cfg.fields.length}`)
      ),
      h(
        "div",
        { class: "h-1 mx-2 rounded-full bg-concrete-200 overflow-hidden" },
        h("div", { class: "h-full bg-brand-500 rounded-full transition-all duration-200", style: { width: (step + 1) / cfg.fields.length * 100 + "%" } })
      )
    );
    const generalErrorBox = ui.generalError ? h(
      "div",
      { class: "flex flex-col gap-3.5 p-4 bg-danger-50 border border-danger-500 rounded-card" },
      h(
        "div",
        { class: "flex gap-2.5 items-start" },
        h("span", { class: "shrink-0 mt-0.5" }),
        h(
          "div",
          { class: "flex flex-col gap-1" },
          h("span", { class: "font-semibold text-danger-500" }, role === "recrutador" ? "Esse CNPJ j\xE1 tem conta na Bicos." : "Esse CPF j\xE1 tem conta na Bicos."),
          h("span", { class: "text-sm text-concrete-700" }, "Entre com o e-mail cadastrado ou recupere a senha. Se n\xE3o foi voc\xEA, fale com a gente pelo WhatsApp.")
        )
      ),
      h(
        "div",
        { class: "flex gap-2" },
        Button({ label: "Entrar na conta", variant: "secondary", size: "sm", className: "flex-1", onClick: () => navigate2("/login") }),
        Button({ label: "Recuperar senha", variant: "ghost", size: "sm", className: "flex-1", onClick: () => navigate2("/esqueci-senha") })
      )
    ) : null;
    const questionBlock = h(
      "div",
      { class: "flex flex-col gap-2.5" },
      h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, cfg.overline),
      h("h1", { class: "font-display font-bold text-3xl text-concrete-900" }, field.question),
      h("p", { class: "text-base text-concrete-700" }, field.help)
    );
    let fieldBlock;
    if (field.isPassword) {
      fieldBlock = h(
        "div",
        { class: "flex flex-col gap-5" },
        PasswordInput({
          id: key + "-senha",
          label: field.label,
          placeholder: field.placeholder,
          value: ui.values.senha || "",
          error: ui.errors.senha,
          visible: ui.passwordVisible,
          onToggleVisible: () => setUI(key, { passwordVisible: !ui.passwordVisible }),
          onInput: setValue
        }),
        PasswordInput({
          id: key + "-confirm",
          label: "Confirme a senha",
          placeholder: "Repita a senha",
          value: ui.confirmPassword,
          error: ui.confirmError,
          visible: ui.passwordVisible,
          onToggleVisible: () => setUI(key, { passwordVisible: !ui.passwordVisible }),
          onInput: (v) => setUI(key, { confirmPassword: v, confirmError: null })
        }),
        h(
          "div",
          { class: "flex flex-col gap-5" },
          h(
            "div",
            { class: "flex items-center gap-3" },
            h(
              "span",
              { class: "flex-1 h-1 rounded-full bg-concrete-200 overflow-hidden" },
              h("span", { class: `block h-full rounded-full ${strengthColor} transition-all`, style: { width: strength / 3 * 100 + "%" } })
            ),
            h("span", { class: `text-sm whitespace-nowrap ${strengthTextColor}` }, STRENGTH_LABEL[strength] || "Senha fraca")
          ),
          h(
            "div",
            { class: "flex flex-col gap-1 pt-1 border-t border-concrete-200" },
            Checkbox({ label: "Li e aceito as condi\xE7\xF5es de uso da Bicos", checked: ui.accepted, onChange: (v) => setUI(key, { accepted: v, acceptError: false }) }),
            h(
              "div",
              { class: "flex gap-4 pl-9" },
              h("a", { href: "#", class: "text-sm text-brand-600 underline" }, "Termos de uso"),
              h("a", { href: "#", class: "text-sm text-brand-600 underline" }, "Pol\xEDtica de privacidade")
            ),
            ui.acceptError ? h("span", { class: "flex items-center gap-2 pl-9 text-sm text-danger-500" }, "Aceite as condi\xE7\xF5es para criar sua conta.") : null
          )
        )
      );
    } else {
      fieldBlock = Input({
        id: key + "-" + field.id,
        label: field.label,
        placeholder: field.placeholder,
        icon: field.icon,
        type: field.type || "text",
        value: ui.values[field.id] || "",
        error: ui.errors[field.id],
        mono: Boolean(field.mono),
        inputMode: field.mask ? "numeric" : field.type === "email" ? "email" : "text",
        onInput: setValue,
        autoFocus: true
      });
    }
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-white lg:max-w-app lg:mx-auto lg:shadow-card lg:my-10 lg:rounded-card lg:overflow-hidden" },
      header,
      h(
        "div",
        { class: "flex-1 px-5 sm:px-8 py-8 flex flex-col gap-7 bg-concrete-50" },
        generalErrorBox,
        questionBlock,
        fieldBlock
      ),
      h(
        "div",
        { class: "px-5 sm:px-8 py-3 bg-white shadow-bar" },
        Button({ label: isLast ? "Criar minha conta" : "Continuar", size: "lg", fullWidth: true, loading: ui.submitting, onClick: continueStep })
      )
    );
  }

  // js/components/Card.js
  var TONES = {
    default: "bg-white border border-concrete-200 shadow-card",
    sunken: "bg-concrete-100 border-0",
    brand: "bg-brand-50 border border-brand-200"
  };
  var PADDING = { none: "", sm: "p-3", md: "p-4", lg: "p-5" };
  function Card({ tone = "default", padding = "md", onClick, className = "" }, ...children) {
    const clickable = Boolean(onClick);
    return h(clickable ? "button" : "div", {
      type: clickable ? "button" : null,
      class: cx(
        "rounded-card overflow-hidden text-left w-full",
        TONES[tone] || TONES.default,
        PADDING[padding] ?? PADDING.md,
        clickable ? "transition-transform duration-150 active:scale-[0.98] cursor-pointer" : "",
        className
      ),
      onClick
    }, ...children);
  }

  // js/screens/shared/VerifyEmail.js
  function renderVerifyEmail(navigate2) {
    const flow = getUI("authFlow", { role: "trabalhador", email: "voce@email.com" });
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 lg:max-w-app lg:mx-auto" },
      h(
        "div",
        { class: "flex-1 flex flex-col items-center text-center gap-6 px-6 pt-16 pb-8" },
        h("span", { class: "inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-brand-50" }, Icon("mail-check", { size: 34, color: "var(--brand)" })),
        h(
          "div",
          { class: "flex flex-col gap-2" },
          h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, "Conta criada. Confirme seu e-mail"),
          h("p", { class: "text-base text-concrete-700" }, "Enviamos um link de confirma\xE7\xE3o para ", h("strong", { class: "text-concrete-900" }, flow.email), ". Abra o link para ativar sua conta.")
        ),
        Card(
          { tone: "sunken", padding: "md", className: "w-full text-left" },
          h(
            "div",
            { class: "flex flex-col gap-3" },
            h("div", { class: "flex gap-2.5 items-center" }, Icon("clock", { size: 20, color: "var(--text-subtle)" }), h("span", { class: "text-sm text-concrete-700" }, "O link vale por 24 horas.")),
            h("div", { class: "flex gap-2.5 items-center" }, Icon("search-x", { size: 20, color: "var(--text-subtle)" }), h("span", { class: "text-sm text-concrete-700" }, "N\xE3o chegou? Confira a caixa de spam."))
          )
        )
      ),
      h(
        "div",
        { class: "px-6 pb-8 flex flex-col gap-2" },
        Button({ label: "Abrir meu e-mail", size: "lg", fullWidth: true, iconLeft: "mail", onClick: () => navigate2("/completar-perfil/" + flow.role) }),
        Button({ label: "Reenviar o link", variant: "ghost", fullWidth: true, onClick: () => {
        } })
      )
    );
  }

  // js/components/Select.js
  var uid4 = 0;
  function Select({ id, label, placeholder = "Selecione", options = [], value = "", onChange: onChange2, error }) {
    const fieldId = id || "select-" + uid4++;
    const wrap = h("div", { class: "flex flex-col gap-1.5 w-full" });
    if (label) wrap.appendChild(h("label", { for: fieldId, class: "text-sm font-semibold text-concrete-900" }, label));
    const row = h("div", {
      class: cx(
        "relative flex items-center min-h-12 px-3 bg-white rounded-control border",
        error ? "border-danger-500" : "border-concrete-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
      )
    });
    const select = h(
      "select",
      {
        id: fieldId,
        "data-focus-id": fieldId,
        class: "flex-1 min-w-0 h-11 bg-transparent outline-none text-base appearance-none pr-6 cursor-pointer",
        onchange: onChange2 ? (e) => onChange2(e.target.value, e) : null
      },
      h("option", { value: "", disabled: true, selected: !value }, placeholder),
      ...options.map((opt) => h("option", { value: opt, selected: opt === value }, opt))
    );
    select.className = cx("flex-1 min-w-0 h-11 bg-transparent outline-none text-base appearance-none pr-6 cursor-pointer", value ? "text-concrete-900" : "text-concrete-400");
    row.appendChild(select);
    row.appendChild(h("span", { class: "pointer-events-none absolute right-3 text-concrete-500" }, Icon("chevron-down", { size: 18 })));
    wrap.appendChild(row);
    if (error) wrap.appendChild(h("span", { class: "flex items-center gap-1.5 text-sm text-danger-500" }, Icon("circle-alert", { size: 14 }), error));
    return wrap;
  }

  // js/components/Tag.js
  function Tag({ label, icon, selected = false, onClick, onRemove, className = "" }) {
    const tag = h("button", {
      type: "button",
      class: cx(
        "inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        selected ? "bg-brand-50 border border-brand-500 text-brand-600" : "bg-white border border-concrete-300 text-concrete-700 hover:bg-concrete-50",
        className
      ),
      onClick
    }, icon ? Icon(icon, { size: 16 }) : null, h("span", {}, label));
    if (onRemove) {
      tag.appendChild(h("span", {
        class: "ml-0.5 -mr-1 inline-flex items-center justify-center w-4 h-4",
        onClick: (e) => {
          e.stopPropagation();
          onRemove(e);
        }
      }, Icon("x", { size: 14 })));
    }
    return tag;
  }

  // js/components/PhotoSlot.js
  function PhotoSlot({ shape = "rect", value, onChange: onChange2, placeholder = "Toque para escolher uma foto", className = "", height = "9rem" }) {
    const isCircle = shape === "circle";
    const input = h("input", {
      type: "file",
      accept: "image/*",
      class: "sr-only",
      onchange: (e) => {
        const file = e.target.files && e.target.files[0];
        if (file && onChange2) onChange2(URL.createObjectURL(file));
      }
    });
    return h(
      "label",
      {
        class: cx(
          "relative flex items-center justify-center overflow-hidden cursor-pointer bg-concrete-200 border-2 border-dashed border-concrete-300 hover:border-brand-400 transition-colors",
          isCircle ? "rounded-full" : "rounded-card w-full",
          className
        ),
        style: isCircle ? {} : { height }
      },
      input,
      value ? h("img", { src: value, alt: "", class: "absolute inset-0 w-full h-full object-cover" }) : h("span", { class: "flex flex-col items-center gap-1.5 text-concrete-500 px-3 text-center" }, Icon("camera", { size: isCircle ? 20 : 24 }), h("span", { class: "text-xs font-semibold" }, placeholder))
    );
  }

  // js/screens/shared/CompleteProfile.js
  function renderCompleteProfile(navigate2, params) {
    const role = params.role === "recrutador" ? "recrutador" : "trabalhador";
    return role === "recrutador" ? recruiterFlow(navigate2) : workerFlow(navigate2);
  }
  function shell(step, total, onBack, children, onContinue, label) {
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-white lg:max-w-app lg:mx-auto lg:shadow-card lg:my-10 lg:rounded-card lg:overflow-hidden" },
      h(
        "div",
        { class: "sticky top-0 z-10 bg-white border-b border-concrete-200 px-2 pb-3" },
        h(
          "div",
          { class: "flex items-center gap-1.5 min-h-14" },
          step > 0 ? IconButton({ icon: "arrow-left", label: "Voltar", onClick: onBack }) : h("span", { class: "w-11 h-11" }),
          h("span", { class: "flex-1 text-sm font-semibold text-concrete-500" }, `Passo ${step + 1} de ${total}`)
        ),
        h(
          "div",
          { class: "h-1 mx-2 rounded-full bg-concrete-200 overflow-hidden" },
          h("div", { class: "h-full bg-brand-500 rounded-full transition-all duration-200", style: { width: (step + 1) / total * 100 + "%" } })
        )
      ),
      h("div", { class: "flex-1 px-5 sm:px-8 py-8 flex flex-col gap-7 bg-concrete-50" }, ...children),
      h(
        "div",
        { class: "px-5 sm:px-8 py-3 bg-white shadow-bar" },
        Button({ label, size: "lg", fullWidth: true, onClick: onContinue })
      )
    );
  }
  function heading(overline, title, help) {
    return h(
      "div",
      { class: "flex flex-col gap-2.5" },
      h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, overline),
      h("h1", { class: "font-display font-bold text-3xl text-concrete-900" }, title),
      h("p", { class: "text-base text-concrete-700" }, help)
    );
  }
  function workerFlow(navigate2) {
    const key = "completar-trabalhador";
    const ui = getUI(key, { step: 0, photo: null, cargo: "", regiao: "", especialidades: [], errors: {} });
    if (ui.step === 0) {
      return shell(0, 2, () => navigate2("/verificar-email"), [
        heading("Completar perfil", "Uma foto e o seu cargo", "Isso aparece no seu perfil para as construtoras que virem seu bico."),
        h(
          "div",
          { class: "flex flex-col items-center gap-3" },
          PhotoSlot({ shape: "circle", value: ui.photo, onChange: (v) => setUI(key, { photo: v }), className: "w-24 h-24", placeholder: "Sua foto" }),
          Button({ label: "Pular por enquanto", variant: "ghost", onClick: () => setUI(key, { step: 1 }) })
        ),
        Select({
          label: "Cargo ou especialidade principal",
          placeholder: "Selecione seu cargo",
          options: CARGOS_TRABALHADOR,
          value: ui.cargo,
          error: ui.errors.cargo,
          onChange: (v) => setUI(key, { cargo: v, errors: Object.assign({}, ui.errors, { cargo: null }) })
        })
      ], () => {
        if (!ui.cargo) {
          setUI(key, { errors: { cargo: "Selecione seu cargo ou especialidade principal." } });
          return;
        }
        setUI(key, { step: 1, errors: {} });
      }, "Continuar");
    }
    return shell(1, 2, () => setUI(key, { step: 0 }), [
      heading("Completar perfil", "Onde e no que voc\xEA trabalha", "Usamos para mostrar bicos perto de voc\xEA e do jeito certo para seu of\xEDcio."),
      Select({
        label: "Regi\xE3o de atua\xE7\xE3o",
        placeholder: "Selecione bairro e cidade",
        options: REGIOES_TRABALHADOR,
        value: ui.regiao,
        error: ui.errors.regiao,
        onChange: (v) => setUI(key, { regiao: v, errors: Object.assign({}, ui.errors, { regiao: null }) })
      }),
      h(
        "div",
        { class: "flex flex-col gap-2.5" },
        h("span", { class: "text-sm font-semibold text-concrete-900" }, "Especialidades"),
        h("div", { class: "flex flex-wrap gap-2" }, ...ESPECIALIDADES.map((e) => Tag({
          label: e,
          selected: ui.especialidades.includes(e),
          onClick: () => setUI(key, { especialidades: ui.especialidades.includes(e) ? ui.especialidades.filter((x) => x !== e) : ui.especialidades.concat([e]), errors: Object.assign({}, ui.errors, { especialidades: null }) })
        }))),
        ui.errors.especialidades ? h("span", { class: "text-sm text-danger-500" }, ui.errors.especialidades) : null
      )
    ], () => {
      const errors = {};
      if (!ui.regiao) errors.regiao = "Selecione sua regi\xE3o de atua\xE7\xE3o.";
      if (ui.especialidades.length === 0) errors.especialidades = "Escolha ao menos uma especialidade.";
      if (Object.keys(errors).length) {
        setUI(key, { errors });
        return;
      }
      setRole("trabalhador");
      navigate2("/mural");
    }, "Concluir perfil");
  }
  function recruiterFlow(navigate2) {
    const key = "completar-recrutador";
    const ui = getUI(key, { step: 0, capa: null, logo: null, tipoObra: "", regiao: "", errors: {} });
    if (ui.step === 0) {
      return shell(0, 2, () => navigate2("/verificar-email"), [
        heading("Completar perfil", "Capa e logo da construtora", "Isso aparece no perfil que os candidatos veem antes de se candidatar."),
        h(
          "div",
          { class: "flex flex-col gap-2" },
          h("span", { class: "text-sm font-semibold text-concrete-900" }, "Foto de capa"),
          PhotoSlot({ shape: "rect", value: ui.capa, onChange: (v) => setUI(key, { capa: v }), height: "7.5rem", placeholder: "Capa da construtora" })
        ),
        h(
          "div",
          { class: "flex items-center gap-4" },
          PhotoSlot({ shape: "circle", value: ui.logo, onChange: (v) => setUI(key, { logo: v }), className: "w-[4.5rem] h-[4.5rem] shrink-0", placeholder: "Logo" }),
          h(
            "div",
            { class: "flex flex-col gap-1" },
            h("span", { class: "text-sm font-semibold text-concrete-900" }, "Foto ou logo de perfil"),
            Button({ label: "Pular por enquanto", variant: "ghost", size: "sm", onClick: () => setUI(key, { step: 1 }) })
          )
        )
      ], () => setUI(key, { step: 1 }), "Continuar");
    }
    return shell(1, 2, () => setUI(key, { step: 0 }), [
      heading("Completar perfil", "Sobre a sua obra", "Usamos para destacar o tipo de obra e mostrar suas vagas na regi\xE3o certa."),
      Select({ label: "Tipo de obra", placeholder: "Selecione o tipo de obra", options: TIPOS_OBRA, value: ui.tipoObra, error: ui.errors.tipoObra, onChange: (v) => setUI(key, { tipoObra: v, errors: Object.assign({}, ui.errors, { tipoObra: null }) }) }),
      Select({ label: "Regi\xE3o de atua\xE7\xE3o", placeholder: "Selecione a regi\xE3o", options: REGIOES_RECRUTADOR, value: ui.regiao, error: ui.errors.regiao, onChange: (v) => setUI(key, { regiao: v, errors: Object.assign({}, ui.errors, { regiao: null }) }) })
    ], () => {
      const errors = {};
      if (!ui.tipoObra) errors.tipoObra = "Selecione o tipo de obra.";
      if (!ui.regiao) errors.regiao = "Selecione sua regi\xE3o de atua\xE7\xE3o.";
      if (Object.keys(errors).length) {
        setUI(key, { errors });
        return;
      }
      setRole("recrutador");
      navigate2("/mural");
    }, "Concluir perfil");
  }

  // js/screens/shared/Login.js
  var KEY2 = "login";
  function renderLogin(navigate2) {
    const ui = getUI(KEY2, { identifier: "", password: "", visible: false, role: "trabalhador", submitting: false });
    function submit() {
      setUI(KEY2, { submitting: true });
      setTimeout(() => {
        setRole(ui.role);
        setUI(KEY2, { submitting: false });
        navigate2("/mural");
      }, 500);
    }
    return h(
      "div",
      { class: "min-h-screen bg-white" },
      h(
        "div",
        { class: "max-w-app mx-auto px-6 sm:px-8 pt-14 pb-10 flex flex-col gap-8" },
        h(
          "div",
          { class: "flex flex-col items-center gap-5 text-center" },
          h("span", { class: "inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500" }, Icon("hammer", { size: 22, color: "#fff" })),
          h("h1", { class: "font-display font-bold text-3xl text-concrete-900" }, "Ol\xE1 de novo")
        ),
        h(
          "div",
          { class: "flex flex-col gap-5" },
          Input({
            id: "login-identifier",
            label: "E-mail, CPF ou CNPJ",
            placeholder: "voce@email.com",
            icon: "mail",
            value: ui.identifier,
            onInput: (v) => setUI(KEY2, { identifier: v })
          }),
          PasswordInput({
            id: "login-password",
            value: ui.password,
            visible: ui.visible,
            onToggleVisible: () => setUI(KEY2, { visible: !ui.visible }),
            onInput: (v) => setUI(KEY2, { password: v })
          }),
          h(
            "div",
            { class: "flex flex-col gap-2" },
            h("span", { class: "text-sm font-semibold text-concrete-900" }, "Entrar como (demonstra\xE7\xE3o)"),
            h(
              "div",
              { class: "flex gap-2" },
              Tag({ label: "Trabalhador", selected: ui.role === "trabalhador", onClick: () => setUI(KEY2, { role: "trabalhador" }) }),
              Tag({ label: "Recrutador", selected: ui.role === "recrutador", onClick: () => setUI(KEY2, { role: "recrutador" }) })
            )
          ),
          Button({ label: "Entrar", size: "lg", fullWidth: true, loading: ui.submitting, onClick: submit }),
          h(
            "div",
            { class: "flex items-center gap-3 py-1" },
            h("span", { class: "flex-1 h-px bg-concrete-200" }),
            h("span", { class: "text-xs text-concrete-500" }, "ou"),
            h("span", { class: "flex-1 h-px bg-concrete-200" })
          ),
          Button({ label: "Continuar com o Google", variant: "secondary", fullWidth: true, iconLeftEl: GoogleIcon({ size: 20 }), onClick: submit }),
          Button({ label: "Continuar com o celular", variant: "secondary", fullWidth: true, iconLeft: "phone-call", onClick: submit })
        ),
        h(
          "div",
          { class: "flex flex-col items-center gap-1" },
          Button({ label: "Esqueci minha senha", variant: "ghost", onClick: () => navigate2("/esqueci-senha") }),
          Button({ label: "Criar minha conta", variant: "ghost", onClick: () => navigate2("/escolha-perfil") })
        )
      )
    );
  }

  // js/screens/shared/ForgotPassword.js
  var KEY3 = "forgot-password";
  function renderForgotPassword(navigate2) {
    const ui = getUI(KEY3, { email: "", error: null, sent: false, submitting: false });
    const content = ui.sent ? h(
      "div",
      { class: "flex-1 flex flex-col items-center text-center gap-5 px-6 pt-16" },
      h("span", { class: "inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-brand-50" }, Icon("mail-check", { size: 34, color: "var(--brand)" })),
      h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, "Link enviado"),
      h("p", { class: "text-base text-concrete-700" }, "Mandamos um link de redefini\xE7\xE3o para ", h("strong", { class: "text-concrete-900" }, ui.email), ". Abra o link para criar uma senha nova."),
      Button({ label: "J\xE1 abri o link", variant: "secondary", onClick: () => navigate2("/redefinir-senha") })
    ) : h(
      "div",
      { class: "flex-1 flex flex-col gap-7 px-5 sm:px-8 py-8" },
      h(
        "div",
        { class: "flex flex-col gap-2.5" },
        h("h1", { class: "font-display font-bold text-3xl text-concrete-900" }, "Esqueceu sua senha?"),
        h("p", { class: "text-base text-concrete-700" }, "Informe o e-mail da sua conta. Enviamos um link para voc\xEA criar uma senha nova.")
      ),
      Input({ id: "forgot-email", label: "E-mail", placeholder: "voce@email.com", icon: "mail", value: ui.email, error: ui.error, onInput: (v) => setUI(KEY3, { email: v, error: null }) })
    );
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-white lg:max-w-app lg:mx-auto" },
      h(
        "div",
        { class: "flex items-center gap-1.5 min-h-14 px-2 border-b border-concrete-200" },
        IconButton({ icon: "arrow-left", label: "Voltar", onClick: () => goBack("/login") }),
        h("span", { class: "font-display font-semibold text-xl text-concrete-900" }, "Recuperar senha")
      ),
      content,
      !ui.sent ? h(
        "div",
        { class: "px-5 sm:px-8 py-3" },
        Button({
          label: "Enviar link",
          size: "lg",
          fullWidth: true,
          loading: ui.submitting,
          onClick: () => {
            if (!isValidEmail(ui.email)) {
              setUI(KEY3, { error: "E-mail inv\xE1lido. Confira se tem @ e o dom\xEDnio." });
              return;
            }
            setUI(KEY3, { submitting: true });
            setTimeout(() => setUI(KEY3, { submitting: false, sent: true }), 600);
          }
        })
      ) : null
    );
  }

  // js/screens/shared/ResetPassword.js
  var KEY4 = "reset-password";
  function renderResetPassword(navigate2) {
    const ui = getUI(KEY4, { senha: "", confirm: "", visible: false, error: null, done: false, submitting: false });
    const strength = passwordStrength(ui.senha);
    const strengthColor = strength === 3 ? "bg-success-500" : strength ? "bg-warning-500" : "bg-concrete-200";
    if (ui.done) {
      return h(
        "div",
        { class: "min-h-screen flex flex-col items-center justify-center text-center gap-5 px-6 bg-white lg:max-w-app lg:mx-auto" },
        h("span", { class: "inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-success-50" }, Icon("circle-check", { size: 34, color: "var(--green-500)" })),
        h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, "Senha redefinida"),
        h("p", { class: "text-base text-concrete-700" }, "Use sua nova senha para entrar na sua conta."),
        Button({ label: "Ir para o login", size: "lg", onClick: () => navigate2("/login") })
      );
    }
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-white lg:max-w-app lg:mx-auto" },
      h(
        "div",
        { class: "flex items-center gap-1.5 min-h-14 px-2 border-b border-concrete-200" },
        IconButton({ icon: "arrow-left", label: "Voltar", onClick: () => goBack("/login") }),
        h("span", { class: "font-display font-semibold text-xl text-concrete-900" }, "Criar nova senha")
      ),
      h(
        "div",
        { class: "flex-1 flex flex-col gap-7 px-5 sm:px-8 py-8" },
        h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("h1", { class: "font-display font-bold text-3xl text-concrete-900" }, "Escolha uma senha nova"),
          h("p", { class: "text-base text-concrete-700" }, "Use 8 caracteres ou mais, misturando letras e n\xFAmeros.")
        ),
        PasswordInput({ id: "reset-senha", value: ui.senha, visible: ui.visible, onToggleVisible: () => setUI(KEY4, { visible: !ui.visible }), onInput: (v) => setUI(KEY4, { senha: v, error: null }) }),
        h(
          "div",
          { class: "flex items-center gap-3" },
          h("span", { class: "flex-1 h-1 rounded-full bg-concrete-200 overflow-hidden" }, h("span", { class: `block h-full rounded-full ${strengthColor}`, style: { width: strength / 3 * 100 + "%" } })),
          h("span", { class: "text-sm text-concrete-500 whitespace-nowrap" }, STRENGTH_LABEL[strength] || "Senha fraca")
        ),
        PasswordInput({ id: "reset-confirm", label: "Confirme a senha nova", value: ui.confirm, visible: ui.visible, onToggleVisible: () => setUI(KEY4, { visible: !ui.visible }), error: ui.error, onInput: (v) => setUI(KEY4, { confirm: v, error: null }) })
      ),
      h(
        "div",
        { class: "px-5 sm:px-8 py-3" },
        Button({
          label: "Salvar nova senha",
          size: "lg",
          fullWidth: true,
          loading: ui.submitting,
          onClick: () => {
            if (ui.senha.length < 8) {
              setUI(KEY4, { error: "Senha curta. Use 8 caracteres ou mais." });
              return;
            }
            if (ui.senha !== ui.confirm) {
              setUI(KEY4, { error: "As senhas n\xE3o s\xE3o iguais. Confira os dois campos." });
              return;
            }
            setUI(KEY4, { submitting: true });
            setTimeout(() => setUI(KEY4, { submitting: false, done: true }), 600);
          }
        })
      )
    );
  }

  // js/components/EmptyState.js
  var TONES2 = {
    default: { iconBg: "bg-concrete-100", iconColor: "var(--text-subtle)" },
    danger: { iconBg: "bg-danger-50", iconColor: "var(--red-500)" },
    offline: { iconBg: "bg-warning-50", iconColor: "var(--amber-500)" }
  };
  function EmptyState({ icon, title, description, actionLabel, onAction, tone = "default", className = "" }) {
    const t = TONES2[tone] || TONES2.default;
    return h(
      "div",
      { class: cx("flex flex-col items-center text-center gap-4 px-6 py-12", className) },
      h("span", { class: cx("inline-flex items-center justify-center w-16 h-16 rounded-full", t.iconBg) }, Icon(icon, { size: 30, color: t.iconColor })),
      h(
        "div",
        { class: "flex flex-col gap-1.5 max-w-xs" },
        h("h3", { class: "text-base font-bold text-concrete-900" }, title),
        description ? h("p", { class: "text-sm text-concrete-500" }, description) : null
      ),
      actionLabel ? Button({ label: actionLabel, variant: "secondary", size: "sm", onClick: onAction }) : null
    );
  }

  // js/screens/shared/Notifications.js
  var WORKER_NOTIFS = [
    { icon: "circle-check", tone: "success", title: "Voc\xEA foi pr\xE9-selecionado", text: "Construtora Meridiano quer falar com voc\xEA sobre Pedreiro de acabamento.", time: "H\xE1 12 min" },
    { icon: "zap", tone: "danger", title: "Bico urgente perto de voc\xEA", text: "Pintor em Mooca, hoje \xE0s 8h. A combinar.", time: "H\xE1 2h" },
    { icon: "star", tone: "accent", title: "Avalie sua \xFAltima di\xE1ria", text: "Obra Canga\xEDba \xB7 Servente de obra, 30 ago.", time: "Ontem" },
    { icon: "file-check", tone: "brand", title: "Candidatura em an\xE1lise", text: "Reforma Serra de Bragan\xE7a est\xE1 avaliando seu perfil.", time: "2 dias atr\xE1s" }
  ];
  var RECRUITER_NOTIFS = [
    { icon: "users", tone: "brand", title: "2 novos candidatos", text: "Pedreiro de acabamento \xB7 Tatuap\xE9 recebeu novas candidaturas.", time: "H\xE1 30 min" },
    { icon: "circle-check", tone: "success", title: "Bico fechado", text: "Todas as vagas de Servente de obra foram preenchidas.", time: "H\xE1 3h" },
    { icon: "star", tone: "accent", title: "Avalie o trabalhador", text: "Marcos Aur\xE9lio concluiu a di\xE1ria em 21 ago.", time: "Ontem" }
  ];
  var TONE_BG = { success: "bg-success-50", danger: "bg-danger-50", accent: "bg-accent-50", brand: "bg-brand-50" };
  var TONE_FG = { success: "var(--green-500)", danger: "var(--red-500)", accent: "var(--teal-500)", brand: "var(--brand)" };
  function renderNotifications(navigate2) {
    const list = getRole() === "recrutador" ? RECRUITER_NOTIFS : WORKER_NOTIFS;
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 lg:bg-transparent lg:min-h-0" },
      BackBar({ title: "Notifica\xE7\xF5es", onBack: () => goBack("/mural") }),
      list.length === 0 ? EmptyState({ icon: "bell", title: "Nenhuma notifica\xE7\xE3o", description: "Avisamos aqui quando algo importante acontecer." }) : h("div", { class: "flex flex-col px-4 py-2 gap-2" }, ...list.map((n) => h(
        "div",
        { class: "flex gap-3 p-4 bg-white border border-concrete-200 rounded-card" },
        h("span", { class: `shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full ${TONE_BG[n.tone]}` }, Icon(n.icon, { size: 18, color: TONE_FG[n.tone] })),
        h(
          "div",
          { class: "flex flex-col gap-1 min-w-0" },
          h("span", { class: "font-semibold text-concrete-900" }, n.title),
          h("span", { class: "text-sm text-concrete-600" }, n.text),
          h("span", { class: "text-xs text-concrete-400" }, n.time)
        )
      )))
    );
  }

  // js/screens/shared/Settings.js
  function Row({ icon, label, description, onClick, danger = false }) {
    return h(
      "button",
      {
        type: "button",
        onClick,
        class: "flex items-center gap-3.5 w-full min-h-14 px-4 py-3 bg-white text-left hover:bg-concrete-50 transition-colors"
      },
      h("span", { class: `shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full ${danger ? "bg-danger-50" : "bg-concrete-100"}` }, Icon(icon, { size: 18, color: danger ? "var(--red-500)" : "var(--gray-600)" })),
      h(
        "span",
        { class: "flex-1 min-w-0 flex flex-col" },
        h("span", { class: `font-semibold ${danger ? "text-danger-500" : "text-concrete-900"}` }, label),
        description ? h("span", { class: "text-sm text-concrete-500" }, description) : null
      ),
      Icon("chevron-right", { size: 18, color: "var(--gray-400)" })
    );
  }
  function Section(title, rowsEl) {
    return h(
      "div",
      { class: "flex flex-col gap-2" },
      title ? h("div", { class: "px-4 text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, title) : null,
      h("div", { class: "flex flex-col divide-y divide-concrete-200 bg-white border border-concrete-200 rounded-card overflow-hidden mx-4 sm:mx-0" }, ...rowsEl)
    );
  }
  function renderSettings(navigate2) {
    const role = getRole();
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 gap-6 pb-8 lg:bg-transparent lg:min-h-0" },
      BackBar({ title: "Configura\xE7\xF5es", onBack: () => goBack(role === "recrutador" ? "/empresa" : "/perfil") }),
      h(
        "div",
        { class: "flex flex-col gap-6 sm:px-0" },
        Section("Conta", [
          Row({ icon: "user", label: "Editar perfil", onClick: () => navigate2(role === "recrutador" ? "/empresa/editar" : "/perfil/editar") }),
          Row({ icon: "lock", label: "Trocar senha", onClick: () => navigate2("/esqueci-senha") })
        ]),
        Section("Prefer\xEAncias", [
          Row({ icon: "bell", label: "Notifica\xE7\xF5es", description: "Bicos urgentes, candidaturas e mensagens", onClick: () => navigate2("/notificacoes") }),
          Row({ icon: "shield-check", label: "Privacidade e dados", description: "Exportar ou excluir sua conta", onClick: () => navigate2("/configuracoes/privacidade") })
        ]),
        Section("Sobre", [
          Row({ icon: "file-check", label: "Termos de uso", onClick: () => {
          } }),
          Row({ icon: "shield-check", label: "Pol\xEDtica de privacidade", onClick: () => {
          } })
        ]),
        Section("", [
          Row({ icon: "log-out", label: "Sair da conta", danger: true, onClick: () => navigate2("/login") })
        ])
      )
    );
  }

  // js/components/Modal.js
  function Dialog({ open, tone = "default", title, description, confirmLabel, onConfirm, cancelLabel = "Cancelar", onCancel }) {
    if (!open) return null;
    return h(
      "div",
      {
        class: "fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6",
        style: { background: "var(--scrim)" },
        onClick: onCancel
      },
      h(
        "div",
        {
          class: "w-full sm:max-w-sm bg-white rounded-t-sheet sm:rounded-sheet p-5 flex flex-col gap-4 animate-slide-up",
          onClick: (e) => e.stopPropagation()
        },
        h(
          "div",
          { class: "flex flex-col gap-1.5" },
          h("h3", { class: "text-lg font-bold text-concrete-900" }, title),
          description ? h("p", { class: "text-sm text-concrete-600" }, description) : null
        ),
        h(
          "div",
          { class: "flex gap-3 pt-1" },
          Button({ label: cancelLabel, variant: "secondary", className: "flex-1", onClick: onCancel }),
          Button({ label: confirmLabel, variant: tone === "danger" ? "danger" : "primary", className: "flex-1", onClick: onConfirm })
        )
      )
    );
  }
  function Sheet({ open, title, onClose, maxHeight = "85vh" }, ...children) {
    if (!open) return null;
    return h(
      "div",
      {
        class: "fixed inset-0 z-40 flex items-end justify-center",
        style: { background: "var(--scrim)" },
        onClick: onClose
      },
      h(
        "div",
        {
          class: "w-full sm:max-w-app bg-white rounded-t-sheet shadow-sheet p-4 flex flex-col gap-4 overflow-y-auto animate-slide-up",
          style: { maxHeight },
          onClick: (e) => e.stopPropagation()
        },
        h(
          "div",
          { class: "flex items-center justify-between" },
          h("span", { class: "text-lg font-bold text-concrete-900" }, title),
          h("button", { type: "button", "aria-label": "Fechar", class: "inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-concrete-100", onClick: onClose }, Icon("x", { size: 20 }))
        ),
        ...children
      )
    );
  }

  // js/screens/shared/Privacy.js
  var KEY5 = "privacy";
  function renderPrivacy(navigate2) {
    const ui = getUI(KEY5, { exporting: false, exported: false, confirmDelete: false });
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 gap-5 pb-8 lg:bg-transparent lg:min-h-0" },
      BackBar({ title: "Privacidade e dados", onBack: () => goBack("/configuracoes") }),
      h(
        "div",
        { class: "flex flex-col gap-5 px-4 sm:px-0" },
        h("p", { class: "text-sm text-concrete-600" }, "De acordo com a LGPD, voc\xEA pode baixar uma c\xF3pia de tudo o que a Bicos guarda sobre voc\xEA, ou excluir sua conta e seus dados por completo."),
        Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-3" },
            h(
              "div",
              { class: "flex gap-3 items-start" },
              Icon("download", { size: 20, color: "var(--text-subtle)" }),
              h(
                "div",
                { class: "flex flex-col gap-1" },
                h("span", { class: "font-semibold text-concrete-900" }, "Exportar meus dados"),
                h("span", { class: "text-sm text-concrete-600" }, "Perfil, candidaturas, avalia\xE7\xF5es e mensagens em um arquivo \xFAnico.")
              )
            ),
            ui.exported ? h("span", { class: "flex items-center gap-2 text-sm text-success-500 font-semibold" }, Icon("circle-check", { size: 16, color: "var(--green-500)" }), "Arquivo enviado para o seu e-mail.") : Button({ label: "Exportar meus dados", variant: "secondary", loading: ui.exporting, onClick: () => {
              setUI(KEY5, { exporting: true });
              setTimeout(() => setUI(KEY5, { exporting: false, exported: true }), 900);
            } })
          )
        ),
        Card(
          { padding: "md", className: "border-danger-100" },
          h(
            "div",
            { class: "flex flex-col gap-3" },
            h(
              "div",
              { class: "flex gap-3 items-start" },
              Icon("triangle-alert", { size: 20, color: "var(--red-500)" }),
              h(
                "div",
                { class: "flex flex-col gap-1" },
                h("span", { class: "font-semibold text-danger-500" }, "Excluir minha conta"),
                h("span", { class: "text-sm text-concrete-600" }, "Remove seu perfil, candidaturas e hist\xF3rico. Essa a\xE7\xE3o n\xE3o pode ser desfeita.")
              )
            ),
            Button({ label: "Excluir minha conta", variant: "danger", onClick: () => setUI(KEY5, { confirmDelete: true }) })
          )
        )
      ),
      Dialog({
        open: ui.confirmDelete,
        tone: "danger",
        title: "Excluir sua conta?",
        description: "Isso apaga seu perfil, candidaturas e hist\xF3rico da Bicos para sempre. N\xE3o d\xE1 para desfazer.",
        confirmLabel: "Sim, excluir conta",
        onConfirm: () => navigate2("/login"),
        cancelLabel: "Cancelar",
        onCancel: () => setUI(KEY5, { confirmDelete: false })
      })
    );
  }

  // js/components/Badge.js
  var TONES3 = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-success-50 text-success-500",
    warning: "bg-warning-50 text-warning-500",
    danger: "bg-danger-50 text-danger-500",
    accent: "bg-accent-50 text-accent-600",
    neutral: "bg-concrete-100 text-concrete-500",
    inverse: "bg-white/15 text-white"
  };
  function Badge({ label, tone = "neutral", icon, className = "" }) {
    return h("span", {
      class: cx("inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-xs font-bold whitespace-nowrap", TONES3[tone] || TONES3.neutral, className)
    }, icon ? Icon(icon, { size: 14 }) : null, label);
  }

  // js/components/Rating.js
  function Rating({ value = 0, count, showValue = true, editable = false, onChange: onChange2, size = 14 }) {
    const wrap = h("span", { class: "inline-flex items-center gap-1" });
    if (!value && !editable) {
      wrap.appendChild(h("span", { class: "text-sm text-concrete-400" }, "Novo na plataforma"));
      return wrap;
    }
    const stars = h("span", { class: "inline-flex items-center gap-0.5" });
    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.round(value);
      const star = Icon("star", { size: editable ? 28 : size, color: filled ? "var(--amber-500)" : "var(--gray-300)" });
      if (editable) {
        star.classList.add("cursor-pointer");
        star.addEventListener("click", () => onChange2 && onChange2(i));
      }
      stars.appendChild(star);
    }
    wrap.appendChild(stars);
    if (showValue && !editable) {
      wrap.appendChild(h("span", { class: "text-sm font-semibold text-concrete-900" }, value.toFixed(1).replace(".", ",")));
      if (count != null) wrap.appendChild(h("span", { class: "text-sm text-concrete-500" }, `(${count})`));
    }
    return wrap;
  }

  // js/screens/shared/WorkerProfileScreen.js
  var POSTS_KEY = "worker-posts";
  function renderWorkerProfile(navigate2, params) {
    const isOwn = !params.id;
    const worker = isOwn ? currentWorker() : getWorker(params.id);
    if (!worker) return notFound(navigate2);
    const jobIdRaw = params.jobId;
    const jobForCtx = jobIdRaw ? getJob(jobIdRaw) : null;
    const jobId = jobForCtx && getRole() === "recrutador" && jobForCtx.companyId === currentCompanyId() ? jobIdRaw : null;
    const decision = jobId ? (applicationFor(jobId, worker.id) || {}).status : null;
    const decidedForJob = jobId && (decision === "pre_selecionado" || decision === "nao_selecionado");
    const jobFull = jobId ? isJobClosed(getJob(jobId)) : false;
    const ui = getUI("worker-profile-photo", { photo: null });
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 lg:bg-transparent lg:min-h-0" },
      h(
        "div",
        { class: "relative" },
        isOwn && ui.photo ? h("img", { src: ui.photo, alt: "", class: "w-full h-52 object-cover lg:rounded-card" }) : h("div", { class: "h-52 bg-concrete-200 lg:rounded-card" }),
        !isOwn ? h("div", { class: "absolute top-2 left-2" }, IconButton({ icon: "arrow-left", label: "Voltar", variant: "solid", onClick: () => goBack(jobId ? "/vaga-gerenciar/" + jobId : "/mural") })) : null,
        h(
          "div",
          { class: "absolute left-4 sm:left-6 -bottom-10 w-24 h-24 rounded-full bg-white p-1 shadow-raised" },
          h(
            "div",
            { class: "relative w-full h-full" },
            h("div", { class: "w-full h-full rounded-full bg-accent-50 text-accent-600 flex items-center justify-center font-bold text-2xl overflow-hidden" }, worker.initials),
            worker.verified ? h("span", { class: "absolute -right-0.5 -bottom-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 border-[3px] border-white" }, Icon("check", { size: 14, color: "#fff" })) : null
          )
        )
      ),
      h(
        "div",
        { class: "flex flex-col gap-5 pt-12 px-4 sm:px-6 pb-40 lg:pb-6" },
        h(
          "div",
          { class: "flex items-start justify-between gap-3" },
          h(
            "div",
            { class: "flex flex-col gap-1.5 min-w-0" },
            h("span", { class: "font-display font-bold text-2xl text-concrete-900" }, worker.name),
            h("span", { class: "text-sm text-concrete-700" }, `${worker.role} \xB7 ${worker.region}`),
            h(
              "span",
              { class: "inline-flex items-center gap-1.5 text-sm font-semibold text-concrete-700" },
              Icon("hammer", { size: 15, color: "var(--text-subtle)" }),
              `${worker.jobsDone} ${worker.jobsDone === 1 ? "bico realizado" : "bicos realizados"}`
            ),
            h(
              "div",
              { class: "flex items-center gap-3" },
              Rating({ value: worker.rating, count: worker.jobsDone }),
              !isOwn ? h("button", {
                type: "button",
                class: "inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600",
                onClick: () => navigate2("/avaliacoes/trabalhador/" + worker.id)
              }, "Ver avalia\xE7\xF5es", Icon("chevron-right", { size: 16, color: "var(--text-brand)" })) : null
            )
          ),
          isOwn ? Button({ label: "Editar", variant: "secondary", size: "sm", iconLeft: "pencil", onClick: () => navigate2("/perfil/editar") }) : worker.novo ? Badge({ label: "Novo na plataforma", tone: "accent" }) : worker.verified ? Badge({ label: "Verificado", tone: "success", icon: "shield-check" }) : null
        ),
        h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Especialidades"),
          h("div", { class: "flex flex-wrap gap-2" }, ...worker.specialties.map((s) => h("span", { class: "inline-flex items-center h-9 px-3 rounded-full bg-white border border-concrete-300 text-sm font-semibold text-concrete-700" }, s)))
        ),
        !isOwn && worker.facts && worker.facts.length ? Card(
          { padding: "md" },
          h("div", { class: "flex flex-col gap-3.5" }, ...worker.facts.map((f) => h("div", { class: "flex gap-2.5 items-center" }, Icon("circle-check", { size: 18, color: "var(--text-subtle)" }), h("span", { class: "text-sm text-concrete-700" }, f))))
        ) : null,
        postsSection(worker, isOwn),
        !isOwn && jobId ? h("p", { class: "text-sm text-concrete-500" }, "O contato por WhatsApp abre depois que voc\xEA aprovar esse trabalhador para a vaga.") : null
      ),
      !isOwn && jobId ? h(
        "div",
        { class: "sticky bottom-0 px-4 sm:px-6 py-3 bg-white shadow-bar flex flex-col gap-2 lg:static lg:bg-transparent lg:shadow-none lg:pt-0 lg:pb-6" },
        !decidedForJob && !jobFull ? h(
          "div",
          { class: "flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3" },
          Button({
            label: `Aprovar para a vaga \xB7 ${approvedCount(jobId) + 1} de ${getJob(jobId).slots || 1}`,
            size: "lg",
            fullWidth: true,
            iconLeft: "circle-check",
            className: "lg:w-auto lg:px-8",
            onClick: () => {
              decideApplication(jobId, worker.id, "aprovado");
              navigate2(isJobClosed(getJob(jobId)) ? "/fechado/" + jobId : "/vaga-gerenciar/" + jobId);
            }
          }),
          Button({ label: "Recusar candidato", variant: "ghost", fullWidth: true, className: "lg:w-auto", onClick: () => {
            decideApplication(jobId, worker.id, "recusado");
            navigate2("/vaga-gerenciar/" + jobId);
          } })
        ) : decidedForJob ? h(
          "div",
          { class: "flex items-center gap-2.5" },
          Badge({ label: decision === "pre_selecionado" ? "Aprovado" : "Recusado", tone: decision === "pre_selecionado" ? "success" : "danger", icon: decision === "pre_selecionado" ? "circle-check" : "circle-x" }),
          h("span", { class: "flex-1 text-sm text-concrete-500" }, decision === "pre_selecionado" ? "Contato por WhatsApp liberado para os dois lados." : "Avisamos que dessa vez n\xE3o deu certo."),
          Button({ label: "Desfazer", variant: "secondary", size: "sm", onClick: () => {
            decideApplication(jobId, worker.id, null);
          } })
        ) : h("span", { class: "text-center text-xs text-concrete-500" }, "As vagas desse bico j\xE1 foram preenchidas.")
      ) : null
    );
  }
  function postsSection(worker, isOwn) {
    const posts = postsForWorker(worker.id);
    const ui = getUI(POSTS_KEY, { composing: false, mediaUrl: null, mediaType: "image", caption: "", deleteId: null });
    const firstName = worker.name.split(" ")[0];
    return h(
      "div",
      { class: "flex flex-col gap-2.5" },
      h(
        "div",
        { class: "flex items-center justify-between gap-2" },
        h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, isOwn ? "Seus trabalhos" : `Trabalhos de ${firstName}`),
        isOwn ? Button({ label: "Publicar", variant: "ghost", size: "sm", iconLeft: "plus", onClick: () => setUI(POSTS_KEY, { composing: true }) }) : null
      ),
      posts.length === 0 ? EmptyState({
        icon: "camera",
        title: isOwn ? "Mostre o seu trabalho" : "Nenhum post ainda",
        description: isOwn ? "Publique fotos ou v\xEDdeos dos seus bicos para as construtoras verem a qualidade do seu servi\xE7o." : `${firstName} ainda n\xE3o publicou fotos ou v\xEDdeos do trabalho.`,
        actionLabel: isOwn ? "Publicar primeiro post" : null,
        onAction: isOwn ? () => setUI(POSTS_KEY, { composing: true }) : null
      }) : h("div", { class: "flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5" }, ...posts.map((p) => postCard(p, isOwn))),
      isOwn ? composer(worker, ui) : null,
      isOwn ? Dialog({
        open: Boolean(ui.deleteId),
        tone: "danger",
        title: "Excluir esse post?",
        description: "A publica\xE7\xE3o some do seu perfil imediatamente.",
        confirmLabel: "Excluir post",
        onConfirm: () => {
          deleteWorkerPost(ui.deleteId);
          setUI(POSTS_KEY, { deleteId: null });
        },
        cancelLabel: "Cancelar",
        onCancel: () => setUI(POSTS_KEY, { deleteId: null })
      }) : null
    );
  }
  function postCard(post, isOwn) {
    return h(
      "div",
      { class: "flex flex-col rounded-card overflow-hidden border border-concrete-200 bg-white" },
      h(
        "div",
        { class: "relative" },
        post.mediaUrl ? post.mediaType === "video" ? h("video", { src: post.mediaUrl, controls: true, class: "w-full h-72 lg:h-auto lg:aspect-square object-cover bg-concrete-900" }) : h("img", { src: post.mediaUrl, alt: "", class: "w-full h-72 lg:h-auto lg:aspect-square object-cover" }) : h("div", { class: "w-full h-72 lg:h-auto lg:aspect-square bg-concrete-200 flex items-center justify-center" }, Icon("camera", { size: 32, color: "var(--text-subtle)" })),
        post.mediaType === "video" ? h("span", { class: "absolute top-2.5 left-2.5" }, Badge({ label: "V\xEDdeo", tone: "neutral" })) : null,
        isOwn ? h("span", { class: "absolute top-2.5 right-2.5" }, IconButton({ icon: "trash-2", label: "Excluir post", variant: "solid", size: "sm", onClick: () => setUI(POSTS_KEY, { deleteId: post.id }) })) : null
      ),
      h(
        "div",
        { class: "flex flex-col gap-1.5 p-3.5" },
        post.caption ? h("p", { class: "text-sm text-concrete-800 leading-relaxed" }, post.caption) : null,
        h("span", { class: "text-xs text-concrete-400" }, formatPostDate(post.date))
      )
    );
  }
  function composer(worker, ui) {
    const closeAndReset = () => setUI(POSTS_KEY, { composing: false, mediaUrl: null, mediaType: "image", caption: "" });
    const fileInput = h("input", {
      type: "file",
      accept: "image/*,video/*",
      class: "sr-only",
      onchange: (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setUI(POSTS_KEY, { mediaUrl: URL.createObjectURL(file), mediaType: file.type.indexOf("video") === 0 ? "video" : "image" });
      }
    });
    return Sheet(
      { open: ui.composing, title: "Publicar trabalho", onClose: closeAndReset },
      h(
        "label",
        {
          class: "relative flex items-center justify-center overflow-hidden cursor-pointer bg-concrete-100 border-2 border-dashed border-concrete-300 hover:border-brand-400 rounded-card w-full transition-colors",
          style: { height: "12rem" }
        },
        fileInput,
        ui.mediaUrl ? ui.mediaType === "video" ? h("video", { src: ui.mediaUrl, controls: true, class: "absolute inset-0 w-full h-full object-cover" }) : h("img", { src: ui.mediaUrl, alt: "", class: "absolute inset-0 w-full h-full object-cover" }) : h("span", { class: "flex flex-col items-center gap-1.5 text-concrete-500 px-3 text-center" }, Icon("camera", { size: 24 }), h("span", { class: "text-xs font-semibold" }, "Toque para escolher uma foto ou v\xEDdeo"))
      ),
      h(
        "div",
        { class: "flex flex-col gap-1.5 w-full" },
        h("label", { for: "worker-post-caption", class: "text-sm font-semibold text-concrete-900" }, "Descri\xE7\xE3o"),
        h("textarea", {
          id: "worker-post-caption",
          "data-focus-id": "worker-post-caption",
          rows: 3,
          placeholder: "Conte o que foi feito nesse bico...",
          value: ui.caption,
          class: "w-full px-3 py-2.5 bg-white rounded-control border border-concrete-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none text-base text-concrete-900 placeholder:text-concrete-400 resize-none transition-colors duration-150",
          oninput: (e) => setUI(POSTS_KEY, { caption: e.target.value })
        })
      ),
      Button({
        label: "Publicar",
        size: "lg",
        fullWidth: true,
        disabled: !ui.mediaUrl,
        onClick: () => {
          addWorkerPost(worker.id, { mediaUrl: ui.mediaUrl, mediaType: ui.mediaType, caption: ui.caption.trim() });
          closeAndReset();
        }
      })
    );
  }
  function notFound(navigate2) {
    return h(
      "div",
      { class: "flex flex-col items-center justify-center min-h-screen gap-3" },
      h("p", { class: "text-concrete-500" }, "Trabalhador n\xE3o encontrado."),
      Button({ label: "Voltar ao mural", variant: "secondary", onClick: () => navigate2("/mural") })
    );
  }

  // js/screens/shared/EditWorkerProfile.js
  var KEY6 = "edit-worker-profile";
  var BANNER_KEY = "worker-profile-photo";
  function renderEditWorkerProfile(navigate2) {
    const worker = currentWorker();
    const ui = getUI(KEY6, () => ({ name: worker.name, role: worker.role, region: worker.region, specialties: [...worker.specialties], photo: null }));
    const banner = getUI(BANNER_KEY, { photo: null });
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 lg:bg-transparent lg:min-h-0" },
      BackBar({ title: "Editar perfil", onBack: () => goBack("/perfil") }),
      h(
        "div",
        { class: "flex-1 flex flex-col gap-5 px-4 sm:px-6 lg:px-0 py-4" },
        h(
          "div",
          { class: "flex flex-col gap-1.5" },
          h("span", { class: "text-sm font-semibold text-concrete-900" }, "Foto de capa"),
          PhotoSlot({ shape: "rect", height: "9rem", placeholder: "Toque para escolher uma foto de capa", value: banner.photo, onChange: (v) => setUI(BANNER_KEY, { photo: v }) })
        ),
        h(
          "div",
          { class: "flex flex-col items-center gap-2" },
          PhotoSlot({ shape: "circle", value: ui.photo, onChange: (v) => setUI(KEY6, { photo: v }), className: "w-24 h-24", placeholder: "Sua foto" })
        ),
        Input({ id: "edit-worker-name", label: "Nome completo", icon: "user", value: ui.name, onInput: (v) => setUI(KEY6, { name: v }) }),
        Select({ label: "Cargo ou especialidade principal", options: CARGOS_TRABALHADOR, value: ui.role, onChange: (v) => setUI(KEY6, { role: v }) }),
        Select({ label: "Regi\xE3o de atua\xE7\xE3o", options: REGIOES_TRABALHADOR, value: ui.region, onChange: (v) => setUI(KEY6, { region: v }) }),
        h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("span", { class: "text-sm font-semibold text-concrete-900" }, "Especialidades"),
          h("div", { class: "flex flex-wrap gap-2" }, ...ESPECIALIDADES.map((e) => Tag({
            label: e,
            selected: ui.specialties.includes(e),
            onClick: () => setUI(KEY6, { specialties: ui.specialties.includes(e) ? ui.specialties.filter((x) => x !== e) : ui.specialties.concat([e]) })
          })))
        ),
        h("div", { class: "pt-2 border-t border-concrete-200" }, Button({ label: "Sair da conta", variant: "danger", fullWidth: true, iconLeft: "log-out", onClick: () => navigate2("/login") }))
      ),
      h(
        "div",
        { class: "px-4 sm:px-6 lg:px-0 py-3 bg-white shadow-bar flex gap-3 lg:static lg:bg-transparent lg:shadow-none" },
        Button({ label: "Cancelar", variant: "secondary", className: "flex-1", onClick: () => navigate2("/perfil") }),
        Button({ label: "Salvar altera\xE7\xF5es", className: "flex-[1.4]", onClick: () => {
          Object.assign(worker, { name: ui.name, role: ui.role, region: ui.region, specialties: ui.specialties });
          navigate2("/perfil");
        } })
      )
    );
  }

  // js/components/JobCover.js
  function jobPhotos(job) {
    if (Array.isArray(job.photos)) return job.photos;
    return job.photo ? [job.photo] : [];
  }
  var COVERS = [
    { test: /eletric/i, icon: "plug-zap", from: "#2F4BB5", to: "#0A1A54" },
    { test: /pint/i, icon: "paint-roller", from: "#2AA096", to: "#08514A" },
    { test: /azulej|porcelan|revest/i, icon: "layout-grid", from: "#6E8DF5", to: "#1D3FB8" },
    { test: /encanad|hidr/i, icon: "droplets", from: "#3AA9D1", to: "#0C5F80" },
    { test: /armador|ferr/i, icon: "construction", from: "#5C6672", to: "#161C24" },
    { test: /carpint|marcen/i, icon: "hammer", from: "#C08A4A", to: "#6E4015" },
    { test: /gess/i, icon: "ruler", from: "#8E9DB5", to: "#46546B" },
    { test: /telhad|telhado/i, icon: "house", from: "#E0A24A", to: "#94540F" },
    { test: /mestre/i, icon: "hard-hat", from: "#3F63F0", to: "#0E2472" },
    { test: /servente|ajudante/i, icon: "shovel", from: "#9AA3AE", to: "#3F4852" },
    { test: /pedreiro|alvenaria|reboco|acabamento/i, icon: "brick-wall", from: "#D9774B", to: "#842F12" }
  ];
  var DEFAULT_COVER = { icon: "hard-hat", from: "#1D4BED", to: "#0A1A54" };
  function JobCover({ job, large = false }) {
    const c = COVERS.find((x) => x.test.test(job.role || "")) || DEFAULT_COVER;
    return h(
      "div",
      { class: "absolute inset-0", style: { background: `linear-gradient(145deg, ${c.from}, ${c.to})` } },
      h("div", { class: "absolute inset-0 job-cover-grid" }),
      h("div", { class: "absolute inset-0", style: { background: "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.22), transparent 58%)" } }),
      h("span", { class: "absolute -right-8 -bottom-8 opacity-[0.13] -rotate-12" }, Icon(c.icon, { size: large ? 280 : 168, color: "#fff" })),
      h(
        "div",
        { class: "absolute inset-0 flex items-center justify-center" },
        h("span", {
          class: cx("inline-flex items-center justify-center bg-white/15 ring-1 ring-white/30 shadow-raised", large ? "w-24 h-24 rounded-3xl" : "w-16 h-16 rounded-2xl"),
          style: { backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }
        }, Icon(c.icon, { size: large ? 44 : 30, color: "#fff" }))
      )
    );
  }
  function SaveFlag({ saved, onToggle }) {
    const label = saved ? "Remover dos salvos" : "Salvar vaga";
    return h(
      "button",
      {
        type: "button",
        "aria-label": label,
        "aria-pressed": saved ? "true" : "false",
        title: label,
        class: "absolute top-2 right-2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full transition-transform active:scale-90 hover:scale-110",
        onClick: (e) => {
          e.stopPropagation();
          onToggle();
        }
      },
      h(
        "span",
        { class: "relative inline-flex w-6 h-6", style: { filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" } },
        Icon("bookmark-solid", { size: 24, color: saved ? "var(--brand)" : "rgba(16,20,24,0.32)", className: "absolute inset-0" }),
        Icon("bookmark", { size: 24, color: "#fff", className: "absolute inset-0" })
      )
    );
  }

  // js/components/JobCard.js
  function PayBlock({ job, muted }) {
    if (muted) {
      return h(
        "div",
        { class: "shrink-0 w-24 h-16 rounded-card bg-concrete-100 flex flex-col items-center justify-center gap-0.5" },
        h("span", { class: "font-mono font-bold text-lg text-concrete-500" }, job.pay != null ? formatBRL(job.pay) : "A combinar"),
        h("span", { class: "text-[0.5625rem] font-semibold tracking-wide uppercase text-concrete-500" }, "por di\xE1ria")
      );
    }
    if (job.pay == null) {
      return h(
        "div",
        { class: "shrink-0 w-24 h-16 rounded-card bg-white border-[1.5px] border-brand-200 flex flex-col items-center justify-center gap-1" },
        Icon("handshake", { size: 16, color: "var(--text-brand)" }),
        h("span", { class: "text-xs font-semibold text-brand-600" }, "A combinar")
      );
    }
    return h(
      "div",
      { class: "shrink-0 w-24 h-16 rounded-card bg-brand-500 shadow-card flex flex-col items-center justify-center gap-0.5" },
      h("span", { class: "font-mono font-bold text-lg text-white" }, formatBRL(job.pay)),
      h("span", { class: "text-[0.5625rem] font-semibold tracking-wide uppercase text-white/85" }, "por di\xE1ria")
    );
  }
  function JobCard({ job, companyName, onClick, overlay = null, footer = null, photoLabel = "Foto do canteiro", muted = false, saved = false, onToggleSave = null }) {
    const cover = jobPhotos(job)[0];
    const photo = h(
      "div",
      { class: cx("relative h-[9.25rem] bg-concrete-200 overflow-hidden", muted ? "grayscale" : "") },
      cover ? h("img", { src: cover, alt: "", class: "w-full h-full object-cover" }) : [
        h("div", { class: "lg:hidden w-full h-full flex items-center justify-center text-concrete-400 text-xs" }, photoLabel),
        h("div", { class: "hidden lg:block absolute inset-0" }, JobCover({ job }))
      ],
      overlay,
      onToggleSave ? SaveFlag({ saved, onToggle: onToggleSave }) : null
    );
    const body = h(
      "div",
      { class: "flex flex-col gap-3 p-4" },
      h(
        "div",
        { class: "flex items-center gap-2.5" },
        h("span", { class: "flex-1 min-w-0 font-display font-semibold text-lg leading-tight text-concrete-900 truncate" }, job.role),
        PayBlock({ job, muted })
      ),
      h(
        "div",
        { class: "flex items-center flex-wrap gap-2" },
        h(
          "span",
          { class: "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-concrete-100 text-sm font-semibold text-concrete-900" },
          Icon("calendar", { size: 14 }),
          job.date
        ),
        h(
          "span",
          { class: "inline-flex items-center gap-1.5 text-sm text-concrete-500" },
          Icon("map-pin", { size: 14, color: "var(--text-subtle)" }),
          companyName ? `${companyName} \xB7 ${job.location}` : job.location
        )
      )
    );
    const card = Card({ padding: "none", onClick, className: "flex flex-col" }, photo, body, footer);
    return card;
  }
  function JobCardFooter({ badgeEl, hint, hintColor = "var(--text-brand)", extra }) {
    return h(
      "div",
      { class: "flex items-center justify-between gap-2 px-4 py-2.5 bg-concrete-100 border-t border-concrete-200" },
      badgeEl,
      extra || (hint ? h("span", { class: "inline-flex items-center gap-0.5 text-sm font-semibold whitespace-nowrap", style: { color: hintColor } }, hint, Icon("chevron-right", { size: 16, color: hintColor })) : null)
    );
  }

  // js/screens/shared/CompanyProfileScreen.js
  function renderCompanyProfile(navigate2, params) {
    const isOwn = !params.id;
    const company = isOwn ? currentCompany() : getCompany(params.id);
    if (!company) return notFound2(navigate2);
    const ui = getUI("company-profile", { capa: null, logo: null, deleteId: null });
    const openJobs = activeJobs().filter((j) => j.companyId === company.id && !j.closed && !isJobFull(j));
    const postToDelete = openJobs.find((j) => j.id === ui.deleteId);
    const successfulJobs = successfulJobsForCompany(company.id);
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 lg:bg-transparent lg:min-h-0" },
      h(
        "div",
        { class: "relative" },
        isOwn && ui.capa ? h("img", { src: ui.capa, alt: "", class: "w-full h-48 object-cover lg:rounded-card" }) : h("div", { class: "h-48 bg-concrete-200 lg:rounded-card" }),
        !isOwn ? h("div", { class: "absolute top-2 left-2" }, IconButton({ icon: "arrow-left", label: "Voltar", variant: "solid", onClick: () => goBack("/mural") })) : null,
        h(
          "div",
          { class: "absolute left-4 sm:left-6 -bottom-10 w-24 h-24 rounded-full bg-white p-1 shadow-raised" },
          h(
            "div",
            { class: "w-full h-full rounded-full bg-brand-50 flex items-center justify-center overflow-hidden" },
            isOwn && ui.logo ? h("img", { src: ui.logo, alt: "", class: "w-full h-full object-cover" }) : Icon("building-2", { size: 26, color: "var(--brand)" })
          )
        )
      ),
      h(
        "div",
        { class: "flex flex-col gap-5 pt-12 px-4 sm:px-6 pb-24 lg:pb-6" },
        h(
          "div",
          { class: "flex items-start justify-between gap-3" },
          h(
            "div",
            { class: "flex flex-col gap-1.5 min-w-0" },
            h("span", { class: "font-display font-bold text-2xl text-concrete-900" }, company.name),
            h("span", { class: "text-sm text-concrete-700" }, `${company.tipoObra || "Constru\xE7\xE3o civil"} \xB7 ${company.location}`),
            h(
              "span",
              { class: "inline-flex items-center gap-1.5 text-sm font-semibold text-concrete-700" },
              Icon("circle-check", { size: 15, color: "var(--text-subtle)" }),
              `${successfulJobs} ${successfulJobs === 1 ? "bico conclu\xEDdo" : "bicos conclu\xEDdos"}`
            ),
            h(
              "div",
              { class: "flex items-center gap-3" },
              Rating({ value: company.rating, count: company.reviewCount }),
              !isOwn ? h("button", {
                type: "button",
                class: "inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600",
                onClick: () => navigate2("/avaliacoes/construtora/" + company.id)
              }, "Ver avalia\xE7\xF5es", Icon("chevron-right", { size: 16, color: "var(--text-brand)" })) : null
            )
          ),
          isOwn ? Button({ label: "Editar", variant: "secondary", size: "sm", iconLeft: "pencil", onClick: () => navigate2("/empresa/editar") }) : company.verified ? Badge({ label: "Verificada", tone: "success", icon: "shield-check" }) : null
        ),
        isOwn ? Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-3.5" },
            h("div", { class: "flex items-center justify-between gap-3" }, h("span", { class: "text-sm text-concrete-500" }, "CNPJ"), h("span", { class: "font-mono text-sm text-concrete-900" }, company.cnpj)),
            h("div", { class: "flex items-center justify-between gap-3" }, h("span", { class: "text-sm text-concrete-500" }, "Tipo de obra"), h("span", { class: "font-semibold text-concrete-900 text-right" }, company.tipoObra)),
            h("div", { class: "flex items-center gap-2 pt-3.5 border-t border-concrete-200" }, Badge({ label: "Verificada", tone: "success", icon: "shield-check" }), h("span", { class: "text-xs text-concrete-500" }, `CNPJ conferido em ${company.verifiedSince}`))
          )
        ) : Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-3.5" },
            h("div", { class: "flex gap-2.5 items-center" }, Icon("hand-coins", { size: 20, color: "var(--text-subtle)" }), h("span", { class: "text-sm text-concrete-700" }, `${company.paidCount || 0} di\xE1rias pagas pela plataforma`)),
            h("div", { class: "flex gap-2.5 items-center" }, Icon("message-circle", { size: 20, color: "var(--text-subtle)" }), h("span", { class: "text-sm text-concrete-700" }, company.respondTime || "Responde em poucas horas, em m\xE9dia")),
            h("div", { class: "flex gap-2.5 items-center" }, Icon("hammer", { size: 20, color: "var(--text-subtle)" }), h("span", { class: "text-sm text-concrete-700" }, `${openJobs.length} vagas abertas agora`)),
            h("div", { class: "flex gap-2.5 items-center" }, Icon("calendar", { size: 20, color: "var(--text-subtle)" }), h("span", { class: "text-sm text-concrete-700" }, company.sinceLabel || "Na Bicos"))
          )
        ),
        isOwn ? h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h(
            "div",
            { class: "flex items-center justify-between gap-2" },
            h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Seus posts"),
            Button({ label: "Publicar", variant: "ghost", size: "sm", iconLeft: "plus", onClick: () => navigate2("/criar-vaga") })
          ),
          openJobs.length === 0 ? EmptyState({ icon: "hammer", title: "Voc\xEA ainda n\xE3o publicou nenhuma vaga", description: "Publique seu primeiro bico para come\xE7ar a receber candidatos.", actionLabel: "Publicar vaga", onAction: () => navigate2("/criar-vaga") }) : h("div", { class: "flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5" }, ...openJobs.map((job) => JobCard({
            job,
            companyName: null,
            onClick: () => navigate2("/vaga-gerenciar/" + job.id),
            footer: JobCardFooter({
              badgeEl: Badge(statusBadge(job)),
              extra: h(
                "div",
                { class: "flex gap-1" },
                IconButton({ icon: "trash-2", label: "Excluir post", onClick: (e) => {
                  e.stopPropagation();
                  setUI("company-profile", { deleteId: job.id });
                } })
              )
            })
          })))
        ) : h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Vagas publicadas"),
          openJobs.length === 0 ? EmptyState({ icon: "hammer", title: "Nenhuma vaga aberta no momento", description: `${company.name} n\xE3o tem bicos publicados agora. Volte mais tarde para ver novidades.` }) : h("div", { class: "flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5" }, ...openJobs.map((job) => JobCard({ job, companyName: null, onClick: () => navigate2("/vaga/" + job.id) })))
        )
      ),
      Dialog({
        open: Boolean(ui.deleteId),
        tone: "danger",
        title: "Excluir esse post?",
        description: "A vaga sai do mural imediatamente. Candidatos j\xE1 enviados n\xE3o s\xE3o avisados.",
        confirmLabel: "Excluir post",
        onConfirm: () => {
          deleteJobPost(ui.deleteId);
          setUI("company-profile", { deleteId: null });
        },
        cancelLabel: "Cancelar",
        onCancel: () => setUI("company-profile", { deleteId: null })
      })
    );
  }
  function statusBadge(job) {
    const pending = pendingCount(job.id);
    const approved = approvedCount(job.id);
    if (isJobClosed(job)) return { label: `Bico fechado \xB7 ${approved} de ${job.slots || 1}`, tone: "success", icon: "circle-check" };
    if (pending) return { label: pending === 1 ? "1 aguardando an\xE1lise" : `${pending} aguardando an\xE1lise`, tone: "warning", icon: "clock" };
    const total = applicationsForJob(job.id).length;
    if (total) return { label: total === 1 ? "1 candidato" : `${total} candidatos`, tone: "brand", icon: "users" };
    return { label: "Sem candidatos ainda", tone: "neutral", icon: "search-x" };
  }
  function notFound2(navigate2) {
    return h(
      "div",
      { class: "flex flex-col items-center justify-center min-h-screen gap-3" },
      h("p", { class: "text-concrete-500" }, "Construtora n\xE3o encontrada."),
      Button({ label: "Voltar ao mural", variant: "secondary", onClick: () => navigate2("/mural") })
    );
  }

  // js/screens/shared/EditCompanyProfile.js
  var KEY7 = "edit-company-profile";
  var BANNER_KEY2 = "company-profile";
  function renderEditCompanyProfile(navigate2) {
    const company = currentCompany();
    const ui = getUI(KEY7, () => ({ name: company.name, tipoObra: company.tipoObra, location: company.location, whatsapp: company.whatsapp }));
    const banner = getUI(BANNER_KEY2, { capa: null, logo: null, deleteId: null });
    return h(
      "div",
      { class: "min-h-screen flex flex-col bg-concrete-50 lg:bg-transparent lg:min-h-0" },
      BackBar({ title: "Editar empresa", onBack: () => goBack("/empresa") }),
      h(
        "div",
        { class: "flex-1 flex flex-col gap-5 px-4 sm:px-6 lg:px-0 py-4" },
        h(
          "div",
          { class: "flex flex-col gap-1.5" },
          h("span", { class: "text-sm font-semibold text-concrete-900" }, "Foto de capa"),
          PhotoSlot({ shape: "rect", height: "9rem", placeholder: "Capa da construtora", value: banner.capa, onChange: (v) => setUI(BANNER_KEY2, { capa: v }) })
        ),
        h(
          "div",
          { class: "flex flex-col items-center gap-2" },
          PhotoSlot({ shape: "circle", value: banner.logo, onChange: (v) => setUI(BANNER_KEY2, { logo: v }), className: "w-24 h-24", placeholder: "Logo" })
        ),
        Input({ id: "edit-company-name", label: "Nome da empresa", icon: "building-2", hint: "\xC9 esse nome que aparece no seu perfil e nas vagas que voc\xEA publicar.", value: ui.name, onInput: (v) => setUI(KEY7, { name: v }) }),
        h(
          "div",
          { class: "flex flex-col gap-1.5 w-full" },
          h("span", { class: "text-sm font-semibold text-concrete-900" }, "CNPJ"),
          h(
            "div",
            { class: "flex items-center gap-2 min-h-12 px-3 bg-concrete-100 rounded-control border border-concrete-200" },
            Icon("lock", { size: 18, color: "var(--text-subtle)" }),
            h("span", { class: "flex-1 min-w-0 font-mono text-base text-concrete-500 truncate" }, company.cnpj)
          ),
          h("span", { class: "text-sm text-concrete-500" }, "O CNPJ \xE9 conferido na Bicos e n\xE3o pode ser alterado. Fale com o suporte se precisar corrigi-lo.")
        ),
        Select({ label: "Tipo de obra", options: TIPOS_OBRA, value: ui.tipoObra, onChange: (v) => setUI(KEY7, { tipoObra: v }) }),
        Input({ id: "edit-company-location", label: "Regi\xE3o onde voc\xEA contrata", icon: "map-pin", value: ui.location, onInput: (v) => setUI(KEY7, { location: v }) }),
        Input({ id: "edit-company-whatsapp", label: "WhatsApp de contato", icon: "phone", value: ui.whatsapp, onInput: (v) => setUI(KEY7, { whatsapp: v }) }),
        h("div", { class: "pt-2 border-t border-concrete-200" }, Button({ label: "Sair da conta", variant: "danger", fullWidth: true, iconLeft: "log-out", onClick: () => navigate2("/login") }))
      ),
      h(
        "div",
        { class: "px-4 sm:px-6 lg:px-0 py-3 bg-white shadow-bar flex gap-3 lg:static lg:bg-transparent lg:shadow-none" },
        Button({ label: "Cancelar", variant: "secondary", className: "flex-1", onClick: () => navigate2("/empresa") }),
        Button({ label: "Salvar altera\xE7\xF5es", className: "flex-[1.4]", onClick: () => {
          Object.assign(company, ui);
          navigate2("/empresa");
        } })
      )
    );
  }

  // js/screens/shared/ReviewsScreen.js
  function renderReviews(navigate2, params) {
    const type = params.type === "construtora" ? "construtora" : "trabalhador";
    const subject = type === "trabalhador" ? getWorker(params.id) : getCompany(params.id);
    if (!subject) return notFound3(navigate2);
    const role = getRole();
    const allowed = type === "trabalhador" ? role === "recrutador" : role === "trabalhador";
    const backTarget = type === "trabalhador" ? "/trabalhador/" + params.id : "/construtora/" + params.id;
    if (!allowed) {
      return h(
        "div",
        { class: "flex flex-col" },
        BackBar({ title: "Avalia\xE7\xF5es", onBack: () => goBack(backTarget) }),
        EmptyState({
          icon: "lock",
          title: "Essas avalia\xE7\xF5es n\xE3o s\xE3o suas para ver",
          description: type === "trabalhador" ? "S\xF3 construtoras podem ver as avalia\xE7\xF5es de um trabalhador." : "S\xF3 trabalhadores podem ver as avalia\xE7\xF5es de uma construtora."
        })
      );
    }
    const reviews = subject.reviews || [];
    const count = type === "trabalhador" ? subject.jobsDone : subject.reviewCount;
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Avalia\xE7\xF5es", onBack: () => goBack(backTarget) }),
      h(
        "div",
        { class: "flex flex-col gap-5 px-4 sm:px-6 lg:px-0 py-4" },
        h(
          "div",
          { class: "flex flex-col gap-1.5" },
          h("span", { class: "font-display font-bold text-2xl text-concrete-900" }, subject.name),
          Rating({ value: subject.rating, count })
        ),
        reviews.length === 0 ? EmptyState({ icon: "star", title: "Ainda n\xE3o h\xE1 avalia\xE7\xF5es", description: `${subject.name} ainda n\xE3o recebeu nenhuma avalia\xE7\xE3o na plataforma.` }) : h("div", { class: "flex flex-col gap-3" }, ...reviews.map((r) => Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-2" },
            h("div", { class: "flex items-center justify-between gap-2" }, h("span", { class: "font-semibold text-concrete-900" }, r.company || r.author), Rating({ value: r.value, showValue: false, size: 13 })),
            h("span", { class: "text-sm text-concrete-700" }, r.text),
            h("span", { class: "text-xs text-concrete-400" }, r.date)
          )
        )))
      )
    );
  }
  function notFound3(navigate2) {
    return h(
      "div",
      { class: "flex flex-col items-center justify-center min-h-screen gap-3" },
      h("p", { class: "text-concrete-500" }, "N\xE3o encontrado."),
      Button({ label: "Voltar ao mural", variant: "secondary", onClick: () => navigate2("/mural") })
    );
  }

  // js/components/JobTile.js
  function JobTile({ job, company, onClick, urgent = false, mine = false, saved = false, onToggleSave = null }) {
    const cover = jobPhotos(job)[0];
    const count = jobPhotos(job).length;
    const bairro = String(job.location || "").split(",")[0];
    const when = [bairro, job.date, job.hours].filter(Boolean).join(" \xB7 ");
    const pill = (children, className = "") => h("span", {
      class: cx("inline-flex items-center gap-1 h-6 sm:h-7 px-2 sm:px-2.5 rounded-full bg-white text-[0.6875rem] sm:text-xs font-semibold shadow-[0_1px_3px_rgba(16,20,24,0.18)] whitespace-nowrap", className || "text-concrete-900")
    }, children);
    const photo = h(
      "div",
      { class: "relative aspect-[20/19] rounded-xl sm:rounded-2xl overflow-hidden bg-concrete-200" },
      cover ? h("img", { src: cover, alt: "", loading: "lazy", draggable: "false", class: "absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" }) : JobCover({ job }),
      h(
        "div",
        { class: "absolute top-2 left-2 sm:top-3 sm:left-3 right-12 flex flex-wrap gap-1.5 pointer-events-none" },
        urgent ? pill([Icon("zap", { size: 12, color: "var(--text-danger)" }), "Urgente"]) : null,
        mine ? pill("Sua vaga", "text-brand-600") : null
      ),
      count > 1 ? h(
        "span",
        { class: "absolute bottom-2 right-2 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-black/55 text-white text-[0.6875rem] font-semibold pointer-events-none" },
        Icon("images", { size: 12, color: "#fff" }),
        String(count)
      ) : null,
      onToggleSave ? SaveFlag({ saved, onToggle: onToggleSave }) : null
    );
    const rating = company && company.rating != null ? h(
      "span",
      { class: "inline-flex items-center gap-0.5 shrink-0 text-concrete-900" },
      Icon("star", { size: 12, color: "currentColor" }),
      String(company.rating).replace(".", ",")
    ) : null;
    const text = h(
      "div",
      { class: "flex flex-col pt-2 sm:pt-2.5 text-[0.8125rem] sm:text-sm leading-[1.35]" },
      h(
        "div",
        { class: "flex items-center gap-2" },
        h("span", { class: "flex-1 min-w-0 truncate font-semibold text-concrete-900 sm:text-[0.9375rem]" }, job.role),
        rating
      ),
      h("span", { class: "truncate text-concrete-500" }, company ? company.name : job.location),
      h("span", { class: "truncate text-concrete-500" }, when),
      h(
        "span",
        { class: "truncate text-concrete-900 pt-0.5" },
        job.pay == null ? h("span", { class: "font-semibold" }, "A combinar") : [h("span", { class: "font-semibold" }, formatBRL(job.pay)), h("span", { class: "text-concrete-500" }, " por di\xE1ria")]
      )
    );
    return h("div", {
      role: "link",
      tabindex: "0",
      "aria-label": [job.role, company && company.name, when].filter(Boolean).join(", "),
      class: "group min-w-0 cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
      onClick,
      onkeydown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }
    }, photo, text);
  }

  // js/screens/worker/Feed.js
  var KEY8 = "feed";
  function openJob(navigate2, role, job) {
    return () => navigate2(role === "recrutador" && isMine(job) ? "/vaga-gerenciar/" + job.id : "/vaga/" + job.id);
  }
  function km(distance) {
    return parseFloat(String(distance || "0").replace(",", ".")) || 0;
  }
  function payNum(job) {
    return job.pay == null ? -1 : job.pay;
  }
  function orderJobs(jobs, role, sort = "perto") {
    const rank = (j) => role === "recrutador" && isMine(j) ? 0 : j.urgent ? 1 : 2;
    const by = sort === "valor" ? (a, b) => payNum(b) - payNum(a) : sort === "cedo" ? (a, b) => (a.date === "Hoje" ? 0 : 1) - (b.date === "Hoje" ? 0 : 1) || km(a.distance) - km(b.distance) : (a, b) => km(a.distance) - km(b.distance);
    return jobs.slice().sort((a, b) => rank(a) - rank(b) || by(a, b));
  }
  function tileFor(navigate2, role, job) {
    return JobTile({
      job,
      company: getCompany(job.companyId),
      onClick: openJob(navigate2, role, job),
      urgent: job.urgent,
      mine: role === "recrutador" && isMine(job),
      saved: isJobSaved(job.id),
      onToggleSave: role === "trabalhador" ? () => toggleSavedJob(job.id) : null
    });
  }
  function tileGrid(navigate2, role, jobs) {
    return h("div", { class: "card-grid" }, ...jobs.map((j) => tileFor(navigate2, role, j)));
  }
  function renderFeed(navigate2) {
    const role = getRole();
    const ui = getUI(KEY8, { search: "", location: "Tatuap\xE9, SP", locationOpen: false, filtersOpen: false, tipo: null, dist: "Toda a cidade", quando: null, sort: "perto", notifyUrgent: true });
    return h("div", {}, mobileFeed(navigate2, role, ui), desktopFeed(navigate2, role, ui));
  }
  function mobileFeed(navigate2, role, ui) {
    const q = ui.search.trim().toLowerCase();
    const searching = q.length > 0;
    const openJobs = activeJobs().filter((j) => !isJobClosed(j));
    const matches = (j) => !q || (j.role + " " + getCompany(j.companyId).name + " " + j.location).toLowerCase().includes(q);
    const passesFilters = (j) => (!ui.tipo || j.role === ui.tipo) && (ui.dist === "Toda a cidade" || km(j.distance) <= parseInt(ui.dist)) && (!ui.quando || j.date === ui.quando);
    const filtered = openJobs.filter(matches).filter(passesFilters);
    const ordered = orderJobs(filtered, role, ui.sort);
    const jobResults = searching ? openJobs.filter(matches) : [];
    const companyResults = searching ? allCompanies().filter((c) => (c.name + " " + c.location).toLowerCase().includes(q)) : [];
    const workerResults = searching ? allWorkers().filter((w) => (w.name + " " + w.role + " " + w.region).toLowerCase().includes(q)) : [];
    const noResults = searching && jobResults.length === 0 && companyResults.length === 0 && workerResults.length === 0;
    const activeChips = [
      ui.tipo ? { label: ui.tipo, icon: "hard-hat", remove: () => setUI(KEY8, { tipo: null }) } : null,
      ui.dist !== "Toda a cidade" ? { label: ui.dist, icon: "map-pin", remove: () => setUI(KEY8, { dist: "Toda a cidade" }) } : null,
      ui.quando ? { label: ui.quando, icon: "calendar", remove: () => setUI(KEY8, { quando: null }) } : null
    ].filter(Boolean);
    const activeCount = activeChips.length;
    const header = h(
      "div",
      { class: "sticky top-0 z-20 flex flex-col gap-2 px-4 pt-2 pb-3.5 bg-white border-b border-concrete-200" },
      h(
        "div",
        { class: "flex items-center justify-between gap-2" },
        h(
          "button",
          {
            type: "button",
            class: "flex items-center gap-2 min-h-12 -ml-1.5 px-1.5 rounded-control",
            onClick: () => setUI(KEY8, { locationOpen: true })
          },
          Icon("map-pin", { size: 20, color: "var(--brand)" }),
          h(
            "span",
            { class: "flex flex-col items-start" },
            h("span", { class: "text-xs text-concrete-500" }, "Bicos perto de"),
            h("span", { class: "font-semibold text-concrete-900 max-w-[9.5rem] truncate" }, ui.location)
          ),
          Icon("chevron-down", { size: 16, color: "var(--text-muted)" })
        ),
        NotificationBell({ count: role === "recrutador" ? 3 : 2, onClick: () => navigate2("/notificacoes") })
      ),
      SearchPill({ id: "feed-search", role, ui, compact: true })
    );
    const searchResults = h(
      "div",
      { class: "flex flex-col gap-5" },
      jobResults.length ? h(
        "div",
        { class: "flex flex-col gap-3" },
        h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Vagas"),
        tileGrid(navigate2, role, orderJobs(jobResults, role))
      ) : null,
      companyResults.length ? h(
        "div",
        { class: "flex flex-col gap-2" },
        h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Construtoras"),
        ...companyResults.map((c) => Card(
          { padding: "md", onClick: () => navigate2("/construtora/" + c.id) },
          h(
            "div",
            { class: "flex items-center gap-3" },
            h("span", { class: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 shrink-0" }, Icon("building-2", { size: 20, color: "var(--brand)" })),
            h(
              "div",
              { class: "flex-1 min-w-0 flex flex-col" },
              h("span", { class: "font-semibold text-concrete-900 truncate" }, c.name),
              h("span", { class: "text-sm text-concrete-500 truncate" }, c.location)
            ),
            Rating({ value: c.rating, count: c.reviewCount })
          )
        ))
      ) : null,
      workerResults.length ? h(
        "div",
        { class: "flex flex-col gap-2" },
        h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Trabalhadores"),
        ...workerResults.map((w) => Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex items-center gap-3" },
            h("span", { class: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-50 text-accent-600 font-bold text-sm shrink-0" }, w.initials),
            h(
              "div",
              { class: "flex-1 min-w-0 flex flex-col" },
              h("span", { class: "font-semibold text-concrete-900 truncate" }, w.name),
              h("span", { class: "text-sm text-concrete-500 truncate" }, `${w.role} \xB7 ${w.region}`)
            ),
            Rating({ value: w.rating, count: w.jobsDone })
          )
        ))
      ) : null,
      noResults ? EmptyState({ icon: "search-x", title: "Nenhum resultado para essa busca", description: "Confira a grafia ou tente um termo mais curto.", actionLabel: "Limpar busca", onAction: () => setUI(KEY8, { search: "" }) }) : null
    );
    const browseResults = h(
      "div",
      { class: "flex flex-col gap-4" },
      h(
        "div",
        { class: "flex flex-wrap items-center gap-2" },
        Tag({ label: activeCount ? `Filtros \xB7 ${activeCount}` : "Filtros", icon: "sliders-horizontal", onClick: () => setUI(KEY8, { filtersOpen: true }) }),
        ...activeChips.map((c) => Tag({ label: c.label, icon: c.icon, selected: true, onRemove: c.remove }))
      ),
      h("div", { class: "flex bg-concrete-100 rounded-full p-1 gap-1" }, ...[
        { id: "perto", label: "Mais perto" },
        { id: "valor", label: "Maior valor" },
        { id: "cedo", label: "Mais cedo" }
      ].map((o) => h("button", {
        type: "button",
        class: `flex-1 h-10 rounded-full text-sm font-bold transition-colors ${ui.sort === o.id ? "bg-white text-brand-600 shadow-card" : "text-concrete-500"}`,
        onClick: () => setUI(KEY8, { sort: o.id })
      }, o.label))),
      ordered.length ? tileGrid(navigate2, role, ordered) : EmptyState({ icon: "search-x", title: "Nenhuma vaga com esse filtro", description: "Tire um filtro ou aumente a dist\xE2ncia para ver mais bicos.", actionLabel: "Limpar filtros", onAction: () => setUI(KEY8, { tipo: null, dist: "Toda a cidade", quando: null }) })
    );
    return h(
      "div",
      { class: "flex flex-col lg:hidden" },
      header,
      h("div", { class: "px-4 pt-4 pb-6 flex flex-col gap-5" }, searching ? searchResults : browseResults),
      Sheet(
        { open: ui.locationOpen, title: "Onde voc\xEA quer trabalhar", onClose: () => setUI(KEY8, { locationOpen: false }) },
        Button({ label: "Usar minha localiza\xE7\xE3o agora", variant: "secondary", fullWidth: true, iconLeft: "locate-fixed", onClick: () => setUI(KEY8, { location: "Tatuap\xE9, SP", locationOpen: false }) }),
        h("div", { class: "flex flex-col" }, ...LOCAIS_BAIRRO.concat(["Toda S\xE3o Paulo"]).map((l) => {
          const active = ui.location === l;
          const bairro = l.split(",")[0];
          const count = l === "Toda S\xE3o Paulo" ? openJobs.length : openJobs.filter((j) => j.location.indexOf(bairro) === 0).length;
          return h(
            "button",
            {
              type: "button",
              class: "flex items-center gap-3 min-h-12 py-1 border-b border-concrete-200 last:border-0 text-left",
              onClick: () => setUI(KEY8, { location: l, locationOpen: false })
            },
            Icon("map-pin", { size: 20, color: active ? "var(--brand)" : "var(--text-subtle)" }),
            h("span", { class: `flex-1 ${active ? "font-bold text-brand-600" : "text-concrete-900"}` }, l),
            h("span", { class: "text-sm text-concrete-500" }, count === 1 ? "1 bico" : `${count} bicos`)
          );
        })),
        h("span", { class: "text-xs text-concrete-500" }, "A dist\xE2ncia de cada bico \xE9 contada a partir daqui.")
      ),
      Sheet(
        { open: ui.filtersOpen, title: "Filtros", onClose: () => setUI(KEY8, { filtersOpen: false }) },
        filterGroup("Tipo de servi\xE7o", TIPOS_SERVICO, ui.tipo, (v) => setUI(KEY8, { tipo: ui.tipo === v ? null : v })),
        filterGroup("Dist\xE2ncia de casa", ["5", "10", "20", "Toda a cidade"].map((d) => d === "Toda a cidade" ? d : `At\xE9 ${d} km`), ui.dist, (v) => setUI(KEY8, { dist: v })),
        filterGroup("Quando", ["Hoje", "Amanh\xE3", "Esta semana", "Fim de semana"], ui.quando, (v) => setUI(KEY8, { quando: ui.quando === v ? null : v })),
        h(
          "div",
          { class: "flex flex-col gap-1 pt-1 border-t border-concrete-200" },
          Switch({ label: "Avisar quando aparecer bico urgente", description: "Chega uma notifica\xE7\xE3o quando surgir vaga com esses filtros perto de voc\xEA.", checked: ui.notifyUrgent, onChange: (v) => setUI(KEY8, { notifyUrgent: v }) })
        ),
        h(
          "div",
          { class: "flex gap-3 pt-1" },
          Button({ label: "Limpar", variant: "secondary", className: "flex-1", onClick: () => setUI(KEY8, { tipo: null, dist: "Toda a cidade", quando: null }) }),
          Button({ label: `Ver ${filtered.length === 1 ? "1 vaga" : filtered.length + " vagas"}`, className: "flex-[1.4]", onClick: () => setUI(KEY8, { filtersOpen: false }) })
        )
      )
    );
  }
  function desktopFeed(navigate2, role, ui) {
    const open = activeJobs().filter((j) => !isJobClosed(j));
    const q = ui.search.trim().toLowerCase();
    const body = q ? desktopSearchResults(navigate2, role, ui, open) : tileGrid(navigate2, role, orderJobs(open, role));
    return h(
      "div",
      { class: "hidden lg:block min-h-[calc(100vh-5rem)] bg-white" },
      h(
        "div",
        { class: "page-x pt-1 pb-8 border-b border-concrete-200" },
        h("div", { class: "max-w-[52rem] mx-auto" }, SearchPill({ id: "feed-search-desktop", role, ui }))
      ),
      h("div", { class: "page-x pt-8 pb-20" }, body)
    );
  }
  function SearchPill({ id, role, ui, compact = false }) {
    const input = h("input", {
      id,
      "data-focus-id": id,
      type: "search",
      autocomplete: "off",
      spellcheck: "false",
      enterkeyhint: "search",
      "aria-label": "Buscar bicos",
      placeholder: role === "recrutador" ? "Buscar vaga, construtora ou trabalhador" : "Buscar por servi\xE7o, bairro ou construtora",
      value: ui.search,
      class: cx("w-full min-w-0 bg-transparent outline-none text-concrete-900 placeholder:text-concrete-500 [&::-webkit-search-cancel-button]:hidden", compact ? "text-[0.9375rem]" : "text-base"),
      oninput: (e) => setUI(KEY8, { search: e.target.value }),
      onkeydown: (e) => {
        if (e.key === "Escape") setUI(KEY8, { search: "" });
        if (e.key === "Enter") e.target.blur();
      }
    });
    return h(
      "div",
      {
        role: "search",
        class: cx(
          "flex items-center rounded-full bg-white border border-concrete-200 shadow-float transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100",
          compact ? "gap-3 h-14 pl-1.5 pr-2" : "gap-4 h-[4.25rem] pl-2 pr-3"
        )
      },
      h("button", {
        type: "button",
        "aria-label": "Buscar",
        title: "Buscar",
        class: cx("shrink-0 inline-flex items-center justify-center rounded-full bg-brand-500 shadow-raised transition hover:bg-brand-600 active:scale-95", compact ? "w-11 h-11" : "w-[3.25rem] h-[3.25rem]"),
        onClick: () => {
          const el = document.getElementById(id);
          if (el) el.focus();
        }
      }, Icon("search", { size: compact ? 20 : 22, color: "#fff" })),
      h("div", { class: "flex-1 min-w-0 flex items-center" }, input),
      ui.search ? h("button", {
        type: "button",
        "aria-label": "Limpar busca",
        title: "Limpar busca",
        class: "shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-concrete-500 transition-colors hover:bg-concrete-100 hover:text-concrete-900",
        onClick: () => setUI(KEY8, { search: "" })
      }, Icon("x", { size: 18 })) : null
    );
  }
  function desktopSearchResults(navigate2, role, ui, open) {
    const q = ui.search.trim().toLowerCase();
    const jobs = open.filter((j) => (j.role + " " + getCompany(j.companyId).name + " " + j.location).toLowerCase().includes(q));
    const companies = allCompanies().filter((c) => (c.name + " " + c.location).toLowerCase().includes(q));
    const workers = allWorkers().filter((w) => (w.name + " " + w.role + " " + w.region).toLowerCase().includes(q));
    const parts = [
      jobs.length ? jobs.length === 1 ? "1 vaga" : `${jobs.length} vagas` : null,
      companies.length ? companies.length === 1 ? "1 construtora" : `${companies.length} construtoras` : null,
      workers.length ? workers.length === 1 ? "1 trabalhador" : `${workers.length} trabalhadores` : null
    ].filter(Boolean);
    const heading2 = h(
      "div",
      { class: "flex items-baseline gap-3 flex-wrap" },
      h("h1", { class: "text-[1.75rem] font-semibold leading-tight text-concrete-900" }, `Resultados para \u201C${ui.search.trim()}\u201D`),
      parts.length ? h("span", { class: "text-concrete-500" }, parts.join(" \xB7 ")) : null
    );
    if (!parts.length) {
      return h(
        "div",
        { class: "flex flex-col gap-4" },
        heading2,
        EmptyState({ icon: "search-x", title: "Nenhum resultado para essa busca", description: "Confira a grafia ou tente um termo mais curto, como o nome do servi\xE7o ou do bairro.", actionLabel: "Limpar busca", onAction: () => setUI(KEY8, { search: "" }) })
      );
    }
    const group = (title, content) => h("section", { class: "flex flex-col gap-4" }, h("h2", { class: "text-[1.375rem] font-semibold text-concrete-900" }, title), content);
    const personGrid = (children) => h("div", { class: "grid gap-4 grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]" }, ...children);
    const personCard = ({ avatar, name, meta, rating, onClick }) => h(
      onClick ? "button" : "div",
      {
        type: onClick ? "button" : null,
        onClick,
        class: cx("flex items-center gap-4 p-4 rounded-2xl border border-concrete-200 bg-white text-left", onClick ? "transition hover:shadow-raised hover:border-concrete-300" : "")
      },
      avatar,
      h(
        "div",
        { class: "flex-1 min-w-0 flex flex-col gap-0.5" },
        h("span", { class: "font-semibold text-concrete-900 truncate" }, name),
        h("span", { class: "text-sm text-concrete-500 truncate" }, meta),
        rating
      )
    );
    return h(
      "div",
      { class: "flex flex-col gap-12" },
      heading2,
      jobs.length ? group("Vagas", tileGrid(navigate2, role, orderJobs(jobs, role))) : null,
      companies.length ? group("Construtoras", personGrid(companies.map((c) => personCard({
        avatar: h("span", { class: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 shrink-0" }, Icon("building-2", { size: 22, color: "var(--brand)" })),
        name: c.name,
        meta: c.location,
        rating: Rating({ value: c.rating, count: c.reviewCount }),
        onClick: () => navigate2("/construtora/" + c.id)
      })))) : null,
      workers.length ? group("Trabalhadores", personGrid(workers.map((w) => personCard({
        avatar: h("span", { class: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-50 text-accent-600 font-bold shrink-0" }, w.initials),
        name: w.name,
        meta: `${w.role} \xB7 ${w.region}`,
        rating: Rating({ value: w.rating, count: w.jobsDone }),
        onClick: role === "recrutador" ? () => navigate2("/trabalhador/" + w.id) : null
      })))) : null
    );
  }
  function filterGroup(title, options, active, onSelect) {
    return h(
      "div",
      { class: "flex flex-col gap-2.5" },
      h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, title),
      h("div", { class: "flex flex-wrap gap-2" }, ...options.map((o) => Tag({ label: o, selected: active === o, onClick: () => onSelect(o) })))
    );
  }

  // js/components/PhotoCarousel.js
  var shownPhoto = /* @__PURE__ */ new Map();
  function PhotoCarousel({ job, className = "h-56 sm:h-72 lg:h-[26rem] rounded-card" }) {
    const photos = jobPhotos(job);
    const n = photos.length;
    const frame = cx("relative w-full overflow-hidden bg-concrete-200", className);
    if (!n) return h("div", { class: frame }, JobCover({ job, large: true }));
    const track = h(
      "div",
      {
        class: cx("flex h-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar outline-none", n > 1 ? "cursor-grab" : ""),
        tabindex: n > 1 ? "0" : null,
        "aria-label": "Fotos do bico",
        "aria-roledescription": "carrossel"
      },
      ...photos.map((src, i) => h(
        "div",
        { class: "shrink-0 w-full h-full snap-center snap-always" },
        h("img", { src, alt: `Foto ${i + 1} de ${n}`, draggable: "false", class: "w-full h-full object-cover select-none pointer-events-none" })
      ))
    );
    if (n === 1) return h("div", { class: frame }, track);
    let width = 0;
    const current = () => Math.min(n - 1, shownPhoto.get(job.id) || 0);
    const goTo = (i) => {
      const target = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: target * (width || track.clientWidth), behavior: "smooth" });
    };
    const arrow = (icon, label, dir, side) => h("button", {
      type: "button",
      "aria-label": label,
      title: label,
      class: cx("absolute top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-concrete-900 shadow-raised transition hover:bg-white hover:scale-105 disabled:opacity-0 disabled:pointer-events-none", side),
      onClick: (e) => {
        e.stopPropagation();
        goTo(current() + dir);
      }
    }, Icon(icon, { size: 18 }));
    const prev = arrow("chevron-left", "Foto anterior", -1, "left-3");
    const next = arrow("chevron-right", "Pr\xF3xima foto", 1, "right-3");
    const dots = photos.map(() => h("span", { class: "h-1.5 rounded-full transition-all duration-200" }));
    const counter = h("span", { class: "absolute top-3 right-3 inline-flex items-center h-6 px-2.5 rounded-full bg-black/60 text-white text-xs font-semibold pointer-events-none" });
    const show = (i) => {
      counter.textContent = `${i + 1} / ${n}`;
      dots.forEach((d, k) => {
        d.className = cx("h-1.5 rounded-full transition-all duration-200", k === i ? "w-4 bg-white" : "w-1.5 bg-white/60");
      });
      prev.disabled = i === 0;
      next.disabled = i === n - 1;
    };
    track.addEventListener("scroll", () => {
      if (track.clientWidth !== width) {
        width = track.clientWidth;
        track.scrollLeft = current() * width;
        return;
      }
      const i = Math.min(n - 1, Math.max(0, Math.round(track.scrollLeft / (width || 1))));
      shownPhoto.set(job.id, i);
      show(i);
    }, { passive: true });
    let drag = null;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, from: current() };
      track.style.scrollSnapType = "none";
      track.classList.replace("cursor-grab", "cursor-grabbing");
      track.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    track.addEventListener("pointermove", (e) => {
      if (drag) track.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    const endDrag = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const threshold = Math.min(60, (width || track.clientWidth) * 0.15);
      const target = drag.from + (dx < -threshold ? 1 : dx > threshold ? -1 : 0);
      drag = null;
      track.classList.replace("cursor-grabbing", "cursor-grab");
      goTo(target);
      const restore = () => {
        track.style.scrollSnapType = "";
      };
      if ("onscrollend" in window) track.addEventListener("scrollend", restore, { once: true });
      setTimeout(restore, 600);
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(current() + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(current() - 1);
      }
    });
    const start = current();
    show(start);
    requestAnimationFrame(() => {
      width = track.clientWidth;
      if (start) track.scrollLeft = start * width;
    });
    return h(
      "div",
      { class: frame },
      track,
      prev,
      next,
      h("div", { class: "absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none" }, ...dots),
      counter
    );
  }
  function PhotoManager({ photos, onChange: onChange2, max = 6 }) {
    const add = h(
      "label",
      {
        class: "relative aspect-square flex flex-col items-center justify-center gap-1.5 rounded-control border-2 border-dashed border-concrete-300 bg-concrete-25 text-concrete-500 cursor-pointer transition-colors hover:border-brand-400 hover:text-brand-600"
      },
      h("input", {
        type: "file",
        accept: "image/*",
        multiple: true,
        class: "sr-only",
        onchange: (e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onChange2(photos.concat(files.map((f) => URL.createObjectURL(f))).slice(0, max));
        }
      }),
      Icon("camera", { size: 22 }),
      h("span", { class: "text-xs font-semibold text-center px-2" }, photos.length ? "Adicionar foto" : "Escolher fotos")
    );
    return h(
      "div",
      { class: "grid grid-cols-3 sm:grid-cols-4 gap-2" },
      ...photos.map((src, i) => h(
        "div",
        { class: "relative aspect-square rounded-control overflow-hidden bg-concrete-200" },
        h("img", { src, alt: `Foto ${i + 1}`, class: "w-full h-full object-cover" }),
        i === 0 ? h("span", { class: "absolute bottom-1.5 left-1.5 px-2 h-5 inline-flex items-center rounded-full bg-black/60 text-white text-[0.625rem] font-bold uppercase tracking-wide" }, "Capa") : null,
        h("button", {
          type: "button",
          "aria-label": `Remover foto ${i + 1}`,
          title: "Remover foto",
          class: "absolute top-1.5 right-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-concrete-900 shadow-raised hover:bg-white",
          onClick: () => onChange2(photos.filter((_, k) => k !== i))
        }, Icon("x", { size: 14 }))
      )),
      photos.length < max ? add : null
    );
  }

  // js/screens/worker/JobDetail.js
  var KEY9 = "job-detail";
  function renderJobDetail(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return notFound4(navigate2);
    const company = getCompany(job.companyId);
    const role = getRole();
    const worker = currentWorker();
    const application = role === "trabalhador" ? applicationFor(job.id, worker.id) : null;
    const canCancel = application && (application.status === "enviada" || application.status === "em_analise");
    const ui = getUI(KEY9, { confirmCancel: false });
    const actions = () => role === "trabalhador" ? [
      application ? canCancel ? Button({ label: "Cancelar candidatura", size: "lg", fullWidth: true, variant: "secondary", onClick: () => setUI(KEY9, { confirmCancel: true }) }) : Button({ label: "Ver minhas candidaturas", size: "lg", fullWidth: true, variant: "secondary", onClick: () => navigate2("/minhas-candidaturas") }) : Button({ label: "Quero esse bico", size: "lg", fullWidth: true, onClick: () => navigate2("/confirmar/" + job.id) }),
      !application ? h("span", { class: "text-center text-xs text-concrete-500" }, "Voc\xEA n\xE3o paga nada para se candidatar") : null
    ] : [];
    const summary = h(
      "aside",
      { class: "hidden lg:block lg:sticky lg:top-28" },
      h(
        "div",
        { class: "flex flex-col gap-5 p-6 bg-white rounded-2xl border border-concrete-200 shadow-float" },
        h(
          "div",
          { class: "flex flex-col gap-1" },
          h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-brand-600" }, "Di\xE1ria"),
          h(
            "div",
            { class: "flex items-baseline gap-2" },
            h("span", { class: "font-mono font-bold text-3xl text-concrete-900" }, job.pay == null ? "A combinar" : formatBRL(job.pay)),
            job.pay == null ? null : h("span", { class: "text-concrete-500" }, "por dia")
          )
        ),
        h(
          "div",
          { class: "flex flex-col rounded-xl border border-concrete-200 divide-y divide-concrete-200" },
          summaryRow("calendar", "Quando", job.dateLong || job.date),
          summaryRow("clock", "Dura\xE7\xE3o", job.duration),
          summaryRow("map-pin", "Onde", `${job.location} \xB7 ${job.distance}`)
        ),
        ...actions(),
        h("div", { class: "flex items-start gap-2 text-sm text-concrete-500" }, Icon("hand-coins", { size: 18, color: "var(--text-subtle)" }), h("span", {}, "Pagamento em PIX no fim da di\xE1ria, combinado direto com a construtora."))
      )
    );
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Detalhe da vaga", onBack: () => goBack("/mural") }),
      h(
        "div",
        { class: "flex flex-col gap-4 px-4 sm:px-0 py-4 pb-28 lg:pb-4 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-10" },
        h(
          "div",
          { class: "flex flex-col gap-4 lg:gap-6" },
          Card(
            { padding: "none" },
            h(
              "div",
              { class: "relative" },
              PhotoCarousel({ job, className: "h-60 sm:h-80 lg:h-[26rem] rounded-t-card" }),
              h(
                "div",
                { class: "absolute z-10 left-4 -bottom-6 w-[3.75rem] h-[3.75rem] rounded-full bg-white p-0.5 shadow-raised" },
                h("div", { class: "w-full h-full rounded-full bg-brand-50 flex items-center justify-center" }, Icon("building-2", { size: 24, color: "var(--brand)" }))
              )
            ),
            h(
              "div",
              { class: "flex items-end justify-between gap-3 pt-9 pb-4 px-4" },
              h(
                "div",
                { class: "flex flex-col gap-1 min-w-0" },
                h("span", { class: "font-semibold text-concrete-900 truncate" }, company.name),
                Rating({ value: company.rating, count: company.reviewCount })
              ),
              Button({ label: "Ver perfil", variant: "secondary", size: "sm", iconLeft: "building-2", onClick: () => navigate2("/construtora/" + company.id) })
            )
          ),
          h(
            "div",
            { class: "flex flex-col gap-1.5" },
            job.urgent ? h("div", { class: "flex items-center gap-2" }, Badge({ label: "Urgente", tone: "danger", icon: "zap" }), h("span", { class: "text-xs text-brand-600" }, "Vaga em destaque")) : null,
            h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, job.role),
            job.description ? h("p", { class: "text-sm text-concrete-700 leading-relaxed" }, job.description) : null
          ),
          Card(
            { tone: "brand", padding: "md", className: "lg:hidden" },
            h(
              "div",
              { class: "flex flex-col gap-4" },
              h(
                "div",
                { class: "flex items-end justify-between gap-3" },
                h(
                  "div",
                  { class: "flex flex-col gap-0.5" },
                  h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-brand-600" }, "Di\xE1ria"),
                  h("span", { class: "font-mono font-bold text-4xl text-concrete-900" }, job.pay == null ? "A combinar" : formatBRL(job.pay))
                ),
                h("span", { class: "text-sm text-concrete-700 text-right" }, "Pago no fim", h("br"), "da di\xE1ria")
              ),
              h("div", { class: "flex items-center gap-2 pt-4 border-t border-brand-200" }, Icon("calendar", { size: 20, color: "var(--text-brand)" }), h("span", { class: "font-display font-semibold text-lg text-concrete-900" }, job.dateLong))
            )
          ),
          section("Onde e como", Card(
            { padding: "md" },
            h(
              "div",
              { class: "flex flex-col gap-3.5" },
              infoRow("map-pin", job.address, `${job.location} \xB7 ${job.distance} de voc\xEA`),
              infoRow("clock", job.hours, job.duration),
              infoRow("hand-coins", "Pagamento em PIX no fim da di\xE1ria", "Combinado direto com a construtora")
            )
          )),
          section("O que precisa levar", Card(
            { padding: "md" },
            h("div", { class: "flex flex-col gap-3" }, ...job.requirements.map((r) => h("div", { class: "flex gap-2.5 items-center" }, Icon("circle-check", { size: 20, color: "var(--green-500)" }), h("span", { class: "text-concrete-700" }, r))))
          ))
        ),
        summary
      ),
      role === "trabalhador" ? h("div", { class: "sticky bottom-0 px-4 sm:px-0 py-3 bg-white shadow-bar flex flex-col gap-1.5 lg:hidden" }, ...actions()) : null,
      Dialog({
        open: ui.confirmCancel,
        tone: "danger",
        title: "Cancelar essa candidatura?",
        description: "Voc\xEA sai da lista de candidatos dessa vaga. Se quiser, pode se candidatar de novo depois.",
        confirmLabel: "Cancelar candidatura",
        onConfirm: () => {
          cancelApplication(job.id, worker.id);
          setUI(KEY9, { confirmCancel: false });
          navigate2("/minhas-candidaturas");
        },
        cancelLabel: "Voltar",
        onCancel: () => setUI(KEY9, { confirmCancel: false })
      })
    );
  }
  function summaryRow(icon, label, value) {
    return h(
      "div",
      { class: "flex items-center gap-3 px-4 py-3" },
      Icon(icon, { size: 18, color: "var(--text-subtle)" }),
      h(
        "div",
        { class: "flex flex-col min-w-0" },
        h("span", { class: "text-xs font-bold uppercase tracking-[0.06em] text-concrete-500" }, label),
        h("span", { class: "text-sm font-semibold text-concrete-900 truncate" }, value)
      )
    );
  }
  function section(title, content) {
    return h("div", { class: "flex flex-col gap-2" }, h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, title), content);
  }
  function infoRow(icon, main, sub) {
    return h(
      "div",
      { class: "flex gap-3 items-start" },
      Icon(icon, { size: 20, color: "var(--text-subtle)" }),
      h("div", { class: "flex flex-col" }, h("span", { class: "font-semibold text-concrete-900" }, main), h("span", { class: "text-sm text-concrete-500" }, sub))
    );
  }
  function notFound4(navigate2) {
    return h(
      "div",
      { class: "flex flex-col items-center justify-center min-h-screen gap-3" },
      h("p", { class: "text-concrete-500" }, "Vaga n\xE3o encontrada ou encerrada."),
      Button({ label: "Voltar ao mural", variant: "secondary", onClick: () => navigate2("/mural") })
    );
  }

  // js/screens/worker/ConfirmApplication.js
  var KEY10 = "confirm-application";
  function renderConfirmApplication(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return h("div", { class: "p-6 text-concrete-500" }, "Vaga n\xE3o encontrada.");
    const company = getCompany(job.companyId);
    const worker = currentWorker();
    const ui = getUI(KEY10, { submitting: false });
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Confirmar candidatura", onBack: () => goBack("/vaga/" + job.id) }),
      h(
        "div",
        { class: "flex flex-col gap-4 px-4 sm:px-0 py-4" },
        h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Confira antes de enviar"),
        Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-4" },
            h(
              "div",
              { class: "flex flex-col gap-0.5" },
              h("span", { class: "font-display font-semibold text-xl text-concrete-900" }, job.role),
              h("span", { class: "text-sm text-concrete-700" }, company.name)
            ),
            h(
              "div",
              { class: "flex gap-3" },
              h("div", { class: "flex-1 bg-concrete-100 rounded-control p-3 flex flex-col gap-0.5" }, h("span", { class: "text-xs text-concrete-500" }, "Di\xE1ria"), h("span", { class: "font-mono font-bold text-2xl text-concrete-900" }, job.pay == null ? "A combinar" : formatBRL(job.pay))),
              h("div", { class: "flex-1 bg-concrete-100 rounded-control p-3 flex flex-col gap-0.5" }, h("span", { class: "text-xs text-concrete-500" }, "Data"), h("span", { class: "font-semibold text-concrete-900" }, job.date))
            ),
            h(
              "div",
              { class: "flex items-center gap-2.5 pt-4 border-t border-concrete-200" },
              h("span", { class: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-50 text-accent-600 font-bold text-sm shrink-0" }, worker.initials),
              h("div", { class: "flex flex-col" }, h("span", { class: "font-semibold text-concrete-900" }, worker.name), h("span", { class: "text-sm text-concrete-500" }, `${worker.role} \xB7 ${worker.rating}`))
            )
          )
        ),
        h("span", { class: "text-sm text-concrete-500" }, "A construtora vai ver seu perfil, suas especialidades e suas avalia\xE7\xF5es. O contato por WhatsApp s\xF3 abre se ela te escolher.")
      ),
      h(
        "div",
        { class: "px-4 sm:px-0 py-3 flex flex-col gap-2" },
        Button({
          label: "Sim, quero esse bico",
          size: "lg",
          fullWidth: true,
          loading: ui.submitting,
          onClick: () => {
            setUI(KEY10, { submitting: true });
            setTimeout(() => {
              setUI(KEY10, { submitting: false });
              applyToJob(job.id, worker.id);
              navigate2("/enviado/" + job.id);
            }, 600);
          }
        }),
        Button({ label: "Voltar para a vaga", variant: "ghost", fullWidth: true, onClick: () => navigate2("/vaga/" + job.id) })
      )
    );
  }

  // js/screens/worker/ApplicationSent.js
  function renderApplicationSent(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return h("div", { class: "p-6 text-concrete-500" }, "Vaga n\xE3o encontrada.");
    const company = getCompany(job.companyId);
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Bicos", onBack: () => goBack("/mural") }),
      h(
        "div",
        { class: "flex flex-col items-center text-center gap-5 px-6 pt-10 pb-8 lg:max-w-app lg:mx-auto" },
        h("span", { class: "inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-success-50" }, Icon("circle-check", { size: 34, color: "var(--green-500)" })),
        h(
          "div",
          { class: "flex flex-col gap-2" },
          h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, "Candidatura enviada"),
          h("p", { class: "text-base text-concrete-700" }, "A construtora recebeu seu perfil. Avisamos quando voc\xEA avan\xE7ar de etapa.")
        ),
        Card(
          { tone: "sunken", padding: "md", className: "w-full" },
          h(
            "div",
            { class: "flex items-center justify-between gap-3" },
            h("div", { class: "flex flex-col gap-0.5 min-w-0" }, h("span", { class: "font-semibold text-concrete-900" }, job.role), h("span", { class: "text-sm text-concrete-500" }, `${company.name} \xB7 ${job.date}`)),
            h("span", { class: "font-mono font-bold text-xl text-concrete-900" }, job.pay == null ? "A combinar" : formatBRL(job.pay))
          )
        ),
        h(
          "div",
          { class: "w-full flex flex-col gap-2 pt-2" },
          Button({ label: "Ver minhas candidaturas", fullWidth: true, onClick: () => navigate2("/minhas-candidaturas") }),
          Button({ label: "Voltar ao mural", variant: "ghost", fullWidth: true, onClick: () => navigate2("/mural") })
        )
      )
    );
  }

  // js/screens/worker/MyApplications.js
  function renderMyApplications(navigate2) {
    const worker = currentWorker();
    const apps = applicationsForWorker(worker.id);
    const inProgress = apps.filter((a) => IN_PROGRESS.has(a.status));
    const closed = apps.filter((a) => CLOSED.has(a.status));
    const savedCount = savedJobs().length;
    function appCard(app, muted) {
      const job = getJob(app.jobId);
      if (!job) return null;
      const company = getCompany(job.companyId);
      const info = statusInfo(app.status, job.id);
      return JobCard({
        job,
        companyName: company.name,
        muted,
        onClick: () => navigate2(info.to),
        footer: JobCardFooter({ badgeEl: Badge({ label: info.label, tone: muted ? "neutral" : info.tone, icon: info.icon }), hint: info.hint, hintColor: muted ? "var(--text-muted)" : "var(--text-brand)" })
      });
    }
    return h(
      "div",
      { class: "flex flex-col" },
      h(
        "div",
        { class: "sticky top-0 z-20 flex items-center justify-between min-h-14 px-4 sm:px-0 bg-white border-b border-concrete-200 lg:static lg:bg-transparent lg:border-0 lg:pb-2" },
        h("h1", { class: "font-display font-semibold text-xl lg:text-[1.75rem] text-concrete-900" }, "Minhas candidaturas"),
        h("span", { class: "text-sm text-concrete-500" }, apps.length === 1 ? "1 no total" : `${apps.length} no total`)
      ),
      h(
        "div",
        { class: "flex flex-col gap-3 px-4 sm:px-0 py-4" },
        Card(
          { padding: "sm", onClick: () => navigate2("/vagas-salvas") },
          h(
            "div",
            { class: "flex items-center gap-3" },
            h("span", { class: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 shrink-0" }, Icon("bookmark", { size: 20, color: "var(--brand)" })),
            h(
              "div",
              { class: "flex-1 min-w-0 flex flex-col" },
              h("span", { class: "font-semibold text-concrete-900" }, "Vagas salvas"),
              h("span", { class: "text-sm text-concrete-500" }, savedCount === 0 ? "Nenhum bico guardado" : savedCount === 1 ? "1 bico guardado" : `${savedCount} bicos guardados`)
            ),
            Icon("chevron-right", { size: 20, color: "var(--gray-400)" })
          )
        ),
        apps.length === 0 ? EmptyState({ icon: "file-check", title: "Voc\xEA ainda n\xE3o se candidatou", description: "Escolha um bico no mural e toque em quero esse bico. Fica tudo registrado aqui.", actionLabel: "Ver o mural", onAction: () => navigate2("/mural") }) : h(
          "div",
          { class: "flex flex-col gap-5" },
          inProgress.length ? h(
            "div",
            { class: "flex flex-col gap-3" },
            h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Em andamento"),
            h("div", { class: "flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5" }, ...inProgress.map((a) => appCard(a, false)))
          ) : null,
          closed.length ? h(
            "div",
            { class: "flex flex-col gap-3" },
            h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Encerradas"),
            h("div", { class: "flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5" }, ...closed.map((a) => appCard(a, true)))
          ) : null
        )
      )
    );
  }

  // js/screens/worker/SavedJobs.js
  function renderSavedJobs(navigate2) {
    const jobs = savedJobs();
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Vagas salvas", onBack: () => goBack("/minhas-candidaturas") }),
      h(
        "div",
        { class: "flex flex-col gap-3 px-4 sm:px-0 py-4" },
        jobs.length === 0 ? EmptyState({ icon: "bookmark", title: "Voc\xEA ainda n\xE3o salvou nenhum bico", description: "No mural, toque no \xEDcone de salvar em um bico para guard\xE1-lo aqui e decidir depois.", actionLabel: "Ver o mural", onAction: () => navigate2("/mural") }) : h("div", { class: "flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5" }, ...jobs.map((job) => {
          const company = getCompany(job.companyId);
          const available = !isJobClosed(job);
          return JobCard({
            job,
            companyName: company.name,
            onClick: () => navigate2("/vaga/" + job.id),
            overlay: h(
              "div",
              { class: "absolute top-2.5 right-2.5", onClick: (e) => e.stopPropagation() },
              IconButton({ icon: "bookmark-x", label: "Remover dos salvos", variant: "solid", onClick: () => toggleSavedJob(job.id) })
            ),
            footer: JobCardFooter({
              extra: h(
                "span",
                { class: `flex items-center gap-2 text-sm font-semibold ${available ? "text-success-500" : "text-concrete-500"}` },
                Icon(available ? "circle-check" : "circle-x", { size: 16, color: available ? "var(--green-500)" : "var(--text-muted)" }),
                available ? "Ainda dispon\xEDvel" : "N\xE3o est\xE1 mais dispon\xEDvel"
              )
            })
          });
        }))
      )
    );
  }

  // js/screens/worker/Selected.js
  function renderSelected(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return h("div", { class: "p-6 text-concrete-500" }, "Vaga n\xE3o encontrada.");
    const company = getCompany(job.companyId);
    const hired = applicationFor(job.id, currentWorkerId());
    const title = hired && hired.status === "contratado" ? `Voc\xEA foi contratado pela ${company.name}` : `A ${company.name} quer falar com voc\xEA`;
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Voc\xEA avan\xE7ou", onBack: () => goBack("/minhas-candidaturas") }),
      h(
        "div",
        { class: "bg-brand-500 text-white px-4 sm:px-6 py-7 flex flex-col gap-3 lg:rounded-card" },
        Badge({ label: hired && hired.status === "contratado" ? "Contratado" : "Pr\xE9-selecionado", tone: "inverse", icon: "circle-check" }),
        h("h1", { class: "font-display font-bold text-3xl leading-tight text-white" }, title),
        h("p", { class: "text-white/85" }, `${job.role} \xB7 ${job.date}`)
      ),
      h(
        "div",
        { class: "flex flex-col gap-4 px-4 sm:px-0 py-4" },
        Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-4" },
            h(
              "div",
              { class: "flex items-center gap-3" },
              h("span", { class: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 shrink-0" }, Icon("building-2", { size: 24, color: "var(--brand)" })),
              h("div", { class: "flex flex-col gap-0.5" }, h("span", { class: "font-semibold text-concrete-900" }, company.name), h("span", { class: "text-sm text-concrete-500" }, company.tipoObra || "Constru\xE7\xE3o civil"))
            ),
            Button({ label: "Falar no WhatsApp", variant: "accent", size: "lg", fullWidth: true, iconLeft: "message-circle", onClick: () => {
            } }),
            h("span", { class: "text-sm text-concrete-700" }, "Combine ponto de encontro, hor\xE1rio e pagamento direto com a construtora. A Bicos n\xE3o cobra taxa e n\xE3o entra na negocia\xE7\xE3o.")
          )
        ),
        Card(
          { tone: "sunken", padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-3" },
            kv("Di\xE1ria combinada", job.pay == null ? "A combinar" : formatBRL(job.pay)),
            kv("Local", job.location),
            kv("Contato liberado", "Hoje \xB7 9h10")
          )
        ),
        Button({ label: "Ver a vaga de novo", variant: "secondary", fullWidth: true, onClick: () => navigate2("/vaga/" + job.id) })
      )
    );
  }
  function kv(label, value) {
    return h("div", { class: "flex items-center justify-between gap-3" }, h("span", { class: "text-sm text-concrete-500" }, label), h("span", { class: "font-mono font-bold text-concrete-900" }, value));
  }

  // js/screens/worker/RateJob.js
  var KEY11 = "rate-job";
  var OPTIONS = [
    { id: "pagou", label: "Pagou no dia", icon: "hand-coins" },
    { id: "epi", label: "EPI no local", icon: "hard-hat" },
    { id: "horario", label: "Hor\xE1rio combinado", icon: "clock" },
    { id: "equipe", label: "Equipe respeitosa", icon: "users" }
  ];
  function renderRateJob(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return h("div", { class: "p-6 text-concrete-500" }, "Vaga n\xE3o encontrada.");
    const company = getCompany(job.companyId);
    const ui = getUI(KEY11, { rating: 5, selected: ["pagou"], comment: "" });
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Avaliar a di\xE1ria", onBack: () => goBack("/minhas-candidaturas") }),
      h(
        "div",
        { class: "flex flex-col gap-5 px-4 sm:px-0 py-4" },
        h(
          "div",
          { class: "flex flex-col gap-1" },
          h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, "Como foi a di\xE1ria?"),
          h("span", { class: "text-sm text-concrete-500" }, `${job.role} \xB7 ${company.name} \xB7 ${job.date}`)
        ),
        Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col items-center gap-3" },
            h("span", { class: "font-semibold text-concrete-900" }, "Sua nota para a construtora"),
            Rating({ value: ui.rating, editable: true, onChange: (v) => setUI(KEY11, { rating: v }) })
          )
        ),
        h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "O que aconteceu"),
          h("div", { class: "flex flex-wrap gap-2" }, ...OPTIONS.map((o) => Tag({
            label: o.label,
            icon: o.icon,
            selected: ui.selected.includes(o.id),
            onClick: () => setUI(KEY11, { selected: ui.selected.includes(o.id) ? ui.selected.filter((x) => x !== o.id) : ui.selected.concat([o.id]) })
          })))
        ),
        Input({
          id: "rate-comment",
          label: "Quer escrever algo? (opcional)",
          placeholder: "Ex.: obra organizada, pagamento em PIX no fim do dia",
          hint: "Sua avalia\xE7\xE3o aparece no perfil da construtora.",
          value: ui.comment,
          onInput: (v) => setUI(KEY11, { comment: v })
        }),
        h("div", { class: "pt-1" }, Button({
          label: "Enviar avalia\xE7\xE3o",
          size: "lg",
          fullWidth: true,
          onClick: () => {
            markReviewed(job.id, currentWorkerId());
            navigate2("/minhas-candidaturas");
          }
        }))
      )
    );
  }

  // js/screens/recruiter/CreateJob.js
  var KEY12 = "create-job";
  function nextJobId() {
    return "BC-" + (5100 + Math.floor(Math.random() * 800));
  }
  function digits(v, max) {
    return String(v).replace(/\D/g, "").slice(0, max);
  }
  function renderCreateJob(navigate2) {
    const ui = getUI(KEY12, {
      step: 1,
      fotos: [],
      tipo: "",
      local: "",
      data: "",
      periodoInicio: "7",
      periodoFim: "17",
      diarias: "1",
      vagas: "1",
      valor: "",
      negociavel: false,
      requisitos: ["Botina e capacete pr\xF3prios"],
      detalhe: "",
      urgente: false,
      errors: {},
      publishing: false
    });
    const previaRole = ui.tipo.trim() || "Vaga sem tipo";
    const previaPay = ui.negociavel ? "A combinar" : ui.valor ? "R$ " + ui.valor : "R$ \u2014";
    const previaMeta = `${ui.local || "Endere\xE7o da obra"} \xB7 ${ui.data || "data a definir"}`;
    function validateStep1() {
      const errors = {};
      if (!ui.tipo.trim()) errors.tipo = "Escreva o tipo de servi\xE7o da vaga.";
      if (!ui.local.trim()) errors.local = "Informe o endere\xE7o da obra.";
      if (!ui.data.trim()) errors.data = "Informe a data da di\xE1ria.";
      if (!ui.periodoInicio || !ui.periodoFim) errors.periodo = "Informe o hor\xE1rio de in\xEDcio e fim.";
      if (!ui.diarias || Number(ui.diarias) < 1) errors.diarias = "Informe quantas di\xE1rias.";
      if (!ui.vagas || Number(ui.vagas) < 1) errors.vagas = "Informe quantas pessoas a vaga precisa.";
      return errors;
    }
    function validateStep2() {
      const errors = {};
      if (!ui.negociavel) {
        const n = parseInt(ui.valor, 10);
        if (!ui.valor.trim()) errors.valor = "Informe o valor da di\xE1ria, ou marque como a combinar.";
        else if (!n || n < 80) errors.valor = "Informe um valor de R$ 80 ou mais.";
      }
      if (!ui.detalhe.trim()) errors.detalhe = "Descreva o servi\xE7o da vaga.";
      return errors;
    }
    function advance() {
      if (ui.step === 1) {
        const errors2 = validateStep1();
        if (Object.keys(errors2).length) {
          setUI(KEY12, { errors: errors2 });
          return;
        }
        setUI(KEY12, { step: 2, errors: {} });
        return;
      }
      const errors = validateStep2();
      if (Object.keys(errors).length) {
        setUI(KEY12, { errors });
        return;
      }
      setUI(KEY12, { publishing: true });
      setTimeout(() => {
        const id = nextJobId();
        const hours = `${ui.periodoInicio}h\u2013${ui.periodoFim}h`;
        const diariasNum = Number(ui.diarias) || 1;
        createJob({
          id,
          companyId: currentCompanyId(),
          role: ui.tipo.trim(),
          pay: ui.negociavel ? null : parseInt(ui.valor, 10),
          location: "Tatuap\xE9, SP",
          address: ui.local,
          distance: "0 km",
          date: ui.data,
          dateLong: `${ui.data} \xB7 ${hours}`,
          hours,
          duration: diariasNum === 1 ? "1 di\xE1ria" : `${diariasNum} di\xE1rias`,
          urgent: ui.urgente,
          slots: Number(ui.vagas) || 1,
          requirements: ui.requisitos,
          description: ui.detalhe.trim(),
          photos: ui.fotos
        });
        setUI(KEY12, { publishing: false });
        resetUI(KEY12);
        navigate2("/vaga-publicada/" + id);
      }, 700);
    }
    const step1 = h(
      "div",
      { class: "flex flex-col gap-6" },
      h(
        "div",
        { class: "flex flex-col gap-1.5" },
        h("span", { class: "text-sm font-semibold text-concrete-900" }, "Fotos da vaga (opcional)"),
        PhotoManager({ photos: ui.fotos, onChange: (fotos) => setUI(KEY12, { fotos }) }),
        h("span", { class: "text-sm text-concrete-500" }, 'At\xE9 6 fotos do canteiro. A primeira vira a capa do card no mural; voc\xEA pode mudar depois em "Sua vaga".')
      ),
      Input({
        id: "create-job-tipo",
        label: "Tipo de servi\xE7o",
        placeholder: "Ex.: Pedreiro de acabamento",
        icon: "hammer",
        value: ui.tipo,
        error: ui.errors.tipo,
        onInput: (v) => setUI(KEY12, { tipo: v, errors: Object.assign({}, ui.errors, { tipo: null }) })
      }),
      Input({ id: "create-job-local", label: "Endere\xE7o da obra", placeholder: "Rua, n\xFAmero e bairro", icon: "map-pin", value: ui.local, error: ui.errors.local, onInput: (v) => setUI(KEY12, { local: v, errors: Object.assign({}, ui.errors, { local: null }) }) }),
      Input({ id: "create-job-data", label: "Data da di\xE1ria", placeholder: "Ex.: 12 set", icon: "calendar", value: ui.data, error: ui.errors.data, onInput: (v) => setUI(KEY12, { data: v, errors: Object.assign({}, ui.errors, { data: null }) }) }),
      h(
        "div",
        { class: "flex flex-col gap-1.5" },
        h("span", { class: "text-sm font-semibold text-concrete-900" }, "Per\xEDodo de trabalho"),
        h(
          "div",
          { class: "flex items-end gap-3" },
          h("div", { class: "flex-1 min-w-0" }, Input({ id: "create-job-periodo-inicio", label: "Das", placeholder: "7", suffix: "h", inputMode: "numeric", value: ui.periodoInicio, onInput: (v) => setUI(KEY12, { periodoInicio: digits(v, 2), errors: Object.assign({}, ui.errors, { periodo: null }) }) })),
          h("div", { class: "flex-1 min-w-0" }, Input({ id: "create-job-periodo-fim", label: "At\xE9", placeholder: "17", suffix: "h", inputMode: "numeric", value: ui.periodoFim, onInput: (v) => setUI(KEY12, { periodoFim: digits(v, 2), errors: Object.assign({}, ui.errors, { periodo: null }) }) }))
        ),
        ui.errors.periodo ? h("span", { class: "text-sm text-danger-500" }, ui.errors.periodo) : null
      ),
      Input({
        id: "create-job-diarias",
        label: "Quantidade de di\xE1rias",
        placeholder: "1",
        suffix: "di\xE1ria(s)",
        inputMode: "numeric",
        value: ui.diarias,
        error: ui.errors.diarias,
        onInput: (v) => setUI(KEY12, { diarias: digits(v, 2), errors: Object.assign({}, ui.errors, { diarias: null }) })
      }),
      Input({
        id: "create-job-vagas",
        label: "Quantidade de pessoas para a vaga",
        placeholder: "1",
        suffix: "pessoa(s)",
        inputMode: "numeric",
        hint: "Quantos trabalhadores voc\xEA precisa contratar para esse bico.",
        error: ui.errors.vagas,
        value: ui.vagas,
        onInput: (v) => setUI(KEY12, { vagas: digits(v, 2), errors: Object.assign({}, ui.errors, { vagas: null }) })
      })
    );
    const step2 = h(
      "div",
      { class: "flex flex-col gap-6" },
      h(
        "div",
        { class: "flex flex-col gap-2" },
        Input({
          id: "create-job-valor",
          label: "Valor da di\xE1ria",
          placeholder: "220",
          suffix: "reais",
          inputMode: "numeric",
          value: ui.negociavel ? "" : ui.valor,
          error: ui.errors.valor,
          hint: ui.errors.valor || ui.negociavel ? null : "O trabalhador v\xEA esse valor no mural. M\xEDnimo de R$ 80.",
          onInput: (v) => setUI(KEY12, { valor: digits(v, 5), errors: Object.assign({}, ui.errors, { valor: null }) })
        }),
        ui.negociavel ? null : Button({ label: "Deixar valor a combinar", variant: "ghost", size: "sm", iconLeft: "handshake", onClick: () => setUI(KEY12, { negociavel: true, valor: "", errors: Object.assign({}, ui.errors, { valor: null }) }) }),
        ui.negociavel ? h(
          "div",
          { class: "flex items-center gap-2 p-3 rounded-control bg-brand-50 border border-brand-200" },
          Icon("handshake", { size: 18, color: "var(--text-brand)" }),
          h("span", { class: "flex-1 text-sm text-brand-600" }, 'O trabalhador v\xEA "A combinar" no lugar do valor, e negocia direto com voc\xEA.'),
          Button({ label: "Definir um valor", variant: "ghost", size: "sm", onClick: () => setUI(KEY12, { negociavel: false }) })
        ) : null
      ),
      h(
        "div",
        { class: "flex flex-col gap-2.5" },
        h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "O que o trabalhador precisa levar"),
        h("div", { class: "flex flex-wrap gap-2" }, ...REQUISITOS_OPCOES.map((r) => Tag({ label: r, selected: ui.requisitos.includes(r), onClick: () => setUI(KEY12, { requisitos: ui.requisitos.includes(r) ? ui.requisitos.filter((x) => x !== r) : ui.requisitos.concat([r]) }) })))
      ),
      h(
        "div",
        { class: "flex flex-col gap-1.5 w-full" },
        h("label", { for: "create-job-detalhe", class: "text-sm font-semibold text-concrete-900" }, "Descri\xE7\xE3o do bico"),
        h("textarea", {
          id: "create-job-detalhe",
          "data-focus-id": "create-job-detalhe",
          rows: 3,
          placeholder: "Ex.: reboco de duas paredes internas, argamassa e areia j\xE1 est\xE3o no local.",
          value: ui.detalhe,
          class: cx(
            "w-full px-3 py-2.5 bg-white rounded-control border outline-none text-base text-concrete-900 placeholder:text-concrete-400 resize-none transition-colors duration-150",
            ui.errors.detalhe ? "border-danger-500" : "border-concrete-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          ),
          oninput: (e) => setUI(KEY12, { detalhe: e.target.value, errors: Object.assign({}, ui.errors, { detalhe: null }) })
        }),
        ui.errors.detalhe ? h("span", { class: "flex items-center gap-1.5 text-sm text-danger-500" }, Icon("circle-alert", { size: 14 }), ui.errors.detalhe) : h("span", { class: "text-sm text-concrete-500" }, "Quanto mais claro, menos desencontro no canteiro. Essa descri\xE7\xE3o aparece para quem ver o bico.")
      ),
      h("div", { class: "pt-1 border-t border-concrete-200" }, Switch({ label: "Marcar como urgente", description: "A vaga aparece no topo do mural com selo de urgente.", checked: ui.urgente, onChange: (v) => setUI(KEY12, { urgente: v }) })),
      Card(
        { tone: "sunken", padding: "md" },
        h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("span", { class: "font-semibold text-concrete-900" }, "Como vai aparecer no mural"),
          h(
            "div",
            { class: "flex items-center gap-3" },
            h("div", { class: "flex-1 min-w-0 flex flex-col gap-0.5" }, h("span", { class: "font-display font-semibold text-lg text-concrete-900 truncate" }, previaRole), h("span", { class: "text-sm text-concrete-500" }, previaMeta)),
            ui.negociavel ? h(
              "div",
              { class: "shrink-0 w-24 h-16 rounded-card bg-white border-[1.5px] border-brand-200 flex flex-col items-center justify-center gap-1" },
              Icon("handshake", { size: 16, color: "var(--text-brand)" }),
              h("span", { class: "text-xs font-semibold text-brand-600" }, "A combinar")
            ) : h(
              "div",
              { class: "shrink-0 w-24 h-16 rounded-card bg-brand-500 shadow-card flex flex-col items-center justify-center gap-0.5" },
              h("span", { class: "font-mono font-bold text-lg text-white" }, previaPay),
              h("span", { class: "text-[0.5625rem] font-semibold tracking-wide uppercase text-white/85" }, "por di\xE1ria")
            )
          )
        )
      )
    );
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Publicar vaga", onBack: () => ui.step === 2 ? setUI(KEY12, { step: 1 }) : goBack("/mural") }),
      h(
        "div",
        { class: "flex items-center gap-2 px-4 sm:px-0 pt-3" },
        stepDot(1, ui.step >= 1),
        h("span", { class: "text-sm text-concrete-500" }, "Servi\xE7o, local e data"),
        h("span", { class: "flex-1 h-px bg-concrete-200" }),
        stepDot(2, ui.step >= 2),
        h("span", { class: "text-sm text-concrete-500" }, "Valor e requisitos")
      ),
      h("div", { class: "px-4 sm:px-0 py-5" }, ui.step === 1 ? step1 : step2),
      h(
        "div",
        { class: "px-4 sm:px-0 py-3 flex flex-col gap-1.5" },
        Button({ label: ui.step === 1 ? "Continuar" : "Publicar vaga", size: "lg", fullWidth: true, loading: ui.publishing, onClick: advance }),
        h("span", { class: "text-center text-xs text-concrete-500" }, "Publicar \xE9 gr\xE1tis. Voc\xEA paga s\xF3 se impulsionar.")
      )
    );
  }
  function stepDot(n, active) {
    return h("span", { class: `inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${active ? "bg-brand-500 text-white" : "bg-concrete-100 text-concrete-500"}` }, String(n));
  }

  // js/screens/recruiter/JobPublished.js
  function renderJobPublished(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return h("div", { class: "p-6 text-concrete-500" }, "Vaga n\xE3o encontrada.");
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Vaga publicada", onBack: () => goBack("/mural") }),
      h(
        "div",
        { class: "flex flex-col items-center text-center gap-5 px-6 pt-10 pb-8 lg:max-w-app lg:mx-auto" },
        h("span", { class: "inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-success-50" }, Icon("circle-check", { size: 34, color: "var(--green-500)" })),
        h(
          "div",
          { class: "flex flex-col gap-2" },
          h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, "Vaga publicada"),
          h("p", { class: "text-base text-concrete-700" }, "Ela j\xE1 est\xE1 no mural de quem trabalha perto da obra. Avisamos quando chegar o primeiro candidato.")
        ),
        Card(
          { tone: "sunken", padding: "md", className: "w-full" },
          h(
            "div",
            { class: "flex items-center justify-between gap-3" },
            h("div", { class: "flex flex-col gap-0.5 min-w-0" }, h("span", { class: "font-semibold text-concrete-900" }, job.role), h("span", { class: "text-sm text-concrete-500" }, `${job.address} \xB7 ${job.date}`)),
            h("span", { class: "font-mono font-bold text-xl text-concrete-900" }, job.pay == null ? "A combinar" : formatBRL(job.pay))
          )
        ),
        h(
          "div",
          { class: "w-full flex flex-col gap-2 pt-2" },
          Button({ label: "Impulsionar essa vaga", iconLeft: "zap", fullWidth: true, onClick: () => navigate2("/impulsionar/" + job.id) }),
          Button({ label: "Voltar ao in\xEDcio", variant: "ghost", fullWidth: true, onClick: () => navigate2("/mural") })
        )
      )
    );
  }

  // js/components/CandidateRow.js
  function CandidateRow({ worker, summary, distance, isNew, decision, onClick, onApprove, onReject }) {
    const decided = decision === "aprovado" || decision === "recusado";
    return h(
      "div",
      {
        class: cx("flex items-center gap-3 p-4 border-b border-concrete-200 last:border-0 cursor-pointer hover:bg-concrete-50", decision === "recusado" ? "opacity-60" : ""),
        onClick
      },
      h("span", {
        class: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-50 text-accent-600 font-bold text-sm shrink-0"
      }, worker.initials),
      h(
        "div",
        { class: "flex-1 min-w-0 flex flex-col gap-1" },
        h(
          "div",
          { class: "flex items-center gap-2" },
          h("span", { class: "font-semibold text-concrete-900 truncate" }, worker.name),
          isNew ? h("span", { class: "shrink-0 px-2 py-0.5 rounded-full bg-accent-50 text-accent-600 text-[0.6875rem] font-bold" }, "Novo") : null
        ),
        h(
          "div",
          { class: "flex items-center gap-2 text-sm text-concrete-500" },
          h("span", { class: "truncate" }, summary),
          h("span", {}, "\xB7"),
          h("span", { class: "shrink-0" }, distance)
        ),
        !isNew ? Rating({ value: worker.rating, count: worker.jobsDone, size: 12 }) : null
      ),
      decided ? h("span", {
        class: cx(
          "shrink-0 px-2.5 h-6 inline-flex items-center rounded-full text-xs font-bold",
          decision === "aprovado" ? "bg-success-50 text-success-500" : "bg-danger-50 text-danger-500"
        )
      }, decision === "aprovado" ? "Aprovado" : "Recusado") : h(
        "div",
        { class: "flex items-center gap-1 shrink-0", onClick: (e) => e.stopPropagation() },
        onReject ? IconButton({ icon: "x", label: "Recusar candidato", variant: "ghost", size: "sm", onClick: onReject }) : null,
        onApprove ? IconButton({ icon: "check", label: "Aprovar candidato", variant: "brand", size: "sm", onClick: onApprove }) : null
      )
    );
  }

  // js/screens/recruiter/JobManage.js
  var KEY13 = "job-manage";
  function renderJobManage(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return h("div", { class: "p-6 text-concrete-500" }, "Vaga n\xE3o encontrada.");
    if (job.companyId !== currentCompanyId()) {
      return h(
        "div",
        { class: "flex flex-col" },
        BackBar({ title: "Sua vaga", onBack: () => goBack("/mural") }),
        EmptyState({
          icon: "lock",
          title: "Essa vaga n\xE3o \xE9 sua",
          description: "S\xF3 a construtora que publicou o bico pode ver os candidatos e a quantidade de vagas."
        })
      );
    }
    const ui = getUI(KEY13, { confirmClose: false });
    const applications = applicationsForJob(job.id);
    const slots = job.slots || 1;
    const approved = approvedCount(job.id);
    const pending = pendingCount(job.id);
    const closed = isJobClosed(job);
    const status = jobStatus(job, approved, pending);
    const payCard = (className) => Card(
      { tone: "brand", padding: "md", className },
      h(
        "div",
        { class: "flex flex-col gap-4" },
        h(
          "div",
          { class: "flex items-end justify-between gap-3" },
          h("div", { class: "flex flex-col gap-0.5" }, h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-brand-600" }, "Di\xE1ria que voc\xEA ofereceu"), h("span", { class: "font-mono font-bold text-4xl text-concrete-900" }, job.pay == null ? "A combinar" : formatBRL(job.pay))),
          h("span", { class: "text-sm text-concrete-700 text-right" }, "Pago no fim", h("br"), "da di\xE1ria")
        ),
        h("div", { class: "flex items-center gap-2 pt-4 border-t border-brand-200" }, Icon("calendar", { size: 20, color: "var(--text-brand)" }), h("span", { class: "font-display font-semibold text-lg text-concrete-900" }, job.dateLong || job.date))
      )
    );
    const slotsCard = (className) => Card(
      { padding: "md", className },
      h(
        "div",
        { class: "flex flex-col gap-3" },
        h(
          "div",
          { class: "flex items-baseline justify-between gap-3" },
          h("span", { class: "font-semibold text-concrete-900" }, `${approved} de ${slots} ${slots === 1 ? "vaga preenchida" : "vagas preenchidas"}`),
          h("span", { class: "font-mono text-sm text-concrete-500" }, `${slots} no total`)
        ),
        h("div", { class: "flex gap-1.5" }, ...Array.from({ length: slots }).map((_, i) => h("span", { class: `flex-1 h-2 rounded-full ${i < approved ? "bg-brand-500" : "bg-concrete-200"}` }))),
        h("span", { class: `text-sm ${closed ? "text-success-500" : "text-concrete-500"}` }, closed ? "Bico fechado. A vaga saiu do mural e n\xE3o recebe mais candidatura." : "Aprove candidatos at\xE9 preencher todas as vagas. A\xED o bico fecha sozinho.")
      )
    );
    const actions = () => [
      Button({ label: "Editar vaga", variant: "secondary", iconLeft: "pencil", className: "flex-1", onClick: () => {
      } }),
      Button({ label: "Encerrar vaga", variant: "ghost", className: "flex-1", onClick: () => setUI(KEY13, { confirmClose: true }) })
    ];
    const side = h(
      "aside",
      { class: "hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-28" },
      payCard(),
      slotsCard(),
      !closed ? h("div", { class: "flex gap-3" }, ...actions()) : null
    );
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Sua vaga", onBack: () => goBack("/mural") }),
      h(
        "div",
        { class: "flex flex-col gap-4 px-4 sm:px-0 py-4 pb-28 lg:pb-4 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10" },
        h(
          "div",
          { class: "flex flex-col gap-4 lg:gap-6" },
          h(
            "div",
            { class: "flex flex-col gap-1.5" },
            h("span", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Fotos da vaga"),
            PhotoManager({ photos: jobPhotos(job), onChange: (photos) => updateJob(job.id, { photos }) }),
            h("span", { class: "text-xs text-concrete-500" }, "At\xE9 6 fotos. A primeira \xE9 a capa do bico no mural.")
          ),
          h(
            "div",
            { class: "flex flex-col gap-1.5" },
            h("div", { class: "flex items-center gap-2" }, Badge(status), h("span", { class: "font-mono text-xs text-concrete-500" }, job.id)),
            h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, job.role),
            job.description ? h("p", { class: "text-sm text-concrete-700 leading-relaxed" }, job.description) : null
          ),
          payCard("lg:hidden"),
          slotsCard("lg:hidden"),
          h(
            "div",
            { class: "flex flex-col gap-2" },
            h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Onde e como"),
            Card(
              { padding: "md" },
              h(
                "div",
                { class: "flex flex-col gap-3.5" },
                infoRow2("map-pin", job.address, job.location),
                infoRow2("clock", job.hours, job.duration),
                infoRow2("hand-coins", "Pagamento em PIX no fim da di\xE1ria", "Combinado direto com o trabalhador")
              )
            )
          ),
          h(
            "div",
            { class: "flex flex-col gap-2" },
            h(
              "div",
              { class: "flex items-center justify-between gap-2" },
              h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, applications.length === 1 ? "1 candidato" : `${applications.length} candidatos`),
              pending ? h("span", { class: "text-xs text-brand-600" }, `${pending} ${pending === 1 ? "novo" : "novos"}`) : null
            ),
            applications.length ? h("div", { class: "bg-white border border-concrete-200 rounded-card shadow-card overflow-hidden" }, ...applications.map((a) => {
              const worker = getWorker(a.workerId);
              const decision = a.status === "pre_selecionado" || a.status === "contratado" ? "aprovado" : a.status === "nao_selecionado" ? "recusado" : null;
              return CandidateRow({
                worker,
                summary: worker.role + " \xB7 " + worker.region,
                distance: worker.distance,
                isNew: worker.novo,
                decision,
                onClick: () => navigate2(`/trabalhador/${worker.id}/${job.id}`),
                onApprove: !decision && !closed ? (e) => {
                  e.stopPropagation();
                  decideApplication(job.id, worker.id, "aprovado");
                  if (isJobClosed(job)) navigate2("/fechado/" + job.id);
                } : null,
                onReject: !decision && !closed ? (e) => {
                  e.stopPropagation();
                  decideApplication(job.id, worker.id, "recusado");
                } : null
              });
            })) : EmptyState({ icon: "users", title: "Nenhum candidato ainda", description: "Vagas com valor acima da m\xE9dia da regi\xE3o costumam receber candidato no mesmo dia. Voc\xEA tamb\xE9m pode impulsionar.", actionLabel: "Impulsionar vaga", onAction: () => navigate2("/impulsionar/" + job.id) })
          )
        ),
        side
      ),
      !closed ? h("div", { class: "sticky bottom-0 px-4 sm:px-0 py-3 bg-white shadow-bar flex gap-3 lg:hidden" }, ...actions()) : null,
      Dialog({
        open: ui.confirmClose,
        tone: "danger",
        title: "Encerrar essa vaga?",
        description: "A vaga sai do mural imediatamente e para de receber candidaturas. Isso n\xE3o pode ser desfeito.",
        confirmLabel: "Encerrar vaga",
        onConfirm: () => {
          closeJob(job.id);
          setUI(KEY13, { confirmClose: false });
          navigate2("/mural");
        },
        cancelLabel: "Cancelar",
        onCancel: () => setUI(KEY13, { confirmClose: false })
      })
    );
  }
  function jobStatus(job, approved, pending) {
    if (job.closed && job.semContratacao) return { label: "Encerrada sem contrata\xE7\xE3o", tone: "danger", icon: "circle-x" };
    if (isJobClosed(job)) return { label: `Bico fechado \xB7 ${approved} de ${job.slots || 1}`, tone: "success", icon: "circle-check" };
    if (pending) return { label: pending === 1 ? "1 aguardando an\xE1lise" : `${pending} aguardando an\xE1lise`, tone: "warning", icon: "clock" };
    const total = applicationsForJob(job.id).length;
    if (total) return { label: total === 1 ? "1 candidato" : `${total} candidatos`, tone: "brand", icon: "users" };
    return { label: "Sem candidatos ainda", tone: "neutral", icon: "search-x" };
  }
  function infoRow2(icon, main, sub) {
    return h(
      "div",
      { class: "flex gap-3 items-start" },
      Icon(icon, { size: 20, color: "var(--text-subtle)" }),
      h("div", { class: "flex flex-col" }, h("span", { class: "font-semibold text-concrete-900" }, main), h("span", { class: "text-sm text-concrete-500" }, sub))
    );
  }

  // js/screens/recruiter/JobClosed.js
  function renderJobClosed(navigate2, params) {
    const job = getJob(params.id);
    const team = job ? applicationsForJob(job.id).filter((a) => a.status === "pre_selecionado" || a.status === "contratado").map((a) => getWorker(a.workerId)) : [];
    if (!job || team.length === 0) {
      return h(
        "div",
        { class: "flex flex-col items-center justify-center min-h-screen gap-3" },
        h("p", { class: "text-concrete-500" }, "Esse bico ainda n\xE3o foi fechado."),
        Button({ label: "Voltar ao in\xEDcio", variant: "secondary", onClick: () => navigate2("/mural") })
      );
    }
    const title = team.length === 1 ? `${team[0].name} est\xE1 contratado` : `${team.length} trabalhadores contratados`;
    const total = (job.pay || 0) * Math.max(team.length, 1);
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Bico fechado", onBack: () => goBack("/mural") }),
      h(
        "div",
        { class: "bg-brand-500 text-white px-4 sm:px-6 py-7 flex flex-col gap-3 lg:rounded-card" },
        Badge({ label: "Bico fechado", tone: "inverse", icon: "circle-check" }),
        h("h1", { class: "font-display font-bold text-3xl leading-tight text-white" }, title),
        h("p", { class: "text-white/85" }, `${job.role} \xB7 ${job.date}`)
      ),
      h(
        "div",
        { class: "flex flex-col gap-4 px-4 sm:px-0 py-4" },
        Card(
          { tone: "sunken", padding: "sm" },
          h(
            "div",
            { class: "flex items-center gap-3" },
            Icon("circle-check", { size: 20, color: "var(--green-500)" }),
            h("span", { class: "flex-1 text-sm text-concrete-700" }, "A vaga saiu do mural. Quem n\xE3o foi aprovado recebeu o aviso de que o bico foi fechado.")
          )
        ),
        h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Equipe contratada"),
        h("div", { class: "flex flex-col gap-3" }, ...team.map((worker) => Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-3.5" },
            h(
              "div",
              { class: "flex items-center gap-3" },
              h("span", { class: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-50 text-accent-600 font-bold shrink-0" }, worker.initials),
              h("div", { class: "flex-1 min-w-0 flex flex-col" }, h("span", { class: "font-semibold text-concrete-900" }, worker.name), h("span", { class: "text-sm text-concrete-500" }, `${worker.role} \xB7 ${worker.region}`))
            ),
            Button({ label: "Falar no WhatsApp", variant: "accent", fullWidth: true, iconLeft: "message-circle", onClick: () => {
            } })
          )
        ))),
        Card(
          { tone: "sunken", padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-3" },
            kv2("Di\xE1ria combinada", job.pay == null ? "A combinar" : formatBRL(job.pay)),
            kv2("Local", job.location),
            kv2("Total do bico", formatBRL(total))
          )
        ),
        Button({ label: "Voltar ao in\xEDcio", variant: "secondary", fullWidth: true, onClick: () => navigate2("/mural") })
      )
    );
  }
  function kv2(label, value) {
    return h("div", { class: "flex items-center justify-between gap-3" }, h("span", { class: "text-sm text-concrete-500" }, label), h("span", { class: "font-mono font-bold text-concrete-900" }, value));
  }

  // js/screens/recruiter/BoostJob.js
  var KEY14 = "boost-job";
  var PLANS = [
    { id: "24h", label: "Topo do mural por 24h", desc: "Aparece antes das outras vagas da regi\xE3o.", price: "R$ 12" },
    { id: "3d", label: "Topo do mural por 3 dias", desc: "Para vaga com data mais distante.", price: "R$ 28" },
    { id: "whats", label: "24h + aviso por WhatsApp", desc: "Avisamos quem tem o perfil da vaga por perto.", price: "R$ 39" }
  ];
  function renderBoostJob(navigate2, params) {
    const job = getJob(params.id);
    if (!job) return h("div", { class: "p-6 text-concrete-500" }, "Vaga n\xE3o encontrada.");
    const ui = getUI(KEY14, { plan: "24h" });
    const chosen = PLANS.find((p) => p.id === ui.plan);
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Impulsionar vaga", onBack: () => goBack("/vaga-gerenciar/" + job.id) }),
      h(
        "div",
        { class: "flex flex-col gap-5 px-4 sm:px-0 py-4" },
        h(
          "div",
          { class: "flex flex-col gap-1" },
          h("h1", { class: "font-display font-bold text-2xl text-concrete-900" }, "Sua vaga no topo do mural"),
          h("span", { class: "text-sm text-concrete-700" }, `${job.role} \xB7 ${job.location}`)
        ),
        Card(
          { padding: "md" },
          h(
            "div",
            { class: "flex flex-col gap-3.5" },
            fact("zap", "A vaga aparece no bloco de cima do mural, antes das outras da mesma regi\xE3o.", "var(--brand)"),
            fact("users", "Vagas impulsionadas na regi\xE3o recebem em m\xE9dia 4 candidatos a mais.", "var(--text-subtle)"),
            fact("triangle-alert", "Impulsionar n\xE3o garante candidato. Se ningu\xE9m se candidatar, devolvemos o valor em 3 dias.", "var(--amber-500)")
          )
        ),
        h(
          "div",
          { class: "flex flex-col gap-2.5" },
          h("div", { class: "text-xs font-bold tracking-[0.08em] uppercase text-concrete-500" }, "Por quanto tempo"),
          h("div", { class: "flex flex-col gap-2" }, ...PLANS.map((p) => {
            const active = ui.plan === p.id;
            return h(
              "button",
              {
                type: "button",
                onClick: () => setUI(KEY14, { plan: p.id }),
                class: `flex items-center gap-3 w-full min-h-[4.5rem] px-4 py-3.5 rounded-card border transition-colors text-left ${active ? "bg-brand-50 border-brand-500" : "bg-white border-concrete-300 shadow-card"}`
              },
              h("span", { class: `shrink-0 w-5 h-5 rounded-full border-2 ${active ? "border-brand-500 bg-brand-500" : "border-concrete-400"}` }),
              h(
                "span",
                { class: "flex-1 min-w-0 flex flex-col gap-0.5" },
                h("span", { class: `font-semibold ${active ? "text-brand-600" : "text-concrete-900"}` }, p.label),
                h("span", { class: "text-sm text-concrete-500" }, p.desc)
              ),
              h("span", { class: "font-mono font-bold text-lg text-concrete-900" }, p.price)
            );
          }))
        ),
        h("span", { class: "text-sm text-concrete-500" }, "Cobran\xE7a \xFAnica no cart\xE3o cadastrado. Sem renova\xE7\xE3o autom\xE1tica. O trabalhador nunca paga nada.")
      ),
      h(
        "div",
        { class: "px-4 sm:px-0 py-3 flex flex-col gap-2" },
        Button({ label: `Impulsionar por ${chosen.price}`, size: "lg", fullWidth: true, onClick: () => {
          job.boosted = true;
          job.urgent = true;
          navigate2("/vaga-gerenciar/" + job.id);
        } }),
        Button({ label: "Agora n\xE3o", variant: "ghost", fullWidth: true, onClick: () => navigate2("/vaga-gerenciar/" + job.id) })
      )
    );
  }
  function fact(icon, text, color) {
    return h("div", { class: "flex gap-2.5 items-start" }, Icon(icon, { size: 20, color }), h("span", { class: "text-sm text-concrete-700" }, text));
  }

  // js/screens/recruiter/History.js
  var STATUS = {
    concluida: { label: "Avaliar o trabalhador", tone: "accent", icon: "star", hint: "Avaliar" },
    avaliada: { label: "Di\xE1ria conclu\xEDda", tone: "success", icon: "circle-check", hint: "Ver o bico" },
    contratado: { label: "Di\xE1ria conclu\xEDda", tone: "success", icon: "circle-check", hint: "Ver o bico" }
  };
  function renderHistory(navigate2) {
    const companyId = currentCompanyId();
    const items = allJobs().filter((j) => j.companyId === companyId && j.closed).flatMap((job) => applicationsForJob(job.id).filter((a) => STATUS[a.status]).map((a) => ({ job, app: a, worker: getWorker(a.workerId) }))).filter((x) => x.worker);
    return h(
      "div",
      { class: "flex flex-col" },
      BackBar({ title: "Bicos fechados", onBack: () => goBack("/empresa") }),
      h(
        "div",
        { class: "flex flex-col gap-3 px-4 sm:px-0 py-4" },
        items.length === 0 ? EmptyState({ icon: "file-check", title: "Nenhuma vaga encerrada", description: "Quando voc\xEA fechar ou encerrar um bico, ele fica guardado aqui.", actionLabel: "Ver vagas abertas", onAction: () => navigate2("/mural") }) : h("div", { class: "flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5" }, ...items.map(({ job, app, worker }) => {
          const s = STATUS[app.status];
          return Card(
            { padding: "sm", onClick: () => navigate2("/vaga-gerenciar/" + job.id) },
            h(
              "div",
              { class: "flex flex-col gap-3" },
              h(
                "div",
                { class: "flex items-center gap-3" },
                h("span", { class: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-50 text-accent-600 font-bold text-sm shrink-0" }, worker.initials),
                h("div", { class: "flex-1 min-w-0 flex flex-col" }, h("span", { class: "font-semibold text-concrete-900 truncate" }, worker.name), h("span", { class: "text-sm text-concrete-500 truncate" }, `${job.role} \xB7 ${job.date}`)),
                h("span", { class: "font-mono font-bold text-lg text-concrete-900 shrink-0" }, job.pay == null ? "A combinar" : formatBRL(job.pay))
              ),
              h(
                "div",
                { class: "flex items-center justify-between gap-2 pt-3 border-t border-concrete-200" },
                Badge({ label: s.label, tone: s.tone, icon: s.icon }),
                h("span", { class: "inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600" }, s.hint, Icon("chevron-right", { size: 16, color: "var(--text-brand)" }))
              )
            )
          );
        }))
      )
    );
  }

  // js/main.js
  route("/splash", () => renderSplash(navigate));
  route("/escolha-perfil", () => renderChooseProfile(navigate));
  route("/cadastro/:role", (p) => renderSignup(navigate, p));
  route("/verificar-email", () => renderVerifyEmail(navigate));
  route("/completar-perfil/:role", (p) => renderCompleteProfile(navigate, p));
  route("/login", () => renderLogin(navigate));
  route("/esqueci-senha", () => renderForgotPassword(navigate));
  route("/redefinir-senha", () => renderResetPassword(navigate));
  route("/notificacoes", () => renderNotifications(navigate));
  route("/configuracoes", () => renderSettings(navigate));
  route("/configuracoes/privacidade", () => renderPrivacy(navigate));
  route("/mural", () => renderFeed(navigate));
  route("/vaga/:id", (p) => renderJobDetail(navigate, p));
  route("/confirmar/:id", (p) => renderConfirmApplication(navigate, p));
  route("/enviado/:id", (p) => renderApplicationSent(navigate, p));
  route("/minhas-candidaturas", () => renderMyApplications(navigate));
  route("/vagas-salvas", () => renderSavedJobs(navigate));
  route("/selecionado/:id", (p) => renderSelected(navigate, p));
  route("/avaliar/:id", (p) => renderRateJob(navigate, p));
  route("/perfil", () => renderWorkerProfile(navigate, {}));
  route("/perfil/editar", () => renderEditWorkerProfile(navigate));
  route("/trabalhador/:id", (p) => renderWorkerProfile(navigate, p));
  route("/trabalhador/:id/:jobId", (p) => renderWorkerProfile(navigate, p));
  route("/empresa", () => renderCompanyProfile(navigate, {}));
  route("/empresa/editar", () => renderEditCompanyProfile(navigate));
  route("/construtora/:id", (p) => renderCompanyProfile(navigate, p));
  route("/avaliacoes/:type/:id", (p) => renderReviews(navigate, p));
  route("/criar-vaga", () => renderCreateJob(navigate));
  route("/vaga-publicada/:id", (p) => renderJobPublished(navigate, p));
  route("/vaga-gerenciar/:id", (p) => renderJobManage(navigate, p));
  route("/fechado/:id", (p) => renderJobClosed(navigate, p));
  route("/impulsionar/:id", (p) => renderBoostJob(navigate, p));
  route("/historico", () => renderHistory(navigate));
  var AUTH_FLOW = /* @__PURE__ */ new Set(["/splash", "/escolha-perfil", "/verificar-email", "/login", "/esqueci-senha", "/redefinir-senha"]);
  var TAB_ROOTS = { trabalhador: /* @__PURE__ */ new Set(["/mural", "/minhas-candidaturas", "/perfil"]), recrutador: /* @__PURE__ */ new Set(["/mural", "/criar-vaga", "/empresa"]) };
  function isAuthFlow(path) {
    if (AUTH_FLOW.has(path)) return true;
    return path.startsWith("/cadastro/") || path.startsWith("/completar-perfil/");
  }
  var NARROW_SCREENS = /* @__PURE__ */ new Set([
    "/criar-vaga",
    "/perfil/editar",
    "/empresa/editar",
    "/configuracoes",
    "/configuracoes/privacidade",
    "/notificacoes",
    "/confirmar/:id",
    "/enviado/:id",
    "/avaliar/:id",
    "/selecionado/:id",
    "/vaga-publicada/:id",
    "/impulsionar/:id",
    "/fechado/:id",
    "/avaliacoes/:type/:id"
  ]);
  var appEl = document.getElementById("app");
  function build(m, path) {
    const content = m.handler(m.params);
    if (isAuthFlow(path)) {
      return content;
    }
    const role = getRole();
    const badges = role === "trabalhador" ? { "minhas-candidaturas": inProgressCount() } : {};
    const activeId = tabIdForPath(path, role);
    const isMural = path === "/mural";
    const showMobileNav = TAB_ROOTS[role] && TAB_ROOTS[role].has(path);
    const nav = AppNav({
      role,
      active: activeId,
      navigate,
      badges,
      showMobilePill: showMobileNav,
      flush: isMural,
      notifications: role === "recrutador" ? 3 : 2,
      account: accountSummary(role)
    });
    const shell2 = document.createElement("div");
    shell2.className = "lg:flex lg:flex-col lg:min-h-screen";
    shell2.appendChild(nav);
    const main = document.createElement("main");
    main.className = cx(
      "flex-1 min-w-0",
      showMobileNav ? "pb-28 lg:pb-0" : "",
      isMural ? "bg-white min-h-screen" : cx("lg:w-full lg:mx-auto lg:px-8 lg:pt-8 lg:pb-16", NARROW_SCREENS.has(m.pattern) ? "lg:max-w-[40rem]" : "lg:max-w-panel")
    );
    main.appendChild(content);
    shell2.appendChild(main);
    return shell2;
  }
  function accountSummary(role) {
    if (role === "recrutador") {
      const company = currentCompany();
      return { name: company.name, photo: getUI("company-profile", { capa: null, logo: null, deleteId: null }).logo };
    }
    const worker = currentWorker();
    return { name: worker.name, initials: worker.initials };
  }
  function tabIdForPath(path, role) {
    if (role === "trabalhador") {
      if (path === "/mural") return "mural";
      if (path === "/minhas-candidaturas") return "minhas-candidaturas";
      if (path === "/perfil") return "perfil";
    } else {
      if (path === "/mural") return "mural";
      if (path === "/criar-vaga") return "criar-vaga";
      if (path === "/empresa") return "empresa";
    }
    return null;
  }
  function inProgressCount() {
    const apps = applicationsForWorker(currentWorkerId());
    return apps.filter((a) => IN_PROGRESS.has(a.status)).length;
  }
  function notFoundScreen() {
    const div = document.createElement("div");
    div.className = "flex flex-col items-center justify-center min-h-screen gap-3 text-center px-6";
    div.innerHTML = '<h1 class="font-display font-bold text-2xl text-concrete-900">P\xE1gina n\xE3o encontrada</h1><p class="text-concrete-500">Volte para o in\xEDcio.</p>';
    return div;
  }
  var lastRender = null;
  function render(m, path) {
    if (path === void 0) {
      if (!lastRender) return;
      ({ m, path } = lastRender);
    } else {
      lastRender = { m, path };
    }
    if (path === "/") {
      navigate("/splash", { replace: true });
      return;
    }
    if (!m) {
      mount(appEl, notFoundScreen());
      return;
    }
    const captured = captureFocus();
    mount(appEl, build(m, path));
    applyFocus(captured);
  }
  onRouteChange((m, path) => {
    window.scrollTo(0, 0);
    getUI("app-nav", { menuOpen: false }).menuOpen = false;
    render(m, path);
  });
  function captureFocus() {
    const active = document.activeElement;
    if (!active || !appEl.contains(active)) return null;
    const id = active.getAttribute("data-focus-id");
    if (!id) return null;
    return { id, start: active.selectionStart, end: active.selectionEnd };
  }
  function applyFocus(captured) {
    if (!captured) return;
    const el = appEl.querySelector(`[data-focus-id="${cssEscape(captured.id)}"]`);
    if (!el) return;
    el.focus();
    if (typeof captured.start === "number" && el.setSelectionRange) {
      try {
        el.setSelectionRange(captured.start, captured.end);
      } catch (e) {
      }
    }
  }
  function cssEscape(s) {
    return String(s).replace(/["\\]/g, "\\$&");
  }
  subscribe(render);
  startRouter();
})();
