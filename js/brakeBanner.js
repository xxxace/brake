class BrakeBanner {
  constructor(option) {
    this.el = option.el;
    this.backgroundColor = option.backgroundColor || 0x000000;
    this.init();
  }

  init() {
    this.app = this.createPIXIApp();
    this.loader = this.createPIXILoader();
    this.mount(this.app.view);
    this.loadSource();
  }

  createPIXIApp() {
    console.log(window.innerWidth);
    const app = new PIXI.Application({
      width: window.innerWidth - 0,
      height: window.innerHeight - 4,
      backgroundColor: this.backgroundColor,
      resizeTo: window,
    });

    return app;
  }

  createPIXILoader() {
    const loader = new PIXI.Loader();

    return loader;
  }

  loadSource() {
    const loader = this.loader;

    // 加载资源
    loader.add("Brakes_Bike.png", "images/Brakes_Bike.png");
    loader.add("Brakes_Handlebars.png", "images/Brakes_Handlebars.png");
    loader.add("lever.png", "images/lever.png");
    loader.load();

    loader.onComplete.add(() => {
      const container = new PIXI.Container();
      const actionButton = this.createButton();
      const bikeContainer = new PIXI.Container();
      const particleContainer = new PIXI.Container();

      // 添加容器
      container.addChild(actionButton);
      container.addChild(bikeContainer);
      container.addChild(particleContainer);
      container.interactive = true;
      container.buttonMode = true;

      // 挂载
      this.app.stage.addChild(container);

      // 引用资源
      const bikeImage = new PIXI.Sprite(
        this.loader.resources["Brakes_Bike.png"].texture
      );
      const handlebarsImage = new PIXI.Sprite(
        this.loader.resources["Brakes_Handlebars.png"].texture
      );
      const leverImage = new PIXI.Sprite(
        this.loader.resources["lever.png"].texture
      );

      // 添加按钮
      bikeContainer.addChild(leverImage);
      bikeContainer.addChild(bikeImage);
      bikeContainer.addChild(handlebarsImage);

      leverImage.scale.x = leverImage.scale.y = 0.85;
      leverImage.pivot.x = 455;
      leverImage.pivot.y = 425;
      leverImage.x = 710;
      leverImage.y = 872;
      leverImage.rotation = (Math.PI / 180) * -10;

      const resize = () => {
        let scale = window.innerWidth / 2048;
        if (scale >= 1) scale = 1;

        bikeContainer.x =
          (window.innerWidth - bikeContainer.width + 670) * scale;
        bikeContainer.y =
          (window.innerHeight - bikeContainer.height + 230) * scale;

        // particleContainer.x =
        //   (window.innerWidth - particleContainer.width) * scale;
        // particleContainer.y =
        //   (window.innerHeight - particleContainer.height) * scale;

        // particleContainer.scale.x = particleContainer.scale.y = scale;
        bikeContainer.scale.x = bikeContainer.scale.y = scale;
      };

      window.addEventListener("resize", resize);
      resize();

      // 创建粒子
      particleContainer.width = window.innerWidth;
      particleContainer.height = window.innerHeight + 200;
      particleContainer.rotation = (Math.PI / 180) * 35;

      particleContainer.pivot.x = window.innerWidth / 2;
      particleContainer.pivot.y = window.innerHeight / 2;

      particleContainer.x = window.innerWidth / 2;
      particleContainer.y = window.innerHeight / 2;

      const particle = this.createParticles(particleContainer, 30, container);

      container.on("mousedown", () => {
        gsap.to(leverImage, {
          duration: 0.2,
          x: 690,
          rotation: (Math.PI / 180) * -41,
        });
        particle.pause();
      });

      container.on("mouseup", () => {
        gsap.to(leverImage, {
          duration: 0.2,
          x: 710,
          rotation: (Math.PI / 180) * -10,
        });
        particle.start();
      });
    });
  }

  createParticles(container, number = 1) {
    if (!container) throw new Error("container can not be empty!");

    const particles = [];
    const colors = [0x000000, 0xf1cf54, 0xb5cea8];
    for (let i = 0; i < number; i++) {
      let { x, y, size, backgroundColor } = {
        x: 0,
        y: 0,
        size: 6,
      };
      const particle = new PIXI.Graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.beginFill(color);
      particle.drawCircle(x, y, size);
      particle.endFill();

      const item = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        gr: particle,
      };

      particle.x = item.x;
      particle.y = item.y;
      particles.push(item);
      container.addChild(particle);
    }

    let speed = 0;
    let scalex = 1;
    function loop() {
      speed += 0.5;
      scalex -= 0.1;
      speed = Math.min(speed, 95);

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.gr.y += speed;

        particle.gr.scale.y = speed;
        particle.gr.scale.x = scalex;

        if (scalex <= 0) {
          particle.gr.scale.x = 0.03;
        }

        if (speed >= 65) {
          particle.gr.scale.y = 40;
        }

        if (particle.gr.y > window.innerHeight) particle.gr.y = 0;
      }
    }

    function start() {
      speed = 0;
      scalex = 1;
      gsap.ticker.add(loop);
    }

    function pause() {
      gsap.ticker.remove(loop);
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        particle.gr.scale.y = 1;
        particle.gr.scale.x = 1;

        gsap.to(particle.gr, {
          duration: 0.6,
          x: particle.x,
          y: particle.y,
          ease: "elastic.out",
        });
      }
    }

    start();

    return {
      start,
      pause,
    };
  }

  createButton() {
    const button = new PIXI.Container();
    const text = new PIXI.Text("click");
    const circle = new PIXI.Graphics();

    text.x = -22;
    text.y = -10;

    circle.lineStyle();
    circle.beginFill(0xde3249, 1);
    circle.drawCircle(0, 0, 50);
    circle.endFill();

    button.addChild(text);
    button.addChild(circle);

    button.x = button.y = 150;

    circle.scale.x = circle.scale.y = 0.8;
    gsap.to(circle.scale, { duration: 1, x: 1.1, y: 1.1, repeat: -1 });
    gsap.to(circle, { duration: 1, alpha: 0, repeat: -1 });

    return button;
  }

  mount(app) {
    let el = this.el;

    if (typeof el === "string") {
      el = document.querySelector(el);
    }

    el.appendChild(app);
  }
}
