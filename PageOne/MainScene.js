class MainScene extends Phaser.Scene {
    constructor() {
        super({
            'key': "MainScene"
        })
    }

    preload() {
        this.load.image('floor', "Assets/floor.png");
        this.load.image('cloud', "Assets/cloud.png");
        this.load.image('idle', "Assets/jump.png");
        this.load.image('run1', "Assets/run1.png");
        this.load.image('run2', "Assets/run2.png");
        this.load.image('low1', "Assets/Low1.png");
        this.load.image('low2', "Assets/Low2.png");
        this.load.image('death', "Assets/death.png");
        this.load.image('restart', "Assets/restart.png");

        //obstacles
        this.load.image('cactus1', "Assets/CACTUS1.png");
        this.load.image('cactus2', "Assets/CACTUS2.png");
        this.load.image('cactus3', "Assets/CACTUS3.png");
        this.load.image('cactus4', "Assets/CACTUS4.png");
        this.load.image('cactus5', "Assets/CACTUS5.png");

        //enimies
        this.load.image('enemy1', "Assets/enemy1.png");
        this.load.image('enemy2', "Assets/enemy2.png");

        //font loader
        this.load.script('WebFont', "util/webfont.js");
    }

    create() {
        this.startRun = false;
        this.jumpStarted = false;
        this.scrollSpeed = 7;
        this.width = game.config.width;
        this.height = game.config.height;
        this.obstacles = [];
        this.enemies =[];
        //create a grid
        this.aGrid = new AlignGrid({ scene: this, rows: 5, cols: 11 });
        //this.aGrid.showNumbers();

       // console.log(canvas);

        //collison Group
        this.group1 = this.matter.world.nextGroup(); //with collisions
        this.group2 = this.matter.world.nextGroup(true);//gameObjects in this group wont collide with each other


        var element = document.createElement('style');
        var ref = this;
        document.head.appendChild(element);

        var sheet = element.sheet;
  
        var styles = '@font-face { font-family: "pixelmix"; src: url("pixelmix.ttf") format("opentype"); }\n';
        sheet.insertRule(styles, 0);
  
        WebFont.load({
            custom: {
              families: ['pixelmix']
            },
            active: function () {
                this.aGridN = new AlignGrid({ scene: this, rows: 5, cols: 11 });
               // this.aGrid.showNumbers();
                console.log("Activated");
              this.styleNew = { fontFamily: 'pixelmix', fontSize: 70, color:'#A9A9A9' };

              ref.scoreText = ref.add.text(100, 100, 'HI', this.styleNew);
              Align.scaleToGameW(ref.scoreText,0.025);
              this.aGridN.placeAt(7,0,ref.scoreText);

              ref.scoreVal = ref.add.text(100, 100, 'HI', this.styleNew);
              Align.scaleToGameW(ref.scoreVal,0.025);
              this.aGridN.placeAt(7.5,0,ref.scoreVal);
              ref.scoreVal.setText(gameData.highScore);
            }
            
        });



        //creating player
        //  this.player =this.add.image(0,0,'idle');
        this.player = this.matter.add.image(0, 0, 'idle', null, { isStatic: false });
        //Align.scaleToGameW(this.player,0.075);
        this.scaleTheObjec(this.player, 0.045);
        this.aGrid.placeAt(1, 2.6, this.player);
        this.player.visible = false;
        this.player.setCollisionGroup(this.group2);

        //creating body for low pos
        this.lowBody = this.matter.add.image(0, 0, 'low1', null, { isStatic: true });
        this.lowBody.setScale(this.player.scaleX / 2, this.player.scaleY / 2);
        this.aGrid.placeAt(1, 2.6, this.lowBody);
        this.lowBody.setPosition(this.player.x, this.player.y + 25);
        this.lowBody.visible = false;
        this.lowBody.setCollisionGroup(this.group2);


        //


        //create death 
          this.dead = this.add.image(0,0,'death');
          this.dead.setScale(this.player.scaleX,this.player.scaleY);
          this.dead.setPosition(this.player.x,this.player.y);
this.dead.visible=false;

        this.input.on('pointerdown', () => {
            console.log("pinter down");
            if (!this.jumpStarted) {
                this.player.visible = true;
                this.run.visible = false;
                this.player.setVelocityY(-15);
                this.jumpStarted = true;
            }
            this.time.addEvent(
                {
                    delay: 1100,
                    callback: () => {
                        this.player.visible = false;
                        this.run.visible = true;
                        this.jumpStarted = false;
                    }
                });

        })



        //creating player animation
        this.anims.create({
            key: 'run',
            frames: [
                { key: 'run1' },
                { key: 'run2' }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.run = this.add.sprite(500, 300, 'blast0').play('run');
        this.run.setScale(this.player.scaleX, this.player.scaleY);
        this.run.setPosition(this.player.x, this.player.y);
        //this.run.visible=false;


        //down anmations here 
        this.anims.create({
            key: 'low',
            frames: [
                { key: 'low1' },
                { key: 'low2' }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.low = this.add.sprite(500, 300, 'low0').play('low');
        this.low.setScale(this.player.scaleX / 2, this.player.scaleY / 2);
        this.low.setPosition(this.player.x, this.player.y);
        this.low.visible = false;


        //ends here


        //this.floor = this.add.image(0, 250, 'floor');
        this.floor = this.matter.add.image(0, 0, 'floor', null, { isStatic: true });
        this.aGrid.placeAtIndex(38, this.floor);
        Align.scaleToGameW(this.floor, 1);


        this.floorTwo = this.add.image(0, 250, 'floor');
        //this.aGrid.placeAtIndex(38, this.floorTwo);
        Align.scaleToGameW(this.floorTwo, 1);

        this.floor.name="floor";
        this.floorTwo.name="floor";

        //this.floorTwo.x =this.floor.x+this.floor.displayWidth/2;

        this.floorTwo.setPosition(this.floor.x + this.floor.displayWidth, this.floor.y);

        this.clouds = [];
        //making clouds
        var i = 0;
        for (i = 0; i < 4; i++) {
            var hFact = Math.random() * 250 + 1;
            var cloud = this.add.image(0, 0, 'cloud');
            cloud.setPosition(this.width + cloud.displayWidth + i * 400, this.height * 0.5 - hFact);
            Align.scaleToGameW(cloud, 0.1);
            this.clouds.push(cloud);
        }


        this.pt = [0, 0];
        this.pt[0] = this.floorTwo.x;
        this.pt[1] = this.floorTwo.y;

        //temp
        this.startRun = true;
        var tempImage =this.add.image(250,200,'idle');
        Align.scaleToGameW(tempImage,0.1);
     
        // var g =null;
        // g =this.game;
        // var pointer = this.input.activePointer;
        // var ref= this;

        // this.game.renderer.snapshot( function (image)
        // {
        //   //  document.body.appendChild(image);
        //   var textureManager = ref.textures;
        //     if (textureManager.exists('area'))
        //     {
        //         textureManager.remove('area');
        //     }
        //       console.log(image);
        //     textureManager.addImage('area', image);

        // tempImage.setTexture('area');
        // });


       // console.log(this.game.renderer.snapshotArea());
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
         //  var ref =this;
        this.input.keyboard.on('keydown_A', function (event) {

            console.log('Hello from the A Key!');
        });
        this.input.keyboard.on('keyup_A', function (event) {

             console.log(ref.game);
             console.log(ref.input.activePointer);
            ref.game.renderer.snapshotArea(pointer.worldX, pointer.worldY, 128, 128, function (image)
            {
                document.body.appendChild(image);
    
                if (textureManager.exists('area'))
                {
                    textureManager.remove('area');
                }
    
                textureManager.addImage('area', image);
    
            tempImage.setTexture('area');
            });
            console.log('Hello from the A Key! up');

        });



        this.cursors = this.input.keyboard.createCursorKeys();


        this.matterCollision.addOnCollideStart(
            {
                objectA: this.player, objectB: this.floor, callback: () => {
                    console.log("hitted the floor");
                    this.jumpStarted = false;
                }
            })
        this.matterCollision.addOnCollideEnd(
            {
                objectA: this.player, objectB: this.floor, callback: () => {
                    console.log("leaving the floor");
                    this.jumpStarted = true;
                }
            })

            this.matterCollision.addOnCollideStart({
                objectA: this.player,
                callback: eventData => {
                    const { bodyB, gameObjectB } = eventData;
                   
                   if(gameObjectB.name!="floor")
                   {
                 this.run.visible=false;
                 this.player.visible=false;
                 this.dead.visible=true;
                 this.dead.setPosition(this.player.x,this.player.y);
                 this.startRun=false;
                  console.log("Player touched something.");
                  // bodyB will be the matter body that the player touched
                  // gameObjectB will be the game object that owns bodyB, or undefined if there's no game object
                   }
                }
              });

        this.createAndPlaceObstacles();
        this.createAnimations();

   

    }

    update() {
        // this.player.setVelocityY(0);
        this.run.setPosition(this.player.x, this.player.y);
        this.low.setPosition(this.player.x, this.player.y + 25);

        if (this.cursors.down.isDown) {
            this.player.setVelocityY(15);
            if (!this.jumpStarted) {

                this.low.visible = true;
                this.player.visible = false;
                this.run.visible = false;
            }
        }
        if (this.cursors.down.isUp) {
            if(this.startRun &&this.jumpStarted==false)
            {
                this.run.visible = true;
                this.low.visible = false;
            }
            else{
                this.run.visible = false;
            }
            
        }

        //up btn
        if (this.cursors.up.isDown) {

            if (!this.jumpStarted) {
                this.player.visible = true;
                this.run.visible = false;
                this.low.visible = false;
                this.player.setVelocityY(-15);
                this.jumpStarted = true;


                this.time.addEvent(
                    {
                        delay: 1100,
                        callback: () => {
                            console.log("emitted once")
                            this.player.visible = false;
                            this.run.visible = true;
                            this.jumpStarted = false;
                        }
                    });
            }

        }
        else if (this.cursors.up.isUp) {

        }


        if (this.startRun) {
            this.floor.x -= this.scrollSpeed;
            this.floorTwo.x -= this.scrollSpeed;

            this.clouds.forEach(element => {
                element.x -= 3;
                if (element.x + element.displayWidth < 0) {
                    this.spawnCloud(element);
                }
            })

            //set conditions to reset the position

            if (this.floor.x + this.floor.displayWidth / 2 < 0) {
                this.floor.x = this.pt[0] - 10;//10;
                this.floor.y = this.pt[1];
            }
            if (this.floorTwo.x + this.floorTwo.displayWidth / 2 < 0) {
                this.floorTwo.x = this.pt[0] - 10;
                this.floorTwo.y = this.pt[1];
            }


            if (this.obstacles.length > 0) {

                
                var i=0;
                for(i=0; i<this.obstacles.length;i++)
                {
                    var element =this.obstacles[i];
                    element.x -= 7;
                    if (element.x + element.displayWidth < 0) {
                       // this.loadObstacles(element);
                       element.destroy();
                       console.log("element destroyed");
                       var ind = Math.floor(Math.random() * 5 + 1);
                       var path = '';
                       path = 'cactus' + ind;
                       // cactus1
                       console.log(path);
                       var obstacle = this.matter.add.image(250, 250, path, null, { isStatic: true });
                       var x = this.width + obstacle.displayWidth;
                       var y = this.floor.y - obstacle.displayHeight;
                       obstacle.setPosition(x, y);
                       if (ind == 5) {
                           this.scaleTheObjec(obstacle, 0.03)
                       }
                       else {
                           this.scaleTheObjec(obstacle, 0.013)
                       }
                       //this.obstacles.push(obstacle);
                       this.obstacles[i]=obstacle;
                    }  
                }

                this.enemies.forEach(element=>{
                    element.x-=(10)

                    if(element.x<0)
                    {
                        element.setPosition(this.width+1500, this.floor.y-250);
                    }
                })
                
                // this.obstacles.forEach(element => {
                //     element.x -= 7;
                //     if (element.x + element.displayWidth < 0) {
                //         this.loadObstacles(element);
                //         //  this.spawnCloud(element);
                //     }
                // })
            }

        }
        this.input.on('pointerup', () => {
            //    this.startRun=!this.startRun;
            //    this.player.visible=!this.player.visible;
            //    this.run.visible=!this.run.visible;
        })


    }
    spawnCloud(obj) {
        var hFact = Math.random() * 250 + 1;
        obj.x = this.width + obj.displayWidth;
        obj.y = this.height * 0.5 - hFact
        console.log('calculated value =' + obj.x + "  " + obj.y);
    }
    scaleTheObjec(obj, x)//0.15   0.015
    {

        var wi = (obj.body.bounds.max.x - obj.body.bounds.min.x) / 2
        var hei = (obj.body.bounds.max.y - obj.body.bounds.min.y) / 2
        var scaleval = game.config.width * x / wi;
        // var scalevalY = game.config.height * y / hei
        obj.setScale(scaleval, scaleval)
    }

    createAnimations() {

        //enemy animation
        this.anims.create({
            key: 'enemy',
            frames: [
                { key: 'enemy1' },
                { key: 'enemy2' }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.enemy = this.add.sprite(500, 300, 'low0').play('enemy');
        this.enemy.setScale(this.player.scaleX / 2, this.player.scaleY / 2);
        this.enemy.setPosition(this.width+1500, this.floor.y-250);
       // this.enemy.visible = false;

        //ends here

    }
    loadObstacles(element) {
        element.destroy();
        console.log("element destroyed");
        var ind = Math.floor(Math.random() * 5 + 1);
        var path = '';
        path = 'cactus' + ind;
        // cactus1
        console.log(path);
        var obstacle = this.matter.add.image(250, 250, path, null, { isStatic: true });
        var x = this.width + obstacle.displayWidth;
        var y = this.floor.y - obstacle.displayHeight/2;
        obstacle.setPosition(x, y);
        if (ind == 5) {
            this.scaleTheObjec(obstacle, 0.03)
        }
        else {
            this.scaleTheObjec(obstacle, 0.013)
        }
        this.obstacles.push(obstacle);


    }
    createAndPlaceObstacles() {
        var ind = Math.floor(Math.random() * 5 + 1);
        var path = '';
        path = 'cactus' + ind;
        // cactus1
        console.log(path);
        var obstacle = this.matter.add.image(250, 250, path, null, { isStatic: true });
        var x = this.width + obstacle.displayWidth;
        var y = this.floor.y - obstacle.displayHeight/2;
        obstacle.setPosition(x, y);
        if (ind == 5) {
            this.scaleTheObjec(obstacle, 0.03)
        }
        else {
            this.scaleTheObjec(obstacle, 0.013)
        }
        this.obstacles.push(obstacle);



        // second one
        ind = Math.floor(Math.random() * 5 + 1);
        path = 'cactus' + ind;
        var obstacle2 = this.matter.add.image(250, 250, path, null, { isStatic: true });
        var x = this.width + obstacle2.displayWidth;
        var y = this.floor.y - obstacle2.displayHeight/2;
        obstacle2.setPosition(x+800, y);
        if (ind == 5) {
            this.scaleTheObjec(obstacle2, 0.03)
        }
        else {
            this.scaleTheObjec(obstacle2, 0.013)
        }
        this.obstacles.push(obstacle2);

        //thirdone
        // ind = Math.floor(Math.random() * 5 + 1);
        // path = 'cactus' + ind;
        // var obstacle3 = this.matter.add.image(250, 250, path, null, { isStatic: true });
        // var x = this.width + obstacle3.displayWidth;
        // var y = this.floor.y - obstacle3.displayHeight;
        // obstacle3.setPosition(x+1600, y);
        // if (ind == 5) {
        //     this.scaleTheObjec(obstacle3, 0.03)
        // }
        // else {
        //     this.scaleTheObjec(obstacle3, 0.013)
        // }
        // this.obstacles.push(obstacle3);
    }
}