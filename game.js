//---------------------------------variable declarations here -----------------
var canvasBg=document.getElementById('canvasBg');
var canvasPest=document.getElementById('canvasPest');
var ctxBg=canvasBg.getContext('2d');
var ctxPest=canvasPest.getContext('2d');
var accuracy=50;
var imgSprite= new Image();
imgSprite.src="images/complete.png";
imgSprite.addEventListener('load',init,false);// ???
var gameWidth=canvasBg.width;
var gameHeight=canvasBg.height;
var isPlaying;
var requestAnimFrame= window.requestAnimationFrame ||
                      window.webkitRequestAnimationFrame ||
                      window.mozRequestAnimationFrame ||
                      window.msRequestAnimationFrame ||
                      window.mozRequestAnimationFrame ||
                      function(callBack){
                        window.setTimeout(callBack,1000/60);
                      }

var pests=[];     //array of enemies
var explosions=[];  //explosions for effect
var mouseX;
var mouseY;
var playButton=new Button(270,550,290,360);
var pestAmount=1;
var pestRate=800;
var pestInterval;
var score=0;
var limit=50;
/*
var spawnInterval;   //interval at which enemies enter
var totalEnemies=0;
var spawnRate=2000; //time difference between consecutive entries
var spawnAmount=2;   //no. of enemies entering once
*/
//---------------------------------variable declarations end -----------------

//-----------------------------------main functions begin -----------------------
function init(){
    drawMenu();    
    document.addEventListener('click',mouseClicked,false);
}
function mouseClicked(e){
    mouseX=e.pageX - canvasBg.offsetLeft;
    mouseY=e.pageY - canvasBg.offsetTop;
    if(!isPlaying&&playButton.checkClicked())playGame();
    else if(isPlaying){
        checkPestKilled();
        //addNewExplosion(1,mouseX,mouseY);//alert(explosions.length);
    }
}
function playGame(){
    drawBg();
    startLoop();  
}
function checkPestKilled(){
    for(var ctr=0;ctr<pests.length;ctr++){
        pests[ctr].checkPestKilled();
    }
}
function updateExplosions(){
    for(var ctr=0;ctr<explosions.length;ctr++){
        explosions[ctr].removeIfOver();
    }
}
function addNewExplosion(effectType,x,y){
    explosions[explosions.length]=new Explosion(effectType,x,y);
}
function startLoop(){
    isPlaying=true;
    startPesting();
    loop();
    //initialize scores and else
    
}

function stopLoop(){
    isPlaying=false;
    //change screen.
    stopPesting();
}

function pauseGame(){
    isPlaying=false;
    stopPesting();
}
function resumeGame(){
    isPlaying=true;
    loop();
}

function loop(){
    if(isPlaying){
        drawBg();
        drawAllPests();
        updateLife();
        updateExplosions();
        drawAllExplosions();
        requestAnimFrame(loop);
    }
}

function drawMenu(){
    var srcX=0;
    var srcY=580;
    var drawX=0;
    var drawY=0;
    ctxBg.drawImage(imgSprite,srcX,srcY,gameWidth,gameHeight,drawX,drawY,gameWidth,gameHeight);
}

function drawBg(){
    var srcX=0;
    var srcY=0;
    var drawX=0;
    var drawY=0;
    ctxBg.drawImage(imgSprite,srcX,srcY,gameWidth,gameHeight,drawX,drawY,gameWidth,gameHeight);
}

function clearCtxBg(){
    ctxBg.clearRect(0,0,gameWidth,gameHeight);
}

function startPesting(){
    stopPesting();
    pestInterval=setInterval(function(){doPest(pestAmount);}, pestRate);
}

function stopPesting(){
    clearInterval(pestInterval);
}

function doPest(n){
    for(var ctr=0;ctr<n;ctr++){
        pests[pests.length]=new Pest();
    }
}

function drawAllPests(){
    clearCtxPest();
    for(var ctr=0;ctr<pests.length;ctr++){
        pests[ctr].draw();
    }
}
function drawAllExplosions(){
    //clearCtxPest();
    for(var ctr=0;ctr<explosions.length;ctr++){
        explosions[ctr].draw();
    }
}
//-----------------------------------main functions end -----------------------

//-----------------------------------button functions begin -------------------
function Button(xL,xR,yT,yB){
    this.xRight=xR;
    this.xLeft=xL;
    this.yTop=yT;
    this.yBottom=yB;
}

Button.prototype.checkClicked=function(){
    if(mouseX>=this.xLeft &&
        mouseX<=this.xRight &&
        mouseY>=this.yTop &&
        mouseY<=this.yBottom)return true;
    else return false;
}

//-----------------------------------button functions end ---------------------

//-----------------------------------Enemy functions begin -----------------------
//Jet class
function Pest(){
    this.srcX=0;
    this.srcY=500;
    this.drawX=Math.floor(Math.random()*gameWidth);
    this.drawY=Math.floor(Math.random()*gameHeight);
    this.width=20;
    this.height=20;
    this.gene=Math.floor(Math.random()*2.99);   // Pest's gene  is 0,1 or 2
    this.srcX+=this.gene*this.width;    // Draw different pest based on its gene
}

Pest.prototype.draw= function(){
    ctxPest.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
}

Pest.prototype.checkPestKilled= function(){
    //alert("called\n"+this.drawX+" "+this.drawY+" "+mouseX+" "+mouseY);
    if(mouseX>=this.drawX- accuracy&&
        mouseX<=this.drawX+accuracy &&
        mouseY>=this.drawY-accuracy &&
        mouseY<=this.drawY+accuracy){this.removePest();return true;}
    else return false;
}
Pest.prototype.removePest= function(){
    pests.splice(pests.indexOf(this),1);
    addNewExplosion(0,this.drawX+(this.width/2),this.drawY+(this.height/2));
    score++;
    document.getElementById("score").innerHTML=score;
}
function updateLife(){
    if(limit<pests.length){
        stopPesting();
        isPlaying=false;
        alert("Sorry bro! Game Over!!!\nReload to play again.");
    }
    else document.getElementById("life").innerHTML=(limit-pests.length);
}
function clearCtxPest(){
    ctxPest.clearRect(0,0,gameWidth,gameHeight);
}

//-----------------------------------Pest functions end -----------------------


//-----------------------------------Explosion functions begin ----------------
function Explosion(effectType,x,y){ // effectType is 0 for mist and 1 for fire
    this.srcX=120;
    this.srcY=500;
    this.width=50;
    this.height=50;
    this.drawX=x-(this.width/2);
    this.drawY=y-(this.height/2);
    this.currentFrame=0;
    this.totalFrames=10;
    this.srcX+=effectType*this.width;
    if(effectType==1)this.width=70;
    this.over=false;
}

Explosion.prototype.draw= function(){
    if(this.currentFrame<this.totalFrames){
        ctxPest.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
        this.currentFrame++;
    }
    else{
        this.over=true;
        this.currentFrame=0;
    }
}

Explosion.prototype.removeIfOver= function(){
    if(this.over)
        explosions.splice(explosions.indexOf(this),1);
}
//-----------------------------------Explosion functions end ----------------
