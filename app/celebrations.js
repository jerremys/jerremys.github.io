(function () {
  "use strict";

  const fireworks = {};
  const filler = {};
  const bouncer = {};
  const tree = {};
  const aquarium = {};
  const bear = {};
  const stars = {};
  const canvas = {
    el: document.getElementById("celebrationCanvas"),
    ctx: null,
    resize: function () {
      canvas.el.width = $(document).width();
      canvas.el.height = $(window).height();
    },
    show: function () {
      $("body").css("overflow", "hidden");
      canvas.resize();

      if (canvas.ctx === null) {
        canvas.ctx = canvas.el.getContext("2d");
      }
      $(canvas.el).show();
    },
    hide: function () {
      $("body").css("overflow", "auto");
      $(canvas.el).hide();
    },
    getSize: function () {
      return {
        x: (canvas.el.width = $(document).width()),
        y: canvas.el.height
      };
    }
  };

  const rainbow = function (size = 12) {
    const rainbow = [];
    const sin_to_hex = function (i, phase) {
      var sin = Math.sin((Math.PI / size) * 2 * i + phase);
      var int = Math.floor(sin * 127) + 128;
      var hex = int.toString(16);

      return hex.length === 1 ? "0" + hex : hex;
    };

    for (var i = 0; i < size; i++) {
      var red = sin_to_hex(i, (0 * Math.PI * 2) / 3); // 0   deg
      var blue = sin_to_hex(i, (1 * Math.PI * 2) / 3); // 120 deg
      var green = sin_to_hex(i, (2 * Math.PI * 2) / 3); // 240 deg
      rainbow[i] = "#" + red + green + blue;
    }

    return rainbow;
  };

  //- Explosion
  //- adapted from "Anchor Click Canvas Animation" by Nick Sheffield
  //- https://codepen.io/nicksheffield/pen/NNEoLg/
  (function () {
    const colors = ['#ffc000', '#ff3b3b', '#ff8400'];
    const bubbles = 25;

    window.explode = (x, y) => {
      let particles = [];
      let ratio = window.devicePixelRatio;
      let c = document.createElement('canvas');
      let ctx = c.getContext('2d');

      c.style.position = 'absolute';
      c.style.left = x - 100 + 'px';
      c.style.top = y - 100 + 'px';
      c.style.pointerEvents = 'none';
      c.style.width = 200 + 'px';
      c.style.height = 200 + 'px';
      c.style.zIndex = 100;
      c.width = 200 * ratio;
      c.height = 200 * ratio;
      document.body.appendChild(c);

      for (var i = 0; i < bubbles; i++) {
        particles.push({
          x: c.width / 2,
          y: c.height / 2,
          radius: r(20, 30),
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: r(0, 360, true),
          speed: r(8, 12),
          friction: 0.9,
          opacity: r(0, 0.5, true),
          yVel: 0,
          gravity: 0.1
        });

      }

      render(particles, ctx, c.width, c.height);
      setTimeout(() => document.body.removeChild(c), 1000);
    };

    const render = (particles, ctx, width, height) => {
      requestAnimationFrame(() => render(particles, ctx, width, height));
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        p.x += p.speed * Math.cos(p.rotation * Math.PI / 180);
        p.y += p.speed * Math.sin(p.rotation * Math.PI / 180);

        p.opacity -= 0.01;
        p.speed *= p.friction;
        p.radius *= p.friction;
        p.yVel += p.gravity;
        p.y += p.yVel;

        if (p.opacity < 0 || p.radius < 0) return;

        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
        ctx.fill();
      });

      return ctx;
    };

    const r = (a, b, c) => parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0));
  })();


  (function () {
    var width = 0,
      height = 0,
      vanishPointY = 0,
      vanishPointX = 0,
      focalLength = 300,
      angleZ = 180,
      cycle = 0,
      colors = {
        r: 255,
        g: 0,
        b: 0
      },
      animate = true;

    /*
     *	Controls the emitter
     */
    class Emitter {
      constructor() {
        this.reset();
      }
      reset() {
        var PART_NUM = 200,
          x = Math.random() * 400 - 200,
          y = Math.random() * 400 - 200,
          z = Math.random() * 800 - 200;

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;

        this.particles = [];

        for (var i = 0; i < PART_NUM; i++) {
          this.particles.push(
            new Particle(this.x, this.y, this.z, {
              r: colors.r,
              g: colors.g,
              b: colors.b
            })
          );
        }
      }
      update() {
        var partLen = this.particles.length;

        this.particles.sort(function (a, b) {
          return b.z - a.z;
        });

        for (var i = 0; i < partLen; i++) {
          this.particles[i].update();
        }

        if (this.particles.length <= 0) {
          this.reset();
        }
      }
      render(imgData) {
        var data = imgData.data;

        for (var i = 0; i < this.particles.length; i++) {
          var particle = this.particles[i],
            dist = Math.sqrt(
              (particle.x - particle.ox) * (particle.x - particle.ox) +
              (particle.y - particle.oy) * (particle.y - particle.oy) +
              (particle.z - particle.oz) * (particle.z - particle.oz)
            );

          if (dist > 255) {
            particle.render = false;
            this.particles.splice(i, 1);
            this.particles.length--;
          }

          if (
            particle.render &&
            particle.xPos < width &&
            particle.xPos > 0 &&
            particle.yPos > 0 &&
            particle.yPos < height
          ) {
            for (var w = 0; w < particle.size; w++) {
              for (var h = 0; h < particle.size; h++) {
                if (
                  particle.xPos + w < width &&
                  particle.xPos + w > 0 &&
                  particle.yPos + h > 0 &&
                  particle.yPos + h < height
                ) {
                  var pData =
                    (~~(particle.xPos + w) + ~~(particle.yPos + h) * width) * 4;
                  data[pData] = particle.color[0];
                  data[pData + 1] = particle.color[1];
                  data[pData + 2] = particle.color[2];
                  data[pData + 3] = 255 - dist;
                }
              }
            }
          }
        }
      }
    }

    /*
     *	Controls the individual particles
     */
    function Particle(x, y, z, color) {
      this.x = x;
      this.y = y;
      this.z = z;

      this.startX = this.x;
      this.startY = this.y;
      this.startZ = this.z;

      this.ox = this.x;
      this.oy = this.y;
      this.oz = this.z;

      this.xPos = 0;
      this.yPos = 0;

      this.vx = Math.random() * 10 - 5;
      this.vy = Math.random() * 10 - 5;
      this.vz = Math.random() * 10 - 5;

      this.color = [color.r, color.g, color.b];
      this.render = true;

      this.size = Math.round(1 + Math.random() * 1);
    }

    Particle.prototype.rotate = function () {
      var x = this.startX * Math.cos(angleZ) - this.startY * Math.sin(angleZ),
        y = this.startY * Math.cos(angleZ) + this.startX * Math.sin(angleZ);

      this.x = x;
      this.y = y;
    };

    Particle.prototype.update = function () {
      this.x = this.startX += this.vx;
      this.y = this.startY += this.vy;
      this.z = this.startZ -= this.vz;
      this.rotate();

      this.vy += 0.1;
      this.x += this.vx;
      this.y += this.vy;
      this.z -= this.vz;

      this.render = false;

      if (this.z > -focalLength) {
        var scale = focalLength / (focalLength + this.z);

        this.size = scale * 2;
        this.xPos = vanishPointX + this.x * scale;
        this.yPos = vanishPointY + this.y * scale;
        this.render = true;
      }
    };

    function render() {
      if (!animate) {
        return;
      }
      colorCycle();
      var imgData = canvas.ctx.createImageData(width, height);

      for (var i = 0; i < 30; i++) {
        emitters[i].update();
        emitters[i].render(imgData);
      }
      canvas.ctx.putImageData(imgData, 0, 0);
      requestAnimationFrame(render);
    }

    function colorCycle() {
      cycle += 0.6;
      if (cycle > 100) {
        cycle = 0;
      }
      colors.r = ~~(Math.sin(0.3 * cycle + 0) * 127 + 128);
      colors.g = ~~(Math.sin(0.3 * cycle + 2) * 127 + 128);
      colors.b = ~~(Math.sin(0.3 * cycle + 4) * 127 + 128);
    }

    var emitters = [];
    for (var e = 0; e < 30; e++) {
      colorCycle();
      emitters.push(new Emitter());
    }

    fireworks.show = function (nextFunc) {
      animate = true;
      canvas.show(nextFunc);
      width = canvas.getSize().x;
      height = canvas.getSize().y;
      vanishPointY = height / 2;
      vanishPointX = width / 2;

      render();
    };

    fireworks.hide = function () {
      animate = false;
      canvas.hide();
    };

    fireworks.resize = function () {
      canvas.resize();
    };
  })();

  (function () {
    let animate = true;

    const pallet = rainbow(40);

    let currentColor = 0;
    let stepBy = 20;
    let clear = false;

    let docWidth, docHeight;

    const grow = {
      maxWidth: 150,
      minWidth: 50,
      maxHeight: 150,
      minHeight: 50,
      growBy: 8,
      growWidth: true,
      growHeight: true
    };

    const rect = {
      x: 0,
      y: 0,
      xStep: stepBy,
      yStep: stepBy,
      height: 100,
      width: 100
    };

    function draw() {
      const ctx = canvas.ctx;
      ctx.fillStyle = pallet[currentColor++ % pallet.length];
      ctx.shadowColor = "#333";
      ctx.shadowBlur = 10;

      if (clear) {
        /*
        const xAngle = rect.x - (docWidth / 2);
        const yAngle = rect.y - (docHeight / 2);

        ctx.shadowOffsetX = xAngle * 0.2;
        ctx.shadowOffsetY = yAngle * 0.2;
        */
        ctx.shadowOffsetX = (rect.width - grow.minWidth);
        ctx.shadowOffsetY = (rect.height - grow.minHeight);

        let shadowOffset = ctx.shadowOffsetX < ctx.shadowOffsetY ? ctx.shadowOffsetX : ctx.shadowOffsetY;

        ctx.shadowBlur = Math.floor(shadowOffset / 2);
      }
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    function update() {

      if (rect.width >= grow.maxWidth) {
        grow.growWidth = false;
      } else if (rect.width <= grow.minWidth) {
        grow.growWidth = true;
      }

      if (rect.height >= grow.maxHeight) {
        grow.growHeight = false;
      } else if (rect.height <= grow.minHeight) {
        grow.growHeight = true;
      }

      rect.height += grow.growHeight ? grow.growBy : -grow.growBy;
      rect.width += grow.growWidth ? grow.growBy : -grow.growBy;

      if (rect.x >= docWidth - rect.width) {
        rect.xStep = -stepBy;
      } else if (rect.x <= 0) {
        rect.xStep = stepBy;
      }

      if (rect.y >= docHeight - rect.height) {
        rect.yStep = -stepBy;
      } else if (rect.y <= 0) {
        rect.yStep = stepBy;
      }

      rect.x += rect.xStep;
      rect.y += rect.yStep;
    }

    function render() {
      if (!animate) {
        return;
      }
      if (clear) {
        canvas.ctx.clearRect(0, 0, canvas.el.width, canvas.el.height);
      }
      draw();
      update();
      window.requestAnimationFrame(render);
    }


    const show = function () {
      filler.resize();
      animate = true;
      canvas.show();
      render();
    };

    const hide = function () {
      animate = false;
      canvas.hide();
    };

    const resize = function () {
      docWidth = $('#celebrations').width();
      docHeight = $('#celebrations').height();

      rect.x = Math.floor(Math.random() * (docWidth - 100));
      rect.y = Math.floor(Math.random() * (docHeight - 100));

      canvas.resize();
    };

    filler.show = function () {
      clear = false;
      grow.growBy = 8;
      stepBy = 20;

      show();
    };

    filler.hide = hide;
    filler.resize = resize;

    bouncer.show = function () {
      clear = true;
      grow.growBy = 1;
      stepBy = rect.xStep = rect.yStep = 5;
      show();
    };

    bouncer.hide = hide;
    bouncer.resize = resize;
  })();

  (function () {
    let animate = false;
    const pallet = rainbow(12);
    let leafCount = 0;

    tree.show = function (nextFunc) {
      animate = true;
      canvas.show(nextFunc);
      setup();
    };
    tree.hide = function () {
      animate = false;
      canvas.hide();
    };
    tree.resize = function () {
      canvas.resize();
      setup();
    };
    class Branch {
      constructor($canvas, branch) {
        this.canvas = $canvas[0];
        this.context = canvas.ctx;
        this.canvasWidth = $canvas.width();
        this.canvasHeight = $canvas.height();
        this.x = this.canvasWidth / 2;
        this.y = this.canvasHeight;
        this.radius = 10;
        this.speed = this.canvasWidth / 500;
        this.angle = Math.PI / 2;
        this.generation = 0;
        this.lifespan = 0;
        this.totalDistance = 0;
        this.distance = 0;
        this.depth = 0;

        if (branch) {
          this.x = branch.x;
          this.y = branch.y;
          this.angle = branch.angle;
          this.speed = branch.speed;
          this.radius = branch.radius * 0.95;
          this.generation = branch.generation + 1;
          this.fillStyle = branch.fillStyle;
          this.totalDistance = branch.totalDistance;
          this.depth = branch.depth + 1;
        }
      }


      split() {
        // Calculate split chance for trunk/branch
        var splitChance = (this.distance - this.canvasHeight / (this.generation == 0 ? 5 : 10)) / 100;
        if (Math.random() < splitChance) {
          // Twigs
          var n = 2 + Math.round(Math.random() * 2);
          for (var i = 0; i < n; i++) {
            branchCollection.add(new Branch($(canvas.el), this));
          }
          branchCollection.remove(this);
        }
      }

      next() {
        this.draw();
        this.iterate();
        this.angle += Math.random() / 5 - 1 / 5 / 2;
        this.split();
        this.lifespan++;
        this.killBranchIfTooSmall();
      }

      draw() {
        var ctx = this.context;
        ctx.save();
        //ctx.fillStyle = pallet[this.depth % pallet.length];
        ctx.fillStyle = '#333333';

        ctx.shadowColor = 'rgba(0, 0, 0, .3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      iterate() {
        var lastX = this.x;
        var lastY = this.y;
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * -Math.sin(this.angle);
        this.radius *= 0.99 - this.generation / 250;
        var deltaDistance = Math.sqrt(
          Math.abs(lastX - this.x) + Math.abs(lastY - this.y)
        );
        this.distance += deltaDistance;
        this.totalDistance += deltaDistance;
        if (this.speed > this.radius * 2) this.speed = this.radius * 2;
      }

      killBranchIfTooSmall() {
        if (this.radius < 0.2) {
          branchCollection.remove(this);
          this.drawLeaf(this.x, this.y);
        }
      }

      drawLeaf(x, y) {
        var ctx = this.context;
        //ctx.strokeStyle = pallet[this.depth  % pallet.length];
        //ctx.fillStyle = pallet[this.depth + 1 % pallet.length];

        ctx.fillStyle = pallet[leafCount++ % pallet.length];
        ctx.strokeStyle = pallet[leafCount % pallet.length];

        ctx.beginPath();
        ctx.ellipse(x, y, 3, 9, this.angle, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

    }

    const branchCollection = {
      branches: [],
      next: function () {
        for (var s in branchCollection.branches) {
          if (branchCollection.branches[s]) {
            branchCollection.branches[s].next();
          }
        }
      },
      add: function (branch) {
        branchCollection.branches.push(branch);
      },
      remove: function (branch) {
        for (var s in branchCollection.branches) {
          if (branchCollection.branches[s] === branch) branchCollection.branches.splice(s, 1);
        }

        if (!branchCollection.branches.length) {
          animate = false;
        }
      }
    };

    function setup() {
      const $canvas = $(canvas.el);

      // Dimensions
      var width = $canvas.width();

      // Branches
      var n = 4 + Math.random() * 8;
      var initialRadius = width / 50;
      for (var i = 0; i < n; i++) {
        const branch = new Branch($canvas);
        branch.x = width / 2 - initialRadius + (i * initialRadius * 2) / n;
        branch.radius = initialRadius;
        branchCollection.add(branch);
      }

      let render = function () {
        branchCollection.next();
        if (animate) {
          requestAnimationFrame(render);
        }
      };
      render();
    }
  })();


  (function () {
    aquarium.show = function (nextFunc) {
      $('#aquarium-celebration').show();
    };
    aquarium.hide = function () {
      $('#aquarium-celebration').hide();
    };
    bear.show = function (nextFunc) {
      $('#bear-celebration').show();
    };
    bear.hide = function () {
      $('#bear-celebration').hide();
    };
    stars.show = function (nextFunc) {
      $('#stars-celebration').show();
    };
    stars.hide = function () {
      $('#stars-celebration').hide();
    };
  })();
}());