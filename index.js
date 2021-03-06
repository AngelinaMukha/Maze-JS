const { Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const engine = Engine.create();
engine.world.gravity.y=0;
const { world } = engine;

const cellsHorizontals=15;
const cellsVertical=10;
const width=window.innerWidth-20;
const height=window.innerHeight-20;
console.log(document);

const unitLengthX = width/cellsHorizontals;
const unitLengthY = height/cellsVertical;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);


//Walls
const walls=[
  Bodies.rectangle(width/2, 0, width, 2,{ isStatic: true}),
  Bodies.rectangle(width/2,height,width,2, { isStatic: true}),
  Bodies.rectangle(0,height/2,2,height,{ isStatic: true}),
  Bodies.rectangle(width,height/2,2,height,{ isStatic: true}),

];
World.add(world, walls);

// Maze generation
const shuffle= (arr) =>{
  let counter =arr.length;
  while(counter>0){
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp =arr[counter];
    arr[counter]=arr[index];
    arr[index]=temp;
  }
  return arr;
};

const grid =Array(cellsVertical)
  .fill(null)
  .map(() =>Array(cellsHorizontals).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(()=>Array(cellsHorizontals-1).fill(false));

const horizontals = Array(cellsVertical-1)
  .fill(null)
  .map(()=> Array(cellsHorizontals).fill(false));

const startRow =Math.floor(Math.random() * cellsVertical);
const startColumn =Math.floor(Math.random() * cellsHorizontals);

const stepThroughCell = (row, column)=>{
  //If I have viseted the cell at [row, column], then return;
  if(grid[row][column]){
    return;
  }
  //Mark this cell as being visited
  grid[row][column] =true;

  //Assemble randomly-ordered list of neighbors
  const neighbours=shuffle([
    [row-1, column, 'up'],
    [row, column+1,'right'],
    [row+1, column, 'down'],
    [row, column-1, 'left']
  ]);

  //for each neighbor...
  for(let neighbour of neighbours){
    const [nextRow, nextColumn, direction] = neighbour;

  //see if that neighbor is out of bounds
  if(nextRow < 0 ||
     nextRow>=cellsVertical || 
     nextColumn < 0 || 
     nextColumn>=cellsHorizontals){
    continue;
  }
  // If we have visited that neighbor, continue to next neighbor
  if(grid[nextRow][nextColumn]){
    continue;
  }
  //Remove a wall from either horizontals or verticals
  if(direction === 'left'){
    verticals[row][column-1]=true;
  }else if(direction === 'right'){
    verticals[row][column]=true;
  }
  if(direction === 'up'){
    horizontals[row-1][column] = true;
  }else if(direction === 'down'){
    horizontals[row][column] = true;
  }
  stepThroughCell(nextRow,nextColumn);
  }
  //Visit that next cell
  
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex)=>{
  row.forEach((open, columnIndex)=>{
    if(open){
      return;
    }
    const wall = Bodies.rectangle(columnIndex*unitLengthX + unitLengthX/2,
      rowIndex*unitLengthY + unitLengthY,
       unitLengthX,5, {
      isStatic: true,
      label: 'wall',
      render:{
        fillStyle: 'Indigo'
      }
    });
    World.add(world,wall);
  });
});

verticals.forEach((row, rowIndex)=>{
  row.forEach((open, columnIndex)=>{
    if(open){
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex*unitLengthX + unitLengthX,
      rowIndex*unitLengthY + unitLengthY/2,
       5,unitLengthY, {
      isStatic: true,
      label: 'wall',
      render:{
        fillStyle: 'Indigo'
      }
    });
    World.add(world,wall);
  });
});
const goalSize = Math.min(unitLengthX, unitLengthY)*0.7;
const goal = Bodies.rectangle(
  width-unitLengthX/2,
  height-unitLengthY/2,
  goalSize,
  goalSize,
  {isStatic: true,
    render:{
      fillStyle: 'GreenYellow'
    },
    label: 'goal'
  },
);
World.add(world,goal);

//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY)/4;
const ball=Bodies.circle(
  unitLengthX/2,
  unitLengthY/2,
  ballRadius,
  {//isStatic: true,
    render:{
      fillStyle: 'Gold'
    },
    label: 'ball'
  }
);
World.add(world,ball);

document.addEventListener('keydown', event =>{
  const {x,y}=ball.velocity;
  if(event.keyCode === 38){
    Body.setVelocity(ball, {x,y:y-5});
  }
  if(event.keyCode === 40){
    Body.setVelocity(ball, {x,y:y+5});
  }
  if(event.keyCode === 37){
    Body.setVelocity(ball, {x:x-5,y});
  }
  if(event.keyCode === 39){
    Body.setVelocity(ball, {x:x+5,y});
  }
}
);

//Winn condition 

Events.on(engine, 'collisionStart', event=>{
 event.pairs.forEach(((collision)=>{
   const labels =['ball', 'goal'];
   if(labels.includes(collision.bodyA.label) &&
   labels.includes(collision.bodyB.label)){
     document.querySelector('.winner').classList.remove('hidden');
     world.bodies.forEach((body)=>{
       if(body.label ==='wall'){
        Body.setStatic(body, false);
       }
     })
     world.gravity.y=1;
   }
 }))
});