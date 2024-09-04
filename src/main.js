import { scale, dialogues } from "./constants";
import { k } from "./kaboomCtx";
import { showDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");
k.setBackground(k.Color.fromHex("#4f6591"));

k.scene("main", async () => {
  const data = await (await fetch("./map.json")).json();
  const layers = data.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scale)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scale),
    {
      speed: 250,
      direction: "down",
      dialogue: false,
      firstAction: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.dialogue = true;
            showDialogue(
              dialogues[boundary.name],
              () => (player.dialogue = false)
            );
          });
        }
      }

      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const item of layer.objects) {
        if (item.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + item.x) * scale,
            (map.pos.y + item.y) * scale
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  k.onMouseDown((click) => {
    if (click !== "left" || player.dialogue) return;

    if (!player.firstAction) {
      player.firstAction = true;
      player.dialogue = true;
      showDialogue(dialogues.player, () => {
        player.dialogue = false;
      })
    }

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  const stopAnims = () => {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });
  k.onKeyDown((key) => {
    if (player.dialogue) return;

    if (!player.firstAction) {
      player.firstAction = true;
      player.dialogue = true;
      showDialogue(dialogues.player, () => {
        player.dialogue = false;
      })
    } else {
      const keyMap = [
        k.isKeyDown("right"),
        k.isKeyDown("left"),
        k.isKeyDown("up"),
        k.isKeyDown("down"),
      ];

      let nbOfKeyPressed = 0;
      for (const key of keyMap) {
        if (key) {
          nbOfKeyPressed++;
        }
      }

      if (nbOfKeyPressed > 1) return;

      if (player.dialogue) return;
      if (keyMap[0]) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "right";
        player.move(player.speed, 0);
        return;
      }

      if (keyMap[1]) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "left";
        player.move(-player.speed, 0);
        return;
      }

      if (keyMap[2]) {
        if (player.curAnim() !== "walk-up") player.play("walk-up");
        player.direction = "up";
        player.move(0, -player.speed);
        return;
      }

      if (keyMap[3]) {
        if (player.curAnim() !== "walk-down") player.play("walk-down");
        player.direction = "down";
        player.move(0, player.speed);
      }
    }
  });

  const displayGame = () => {
    document.getElementById('game').style.display = 'block';
    document.getElementById('about').style.display = 'none';
    document.getElementById('projects').style.display = 'none';
    document.getElementById('note').style.display = 'block';
  }

  const displaySection = (id) => {
    document.getElementById('game').style.display = 'none';
    document.getElementById('note').style.display = 'none';
    document.getElementById(id).style.display = 'block';
    document.getElementById('app').style.overflowY = 'auto';
  }

  document.getElementById('about-trigger').addEventListener('click', () => {
    displaySection('about');
    document.getElementById('projects').style.display = 'none';
    document.getElementById('about-trigger').style.display = 'none';
    document.getElementById('projects-trigger').style.display = 'none';
  });

  document.getElementById('projects-trigger').addEventListener('click', () => {
    displaySection('projects');
    document.getElementById('about').style.display = 'none';
    document.getElementById('about-trigger').style.display = 'none';
    document.getElementById('projects-trigger').style.display = 'none';
  });

  document.getElementById('close-about').addEventListener('click', () => {
    displayGame();
    document.getElementById('about-trigger').style.display = 'block';
    document.getElementById('projects-trigger').style.display = 'block';
  });

  document.getElementById('close-projects').addEventListener('click', () => {
    displayGame();
    document.getElementById('about-trigger').style.display = 'block';
    document.getElementById('projects-trigger').style.display = 'block';
  });
});

k.go("main");

document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.querySelector('#projects-carousel');
  const items = carousel.querySelectorAll('.carousel-item');
  const prevButton = carousel.querySelectorAll('[data-slide="prev"]');
  const nextButton = carousel.querySelectorAll('[data-slide="next"]');

  let currentIndex = 0;

  const updateCarousel = () => {
    items.forEach((item, index) => {
      item.classList.remove('active');
      if (index === currentIndex) {
        item.classList.add('active');
      }
    })
  }

  const displayNextItem = () => {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  }

  const displayPrevItem = () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
  }

  prevButton.forEach(button => {
    button.addEventListener('click', displayPrevItem);
  })
  nextButton.forEach(button => {
    button.addEventListener('click', displayNextItem);
  })
})


