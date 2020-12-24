var database;
var player1,player2;
var position1,position2;
var redAnimation, yellowAnimation;
var gameState;
var player1Score, player2Score;
var toss;
//var msg;

function preload(){
    redAnimation=loadAnimation("assets/player1a.png","assets/player1b.png","assets/player1a.png");
    yellowAnimation=loadAnimation("assets/player2a.png","assets/player2b.png","assets/player2a.png");
}

function setup(){
    database=firebase.database();
    createCanvas(600,600);

    //player1 on the left side
    player1=createSprite(300,250,10,10);
    
    player1.addAnimation("redPlayer",redAnimation);
    redAnimation.frameDelay = 200;
    player1.scale=0.5;
    player1.setCollider("circle", 0,0,60)
    //player1.debug=true;


    //player2 on the right side
    player2=createSprite(300,250,10,10);
    player2.addAnimation("yellowPlayer",yellowAnimation);
    yellowAnimation.frameDelay = 200;
    player2.scale=-0.5;
    player2.setCollider("circle", 0,0,60)
    //player2.debug=true;

    var gameStateRef=database.ref('gameState');
    gameStateRef.on("value",readState,showError);

    player1ScoreRef=database.ref('player1Score');
    player1ScoreRef.on("value",readScore1,showError);

    player2ScoreRef=database.ref('player2Score');
    player2ScoreRef.on("value",readScore2,showError);

    var player1Position=database.ref('player1/position');
    player1Position.on("value",readPosition1,showError);

    var player2Position=database.ref('player2/position');
    player2Position.on("value",readPosition2,showError);

    var tossRef=database.ref('toss');
    tossRef.on("value",readtoss,showError);

    /*var msgRef=database.ref('toss');
    msgRef.on("value",readmsg,showError);*/

    resetbutton=createButton('Reset');
    resetbutton.position(100,30);

    resetbutton.mousePressed(()=>{
        database.ref('player1/position').update({
            'x': 150,
            'y': 300  
          })
    
          database.ref('player2/position').update({
            'x': 450,
            'y': 300  
          })

        
        database.ref('/').update({
            toss:0,
            player1Score:0,
            player2Score:0,
            gameState:0

        })      
    })
}

