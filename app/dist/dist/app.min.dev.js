"use strict";

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var e = 0, t = 0, s = arguments.length; t < s; t++) {
    e += arguments[t].length;
  }

  for (var n = Array(e), r = 0, t = 0; t < s; t++) {
    for (var o = arguments[t], a = 0, i = o.length; a < i; a++, r++) {
      n[r] = o[a];
    }
  }

  return n;
};

exports.__esModule = !0;

var jquery_1 = require("jquery"),
    chart_js_1 = require("chart.js"),
    latin = {},
    entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
},
    latin = {
  version: 7,
  storage: window.localStorage,
  app: {
    clickSubmit: !0,
    showHint: !0,
    randomOrder: !0,
    allRoots: !1,
    answers: 5
  },
  options: {},
  celebrationChance: 15,
  used: [],
  roots: [],
  commonIndexes: [],
  celebration: null,
  currentIndex: -1,
  question: {
    word: -1,
    duration: -1,
    answers: [],
    dateTime: null
  },
  answerQueue: [],
  answerQueueSize: 20,
  exclamations: ["Amazing", "Awesome", "Brilliant", "Capital", "Cracking", "Excellent", "Exceptional", "Exquisite", "Fabulous", "Fantastic", "Great", "Marvelous", "Nice", "Splendid", "Stellar", "Superb", "Superior", "Supreme", "Terrific", "Tip-Top"],
  escapeHtml: function escapeHtml(e) {
    return String(e).replace(/[&<>"'`=\/]/g, function (e) {
      return entityMap[e];
    });
  },
  init: function init() {
    jquery_1["default"](".tap-target").tapTarget(), jquery_1["default"]("#hintCollapsible").collapsible(), jquery_1["default"](".sidenav").sidenav(), jquery_1["default"](".dropdown-trigger").dropdown({
      constrainWidth: !1,
      closeOnClick: !1,
      coverTrigger: !1
    }), jquery_1["default"]("select").formSelect(), this.loadRoots(), this.db.setup();
  },
  setup: function setup() {
    jquery_1["default"]("#reports").hide(), this.loadSettings(), this.bindSettings(jquery_1["default"]("#slide-out")), this.nextRoot(!1), jquery_1["default"]("#nextRoot").click(this.nextRoot), jquery_1["default"]("#checkAnswer").click(this.checkAnswer), jquery_1["default"]("#rootHint").on("click", ".hint", this.define);
  },
  define: function define() {
    window.open("https://www.merriam-webster.com/dictionary/" + this.escapeHtml(jquery_1["default"](this).text()));
  },
  loadSettings: function loadSettings() {
    var e = this.storage.getItem("settings");
    null === e ? this.storage.setItem("settings", JSON.stringify(this.app)) : this.app = JSON.parse(e), jquery_1["default"]("#answer-choices").text(this.app.answers);
  },
  buildCommonIndex: function buildCommonIndex(e) {
    var n;
    void 0 === e && (e = []), 0 < this.roots.length && (console.log("Build common indexes"), n = this.roots.map(function (e) {
      return e[0];
    }), jquery_1["default"].each(e, function (e, t) {
      var s = n.indexOf(t);
      -1 !== s ? this.commonIndexes.push(s) : console.log("Root not found: " + t);
    }));
  },
  bindSettings: function bindSettings(n) {
    var e = jquery_1["default"]("input", n);
    jquery_1["default"].each(this.app, function (e, t) {
      var s = jquery_1["default"]('[name="' + e + '"]', n);

      switch (s.prop("type")) {
        case "checkbox":
          s.prop("checked", t);
          break;

        default:
          s.val(t);
      }
    }), e.change(this.handleSettingChanged);
  },
  handleSettingChanged: function handleSettingChanged(e) {
    var t = jquery_1["default"](e.currentTarget),
        s = t.prop("name");

    switch ("checkbox" === t.prop("type") ? this.app[s] = t.prop("checked") : this.app[s] = t.val(), this.storage.setItem("settings", JSON.stringify(this.app)), jquery_1["default"]("#answer-choices").text(this.app.answers), s) {
      case "clickSubmit":
        this.setClickSubmit(this.app[s]);
        break;

      case "randomOrder":
        this.app.randomOrder || (this.currentIndex = 0, this.nextRoot());
        break;

      case "showHint":
        this.toggleHint();
        break;

      case "answers":
        this.renderAnswers(this.currentIndex);
    }
  },
  setClickSubmit: function setClickSubmit(e) {
    void 0 === e && (e = !0);
    var t = jquery_1["default"]("#answerContainer");
    e ? (jquery_1["default"]("#checkAnswer").hide(), jquery_1["default"]("input[type='radio']", t).change(this.checkAnswer)) : (jquery_1["default"]("#checkAnswer").show(), jquery_1["default"]("input[type='radio']", t).off("change", this.checkAnswer));
  },
  toggleHint: function toggleHint() {
    var e = M.Collapsible.getInstance(jquery_1["default"]("#hintCollapsible")[0]);
    this.app.showHint ? e.open(0) : e.close(0);
  },
  nextRoot: function nextRoot(e) {
    void 0 === e && (e = !0);
    var t = this.getNextIndex(),
        s = this.roots[t],
        n = 0;
    this.toggleHint(), null !== this.celebration && (this.celebration.hide(), this.celebration = null), e && (jquery_1["default"](".card-content").addClass("scale-out"), n = 300), jquery_1["default"]("#nextRoot").addClass("disabled"), this.currentIndex = t, window.setTimeout(function () {
      jquery_1["default"]("#latinRoot").text(s[this.options.WORD]), jquery_1["default"]("#rootOrigin").text(s[this.options.ORIGIN]), this.renderAnswers(t), this.renderHint(s[this.options.HINT]), jquery_1["default"](".card-content").removeClass("scale-out"), this.question = {
        word: s[this.options.WORD],
        duration: Date.now(),
        answers: []
      };
    }, n);
  },
  renderHint: function renderHint(e) {
    jquery_1["default"]("#rootHint").html('<span class="hint">' + e.split(/\s*,\s*/).join('</span>, <span class="hint">') + "</span>");
  },
  checkAnswer: function checkAnswer(e) {
    var t,
        s,
        n,
        r,
        o = jquery_1["default"]("#answerContainer"),
        a = jquery_1["default"]("input[name='answerGroup']:checked");
    this.question.answers.push(a.val()), this.question.dateTime = new Date().getTime(), a.val() === o.data("answer") ? (jquery_1["default"]("#checkAnswer").prop("disabled", !0), (t = jquery_1["default"]("#nextRoot")).removeClass("disabled"), jquery_1["default"]("#answerContainer input").prop("disabled", !0), 0 === Math.floor(Math.random() * this.celebrationChance) ? (s = jquery_1["default"]("#lets-celebrate"), t.addClass("disabled"), s.addClass("show"), window.setTimeout(function () {
      s.removeClass("show"), t.removeClass("disabled"), this.celebrate();
    }, 1600)) : 1 === this.question.answers.length ? ((n = jquery_1["default"](e.currentTarget).offset()).left += 30, r = this.exclamations[Math.floor(Math.random() * this.exclamations.length)], jquery_1["default"]("#exclamation").text(r).css({
      left: n.left,
      top: n.top
    }).addClass("show"), window.setTimeout(function () {
      jquery_1["default"]("#exclamation").removeClass("show");
    }, 1e3)) : M.toast({
      html: "Correct",
      classes: "correct",
      displayLength: 1e3
    }), this.finishAnswer()) : M.toast({
      html: "Try again",
      classes: "incorrect",
      displayLength: 1e3
    });
  },
  finishAnswer: function finishAnswer() {
    this.question.duration = Date.now() - this.question.duration, this.db.saveAnswer(this.question);
  },
  getNextIndex: function getNextIndex() {
    if (0 === this.roots.length) throw "Roots not loaded";
    var e,
        t = this.app.randomOrder ? this.getRandomIndex() : (++this.currentIndex, e = this.app.allRoots ? this.roots.length : this.commonIndexes.length, this.currentIndex >= e && (this.currentIndex = 0), this.currentIndex);
    return -1 !== this.answerQueue.indexOf(t) ? this.getNextIndex() : (this.answerQueue.push(t), this.answerQueue.length > this.answerQueueSize && this.answerQueue.shift(), t);
  },
  renderAnswers: function renderAnswers(e) {
    for (var t = "", s = [e], n = jquery_1["default"]("#answerContainer"), r = this.roots[e], o = Math.floor(Math.random() * this.app.answers), a = 0; a < this.app.answers;) {
      var i,
          u = this.getRandomIndex();
      -1 === s.indexOf(u) && (t += '<p><label><input name="answerGroup" type="radio" value="' + (i = a === o ? r : this.roots[u])[this.options.ANSWER] + '" /><span>' + i[this.options.ANSWER] + "</span></label></p>", a++, s.push(u));
    }

    n.html(t), n.data("answer", r[this.options.ANSWER]), this.app.clickSubmit && this.setClickSubmit(!0);
  },
  getRandomIndex: function getRandomIndex() {
    if (this.app.allRoots) return Math.floor(Math.random() * this.roots.length);
    var e = Math.floor(Math.random() * this.commonIndexes.length);
    return this.commonIndexes[e];
  },
  loadJson: function loadJson() {
    jquery_1["default"].ajax({
      dataType: "json",
      url: "/app/roots.json?_=" + new Date().getTime(),
      success: function success(e) {
        this.options = e.options, this.roots = e.data, this.buildCommonIndex(e.common), this.storage.setItem("latinRoots", JSON.stringify({
          version: this.version,
          options: e.options,
          roots: e.data,
          common: e.common,
          commonIndexes: this.commonIndexes
        })), this.setup();
      }
    });
  },
  loadRoots: function loadRoots() {
    var e = this.storage.getItem("latinRoots");
    if (null === e) this.loadJson(), jquery_1["default"](".tap-target").tapTarget("open");else {
      var t = JSON.parse(e);
      if (t.version !== this.version) return window.localStorage.removeItem("latinRoots"), void this.loadRoots();
      this.options = t.options, this.roots = t.roots, this.commonIndexes = t.commonIndexes, this.setup();
    }
  },
  toggleOption: function toggleOption(e) {
    console.log(e);
  },
  showReports: function showReports() {
    jquery_1["default"](".sidenav").sidenav("close"), jquery_1["default"]("#questions").fadeOut(200, function () {
      jquery_1["default"]("#reports").fadeIn(200);
    }), this.db.renderData();
  },
  hideReports: function hideReports() {
    jquery_1["default"]("#reports").hide(200, function () {
      jquery_1["default"]("#questions").fadeIn(200);
    });
  },
  celebrate: function celebrate() {
    jquery_1["default"]("body").addClass("celbrate"), this.celebration = this.celebrations[Math.floor(Math.random() * this.celebrations.length)], this.celebration.show(), jquery_1["default"]("#celebrations").click(this.uncelebrate), jquery_1["default"](window).resize(this.celebration.resize);
  },
  uncelebrate: function uncelebrate() {
    jquery_1["default"]("body").removeClass("celbrate"), this.celebration.hide(), this.nextRoot(this.uncelebrate), jquery_1["default"]("#celebrations").off("click", this.uncelebrate);
  }
},
    db = {
  db: null,
  name: "latin",
  version: 3,
  numStats: 10,
  setup: function setup() {
    var e;
    window.indexedDB ? ((e = window.indexedDB.open(this.db.name, this.db.version)).onsuccess = function (e) {}, e.onupgradeneeded = this.db.upgradeNeeded) : console.log("This browser doesn't support IndexedDB");
  },
  upgradeNeeded: function upgradeNeeded(e) {
    this.db.db = e.target.result, console.debug("Upgrading database from " + e.oldVersion), this.db.db.objectStoreNames.contains("answers") || this.db.db.createObjectStore("answers", {
      keyPath: "id",
      autoIncrement: !0
    }).createIndex("answerIndex", "answers.dateTime", {
      unique: !0
    });
  },
  saveAnswer: function saveAnswer(e) {
    console.debug("Saving...");
    var t = this.db.db.transaction(["answers"], "readwrite");
    t.oncomplete = function () {
      console.debug("Transaction complete");
    }, t.onerror = function () {
      console.error("Unable to save data");
    };
    var s = t.objectStore("answers").add(e);
    console.debug("save: " + e), s.onsuccess = function () {
      console.debug("Data saved");
    };
  },
  saveAnswers: function saveAnswers(e) {
    e.forEach(function (e) {
      this.db.saveAnswer(e);
    });
  },
  msToTime: function msToTime(e) {
    function t(e) {
      return (e < 10).toString() ? "0" : e.toString();
    }

    var s = Math.floor(e / 1e3 % 60),
        n = Math.floor(e / 6e4 % 60);
    return t(Math.floor(e / 36e5 % 24)) + ":" + t(n) + ":" + t(s);
  },
  msToDate: function msToDate(e) {
    var t = new Date(e);
    return t.getFullYear() + "-" + t.getMonth() + "-" + t.getDate();
  },
  addDayStats: function addDayStats(e, t) {
    var s = this.db.msToDate(t.dateTime);
    void 0 === e[s] && (e[s] = {
      duration: 0,
      questions: 0,
      answers: 0,
      times: []
    });
    var n = e[s];
    n.duration += t.duration, n.times.push(t.dateTime), n.questions++, n.answers += t.answers.length;
  },
  getMostMissed: function getMostMissed() {},
  showLatinStats: function showLatinStats(e) {
    jquery_1["default"]("#totals-questions").text(e.questions), jquery_1["default"]("#totals-answers").text(e.guesses), jquery_1["default"]("#totals-time").text(this.db.msToTime(e.duration));
  },
  getData: function getData() {
    var o = {
      questions: 0,
      guesses: 0,
      duration: 0
    },
        a = {},
        i = new Map(),
        e = this.db.db.transaction(["answers"]).objectStore("answers").openCursor();
    return jquery_1["default"].Deferred(function (r) {
      e.onerror = function (e) {
        console.error("Query error: " + e);
      }, e.onsuccess = function (e) {
        var t,
            s,
            n = e.target.result;
        n ? (o.questions++, o.guesses += n.value.answers.length, o.duration += 60 < n.value.duration ? 60 : n.value.duration, t = n.value.word, void 0 === (s = i.get(t)) && (s = {
          occurances: 0,
          guesses: 0
        }, i.set(t, s)), s.occurances++, s.guesses += n.value.answers.length, this.db.addDayStats(a, n.value), n["continue"]()) : r.resolve({
          stats: o,
          wordStats: i,
          dayStats: a
        });
      };
    }).promise();
  },
  renderData: function renderData() {
    jquery_1["default"]("#out").text(""), this.db.getData().done(function (e) {
      this.db.showLatinStats(e.stats), this.db.showWordStats(e.wordStats), this.db.showChart(e.dayStats);
    });
  },
  showWordStats: function showWordStats(e) {
    var t = new Map(__spreadArrays(e.entries()).sort(function (e, t) {
      return t[1].guesses - e[1].guesses;
    })),
        s = new Map(__spreadArrays(e.entries()).sort(function (e, t) {
      return e[1].guesses - t[1].guesses;
    })),
        n = new Map(__spreadArrays(e.entries()).sort(function (e, t) {
      return e[1].occurances - t[1].occurances;
    })),
        r = new Map(__spreadArrays(e.entries()).sort(function (e, t) {
      return t[1].occurances - e[1].occurances;
    }));
    this.db.renderWordStats(jquery_1["default"]("#most-correct"), "guesses", s), this.db.renderWordStats(jquery_1["default"]("#least-correct"), "guesses", t), this.db.renderWordStats(jquery_1["default"]("#most-seen"), "occurances", r), this.db.renderWordStats(jquery_1["default"]("#least-seen"), "occurances", n);
  },
  renderWordStats: function renderWordStats(e, t, s) {
    var n = 0;
    e.html("");

    for (var r = 0, o = s; r < o.length; r++) {
      var a = o[r],
          i = a[0],
          u = a[1];
      if (e.append('<li class="collection-item"><span class="badge">' + u[t] + "</span>" + i + "</li>"), ++n >= this.db.numStats) break;
    }
  },
  chartColors: {
    green: "#388E3C",
    green2: "#4CAF50",
    blue: "#2962ff",
    blue2: "#448AFF",
    red: "#f44336",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    purple: "rgb(153, 102, 255)",
    grey: "rgb(201, 203, 207)"
  },
  renderQuestionsAndGuessesChart: function renderQuestionsAndGuessesChart(e, t, s, n) {
    var r = {
      labels: e,
      datasets: [{
        type: "line",
        label: "Avg. Answsers per Question",
        backgroundColor: this.db.chartColors.red,
        fill: !1,
        stack: "Stack 1",
        pointHoverRadius: 10,
        data: n
      }, {
        type: "bar",
        label: "Questions",
        borderWidth: 1,
        borderColor: this.db.chartColors.green,
        backgroundColor: this.db.chartColors.green2,
        stack: "Stack 0",
        data: s
      }, {
        type: "bar",
        label: "Guesses",
        borderWidth: 1,
        borderColor: this.db.chartColors.blue,
        backgroundColor: this.db.chartColors.blue2,
        stack: "Stack 0",
        data: t
      }]
    },
        o = jquery_1["default"]("<canvas>");
    jquery_1["default"]("#charts").append(o), new chart_js_1["default"].Chart(o[0].getContext("2d"), {
      type: "bar",
      data: r,
      options: {
        responsive: !0,
        legend: {
          position: "top"
        },
        hover: {
          mode: "index"
        },
        title: {
          display: !0,
          text: "Questions & Answers"
        },
        scales: {
          xAxes: {
            stacked: !0
          },
          yAxes: {
            stacked: !0
          }
        }
      }
    });
  },
  renderSecondsPerQuestionChart: function renderSecondsPerQuestionChart(e, t, s) {
    var n = {
      labels: e,
      datasets: [{
        type: "bar",
        label: "Total Time (Minutes)",
        borderWidth: 1,
        borderColor: this.db.chartColors.green,
        backgroundColor: this.db.chartColors.green2,
        data: t
      }, {
        type: "line",
        label: "Avg. Time per Word",
        borderWidth: 1,
        borderColor: this.db.chartColors.blue,
        backgroundColor: this.db.chartColors.blue2,
        data: s
      }]
    },
        r = jquery_1["default"]("<canvas>");
    jquery_1["default"]("#charts").append(r), new chart_js_1["default"].Chart(r[0].getContext("2d"), {
      type: "bar",
      data: n,
      options: {
        responsive: !0,
        legend: {
          position: "top"
        },
        title: {
          display: !0,
          text: "Time"
        }
      }
    });
  },
  showChart: function showChart(e) {
    var t = Object.keys(e),
        n = [],
        r = [],
        o = [],
        a = [],
        i = [];
    jquery_1["default"].each(e, function (e, t) {
      var s = 60 < (s = t.duration / 1e3) ? 60 : s;
      n.push(t.questions), r.push(t.answers), a.push(s / t.questions), o.push(Math.ceil(s / 60)), i.push(t.answers / t.questions);
    }), jquery_1["default"]("#charts").html(""), this.db.renderQuestionsAndGuessesChart(t, r, n, i), this.db.renderSecondsPerQuestionChart(t, o, a);
  }
};