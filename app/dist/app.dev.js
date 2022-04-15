"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/********************************************************
 * Jerremy Strassner
 * jerremy.j.strassner@gmail.com
 *********************************************************/
var latin = {};

(function () {
  'use strict';

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
    celebrations: ["filler", "bouncer", "fireworks", "tree", "aquarium", "bear", "stars"],
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
    entityMap: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    },
    escapeHtml: function escapeHtml(string) {
      return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return latin.entityMap[s];
      });
    },
    init: function init() {
      $(".tap-target").tapTarget();
      $('#hintCollapsible').collapsible();
      $('.sidenav').sidenav();
      $('.dropdown-trigger').dropdown({
        constrainWidth: false,
        closeOnClick: false,
        coverTrigger: false
      });
      $('select').formSelect();
      latin.loadRoots();
      latin.db.setup();
    },
    setup: function setup() {
      $("#reports").hide();
      latin.loadSettings();
      latin.bindSettings($("#slide-out"));
      latin.nextRoot(false);
      $('#nextRoot').click(latin.nextRoot);
      $('#checkAnswer').click(latin.checkAnswer);
      $("#rootHint").on('click', '.hint', latin.define);
    },
    define: function define() {
      window.open('https://www.merriam-webster.com/dictionary/' + latin.escapeHtml($(this).text()));
    },
    loadSettings: function loadSettings() {
      var settingsString = latin.storage.getItem('settings');

      if (settingsString === null) {
        latin.storage.setItem('settings', JSON.stringify(latin.app));
      } else {
        latin.app = JSON.parse(settingsString);
      }
    },
    buildCommonIndex: function buildCommonIndex() {
      var commonList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (latin.roots.length > 0) {
        console.log("Build common indexes");

        var stripper = function stripper(val) {
          return val[0];
        };

        var allRoots = latin.roots.map(stripper);
        $.each(commonList, function (idx, root) {
          var rootIndex = allRoots.indexOf(root);

          if (rootIndex !== -1) {
            latin.commonIndexes.push(rootIndex);
          } else {
            console.log("Root not found: " + root);
          }
        });
      }
    },
    bindSettings: function bindSettings($form) {
      var $cb = $("input", $form);
      $.each(latin.app, function (index, value) {
        var $el = $('[name="' + index + '"]', $form);

        switch ($el.prop('type')) {
          case 'checkbox':
            $el.prop("checked", value);
            break;

          default:
            $el.val(value);
        }
      });
      $cb.change(latin.handleSettingChanged);
    },
    handleSettingChanged: function handleSettingChanged(el) {
      var $el = $(el.currentTarget),
          name = $el.prop("name");

      if ($el.prop('type') === 'checkbox') {
        latin.app[name] = $el.prop("checked");
      } else {
        latin.app[name] = $el.val();
      }

      latin.storage.setItem('settings', JSON.stringify(latin.app));

      switch (name) {
        case 'clickSubmit':
          latin.setClickSubmit(latin.app[name]);
          break;

        case 'randomOrder':
          if (!latin.app.randomOrder) {
            latin.currentIndex = 0;
            latin.nextRoot();
          }

          break;

        case 'showHint':
          latin.toggleHint();
          break;

        case 'answers':
          latin.renderAnswers(latin.currentIndex);
          break;
      }
    },
    setClickSubmit: function setClickSubmit() {
      var auto = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var container = $('#answerContainer');

      if (auto) {
        $("#checkAnswer").hide();
        $("input[type='radio']", container).change(latin.checkAnswer);
      } else {
        $('#checkAnswer').show();
        $("input[type='radio']", container).off('change', latin.checkAnswer);
      }
    },
    toggleHint: function toggleHint() {
      var hintCollapsible = M.Collapsible.getInstance($('#hintCollapsible')[0]);

      if (!latin.app.showHint) {
        hintCollapsible.close();
      } else {
        hintCollapsible.open();
      }
    },
    nextRoot: function nextRoot() {
      var transition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var newRootIndex = latin.getNextIndex(),
          newRoot = latin.roots[newRootIndex];
      var delay = 0;
      latin.toggleHint();

      if (latin.celebration !== null) {
        latin.celebration.hide();
        latin.celebration = null;
      }

      if (transition) {
        $(".card-content").addClass("scale-out");
        delay = 300;
      }

      $("#nextRoot").addClass("disabled");
      latin.currentIndex = newRootIndex;
      window.setTimeout(function () {
        $('#latinRoot').text(newRoot[latin.options.WORD]);
        $('#rootOrigin').text(newRoot[latin.options.ORIGIN]);
        latin.renderAnswers(newRootIndex);
        latin.renderHint(newRoot[latin.options.HINT]);
        $(".card-content").removeClass("scale-out");
        latin.question = {
          word: newRoot[latin.options.WORD],
          duration: Date.now(),
          answers: []
        };
      }, delay);
    },
    renderHint: function renderHint(hint) {
      $('#rootHint').html('<span class="hint">' + hint.split(/\s*,\s*/).join('</span>, <span class="hint">') + '</span>');
    },
    checkAnswer: function checkAnswer(evt) {
      var container = $('#answerContainer');
      var selected = $("input[name='answerGroup']:checked");
      latin.question.answers.push(selected.val());
      latin.question.dateTime = new Date().getTime();

      if (selected.val() === container.data('answer')) {
        $('#checkAnswer').prop("disabled", true);
        var $nextRoot = $("#nextRoot");
        $nextRoot.removeClass("disabled");
        $('#answerContainer input').prop('disabled', true);

        if (Math.floor(Math.random() * latin.celebrationChance) === 0) {
          var $el = $("#lets-celebrate");
          $nextRoot.addClass("disabled");
          $el.addClass('show');
          window.setTimeout(function () {
            $el.removeClass('show');
            $nextRoot.removeClass("disabled");
            latin.celebrate();
          }, 1600);
        } else if (latin.question.answers.length === 1) {
          var position = $(evt.currentTarget).offset();
          position.left += 30;
          window.explode(position.left, position.top);
          var exclamationText = latin.exclamations[Math.floor(Math.random() * latin.exclamations.length)];
          $("#exclamation").text(exclamationText).css({
            left: position.left,
            top: position.top
          }).addClass('show');
          window.setTimeout(function () {
            $("#exclamation").removeClass('show');
          }, 1000);
        } else {
          M.toast({
            html: 'Correct',
            classes: 'correct',
            displayLength: 1000
          });
        }

        latin.finishAnswer();
      } else {
        M.toast({
          html: 'Try again',
          classes: 'incorrect',
          displayLength: 1000
        });
      }
    },
    finishAnswer: function finishAnswer() {
      latin.question.duration = Date.now() - latin.question.duration;
      latin.db.saveAnswer(latin.question);
    },
    getNextIndex: function getNextIndex() {
      if (latin.roots.length === 0) {
        throw 'Roots not loaded';
      }

      var newIndex;

      if (latin.app.randomOrder) {
        newIndex = latin.getRandomIndex();
      } else {
        ++latin.currentIndex;
        var max = latin.app.allRoots ? latin.roots.length : latin.commonIndexes.length;

        if (latin.currentIndex >= max) {
          latin.currentIndex = 0;
        }

        newIndex = latin.currentIndex;
      }

      if (latin.answerQueue.indexOf(newIndex) !== -1) {
        // Question repeated too soon
        return latin.getNextIndex();
      }

      latin.answerQueue.push(newIndex);

      if (latin.answerQueue.length > latin.answerQueueSize) {
        latin.answerQueue.shift();
      }

      return newIndex;
    },
    renderAnswers: function renderAnswers(rootIndex) {
      var answerHtml = '',
          picked = [rootIndex],
          container = $('#answerContainer'),
          root = latin.roots[rootIndex];
      var correctAnswerIndex = Math.floor(Math.random() * latin.app.answers);

      for (var i = 0; i < latin.app.answers;) {
        var answerIndex = latin.getRandomIndex();

        if (picked.indexOf(answerIndex) !== -1) {
          continue;
        }

        var answer = i === correctAnswerIndex ? root : latin.roots[answerIndex];
        answerHtml += '<p><label><input name="answerGroup" type="radio" value="' + answer[latin.options.ANSWER] + '" /><span>' + answer[latin.options.ANSWER] + '</span></label></p>';
        i++;
        picked.push(answerIndex);
      }

      container.html(answerHtml);
      container.data('answer', root[latin.options.ANSWER]);

      if (latin.app.clickSubmit) {
        latin.setClickSubmit(true);
      }
    },
    getRandomIndex: function getRandomIndex() {
      if (latin.app.allRoots) {
        return Math.floor(Math.random() * latin.roots.length);
      } else {
        var commonIndex = Math.floor(Math.random() * latin.commonIndexes.length);
        return latin.commonIndexes[commonIndex];
      }
    },
    loadJson: function loadJson() {
      $.getJSON({
        url: '/app/roots.json?_=' + new Date().getTime(),
        success: function success(resp) {
          latin.options = resp.options;
          latin.roots = resp.data;
          latin.buildCommonIndex(resp.common);
          latin.storage.setItem('latinRoots', JSON.stringify({
            version: latin.version,
            options: resp.options,
            roots: resp.data,
            common: resp.common,
            commonIndexes: latin.commonIndexes
          }));
          latin.setup();
        }
      });
    },
    loadRoots: function loadRoots() {
      var rootsString = latin.storage.getItem('latinRoots');

      if (rootsString === null) {
        latin.loadJson();
        $(".tap-target").tapTarget('open');
      } else {
        var data = JSON.parse(rootsString);

        if (data.version !== latin.version) {
          window.localStorage.removeItem('latinRoots');
          latin.loadRoots();
          return;
        }

        latin.options = data.options;
        latin.roots = data.roots;
        latin.commonIndexes = data.commonIndexes;
        latin.setup();
      }
    },
    toggleOption: function toggleOption($evt) {
      var $cb = $('input[type=checkbox]', $evt.currentTarget);

      if (!$cb.length) {
        return;
      }

      $cb.prop("checked", !!!$cb.prop("checked"));
      var e = $.Event("click");
      e.currentTarget = $cb;
      latin.handleSettingChanged(e);
    },
    showReports: function showReports() {
      $('.sidenav').sidenav("close");
      $("#questions").fadeOut(200, function () {
        $("#reports").fadeIn(200);
      });
      latin.db.getData();
    },
    hideReports: function hideReports() {
      $("#reports").hide(200, function () {
        $("#questions").fadeIn(200);
      });
    },
    celebrate: function celebrate() {
      $('body').addClass('celbrate');
      latin.celebration = latin.celebrations[Math.floor(Math.random() * latin.celebrations.length)];
      latin.celebration.show();
      $('#celebrations').click(latin.uncelebrate);
      $(window).resize(latin.celebration.resize);
    },
    uncelebrate: function uncelebrate() {
      $('body').removeClass('celbrate');
      latin.celebration.hide();
      latin.nextRoot(latin.uncelebrate);
      $(window).off('resize', window.canvas.resize);
      $('#celebrations').off('click', latin.uncelebrate);
    }
  };
  latin.db = {
    db: null,
    name: 'latin',
    version: 3,
    numStats: 10,
    setup: function setup() {
      if (!window.indexedDB) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
      }

      var openRequest = window.indexedDB.open(latin.db.name, latin.db.version);

      openRequest.onsuccess = function (event) {
        latin.db.db = event.target.result;
        console.debug("IndexedDb connected: " + latin.db.db);
      };

      openRequest.onupgradeneeded = latin.db.upgradeNeeded;
    },
    upgradeNeeded: function upgradeNeeded(event) {
      latin.db.db = event.target.result;
      console.debug("Upgrading database from " + event.oldVersion);

      if (!latin.db.db.objectStoreNames.contains('answers')) {
        var store = latin.db.db.createObjectStore('answers', {
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
      var transaction = latin.db.db.transaction(["answers"], "readwrite");

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
        latin.db.saveAnswer(answer);
      });
    },
    msToTime: function msToTime(duration) {
      var seconds = Math.floor(duration / 1000 % 60),
          minutes = Math.floor(duration / (1000 * 60) % 60),
          hours = Math.floor(duration / (1000 * 60 * 60) % 24);
      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      return hours + ":" + minutes + ":" + seconds;
    },
    msToDate: function msToDate(ms) {
      var date = new Date(ms);
      return "".concat(date.getFullYear(), "-").concat(date.getMonth(), "-").concat(date.getDate());
    },
    addDayStats: function addDayStats(dayStats, answer) {
      var key = latin.db.msToDate(answer.dateTime);

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
    showLatinStats: function showLatinStats(latinStats) {
      $("#totals-questions").text(latinStats.questions);
      $("#totals-answers").text(latinStats.guesses);
      $("#totals-time").text(latin.db.msToTime(latinStats.duration));
    },
    getData: function getData() {
      $('#out').text("");
      var stats = {
        questions: 0,
        guesses: 0,
        duration: 0
      };
      var dayStats = {};
      var wordStats = new Map();
      var request = latin.db.db.transaction(["answers"]).objectStore("answers").openCursor();

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
          latin.db.addDayStats(dayStats, cursor.value);
          cursor["continue"]();
        } else {
          latin.db.showLatinStats(stats);
          latin.db.showWordStats(wordStats);
          latin.db.showChart(dayStats);
        }
      };
    },
    showWordStats: function showWordStats(wordStats) {
      var guessessAsc = new Map(_toConsumableArray(wordStats.entries()).sort(function (a, b) {
        return b[1].guesses - a[1].guesses;
      }));
      var guessessDesc = new Map(_toConsumableArray(wordStats.entries()).sort(function (a, b) {
        return a[1].guesses - b[1].guesses;
      }));
      var wordsAsc = new Map(_toConsumableArray(wordStats.entries()).sort(function (a, b) {
        return a[1].occurances - b[1].occurances;
      }));
      var wordsDesc = new Map(_toConsumableArray(wordStats.entries()).sort(function (a, b) {
        return b[1].occurances - a[1].occurances;
      }));
      latin.db.renderWordStats($("#most-correct"), 'guesses', guessessDesc);
      latin.db.renderWordStats($("#least-correct"), 'guesses', guessessAsc);
      latin.db.renderWordStats($("#most-seen"), 'occurances', wordsDesc);
      latin.db.renderWordStats($("#least-seen"), 'occurances', wordsAsc);
    },
    renderWordStats: function renderWordStats($container, valueKey, wordMap) {
      var count = 0;
      $container.html('');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = wordMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              key = _step$value[0],
              value = _step$value[1];

          $container.append("<li class=\"collection-item\"><span class=\"badge\">".concat(value[valueKey], "</span>").concat(key, "</li>"));

          if (++count >= latin.db.numStats) {
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
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
          backgroundColor: latin.db.chartColors.red,
          fill: false,
          stack: 'Stack 1',
          pointHoverRadius: 10,
          data: averageGuesses
        }, {
          type: 'bar',
          label: 'Questions',
          borderWidth: 1,
          borderColor: latin.db.chartColors.green,
          backgroundColor: latin.db.chartColors.green2,
          stack: 'Stack 0',
          data: chartQuestions
        }, {
          type: 'bar',
          label: 'Guesses',
          borderWidth: 1,
          borderColor: latin.db.chartColors.blue,
          backgroundColor: latin.db.chartColors.blue2,
          stack: 'Stack 0',
          data: chartAnswers
        }]
      };
      var $canvas = $('<canvas>');
      $("#charts").append($canvas);
      new Chart($canvas[0].getContext('2d'), {
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
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
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
          borderColor: latin.db.chartColors.green,
          backgroundColor: latin.db.chartColors.green2,
          data: timeTotals
        }, {
          type: 'line',
          label: 'Avg. Time per Word',
          borderWidth: 1,
          borderColor: latin.db.chartColors.blue,
          backgroundColor: latin.db.chartColors.blue2,
          data: secondsPerQuestion
        }]
      };
      var $canvas2 = $('<canvas>');
      $("#charts").append($canvas2);
      new Chart($canvas2[0].getContext('2d'), {
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
      $.each(dayStats, function (idx, el) {
        var duration = el.duration / 1000;
        duration = duration > 60 ? 60 : duration;
        chartQuestions.push(el.questions);
        chartAnswers.push(el.answers);
        secondsPerQuestion.push(duration / el.questions);
        timeTotals.push(Math.ceil(duration / 60));
        averageGuesses.push(el.answers / el.questions);
      });
      $("#charts").html("");
      latin.db.renderQuestionsAndGuessesChart(chartLabels, chartAnswers, chartQuestions, averageGuesses);
      latin.db.renderSecondsPerQuestionChart(chartLabels, timeTotals, secondsPerQuestion);
    }
  };
  $(window.document).ready(latin.init);
})();