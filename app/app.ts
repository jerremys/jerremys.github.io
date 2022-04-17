/********************************************************
 * Jerremy Strassner
 * jerremy.j.strassner@gmail.com
 *********************************************************/
import $ from "jquery";
import Chart from "chart.js";
import { Sidenav, Collapsible } from "materialize-css";

let latin = {};


	'use strict';

	const entityMap = {
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

		escapeHtml: function (string) {
			return String(string).replace(/[&<>"'`=\/]/g, function (s) {
				return entityMap[s];
			});
		},
		init: function () {
			$(".tap-target").tapTarget();
			$('#hintCollapsible').collapsible();
			$('.sidenav').sidenav();
			$('.dropdown-trigger').dropdown({
				constrainWidth: false,
				closeOnClick: false,
				coverTrigger: false
			});
			$('select').formSelect();
			this.loadRoots();
			this.db.setup();
		},
		setup: function () {
			$("#reports").hide();
			this.loadSettings();
			this.bindSettings($("#slide-out"));
			this.nextRoot(false);

			$('#nextRoot').click(this.nextRoot);
			$('#checkAnswer').click(this.checkAnswer);

			$("#rootHint").on('click', '.hint', this.define);
		},
		define: function () {
			window.open('https://www.merriam-webster.com/dictionary/' + this.escapeHtml($(this).text()));
		},
		loadSettings: function () {
			var settingsString = this.storage.getItem('settings');
			if (settingsString === null) {
				this.storage.setItem('settings', JSON.stringify(this.app));
			} else {
				this.app = JSON.parse(settingsString);
			}
			$('#answer-choices').text(this.app.answers);
		},
		buildCommonIndex: function (commonList = []) {
			if (this.roots.length > 0) {
				console.log("Build common indexes");
				const stripper = function (val) {
					return val[0];
				};

				const allRoots = this.roots.map(stripper);
				$.each(commonList, function (idx, root) {
					const rootIndex = allRoots.indexOf(root);
					if (rootIndex !== -1) {
						this.commonIndexes.push(rootIndex);
					} else {
						console.log("Root not found: " + root);
					}
				});
			}
		},
		bindSettings: function ($form) {
			const $cb = $("input", $form);
			$.each(this.app, function (index: number, value) {
				const $el = $('[name="' + index + '"]', $form);
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
		handleSettingChanged: function (el) {
			const $el = $(el.currentTarget),
				name = $el.prop("name");

			if ($el.prop('type') === 'checkbox') {
				this.app[name] = $el.prop("checked");
			} else {
				this.app[name] = $el.val();
			}

			this.storage.setItem('settings', JSON.stringify(this.app));

			$('#answer-choices').text(this.app.answers);

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
		setClickSubmit: function (auto = true) {
			const container = $('#answerContainer');

			if (auto) {
				$("#checkAnswer").hide();
				$("input[type='radio']", container).change(this.checkAnswer);
			} else {
				$('#checkAnswer').show();
				$("input[type='radio']", container).off('change', this.checkAnswer);
			}
		},
		toggleHint: function () {
			const hintCollapsible = M.Collapsible.getInstance($('#hintCollapsible')[0]);

			if (!this.app.showHint) {
				hintCollapsible.close(0);
			} else {
				hintCollapsible.open(0);
			}
		},
		nextRoot: function (transition = true) {
			const newRootIndex = this.getNextIndex(),
				newRoot = this.roots[newRootIndex];
			let delay = 0;
			this.toggleHint();

			if (this.celebration !== null) {
				this.celebration.hide();
				this.celebration = null;
			}

			if (transition) {
				$(".card-content").addClass("scale-out");
				delay = 300;
			}
			$("#nextRoot").addClass("disabled");
			this.currentIndex = newRootIndex;

			window.setTimeout(function () {
				$('#latinRoot').text(newRoot[this.options.WORD]);
				$('#rootOrigin').text(newRoot[this.options.ORIGIN]);
				this.renderAnswers(newRootIndex);
				this.renderHint(newRoot[this.options.HINT]);
				$(".card-content").removeClass("scale-out");
				this.question = {
					word: newRoot[this.options.WORD],
					duration: Date.now(),
					answers: []
				};
			}, delay);
		},
		renderHint: function (hint) {
			$('#rootHint').html('<span class="hint">' + hint.split(/\s*,\s*/).join('</span>, <span class="hint">') + '</span>');
		},
		checkAnswer: function (evt) {
			const container = $('#answerContainer');
			const selected = $("input[name='answerGroup']:checked");
			this.question.answers.push(selected.val());
			this.question.dateTime = (new Date()).getTime();

			if (selected.val() === container.data('answer')) {
				$('#checkAnswer').prop("disabled", true);
				const $nextRoot = $("#nextRoot");
				$nextRoot.removeClass("disabled");
				$('#answerContainer input').prop('disabled', true);

				if (Math.floor(Math.random() * this.celebrationChance) === 0) {
					const $el = $("#lets-celebrate");
					$nextRoot.addClass("disabled");
					$el.addClass('show');
					window.setTimeout(function () {
						$el.removeClass('show');
						$nextRoot.removeClass("disabled");
						this.celebrate();
					}, 1600);

				} else if (this.question.answers.length === 1) {
					const position = $(evt.currentTarget).offset();
					position.left += 30;
					//todo: fix
					//explode(position.left, position.top);
					const exclamationText = this.exclamations[Math.floor(Math.random() * this.exclamations.length)];
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

				this.finishAnswer();
			} else {
				M.toast({
					html: 'Try again',
					classes: 'incorrect',
					displayLength: 1000
				});
			}
		},
		finishAnswer: function () {
			this.question.duration = Date.now() - this.question.duration;
			this.db.saveAnswer(this.question);
		},
		getNextIndex: function () {
			if (this.roots.length === 0) {
				throw 'Roots not loaded';
			}
			let newIndex;

			if (this.app.randomOrder) {
				newIndex = this.getRandomIndex();
			} else {
				++this.currentIndex;
				const max = this.app.allRoots ? this.roots.length : this.commonIndexes.length;
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
		renderAnswers: function (rootIndex) {
			let answerHtml = '',
				picked = [rootIndex],
				container = $('#answerContainer'),
				root = this.roots[rootIndex];
			let correctAnswerIndex = Math.floor(Math.random() * this.app.answers);

			for (let i = 0; i < this.app.answers;) {
				const answerIndex = this.getRandomIndex();
				if (picked.indexOf(answerIndex) !== -1) {
					continue;
				}

				const answer = i === correctAnswerIndex ? root : this.roots[answerIndex];
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
		getRandomIndex: function () {
			if (this.app.allRoots) {
				return Math.floor(Math.random() * this.roots.length);
			} else {
				const commonIndex = Math.floor(Math.random() * this.commonIndexes.length);
				return this.commonIndexes[commonIndex];
			}

		},
		loadJson: function () {
			const success = function (resp: any) {
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

			$.ajax({
				'dataType': "json",
				'url': '/app/roots.json?_=' + (new Date()).getTime(),
				'success': success
			});

		},

		loadRoots: function () {
			var rootsString = this.storage.getItem('latinRoots');

			if (rootsString === null) {
				this.loadJson();
				$(".tap-target").tapTarget('open');
			} else {
				const data = JSON.parse(rootsString);

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
		toggleOption: function ($evt : JQuery.Event) {
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
		showReports: function () {
			$('.sidenav').sidenav("close");

			$("#questions").fadeOut(200, function () {
				$("#reports").fadeIn(200);
			});

			this.db.renderData();
		},
		hideReports: function () {
			$("#reports").hide(200, function () {
				$("#questions").fadeIn(200);
			});
		},
		celebrate: function () {
			$('body').addClass('celbrate');
			this.celebration = this.celebrations[Math.floor(Math.random() * this.celebrations.length)];
			this.celebration.show();
			$('#celebrations').click(this.uncelebrate);

			$(window).resize(this.celebration.resize);
		},
		uncelebrate: function () {
			$('body').removeClass('celbrate');
			this.celebration.hide();
			this.nextRoot(this.uncelebrate);
			//TODO: fix
			//$(window).off('resize', window.canvas.resize);
			$('#celebrations').off('click', this.uncelebrate);
		}
	};
	const db = {
		db: null,
		name: 'latin',
		version: 3,
		numStats: 10,
		setup: function () {
			if (!window.indexedDB) {
				console.log('This browser doesn\'t support IndexedDB');
				return;
			}

			const openRequest = window.indexedDB.open(this.db.name, this.db.version);
			openRequest.onsuccess = function (event) {
				//this.db.db = event.target.result;
				//console.debug("IndexedDb connected: " + this.db.db);
			};

			openRequest.onupgradeneeded = this.db.upgradeNeeded;
		},

		upgradeNeeded: function (event) {
			this.db.db = event.target.result;
			console.debug("Upgrading database from " + event.oldVersion);
			if (!this.db.db.objectStoreNames.contains('answers')) {
				let store = this.db.db.createObjectStore('answers', {
					keyPath: 'id',
					autoIncrement: true
				});
				store.createIndex("answerIndex", 'answers.dateTime', {
					unique: true
				});
			}
		},

		saveAnswer: function (answer) {
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
		saveAnswers: function (answers) {
			answers.forEach(function (answer) {
				this.db.saveAnswer(answer);
			});
		},
		msToTime: function (duration) {
			const seconds = Math.floor((duration / 1000) % 60),
				minutes = Math.floor((duration / (1000 * 60)) % 60),
				hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

			const toDub = function(num: number) : string{
				return (num < 10).toString() ? "0" : num.toString();
			}

			return toDub(hours) + ":" + toDub(minutes) + ":" + toDub(seconds);
		},

		msToDate: function (ms) {
			const date = new Date(ms);
			return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
		},

		addDayStats: function (dayStats, answer) {
			let key = this.db.msToDate(answer.dateTime);

			if (dayStats[key] === undefined) {
				dayStats[key] = {
					duration: 0,
					questions: 0,
					answers: 0,
					times: []
				};
			}

			const day = dayStats[key];
			day.duration += answer.duration;
			day.times.push(answer.dateTime);
			day.questions++;
			day.answers += answer.answers.length;
		},
		getMostMissed :function (){

		},
		showLatinStats: function (latinStats) {
			$("#totals-questions").text(latinStats.questions);
			$("#totals-answers").text(latinStats.guesses);
			$("#totals-time").text(this.db.msToTime(latinStats.duration));
		},
		getData: function () {
			let stats = {
				questions: 0,
				guesses: 0,
				duration: 0
			};
			const dayStats = {};
			let wordStats = new Map();
			var request = this.db.db.transaction(["answers"]).objectStore("answers").openCursor();
			return $.Deferred(function (dfd) {
				request.onerror = function (event) {
					console.error("Query error: " + event);
				};
				request.onsuccess = function (event) {
					var cursor = event.target.result;
					if (cursor) {
						stats.questions++;
						stats.guesses += cursor.value.answers.length;
						stats.duration += cursor.value.duration > 60 ? 60 : cursor.value.duration;
						const word = cursor.value.word;

						let wordInfo = wordStats.get(word);
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
						cursor.continue();
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
		renderData: function () {
			$('#out').text("");

			this.db.getData().done(function (data) {
				this.db.showLatinStats(data.stats);
				this.db.showWordStats(data.wordStats);
				this.db.showChart(data.dayStats);
			});
		},
		showWordStats: function (wordStats) {
			const guessessAsc = new Map([...wordStats.entries()].sort((a, b) => b[1].guesses - a[1].guesses));
			const guessessDesc = new Map([...wordStats.entries()].sort((a, b) => a[1].guesses - b[1].guesses));

			const wordsAsc = new Map([...wordStats.entries()].sort((a, b) => a[1].occurances - b[1].occurances));
			const wordsDesc = new Map([...wordStats.entries()].sort((a, b) => b[1].occurances - a[1].occurances));

			this.db.renderWordStats($("#most-correct"), 'guesses', guessessDesc);
			this.db.renderWordStats($("#least-correct"), 'guesses', guessessAsc);

			this.db.renderWordStats($("#most-seen"), 'occurances', wordsDesc);
			this.db.renderWordStats($("#least-seen"), 'occurances', wordsAsc);
		},

		renderWordStats: function ($container, valueKey, wordMap) {
			let count = 0;
			$container.html('');
			for (let [key, value] of wordMap) {
				$container.append(`<li class="collection-item"><span class="badge">${value[valueKey]}</span>${key}</li>`);

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


		renderQuestionsAndGuessesChart: function (chartLabels, chartAnswers, chartQuestions, averageGuesses) {
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
			} as Chart.ChartData;

			let $canvas = $('<canvas>');
			$("#charts").append($canvas);
			new Chart.Chart((<HTMLCanvasElement> $canvas[0]).getContext('2d'), {
				type: 'bar',
				data: questionsAndGuesses,
				options: {
					responsive: true,
					legend: {
						position: 'top',
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
							stacked: true,
						},
						yAxes: {
							stacked: true
						}
					}
				}
			});

		},

		renderSecondsPerQuestionChart: function (chartLabels, timeTotals, secondsPerQuestion) {
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
			} as Chart.ChartData;

			let $canvas2 = $('<canvas>');
			$("#charts").append($canvas2);
			new Chart.Chart((<HTMLCanvasElement> $canvas2[0]).getContext('2d'), {
				type: 'bar',
				data: correctPercentChart,
				options: {
					responsive: true,
					legend: {
						position: 'top',
					},
					title: {
						display: true,
						text: 'Time'
					}
				}

			});
		},

		showChart: function (dayStats) {
			let chartLabels = Object.keys(dayStats);
			let chartQuestions = [],
				chartAnswers = [],
				timeTotals = [],
				secondsPerQuestion = [],
				averageGuesses = [];
			$.each(dayStats, function (idx, el) {
				let duration = el.duration / 1000;
				duration = duration > 60 ? 60 : duration;

				chartQuestions.push(el.questions);
				chartAnswers.push(el.answers);
				secondsPerQuestion.push(duration / el.questions);
				timeTotals.push(Math.ceil(duration / 60));
				averageGuesses.push(el.answers / el.questions);
			});
			$("#charts").html("");
			this.db.renderQuestionsAndGuessesChart(chartLabels, chartAnswers, chartQuestions, averageGuesses);
			this.db.renderSecondsPerQuestionChart(chartLabels, timeTotals, secondsPerQuestion);
		}
	};

	$(window.document).ready(this.init);
