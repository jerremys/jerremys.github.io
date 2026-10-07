/********************************************************
 * Jerremy Strassner
 * jerremy.j.strassner@gmail.com
 *********************************************************/
let latin = {
	version: 7,
	storage: window.localStorage,
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
	escapeHtml: function (string) {
		return String(string).replace(/[&<>"'`=\/]/g, function (s) {
			return latin.entityMap[s];
		});
	},
	init: function () {
		latin.loadRoots();

		$("#answer_choices").on("input", function () {
			$("#selected_answer_choices").text(this.value);
		});

		if (
			"IntersectionObserver" in window &&
			"IntersectionObserverEntry" in window &&
			"intersectionRatio" in window.IntersectionObserverEntry.prototype
		) {
			let observer = new IntersectionObserver(entries => {
				$("#hint-marker").toggleClass("hidden", entries[0].isIntersecting);
			});

			const options = {
				root: document.querySelector("body"),
				rootMargin: "0px",
				scrollMargin: "0px",
				threshold: 1.0,
				trackVisibility: true
			}

			observer.observe(document.querySelector("#hint-card"), options);
		}

	},
	setup: function () {
		latin.loadSettings();
		latin.bindSettings($("#slide-out"));
		latin.nextRoot(false);

		$("#answerContainer").on("click", "button", latin.checkAnswer);
		$('#nextRoot').click(latin.nextRoot);
		$('#checkAnswer').click(latin.checkAnswer);

		$("#rootHint").on('click', '.hint', latin.define);
	},
	define: function () {
		window.open('https://www.merriam-webster.com/dictionary/' + latin.escapeHtml($(this).text()));
	},
	loadSettings: function () {
		var settingsString = latin.storage.getItem('settings');
		if (settingsString !== null) {
			// Load settings
			let settings = JSON.parse(settingsString);

			for (var key in settings) {
				if (settings.hasOwnProperty(key)) {
					console.log(`Load setting(#${key}): settings[key]`);
					let $el = $(`#${key}`);

					if ($el.attr('type') == "checkbox") {
						$el.prop('checked', settings[key] == "1");
					} else {
						$el.val(settings[key]);
					}
					latin.handleSettingChanged($el.get(0));
					console.log(`#${key}=>${settings[key]}`);
				}
			}

		}
		$("#root-actions").toggle(!!!$("#auto_submit").prop("checked"));

		$("#answer_choices").trigger("input");

		latin.handleSettingChanged();
	},
	buildCommonIndex: function (commonList = []) {
		if (latin.roots.length > 0) {
			console.log("Build common indexes");
			const stripper = function (val) {
				return val[0];
			};

			const allRoots = latin.roots.map(stripper);
			$.each(commonList, function (idx, root) {
				const rootIndex = allRoots.indexOf(root);
				if (rootIndex !== -1) {
					latin.commonIndexes.push(rootIndex);
				} else {
					console.log("Root not found: " + root);
				}
			});
		}
	},
	bindSettings: function ($form) {
		$("#settings input").on("change", latin.handleSettingChanged);
	},
	handleSettingChanged: function (el) {
		let currentSettings = {};

		if (latin.currentIndex < 1) {
			latin.currentIndex = latin.getNextIndex();
		}


		$("#settings input").each(function (idx, el) {
			if (el.type == "checkbox") {
				currentSettings[el.name] = el.checked ? 1 : 0;
			} else {
				currentSettings[el.name] = el.value;
			}

			console.log(`Settings: ${el.name}=${el.value}`);

			switch (el.name) {
				case 'auto_submit':
					latin.toggleClickSubmit(el.checked);
					break;
				case 'show_hint':
					latin.toggleHint(el.checked);
					break;
				case 'answer_choices':
					$("#selected_answer_choices").text(el.value);
					latin.renderAnswers(latin.currentIndex);
					break;
			}

		})

		latin.storage.setItem('settings', JSON.stringify(currentSettings));
	},
	toggleClickSubmit: function (autoSubmit) {
		$('#root-actions').toggle(!autoSubmit);
	},
	toggleHint: function (show) {
		$("body").toggleClass('show-hint', show);
	},
	nextRoot: function (transition = true) {
		$("html, body").stop().animate({scrollTop:0}, 500, 'swing');

		const newRootIndex = latin.getNextIndex(),
			newRoot = latin.roots[newRootIndex];
		let delay = 0;

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

		latin.hideLoading();
	},
	renderHint: function (hint) {
		$('#rootHint').html('<span class="hint">' + hint.split(/\s*,\s*/).join('</span>, <span class="hint">') + '</span>');
	},
	animateShard: function (shard, index) {
		// Reset animation
		shard.style.animation = 'none';
		shard.offsetHeight; // Trigger reflow

		// Set custom properties
		const angle = Math.random() * Math.PI * 2;
		const distance = 50 + Math.random() * 150;
		const tx = Math.cos(angle) * distance;
		const ty = Math.sin(angle) * distance;
		const rotation = (Math.random() - 0.5) * 1440;
		shard.style.setProperty('--tx', tx + 'px');
		shard.style.setProperty('--ty', ty + 'px');
		shard.style.setProperty('--r', rotation + 'deg');

		// Apply animation
		shard.style.animation = 'explode 1.5s ease ' + (index * 40) + 'ms forwards';
	},

	checkAnswer: function (evt) {
		const container = $('#answerContainer');
		const selected = $(evt.target);
		latin.question.answers.push(selected.val());
		latin.question.dateTime = (new Date()).getTime();

		if (selected.val() === container.data('answer')) {
			$('#checkAnswer').prop("disabled", true);
			const $nextRoot = $("#nextRoot");
			$nextRoot.removeClass("disabled");
			$('#answerContainer input').prop('disabled', true);

			if (false && Math.floor(Math.random() * latin.celebrationChance) === 0) {
				const $el = $("#lets-celebrate");
				$nextRoot.addClass("disabled");
				$el.addClass('show');
				window.setTimeout(function () {
					$el.removeClass('show');
					$nextRoot.removeClass("disabled");
					latin.celebrate();
				}, 1600);

			} else if (latin.question.answers.length === 1) {
				const position = $(evt.currentTarget).offset();
				position.left += 30;
				const exclamationText = latin.exclamations[Math.floor(Math.random() * latin.exclamations.length)];
				selected.addClass("correct");

				var count = 0;
				const exclamationTextSpans = exclamationText.split('').flatMap(c1 => `<span class="shard" style="--i: ${count++}">${c1}</span>`).join("");
				var $exclamation = $("#exclamation");

				$exclamation.html(exclamationTextSpans).css({
					left: evt.pageX,
					top: evt.pageY
				}).addClass('show');

				const right = $exclamation.position().left + $exclamation.width();

				if( right > $("body").width() ){
					$exclamation.css("left", $("body").width() - $exclamation.width());
				} else if($exclamation.position().left < 0){
					$exclamation.css("left", 0);
				}

				const shards = document.querySelectorAll('.shard');

				window.setTimeout(function () {
					shards.forEach((shard, index) => {
						latin.animateShard(shard, index);
					});

					window.setTimeout(function () {
						$exclamation.removeClass('show');
					}, 800);
				}, 400);

				if ($("#auto_submit").prop("checked")) {
					$("div.card").addClass("loading");
					latin.showLoading();

					window.setTimeout(function () {
						latin.nextRoot();
					}, 300);
				}

			} else {
				selected.addClass("correct");
				if ($("#auto_submit").prop("checked")) {
					$("div.card").addClass("loading");
					latin.showLoading();

					window.setTimeout(function () {
						latin.nextRoot();
					}, 1000);
				}
			}

			latin.finishAnswer();
		} else {
			selected.addClass("wrong");
		}
	},
	showLoading: function () {
		$("div.card").addClass("loading");
	},
	hideLoading: function () {
		$("div.card").removeClass("loading");
	},
	finishAnswer: function () {
		latin.question.duration = Date.now() - latin.question.duration;
	},
	getNextIndex: function () {
		if (latin.roots.length === 0) {
			throw 'Roots not loaded';
		}
		let newIndex = latin.getRandomIndex();

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
	renderAnswers: function (rootIndex) {
		let answerHtml = '',
			picked = [rootIndex],
			container = $('#answerContainer'),
			root = latin.roots[rootIndex],
			answer_choices = parseInt($("#answer_choices").val(), 10);

		let correctAnswerIndex = Math.floor(Math.random() * answer_choices);

		for (let i = 0; i < answer_choices;) {
			const answerIndex = latin.getRandomIndex();
			if (picked.indexOf(answerIndex) !== -1) {
				continue;
			}

			const answer = i === correctAnswerIndex ? root : latin.roots[answerIndex];
			answerHtml += `<button name="answerGroup" value="${answer[latin.options.ANSWER]}">${answer[latin.options.ANSWER]}</button>`;
			i++;

			picked.push(answerIndex);
		}

		container.html(answerHtml);
		container.data('answer', root[latin.options.ANSWER]);
	},
	getRandomIndex: function () {
		if ($("#all_roots").prop('checked')) {
			return Math.floor(Math.random() * latin.roots.length);
		} else {
			const commonIndex = Math.floor(Math.random() * latin.commonIndexes.length);
			return latin.commonIndexes[commonIndex];
		}

	},
	loadJson: function () {
		$.getJSON({
			url: '/app/roots.json?_=' + (new Date()).getTime(),
			success: function (resp) {
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
	loadRoots: function () {
		var rootsString = latin.storage.getItem('latinRoots');

		if (rootsString === null) {
			latin.loadJson();
		} else {
			const data = JSON.parse(rootsString);

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
	toggleOption: function ($evt) {
		const $cb = $('input[type=checkbox]', $evt.currentTarget);
		if (!$cb.length) {
			return;
		}

		$cb.prop("checked", !!!$cb.prop("checked"));

		var e = $.Event("click");
		e.currentTarget = $cb;
		latin.handleSettingChanged(e);
	},
	celebrate: function () {
		$('body').addClass('celbrate');
		let celebrations = Object.keys(latin.celebrations);
		latin.celebration = latin.celebrations[celebrations[Math.floor(Math.random() * celebrations.length)]];
		latin.celebration.show();
		$('#celebrations').click(latin.uncelebrate);

		$(window).resize(latin.celebration.resize);
	},
	uncelebrate: function () {
		$('body').removeClass('celbrate');
		latin.celebration.hide();
		latin.nextRoot(latin.uncelebrate);
		if (window.canvas)
			$(window).off('resize', window.canvas.resize);
		$('#celebrations').off('click', latin.uncelebrate);
	}
};

$(window.document).ready(function () {
	latin.init();
});
