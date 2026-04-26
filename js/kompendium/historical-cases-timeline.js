// Historical EA cases timeline (1930-2024) - Chart.js scatter
(function () {
  'use strict';
  if (typeof Chart === 'undefined') return;
  var canvas = document.getElementById('historical-cases-timeline');
  var detail = document.getElementById('historical-cases-detail');
  if (!canvas || !detail) return;

  var CASES = [
    { y: 1933, s: 5, c: 'totalitarian', n: 'Nacistická propaganda', d: 'Goebbelsovo ministerstvo - systematická kontrola jazyka, Volksempfänger, Reichskulturkammer.' },
    { y: 1937, s: 5, c: 'totalitarian', n: 'Velký teror (SSSR)', d: 'Stalinské čistky - vynucená sebekritika, kolektivní vina, jazyková inverze.' },
    { y: 1949, s: 5, c: 'totalitarian', n: 'Maoismus - Speak Bitterness', d: 'Veřejná sebekritika, thought reform, lao gai převýchova.' },
    { y: 1950, s: 4, c: 'cult', n: 'Scientologie', d: 'Auditing, deklarace SP, disconnect policy - epistemická izolace.' },
    { y: 1953, s: 4, c: 'academic', n: 'MK-ULTRA', d: 'CIA experimenty s narušením identity, LSD, sensorická deprivace.' },
    { y: 1968, s: 4, c: 'cult', n: 'Komuna Synanon', d: 'The Game - rituální verbální napadání, attack therapy.' },
    { y: 1969, s: 5, c: 'cult', n: 'Manson Family', d: 'LSD + izolace + autoritářská struktura - rozpad osobní identity.' },
    { y: 1971, s: 4, c: 'academic', n: 'Stanford Prison Experiment', d: 'Rychlá role-internalizace, deindividuace.' },
    { y: 1972, s: 3, c: 'disinfo', n: 'Operation Mockingbird (odhalení)', d: 'CIA infiltrace médií, manipulace narativu.' },
    { y: 1975, s: 5, c: 'totalitarian', n: 'Rudí Khmerové', d: 'Year Zero - destrukce jazyka, rodiny, paměti, vzdělání.' },
    { y: 1978, s: 5, c: 'cult', n: 'Jonestown', d: '918 obětí - Peoples Temple, kompletní informační izolace, white nights.' },
    { y: 1984, s: 4, c: 'cult', n: 'Rajneeshpuram', d: 'Bioterror v Oregonu, Sheela manipulace, Dynamic Meditation jako technika prolomení.' },
    { y: 1989, s: 4, c: 'cult', n: 'Aum Shinrikyo', d: 'Sarin v metru - PSI sluchátka, izolace, posvátná chemie.' },
    { y: 1993, s: 4, c: 'cult', n: 'Branch Davidians', d: 'Waco - apokalyptické rámcování, izolace, charisma autority.' },
    { y: 1997, s: 4, c: 'cult', n: 'Heaven\'s Gate', d: '39 sebevražd - epistemické zapouzdření, evidence-proof přesvědčení.' },
    { y: 2001, s: 3, c: 'disinfo', n: 'War on Terror narativ', d: 'WMD claim, jazyková válka (enhanced interrogation), strach jako epistemické pojivo.' },
    { y: 2003, s: 3, c: 'disinfo', n: 'Iraq WMD claims', d: 'Manufactured consent, cherry-picking intelligence.' },
    { y: 2008, s: 3, c: 'cult', n: 'NXIVM start', d: 'DOS branding, executive success programs - cohesive control coercion.' },
    { y: 2010, s: 3, c: 'disinfo', n: 'Astroturf 2.0', d: 'Sock puppet sítě, Russian Internet Research Agency formace.' },
    { y: 2013, s: 3, c: 'academic', n: 'Cambridge Analytica (start)', d: 'Psychometrická microtargeting, OCEAN profiling.' },
    { y: 2014, s: 4, c: 'totalitarian', n: 'ISIS propagandistická mašinerie', d: 'Dabiq, video formát, cizí bojovníci - radikalizační pipeline.' },
    { y: 2015, s: 3, c: 'disinfo', n: 'Pizzagate seedling', d: 'QAnon-prekurzory, 4chan rabbit holes.' },
    { y: 2016, s: 4, c: 'disinfo', n: 'Brexit / 2016 election', d: 'Cambridge Analytica skandál, deep fake epoch začíná.' },
    { y: 2017, s: 3, c: 'cult', n: 'NXIVM odhalení', d: 'Allison Mack, Keith Raniere - sex trafficking, blackmail collaterall.' },
    { y: 2018, s: 4, c: 'disinfo', n: 'QAnon mainstream', d: 'Hluboké rabbit holes, drops, decode kultury, Q-coiny.' },
    { y: 2019, s: 3, c: 'disinfo', n: 'Hong Kong protests info-war', d: 'Doxing, lokační deepfake, čínský státní firehose.' },
    { y: 2020, s: 5, c: 'disinfo', n: 'COVID dezinformační vlna', d: 'Plandemic, Mikrochip 5G, ivermectin - epistemická fragmentace v pandemii.' },
    { y: 2020, s: 4, c: 'disinfo', n: 'Stop the Steal', d: 'Volební dezinfo, kapitol 6.1.2021 mobilizace.' },
    { y: 2021, s: 3, c: 'cult', n: 'TikTok-cult mikrokomunity', d: 'Algoritmus + parasocial - akcelerovaná radikalizace teenagerů.' },
    { y: 2022, s: 4, c: 'disinfo', n: 'Ruská invaze - info válka', d: 'Z-symbolika, denacifikační rámec, ChatGPT-předskoková fáze.' },
    { y: 2022, s: 3, c: 'academic', n: 'GPT-3 jailbreaks', d: 'DAN prompty, AI manipulace - oboustranná epistemická hrozba.' },
    { y: 2023, s: 4, c: 'disinfo', n: 'AI deepfake floodgate', d: 'Voice cloning, Pope-puffer, Trump-arrest fake - důkaz se hroutí.' },
    { y: 2023, s: 3, c: 'cult', n: 'Andrew Tate ekosystém', n2: 'Andrew Tate', d: 'Toxic masculinity pipeline, Hustlers University, manosféra.' },
    { y: 2023, s: 3, c: 'disinfo', n: 'Gaza info-war', d: 'Multiple realities paradigm, hospital strike claims, evidence collapse.' },
    { y: 2023, s: 3, c: 'cult', n: 'TwinFlames Universe', d: 'Netflix dokument - love-bombing, identity erasure, harem dynamics.' },
    { y: 2024, s: 4, c: 'disinfo', n: 'Election deepfake era', d: 'Robocally, Biden-fake, Slovak audio - synthetic disinformation operativní.' },
    { y: 2024, s: 3, c: 'academic', n: 'LLM persuasion studies', d: 'GPT-4 výzkumy přesvědčování - 6× lepší než lidský průměr.' },
    { y: 2024, s: 4, c: 'disinfo', n: 'Sora video genese', d: 'Foto-realistické video AI - další kolaps důkazního standardu.' },
    { y: 2024, s: 3, c: 'cult', n: 'AI girlfriend ekonomika', d: 'Replika, Character.AI - parasocial epistemický uzel.' },
    { y: 2024, s: 4, c: 'disinfo', n: 'Synthetic Reality Era', d: '2024 = první rok kdy běžný uživatel nedokáže odlišit AI od reality.' }
  ];

  var COLORS = {
    totalitarian: 'rgba(220, 38, 38, 0.85)',
    cult: 'rgba(168, 85, 247, 0.85)',
    disinfo: 'rgba(245, 158, 11, 0.85)',
    academic: 'rgba(59, 130, 246, 0.85)'
  };
  var LABELS = {
    totalitarian: 'Totalitní režimy',
    cult: 'Kulty / sekty',
    disinfo: 'Dezinformační operace',
    academic: 'Akademické / experimentální'
  };

  function setText(el, txt) { while (el.firstChild) el.removeChild(el.firstChild); el.appendChild(document.createTextNode(txt)); }

  function showCase(c) {
    while (detail.firstChild) detail.removeChild(detail.firstChild);
    var h = document.createElement('h4');
    h.className = 'font-bold text-lg mb-2';
    setText(h, c.n + ' (' + c.y + ')');
    var meta = document.createElement('p');
    meta.className = 'text-xs text-slate-400 mb-2';
    setText(meta, LABELS[c.c] + ' · severity ' + c.s + '/5');
    var p = document.createElement('p');
    setText(p, c.d);
    detail.appendChild(h); detail.appendChild(meta); detail.appendChild(p);
  }

  var datasets = Object.keys(LABELS).map(function (k) {
    return {
      label: LABELS[k],
      data: CASES.filter(function (c) { return c.c === k; }).map(function (c) { return { x: c.y, y: c.s, _ref: c }; }),
      backgroundColor: COLORS[k],
      pointRadius: 8,
      pointHoverRadius: 11
    };
  });

  new Chart(canvas.getContext('2d'), {
    type: 'scatter',
    data: { datasets: datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } },
        tooltip: { callbacks: { label: function (ctx) { return ctx.raw._ref.n + ' (' + ctx.raw._ref.y + ')'; } } }
      },
      scales: {
        x: { title: { display: true, text: 'Rok', color: '#94a3b8' }, min: 1925, max: 2025, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
        y: { title: { display: true, text: 'Závažnost (1-5)', color: '#94a3b8' }, min: 0, max: 6, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }
      },
      onClick: function (_, els) { if (els.length) { var p = els[0]; showCase(datasets[p.datasetIndex].data[p.index]._ref); } }
    }
  });

  setText(detail, 'Klikni na bod v grafu pro detail historického případu.');
})();