function draw(){
    background("white");      
    
    if(gameState===0){
        
        fill("black");
        textSize(24);
        //if(msg==0){
        text("Press Space to start the toss",180,200);
        /*}else{
            text("Press Space to Continue",180,200);
        }*/
        console.log("press space");

        //Press space to start toss
        if(keyDown("space")){            
            
            if(toss===0){
                console.log("gameState: "+gameState);
                console.log("toss: "+toss);
                console.log("space key pressed");
                //at the starting, toss=0 means player is selected randomly
                var rand=Math.round(random(1,2));

                if(rand===1){                        
                    console.log("gameState: "+gameState);
                    console.log("toss: "+toss);            
                    database.ref('/').update({

                        'gameState':1//random number 1 means player 1 should ride and update toss as 1 in database
                    
                    })
                
                    alert("RED WINS THE TOSS");
                   

                }else if(rand===2){                      
                    console.log("gameState: "+gameState);
                    console.log("toss: "+toss);             
                    database.ref('/').update({
                        'gameState':2//random number 2 means player 2 should ride and update toss as 2 in database
                      
                    })
                   
                    alert("YELLOW WINS THE TOSS");
                    
                }
           }else if(toss==1 && gameState==0){//in the next round toss will be either 1 or 2.             
          
                console.log("2nd round, toss is 1 and gamestate is 2");
                console.log("gameState: "+gameState);
                console.log("toss: "+toss);
                database.ref('/').update({
                    'gameState':2//if toss is 1, it means the last round was started by player 1. 
                    //So now, it should be player2 's turn, gameState is set as 2 so that player2 will play this time 
                })

                alert("NOW IT'S YELLOW'S TURN!!!!!!!!!!!");
            

            }else if(toss==2 && gameState==0){
            
                console.log("2nd round, toss is 2 and gamestate is 1");
                console.log("gameState: "+gameState);
                console.log("toss: "+toss);
                database.ref('/').update({
                    'gameState':1//if toss is 2, it means the last round was started by player 2. 
                    //So now, it should be player1's turn, gameState is set as 1 so that player1 will play this time 
                })

                alert("NOW IT'S RED'S TURN!!!!!!!!");
            }
        

            database.ref('player1/position').update({
                'x': 150,
                'y': 300  
              })
        
              database.ref('player2/position').update({
                'x': 450,
                'y': 300  
              })

           
        } 
        
    }  
    //When player1(RED) is playing
    if(gameState===1){
        console.log("gameState: "+gameState);
        console.log("toss: "+toss);
        console.log("in player1's block");
       
        //arrow key control for the movement of the player1. He can move left,right, up and down
        //Player2 can move only up(key w) and down(s key)
        textSize(14);
        fill("blue");
        text("Use arrow keys for moving Red",180,50);
        text("To move Yellow: w  -->  up, s --> down",158,70);

        if(keyWentDown(LEFT_ARROW)){
            writePosition1(-20,0); //changePosition(-5,0);
        }else if(keyWentDown(RIGHT_ARROW)){            
            writePosition1(20,0); 
        }else if(keyWentDown(UP_ARROW)){
            writePosition1(0,-20); 
        }else if(keyWentDown(DOWN_ARROW)){
            writePosition1(0,20); 
        }else if(keyWentDown("w")){
            writePosition2(0,-20); // up
        }else if(keyWentDown("s")){
            writePosition2(0,20);  // down
        }
       
        if(player1.x>500){//player1 loses
            database.ref('/').update({
                'player1Score': player1Score-5,//player1 loses score
                'player2Score': player2Score+5,//player2 gains score               
                'toss':1,
                'gameState' : 0, //game goes back to starting 
                //'msg':1
            })
        }

        //player1 wins when player1 touches player2
        if(player1.isTouching(player2)){

            database.ref('/').update({                
                'player1Score': player1Score+5,
                'player2Score': player2Score-5,
                'toss':1,
                'gameState':0,
                //'msg':1
            });

            alert("RED LOST");
        }
    }


    //When player1(YELLOW) is playing
    if(gameState===2){
        console.log("gameState: "+gameState);
        console.log("toss: "+toss);
        console.log("in player2's block");
        //msg=1;
    //Player2 can move left(a), right(s), up(w), down(d)
    //arrow key control for the movement of the player1. He can move left,right, up and down
        textSize(14);
        fill("blue");
        text("To move yellow: a --> left,   s --> right, w --> up, d --> down",132,50);
        text("Use up/ down arrow keys for moving Red up/down",160,70);

        if(keyWentDown("a")){
            writePosition2(-20,0); //changePosition(-5,0);
            console.log("key a for player2");
        }else if(keyWentDown("s")){
            writePosition2(20,0); 
        }else if(keyWentDown("w")){
            writePosition2(0,-20); 
        }else if(keyWentDown("d")){
            writePosition2(0,20); 
        }else if(keyWentDown(UP_ARROW)){
            writePosition1(0,-20); // up
        }else if(keyWentDown(DOWN_ARROW)){
            writePosition1(0,20);  // down
        }

        if(player2.x<150){//gameState becomes 0 and game restarts if player2 crosses left border of player1
            database.ref('/').update({
                'player1Score': player1Score+5,//player1 loses scoe
                'player2Score': player2Score-5,//player2 gains score                
                'toss':2,
                'gameState' : 0,//game goes back to starting 
               // 'msg':1
            })
        }

        //player2(YELLOW) wins when player1 touches player2
        if(player1.isTouching(player2)){
            database.ref('/').update({              
                'player1Score': player1Score-5,
                'player2Score': player2Score+5,
                'toss':2,
                'gameState':0,
                //'msg':1
            });

            alert("YELLOW LOST");
        }
    }

        if(player1Score===30 || player2Score===30){
            fill("black");
            textSize(24);
            if(player1Score===30){
                text("Red Won the Game!!!!!!!",180,150);
            }
            if(player2Score===30){
                text("Yellow Won the Game!!!!!!!",180,150);
            }
            text("Press 'R'' to restart",180,200);
            
                database.ref('/').update({
                
                'gameState' : 3 //game goes back to starting 
            })
        }
        if(keyWentDown("r") && gameState===3){
            
            database.ref('/').update({
                'player1Score': 0,//player1 score reset
                'player2Score': 0,//player2 score reset
                'toss':0,
               // 'msg':0,
                'gameState' : 0 //game goes back to starting 
               
            })
        }
    

textSize(15);
fill("yellow");
//stroke("black");
text("YELLOW: "+player1Score,350,15);
fill("red");
text("RED: "+player2Score,150,15);

//draw line at centre
drawline();

//draw line at left
drawline1();

//draw line at right
drawline2();

drawSprites();

}

function readtoss(data){
    toss=data.val();
}

function readPosition1(data){
    position1=data.val();
    player1.x=position1.x;
    player1.y=position1.y;
}

function readPosition2(data){
    position2=data.val();
    player2.x=position2.x;
    player2.y=position2.y;
}

function readState(data){
    gameState=data.val();
}

function readScore1(data1){
    player1Score=data1.val();
}

function readScore2(data2){
    player2Score=data2.val();
}

function showError(){
    console.log("Error in writing to the database");
}
function writePosition1(x,y){
    database.ref('player1/position').set({
        'x':position1.x+x,
        'y':position1.y+y
    });
}

function writePosition2(x,y){
    database.ref('player2/position').set({
        'x':position2.x+x,
        'y':position2.y+y
    });
}
function drawline(){
    for(var i=0;i<600;i=i+20){
        line(300,i,300,i+10);
    }
}
function drawline1(){
    for(var i=0;i<600;i=i+20){
        stroke("yellow");
        strokeWeight(4);
        line(100,i,100,i+10);
    }
}

function drawline2(){
    for(var i=0;i<600;i=i+20){
        stroke("red");
        strokeWeight(4);
        line(500,i,500,i+10);
    }
}

/*function readmsg(data){
    msg=data.val();
}*/
