function initGame(){
  let canvas = document.getElementById('canvas');
  let message = document.getElementById('message');
  let offset = 0;
  let raster = 30;
  let lineheight = 300;
  let blocks = [];
  let colors = ['red','blue']
  let ghostColors = ['#FFaaaa','#aaaaFF']
  let streakColor = 'yellow';
  let streakWidth = 9;
  let player = 0;
  let newOffset = undefined;
  let state = 'play';
  let snappingDist = 15;
  let validMoves = undefined;
  let currentMove = undefined;
  let leftEdge = undefined;
  let rightEdge = undefined;
  let speed = 6;
  let streaks = [];

  let centerSquare = function(x,y){
    return {
      x: x*raster + offset + canvas.width/2 + raster/2,
      y: lineheight - raster/2 - raster*y
    }
  }

  let centerBlock = function(block){
    if(block.horizontal){
      return {
        x: block.x*raster + offset + canvas.width/2 + raster,
        y: lineheight - raster/2 - raster*block.y
      }
    }
    else{
      return {
        x: block.x*raster + offset + canvas.width/2 + raster/2,
        y: lineheight - raster*(block.y+1)
      };
    }
  }

  let cornerBlock = function(block){
    if(block.horizontal){
      return {
        x: block.x*raster + offset + canvas.width/2,
        y: lineheight - raster*(block.y+1)
      }
    }
    else{
      return {
        x: block.x*raster + offset + canvas.width/2,
        y: lineheight - raster*(block.y+2)
      }
    }
  }
  
  let declareWinner = function(){
    if(state === 'draw'){
      message.innerText = 'draw';
    }
    if(state === 'win'){
      if(player === 0){
        message.innerText = 'red wins!'
        message.style.color = 'red';
      }
      else{
        message.innerText = 'blue wins!'
        message.style.color = 'blue';
      }
    }
  }
  
  let computeValidMoves = function(){
    let list=[];
    let leftMoveEdge = -8;
    if(rightEdge !== undefined){
      leftMoveEdge = rightEdge - 8;
    }
    let rightMoveEdge = 8;
    if(leftEdge !== undefined){
      rightMoveEdge = leftEdge + 8;
    }
    heights = []
    for(let i=leftMoveEdge;i<=rightMoveEdge;i++){
      heights.push(0);
    }
    for(let i=0;i<blocks.length;i++){
      if(blocks[i].horizontal){
        let index = blocks[i].x - leftMoveEdge;
        let height = blocks[i].y+1;
        heights[index] = Math.max(heights[index],height);
        heights[index+1] = Math.max(heights[index+1],height);
      }
      else{
        let index = blocks[i].x - leftMoveEdge;
        let height = blocks[i].y+2;
        heights[index] = Math.max(heights[index],height);
      }
    }
    for(let i=leftMoveEdge;i<=rightMoveEdge;i++){ //vertical
      height = heights[i-leftMoveEdge];
      if(height + 2 <= 9){
        let allowed = true;
        for(let j = 0; j<blocks.length; j++){
          if(blocks[j].player === player
              && blocks[j].x === i
              && blocks[j].y === height-2){
            allowed=false;
            break;
          }
        }
        if(allowed){
          list.push({
              x:i,
              y:height,
              player: player,
              horizontal: false
            });
        }
      }
    }
    for(let i=leftMoveEdge;i<=rightMoveEdge-1;i++){ //horizontal
      height1 = heights[i-leftMoveEdge];
      height2 = heights[i-leftMoveEdge+1];
      if(height1 === height2 && height1 + 1 <= 9){
        let allowed = true;
        for(let j = 0; j<blocks.length; j++){
          if(blocks[j].player === player
              && blocks[j].horizontal
              && (blocks[j].x === i-2 || blocks[j].x === i+2)
              && blocks[j].y === height1){
            allowed=false;
            break;
          }
        }
        if(allowed){
          list.push({
              x:i,
              y:height1,
              player: player,
              horizontal: true
            });
        }
      }
    }
    validMoves = list;
    if(validMoves.length>0){
      state = 'play';
    }
    else{
      state = 'draw';
      declareWinner();
    }
  }

  let renderBlock = function(ctx,block,ghost){
    ctx.beginPath();
    if(ghost){
      ctx.fillStyle = ghostColors[block.player];
    }
    else{
      ctx.fillStyle = colors[block.player];
    }
    ctx.strokeStyle = "black";
    let corner = cornerBlock(block);
    if(block.horizontal){
      ctx.rect(corner.x, corner.y, raster*2, raster);
      //ctx.rect(offset + canvas.width/2 + block.x*raster,
      //         lineheight - block.y*raster - raster,raster*2,raster);
    }
    else{
      ctx.rect(corner.x, corner.y, raster, raster*2);
      //ctx.rect(offset + canvas.width/2 + block.x*raster,
      //         lineheight - block.y*raster - raster*2,raster,raster*2);
    }
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  let render = function(){
    if(state === 'animation'){
      dir = Math.sign(newOffset - offset)
      offset = offset + dir * speed;
      if(dir === 0 || Math.sign(newOffset - offset) !== dir){
        offset = newOffset;
        computeValidMoves();
      }
    }
    let ctx = canvas.getContext("2d"); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let grd = ctx.createLinearGradient(0,0,canvas.width,0);
    grd.addColorStop(0,"white");
    grd.addColorStop(0.2,"white");
    grd.addColorStop(0.4,"black");
    grd.addColorStop(0.6,"black");
    grd.addColorStop(0.8,"white");
    grd.addColorStop(1,"white");

    ctx.fillStyle = grd;
    ctx.fillRect(0,lineheight,canvas.width,3);

    //for(let i=0;i<validMoves.length;i++){
    //  ctx.beginPath();
    //  ctx.fillStyle="black";
    //  center = centerBlock(validMoves[i]);
    //  ctx.arc(center.x,center.y,2,0,2*Math.PI);
    //  ctx.fill();
    //  ctx.closePath();
    //}
    for(let i=0; i<blocks.length; i++){
      renderBlock(ctx, blocks[i],false);
    }
    if(state === 'play' && currentMove !== undefined){
      renderBlock(ctx, currentMove,true);
    }
    for(let i=0; i<streaks.length; i++){
      ctx.beginPath();
      from = centerSquare(streaks[i].from.x, streaks[i].from.y);
      to = centerSquare(streaks[i].to.x, streaks[i].to.y);
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = streakColor;
      ctx.lineWidth = streakWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.lineCap = 'butt';
    }
     

  };
  let mouseMove = function(evt){
    if(state === 'play'){
      let rect = canvas.getBoundingClientRect();
      let mouseX = evt.clientX - rect.left;
      let mouseY = evt.clientY - rect.top;
      let best = undefined;
      let bestDist = undefined
      for(let i=0;i<validMoves.length;i++){
        center = centerBlock(validMoves[i]);
        let dSq = (mouseX - center.x)**2 + (mouseY - center.y)**2;
        if(dSq < snappingDist**2){
          if ((bestDist === undefined) || (dSq < bestDist)){
            bestDist = dSq;
            best = i;
          }
        }
      }
      if(best !== undefined){
        currentMove = validMoves[best];
      }
      else{
        currentMove = undefined;
      }
    }
  }
  let checkWin = function(block){
    let markings = []
    for(let i=leftEdge; i<=rightEdge; i++){
      markings.push([]);
      let index = i - leftEdge;
      for(let j=0; j<9; j++){
        markings[index].push(0);
      }
    }
    for(let i=0;i<blocks.length;i++){
      if(blocks[i].player === block.player){
        blockXIndex = blocks[i].x - leftEdge;
        blockYIndex = blocks[i].y;
        if(blocks[i].horizontal){
          markings[blockXIndex][blockYIndex] = 1;
          markings[blockXIndex+1][blockYIndex] = 1;
        }
        else{
          markings[blockXIndex][blockYIndex] = 1;
          markings[blockXIndex][blockYIndex+1] = 1;
        }
      }
    }
    let searchStreak = function(x,y,dx,dy){
      let getMarking = function(i,j){
        console.log(i,j);
        if(i<leftEdge || i>rightEdge){
          return 0;
        }
        else if(j<0 || j>8){
          return 0;
        }
        else{
          return markings[i-leftEdge][j];
        }
      }
      let right = 0;
      let left = 0;
      let i = x+dx;
      let j = y+dy;
      while(getMarking(i,j)){
        right+=1;
        i+=dx;
        j+=dy;
      }
      i = x-dx;
      j = y-dy;
      while(getMarking(i,j)){
        left+=1;
        i-=dx;
        j-=dy;
      }
      return {
        length: right+left+1,
        from: {x: x-left*dx, y: y-left*dy},
        to: {x: x+right*dx, y: y+right*dy}
      };
    }
    streaks = [];
    toCheck = [{x: block.x, y: block.y, dx: 1, dy: 1},
               {x: block.x, y: block.y, dx: 1, dy: -1},
               {x: block.x, y: block.y, dx: 1, dy: 0},
               {x: block.x, y: block.y, dx: 0, dy: 1}];
    if(block.horizontal){
      toCheck.push({x: block.x+1,y: block.y, dx:0, dy: 1});
      toCheck.push({x: block.x+1,y: block.y, dx:1, dy: 1});
      toCheck.push({x: block.x+1,y: block.y, dx:1, dy: -1});
    }
    else{
      toCheck.push({x: block.x,y: block.y+1, dx:1, dy: 0});
      toCheck.push({x: block.x,y: block.y+1, dx:1, dy: 1});
      toCheck.push({x: block.x,y: block.y+1, dx:1, dy: -1});
    }
    for(let i=0; i<toCheck.length; i++){
      let streak = searchStreak(toCheck[i].x, toCheck[i].y, toCheck[i].dx, toCheck[i].dy);
      if(streak.length >= 5){
        streaks.push(streak);
      }
    }
    return streaks;
  }
  let onClick = function(evt){
    if(currentMove !== undefined){
      let offsetChange = false;
      if(leftEdge === undefined || currentMove.x < leftEdge){
        leftEdge = currentMove.x;
      }
      let currentRightX = currentMove.x;
      if(currentMove.horizontal){
        currentRightX = currentRightX + 1;
      }
      if(rightEdge === undefined || currentRightX > rightEdge){
        rightEdge = currentRightX;
      }
      newOffset = -raster * (leftEdge + rightEdge)/2
      state = 'animation';

      blocks.push(currentMove);
      streaks = checkWin(currentMove);
      console.log(streaks);
      if(streaks.length > 0){
        state='win';
        declareWinner();
      }
      else{
        player = 1 - player;
        currentMove=undefined;
      }
    }
  }

  computeValidMoves();

  return {
    render: render,
    offset: offset,
    canvas: canvas,
    mouseMove: mouseMove,
    onClick: onClick
  };
}


function init(){
  game = initGame();
  game.canvas.addEventListener('mousemove', game.mouseMove);
  game.canvas.addEventListener('click', game.onClick);
  setInterval(game.render, 20);
}
