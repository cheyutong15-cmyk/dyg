const {
    Engine,
    Render,
    Runner,
    Bodies,
    Composite,
    Mouse,
    MouseConstraint
} = Matter;

// 创建引擎
const engine = Engine.create();
let score = 0;
let gameOver = false;
let dangerStartTime = null;

let currentLevel = 0;
let nextLevel = 0;
const r = Math.random();

if (r < 0.8) {
    nextLevel = 0;
}
else if (r < 0.95) {
    nextLevel = 1;
}
else {
    nextLevel = 2;
}

currentLevel = nextLevel;

// 获取canvas
const canvas = document.getElementById("gameCanvas");
let mouseX = 250;

// 设置实际大小
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// 创建渲染器
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: canvas.width,
        height: canvas.height,
        wireframes: false,
        background: "#ffffff"
    }
});

// 地面
const ground = Bodies.rectangle(
    canvas.width / 2,
    canvas.height - 20,
    canvas.width,
    40,
    {
        isStatic: true,
        render: {
            fillStyle: "#666"
        }
    }
);

// 左墙
const leftWall = Bodies.rectangle(
    -10,
    canvas.height / 2,
    20,
    canvas.height,
    {
        isStatic: true
    }
);

// 右墙
const rightWall = Bodies.rectangle(
    canvas.width + 10,
    canvas.height / 2,
    20,
    canvas.height,
    {
        isStatic: true
    }
);

Composite.add(
    engine.world,
    [ground, leftWall, rightWall]
);
function createBall(x) {

    if (gameOver) return;

    const level = currentLevel;

    const ball = Bodies.circle(
        x,
        50,
        30 + level * 5,
        {
            restitution: 0.2,
            render: {
                fillStyle: [
                    "#FFD700",
                    "#4CAF50",
                    "#2196F3"
                ][level]
        }
    }
);

ball.level = level; 


currentLevel = nextLevel;

Composite.add(
    engine.world,
    ball
);

   currentLevel = nextLevel;

const r = Math.random();

if (r < 0.8) {
    nextLevel = 0;
}
else if (r < 0.95) {
    nextLevel = 1;
}
else {
    nextLevel = 2;
}

const names = [
    "黄色",
    "绿色",
    "蓝色"
];

document.getElementById(
    "nextBall"
).innerText =
    "下一颗：" +
    names[nextLevel];
}
canvas.addEventListener("mousemove", (e) => {

    const rect =
        canvas.getBoundingClientRect();

    mouseX =
        e.clientX - rect.left;

});
// 电脑点击
canvas.addEventListener("click", (e) => {

    const rect =
        canvas.getBoundingClientRect();

    createBall(
        e.clientX - rect.left
    );

});

// 手机触摸
canvas.addEventListener("touchstart", (e) => {

    e.preventDefault();

    const rect =
        canvas.getBoundingClientRect();

    createBall(
        e.touches[0].clientX -
        rect.left
    );

});

// 鼠标控制
const mouse = Mouse.create(canvas);

const mouseConstraint =
    MouseConstraint.create(
        engine,
        {
            mouse: mouse
        }
    );

Composite.add(
    engine.world,
    mouseConstraint
);

// 启动
Render.run(render);

const runner = Runner.create();

Runner.run(
    runner,
    engine
);
const dangerLine = 120;
Matter.Events.on(render, "afterRender", () => {

    const ctx = render.context;

    // 红线
    ctx.beginPath();

    ctx.moveTo(0, dangerLine);

    ctx.lineTo(canvas.width, dangerLine);

    ctx.strokeStyle = "red";

    ctx.lineWidth = 3;

    ctx.stroke();

    // 预览球
    ctx.beginPath();

    ctx.arc(
        mouseX,
        50,
        30 + currentLevel * 5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = [
        "#FFD700",
        "#4CAF50",
        "#2196F3"
    ][currentLevel];

    ctx.fill();

});


Matter.Events.on(engine, "collisionStart", function(event) {

    const pairs = event.pairs;

    pairs.forEach(pair => {

        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if(
            bodyA.level !== undefined &&
            bodyB.level !== undefined &&
            bodyA.level === bodyB.level &&
            bodyA.position.y > 200 &&
            bodyB.position.y > 200
    
        ){

            const level = bodyA.level;

            const x =
                (bodyA.position.x +
                 bodyB.position.x) / 2;

            const y =
                (bodyA.position.y +
                 bodyB.position.y) / 2;

            Composite.remove(
                engine.world,
                bodyA
            );

            Composite.remove(
                engine.world,
                bodyB
            );

            const newBall =
                Bodies.circle(
                    x,
                    y,
                    30 + (level + 1) * 5,
                    {
                        restitution:0.2,
                        render:{
                            fillStyle:[
                                "#FFD700",
                                "#4CAF50",
                                "#2196F3",
                                "#9C27B0",
                                "#F44336",
                                "#FF9800"
                            ][
                                Math.min(level+1,5)
                            ]
                        }
                    }
                );

            newBall.level = level + 1;

            Composite.add(
                engine.world,
                newBall
            );
            score += level + 1;

            document.getElementById("score").innerText =
                 "分数：" + score;

        }

    });

});
setInterval(() => {

    if (gameOver) return;

    const bodies =
        Composite.allBodies(engine.world);

    let hasDangerBall = false;

    for (let body of bodies) {

        if (
            body.level !== undefined &&
            body.position.y < dangerLine &&
            body.speed < 0.2
        ) {

            hasDangerBall = true;

            if (dangerStartTime === null) {
                dangerStartTime = Date.now();
            }

            if (
                Date.now() - dangerStartTime >
                3000
            ) {

                gameOver = true;

                alert(
                    "游戏结束！\n\n最终分数：" +
                    score
                );

            }

            break;
        }

    }

    if (!hasDangerBall) {
        dangerStartTime = null;
    }

}, 500);