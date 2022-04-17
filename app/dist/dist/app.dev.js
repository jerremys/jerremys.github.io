"use strict";

var __spreadArrays = void 0 && (void 0).__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
};

exports.__esModule = true;
/********************************************************
 * Jerremy Strassner
 * jerremy.j.strassner@gmail.com
 *********************************************************/

var jquery_1 = require("jquery");

var chart_js_1 = require("chart.js");

var latin = {};
var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};
latin = {
  version: 7,
  storage: window.localStorage,
  app: {
    clickSubmit: true,
    showHint: true,
    randomOrder: true,
    allRoots: false,
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
  exclamations: ['Amazing', 'Awesome', 'Brilliant', 'Capital', 'Cracking', 'Excellent', 'Exceptional', 'Exquisite', 'Fabulous', 'Fantastic', 'Great', 'Marvelous', 'Nice', 'Splendid', 'Stellar', 'Superb', 'Superior', 'Supreme', 'Terrific', 'Tip-Top'],
  escapeHtml: function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
      return entityMap[s];
    });
  },
  init: function init() {
    jquery_1["default"](".tap-target").tapTarget();
    jquery_1["default"]('#hintCollapsible').collapsible();
    jquery_1["default"]('.sidenav').sidenav();
    jquery_1["default"]('.dropdown-trigger').dropdown({
      constrainWidth: false,
      closeOnClick: false,
      coverTrigger: false
    });
    jquery_1["default"]('select').formSelect();
    this.loadRoots();
    this.db.setup();
  },
  setup: function setup() {
    jquery_1["default"]("#reports").hide();
    this.loadSettings();
    this.bindSettings(jquery_1["default"]("#slide-out"));
    this.nextRoot(false);
    jquery_1["default"]('#nextRoot').click(this.nextRoot);
    jquery_1["default"]('#checkAnswer').click(this.checkAnswer);
    jquery_1["default"]("#rootHint").on('click', '.hint', this.define);
  },
  define: function define() {
    window.open('https://www.merriam-webster.com/dictionary/' + this.escapeHtml(jquery_1["default"](this).text()));
  },
  loadSettings: function loadSettings() {
    var settingsString = this.storage.getItem('settings');

    if (settingsString === null) {
      this.storage.setItem('settings', JSON.stringify(this.app));
    } else {
      this.app = JSON.parse(settingsString);
    }

    jquery_1["default"]('#answer-choices').text(this.app.answers);
  },
  buildCommonIndex: function buildCommonIndex(commonList) {
    if (commonList === void 0) {
      commonList = [];
    }

    if (this.roots.length > 0) {
      console.log("Build common indexes");

      var stripper = function stripper(val) {
        return val[0];
      };

      var allRoots_1 = this.roots.map(stripper);
      jquery_1["default"].each(commonList, function (idx, root) {
        var rootIndex = allRoots_1.indexOf(root);

        if (rootIndex !== -1) {
          this.commonIndexes.push(rootIndex);
        } else {
          console.log("Root not found: " + root);
        }
      });
    }
  },
  bindSettings: function bindSettings($form) {
    var $cb = jquery_1["default"]("input", $form);
    jquery_1["default"].each(this.app, function (index, value) {
      var $el = jquery_1["default"]('[name="' + index + '"]', $form);

      switch ($el.prop('type')) {
        case 'checkbox':
          $el.prop("checked", value);
          break;

        default:
          $el.val(value);
      }
    });
    $cb.change(this.handleSettingChanged);
  },
  handleSettingChanged: function handleSettingChanged(el) {
    var $el = jquery_1["default"](el.currentTarget),
        name = $el.prop("name");

    if ($el.prop('type') === 'checkbox') {
      this.app[name] = $el.prop("checked");
    } else {
      this.app[name] = $el.val();
    }

    this.storage.setItem('settings', JSON.stringify(this.app));
    jquery_1["default"]('#answer-choices').text(this.app.answers);

    switch (name) {
      case 'clickSubmit':
        this.setClickSubmit(this.app[name]);
        break;

      case 'randomOrder':
        if (!this.app.randomOrder) {
          this.currentIndex = 0;
          this.nextRoot();
        }

        break;

      case 'showHint':
        this.toggleHint();
        break;

      case 'answers':
        this.renderAnswers(this.currentIndex);
        break;
    }
  },
  setClickSubmit: function setClickSubmit(auto) {
    if (auto === void 0) {
      auto = true;
    }

    var container = jquery_1["default"]('#answerContainer');

    if (auto) {
      jquery_1["default"]("#checkAnswer").hide();
      jquery_1["default"]("input[type='radio']", container).change(this.checkAnswer);
    } else {
      jquery_1["default"]('#checkAnswer').show();
      jquery_1["default"]("input[type='radio']", container).off('change', this.checkAnswer);
    }
  },
  toggleHint: function toggleHint() {
    var hintCollapsible = M.Collapsible.getInstance(jquery_1["default"]('#hintCollapsible')[0]);

    if (!this.app.showHint) {
      hintCollapsible.close(0);
    } else {
      hintCollapsible.open(0);
    }
  },
  nextRoot: function nextRoot(transition) {
    if (transition === void 0) {
      transition = true;
    }

    var newRootIndex = this.getNextIndex(),
        newRoot = this.roots[newRootIndex];
    var delay = 0;
    this.toggleHint();

    if (this.celebration !== null) {
      this.celebration.hide();
      this.celebration = null;
    }

    if (transition) {
      jquery_1["default"](".card-content").addClass("scale-out");
      delay = 300;
    }

    jquery_1["default"]("#nextRoot").addClass("disabled");
    this.currentIndex = newRootIndex;
    window.setTimeout(function () {
      jquery_1["default"]('#latinRoot').text(newRoot[this.options.WORD]);
      jquery_1["default"]('#rootOrigin').text(newRoot[this.options.ORIGIN]);
      this.renderAnswers(newRootIndex);
      this.renderHint(newRoot[this.options.HINT]);
      jquery_1["default"](".card-content").removeClass("scale-out");
      this.question = {
        word: newRoot[this.options.WORD],
        duration: Date.now(),
        answers: []
      };
    }, delay);
  },
  renderHint: function renderHint(hint) {
    jquery_1["default"]('#rootHint').html('<span class="hint">' + hint.split(/\s*,\s*/).join('</span>, <span class="hint">') + '</span>');
  },
  checkAnswer: function checkAnswer(evt) {
    var container = jquery_1["default"]('#answerContainer');
    var selected = jquery_1["default"]("input[name='answerGroup']:checked");
    this.question.answers.push(selected.val());
    this.question.dateTime = new Date().getTime();

    if (selected.val() === container.data('answer')) {
      jquery_1["default"]('#checkAnswer').prop("disabled", true);
      var $nextRoot_1 = jquery_1["default"]("#nextRoot");
      $nextRoot_1.removeClass("disabled");
      jquery_1["default"]('#answerContainer input').prop('disabled', true);

      if (Math.floor(Math.random() * this.celebrationChance) === 0) {
        var $el_1 = jquery_1["default"]("#lets-celebrate");
        $nextRoot_1.addClass("disabled");
        $el_1.addClass('show');
        window.setTimeout(function () {
          $el_1.removeClass('show');
          $nextRoot_1.removeClass("disabled");
          this.celebrate();
        }, 1600);
      } else if (this.question.answers.length === 1) {
        var position = jquery_1["default"](evt.currentTarget).offset();
        position.left += 30; //todo: fix
        //explode(position.left, position.top);

        var exclamationText = this.exclamations[Math.floor(Math.random() * this.exclamations.length)];
        jquery_1["default"]("#exclamation").text(exclamationText).css({
          left: position.left,
          top: position.top
        }).addClass('show');
        window.setTimeout(function () {
          jquery_1["default"]("#exclamation").removeClass('show');
        }, 1000);
      } else {
        M.toast({
          html: 'Correct',
          classes: 'correct',
          displayLength: 1000
        });
      }

      this.finishAnswer();
    } else {
      M.toast({
        html: 'Try again',
        classes: 'incorrect',
        displayLength: 1000
      });
    }
  },
  finishAnswer: function finishAnswer() {
    this.question.duration = Date.now() - this.question.duration;
    this.db.saveAnswer(this.question);
  },
  getNextIndex: function getNextIndex() {
    if (this.roots.length === 0) {
      throw 'Roots not loaded';
    }

    var newIndex;

    if (this.app.randomOrder) {
      newIndex = this.getRandomIndex();
    } else {
      ++this.currentIndex;
      var max = this.app.allRoots ? this.roots.length : this.commonIndexes.length;

      if (this.currentIndex >= max) {
        this.currentIndex = 0;
      }

      newIndex = this.currentIndex;
    }

    if (this.answerQueue.indexOf(newIndex) !== -1) {
      // Question repeated too soon
      return this.getNextIndex();
    }

    this.answerQueue.push(newIndex);

    if (this.answerQueue.length > this.answerQueueSize) {
      this.answerQueue.shift();
    }

    return newIndex;
  },
  renderAnswers: function renderAnswers(rootIndex) {
    var answerHtml = '',
        picked = [rootIndex],
        container = jquery_1["default"]('#answerContainer'),
        root = this.roots[rootIndex];
    var correctAnswerIndex = Math.floor(Math.random() * this.app.answers);

    for (var i = 0; i < this.app.answers;) {
      var answerIndex = this.getRandomIndex();

      if (picked.indexOf(answerIndex) !== -1) {
        continue;
      }

      var answer = i === correctAnswerIndex ? root : this.roots[answerIndex];
      answerHtml += '<p><label><input name="answerGroup" type="radio" value="' + answer[this.options.ANSWER] + '" /><span>' + answer[this.options.ANSWER] + '</span></label></p>';
      i++;
      picked.push(answerIndex);
    }

    container.html(answerHtml);
    container.data('answer', root[this.options.ANSWER]);

    if (this.app.clickSubmit) {
      this.setClickSubmit(true);
    }
  },
  getRandomIndex: function getRandomIndex() {
    if (this.app.allRoots) {
      return Math.floor(Math.random() * this.roots.length);
    } else {
      var commonIndex = Math.floor(Math.random() * this.commonIndexes.length);
      return this.commonIndexes[commonIndex];
    }
  },
  loadJson: function loadJson() {
    var success = function success(resp) {
      this.options = resp.options;
      this.roots = resp.data;
      this.buildCommonIndex(resp.common);
      this.storage.setItem('latinRoots', JSON.stringify({
        version: this.version,
        options: resp.options,
        roots: resp.data,
        common: resp.common,
        commonIndexes: this.commonIndexes
      }));
      this.setup();
    };

    jquery_1["default"].ajax({
      'dataType': "json",
      'url': '/app/roots.json?_=' + new Date().getTime(),
      'success': success
    });
  },
  loadRoots: function loadRoots() {
    var rootsString = this.storage.getItem('latinRoots');

    if (rootsString === null) {
      this.loadJson();
      jquery_1["default"](".tap-target").tapTarget('open');
    } else {
      var data = JSON.parse(rootsString);

      if (data.version !== this.version) {
        window.localStorage.removeItem('latinRoots');
        this.loadRoots();
        return;
      }

      this.options = data.options;
      this.roots = data.roots;
      this.commonIndexes = data.commonIndexes;
      this.setup();
    }
  },
  toggleOption: function toggleOption($evt) {
    console.log($evt);
    /*
    const $cb = $('input[type=checkbox]', $evt.currentTarget);
    if (!$cb.length) {
        return;
    }
      $cb.prop("checked", !!!$cb.prop("checked"));
      var e = $.Event("click");
    e.currentTarget = $cb;
    this.handleSettingChanged(e);
    */
  },
  showReports: function showReports() {
    jquery_1["default"]('.sidenav').sidenav("close");
    jquery_1["default"]("#questions").fadeOut(200, function () {
      jquery_1["default"]("#reports").fadeIn(200);
    });
    this.db.renderData();
  },
  hideReports: function hideReports() {
    jquery_1["default"]("#reports").hide(200, function () {
      jquery_1["default"]("#questions").fadeIn(200);
    });
  },
  celebrate: function celebrate() {
    jquery_1["default"]('body').addClass('celbrate');
    this.celebration = this.celebrations[Math.floor(Math.random() * this.celebrations.length)];
    this.celebration.show();
    jquery_1["default"]('#celebrations').click(this.uncelebrate);
    jquery_1["default"](window).resize(this.celebration.resize);
  },
  uncelebrate: function uncelebrate() {
    jquery_1["default"]('body').removeClass('celbrate');
    this.celebration.hide();
    this.nextRoot(this.uncelebrate); //TODO: fix
    //$(window).off('resize', window.canvas.resize);

    jquery_1["default"]('#celebrations').off('click', this.uncelebrate);
  }
};
var db = {
  db: null,
  name: 'latin',
  version: 3,
  numStats: 10,
  setup: function setup() {
    if (!window.indexedDB) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }

    var openRequest = window.indexedDB.open(this.db.name, this.db.version);

    openRequest.onsuccess = function (event) {//this.db.db = event.target.result;
      //console.debug("IndexedDb connected: " + this.db.db);
    };

    openRequest.onupgradeneeded = this.db.upgradeNeeded;
  },
  upgradeNeeded: function upgradeNeeded(event) {
    this.db.db = event.target.result;
    console.debug("Upgrading database from " + event.oldVersion);

    if (!this.db.db.objectStoreNames.contains('answers')) {
      var store = this.db.db.createObjectStore('answers', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex("answerIndex", 'answers.dateTime', {
        unique: true
      });
    }
  },
  saveAnswer: function saveAnswer(answer) {
    console.debug("Saving...");
    var transaction = this.db.db.transaction(["answers"], "readwrite");

    transaction.oncomplete = function () {
      console.debug("Transaction complete");
    };

    transaction.onerror = function () {
      console.error("Unable to save data");
    };

    var objectStore = transaction.objectStore("answers");
    var request = objectStore.add(answer);
    console.debug("save: " + answer);

    request.onsuccess = function () {
      console.debug("Data saved");
    };
  },
  saveAnswers: function saveAnswers(answers) {
    answers.forEach(function (answer) {
      this.db.saveAnswer(answer);
    });
  },
  msToTime: function msToTime(duration) {
    var seconds = Math.floor(duration / 1000 % 60),
        minutes = Math.floor(duration / (1000 * 60) % 60),
        hours = Math.floor(duration / (1000 * 60 * 60) % 24);

    var toDub = function toDub(num) {
      return (num < 10).toString() ? "0" : num.toString();
    };

    return toDub(hours) + ":" + toDub(minutes) + ":" + toDub(seconds);
  },
  msToDate: function msToDate(ms) {
    var date = new Date(ms);
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
  },
  addDayStats: function addDayStats(dayStats, answer) {
    var key = this.db.msToDate(answer.dateTime);

    if (dayStats[key] === undefined) {
      dayStats[key] = {
        duration: 0,
        questions: 0,
        answers: 0,
        times: []
      };
    }

    var day = dayStats[key];
    day.duration += answer.duration;
    day.times.push(answer.dateTime);
    day.questions++;
    day.answers += answer.answers.length;
  },
  getMostMissed: function getMostMissed() {},
  showLatinStats: function showLatinStats(latinStats) {
    jquery_1["default"]("#totals-questions").text(latinStats.questions);
    jquery_1["default"]("#totals-answers").text(latinStats.guesses);
    jquery_1["default"]("#totals-time").text(this.db.msToTime(latinStats.duration));
  },
  getData: function getData() {
    var stats = {
      questions: 0,
      guesses: 0,
      duration: 0
    };
    var dayStats = {};
    var wordStats = new Map();
    var request = this.db.db.transaction(["answers"]).objectStore("answers").openCursor();
    return jquery_1["default"].Deferred(function (dfd) {
      request.onerror = function (event) {
        console.error("Query error: " + event);
      };

      request.onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
          stats.questions++;
          stats.guesses += cursor.value.answers.length;
          stats.duration += cursor.value.duration > 60 ? 60 : cursor.value.duration;
          var word = cursor.value.word;
          var wordInfo = wordStats.get(word);

          if (wordInfo === undefined) {
            wordInfo = {
              occurances: 0,
              guesses: 0
            };
            wordStats.set(word, wordInfo);
          }

          wordInfo.occurances++;
          wordInfo.guesses += cursor.value.answers.length;
          this.db.addDayStats(dayStats, cursor.value);
          cursor["continue"]();
        } else {
          dfd.resolve({
            'stats': stats,
            'wordStats': wordStats,
            'dayStats': dayStats
          });
        }
      };
    }).promise();
  },
  renderData: function renderData() {
    jquery_1["default"]('#out').text("");
    this.db.getData().done(function (data) {
      this.db.showLatinStats(data.stats);
      this.db.showWordStats(data.wordStats);
      this.db.showChart(data.dayStats);
    });
  },
  showWordStats: function showWordStats(wordStats) {
    var guessessAsc = new Map(__spreadArrays(wordStats.entries()).sort(function (a, b) {
      return b[1].guesses - a[1].guesses;
    }));
    var guessessDesc = new Map(__spreadArrays(wordStats.entries()).sort(function (a, b) {
      return a[1].guesses - b[1].guesses;
    }));
    var wordsAsc = new Map(__spreadArrays(wordStats.entries()).sort(function (a, b) {
      return a[1].occurances - b[1].occurances;
    }));
    var wordsDesc = new Map(__spreadArrays(wordStats.entries()).sort(function (a, b) {
      return b[1].occurances - a[1].occurances;
    }));
    this.db.renderWordStats(jquery_1["default"]("#most-correct"), 'guesses', guessessDesc);
    this.db.renderWordStats(jquery_1["default"]("#least-correct"), 'guesses', guessessAsc);
    this.db.renderWordStats(jquery_1["default"]("#most-seen"), 'occurances', wordsDesc);
    this.db.renderWordStats(jquery_1["default"]("#least-seen"), 'occurances', wordsAsc);
  },
  renderWordStats: function renderWordStats($container, valueKey, wordMap) {
    var count = 0;
    $container.html('');

    for (var _i = 0, wordMap_1 = wordMap; _i < wordMap_1.length; _i++) {
      var _a = wordMap_1[_i],
          key = _a[0],
          value = _a[1];
      $container.append("<li class=\"collection-item\"><span class=\"badge\">" + value[valueKey] + "</span>" + key + "</li>");

      if (++count >= this.db.numStats) {
        break;
      }
    }
  },
  chartColors: {
    green: '#388E3C',
    green2: '#4CAF50',
    blue: '#2962ff',
    blue2: '#448AFF',
    red: '#f44336',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  },
  renderQuestionsAndGuessesChart: function renderQuestionsAndGuessesChart(chartLabels, chartAnswers, chartQuestions, averageGuesses) {
    var questionsAndGuesses = {
      labels: chartLabels,
      datasets: [{
        type: 'line',
        label: 'Avg. Answsers per Question',
        backgroundColor: this.db.chartColors.red,
        fill: false,
        stack: 'Stack 1',
        pointHoverRadius: 10,
        data: averageGuesses
      }, {
        type: 'bar',
        label: 'Questions',
        borderWidth: 1,
        borderColor: this.db.chartColors.green,
        backgroundColor: this.db.chartColors.green2,
        stack: 'Stack 0',
        data: chartQuestions
      }, {
        type: 'bar',
        label: 'Guesses',
        borderWidth: 1,
        borderColor: this.db.chartColors.blue,
        backgroundColor: this.db.chartColors.blue2,
        stack: 'Stack 0',
        data: chartAnswers
      }]
    };
    var $canvas = jquery_1["default"]('<canvas>');
    jquery_1["default"]("#charts").append($canvas);
    new chart_js_1["default"].Chart($canvas[0].getContext('2d'), {
      type: 'bar',
      data: questionsAndGuesses,
      options: {
        responsive: true,
        legend: {
          position: 'top'
        },
        hover: {
          mode: 'index'
        },
        title: {
          display: true,
          text: 'Questions & Answers'
        },
        scales: {
          xAxes: {
            stacked: true
          },
          yAxes: {
            stacked: true
          }
        }
      }
    });
  },
  renderSecondsPerQuestionChart: function renderSecondsPerQuestionChart(chartLabels, timeTotals, secondsPerQuestion) {
    var correctPercentChart = {
      labels: chartLabels,
      datasets: [{
        type: 'bar',
        label: 'Total Time (Minutes)',
        borderWidth: 1,
        borderColor: this.db.chartColors.green,
        backgroundColor: this.db.chartColors.green2,
        data: timeTotals
      }, {
        type: 'line',
        label: 'Avg. Time per Word',
        borderWidth: 1,
        borderColor: this.db.chartColors.blue,
        backgroundColor: this.db.chartColors.blue2,
        data: secondsPerQuestion
      }]
    };
    var $canvas2 = jquery_1["default"]('<canvas>');
    jquery_1["default"]("#charts").append($canvas2);
    new chart_js_1["default"].Chart($canvas2[0].getContext('2d'), {
      type: 'bar',
      data: correctPercentChart,
      options: {
        responsive: true,
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Time'
        }
      }
    });
  },
  showChart: function showChart(dayStats) {
    var chartLabels = Object.keys(dayStats);
    var chartQuestions = [],
        chartAnswers = [],
        timeTotals = [],
        secondsPerQuestion = [],
        averageGuesses = [];
    jquery_1["default"].each(dayStats, function (idx, el) {
      var duration = el.duration / 1000;
      duration = duration > 60 ? 60 : duration;
      chartQuestions.push(el.questions);
      chartAnswers.push(el.answers);
      secondsPerQuestion.push(duration / el.questions);
      timeTotals.push(Math.ceil(duration / 60));
      averageGuesses.push(el.answers / el.questions);
    });
    jquery_1["default"]("#charts").html("");
    this.db.renderQuestionsAndGuessesChart(chartLabels, chartAnswers, chartQuestions, averageGuesses);
    this.db.renderSecondsPerQuestionChart(chartLabels, timeTotals, secondsPerQuestion);
  }
}; //$(window.document).ready(latin.init);