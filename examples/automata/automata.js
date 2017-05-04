// Original source: https://github.com/tonylukasavage/Automata
// This example was initially developed to showcase Titanium performance characteristics
// The author himself explains that Titanium is not well suited for this kind of application
// It resides in this example directory because we wanted to get an idea how this
// performs with Tabris.js

let height = tabris.ui.contentView.bounds.height;
let width = tabris.ui.contentView.bounds.width;
let CELL_SIZE = Math.floor(Math.min(height,width) / 30);
let xSize = width / CELL_SIZE;
let ySize = height / CELL_SIZE;
let universe = tabris.ui.contentView.set({
  background: '#000'
});

function getNextState(x, y, alive) {
  let count = 0,
    xm1 = x > 0,
    xp1 = x + 1 < xSize,
    ym1 = y > 0,
    yp1 = y + 1 < ySize;

  if (xm1) {
    if (ym1 && cells[x - 1][y - 1].lastAlive) { count++; }
    if (cells[x - 1][y].lastAlive) { count++; }
    if (yp1 && cells[x - 1][y + 1].lastAlive) { count++; }
  }
  if (xp1) {
    if (ym1 && cells[x + 1][y - 1].lastAlive) { count++; }
    if (cells[x + 1][y].lastAlive) { count++; }
    if (yp1 && cells[x + 1][y + 1].lastAlive) { count++; }
  }
  if (ym1 && cells[x][y - 1].lastAlive) { count++; }
  if (yp1 && cells[x][y + 1].lastAlive) { count++; }

  return (alive && (count === 2 || count === 3)) || (!alive && count === 3);
}

// seed the grid
let cells = [];
for (let x = 0; x < xSize; x++) {
  cells[x] = [];
  for (let y = 0; y < ySize; y++) {
    let alive = Math.random() >= 0.5;
    cells[x][y] = {
      proxy: new tabris.Composite({
        height: CELL_SIZE,
        width: CELL_SIZE,
        background: '#fff',
        top: y * CELL_SIZE,
        left: x * CELL_SIZE,
        visible: alive
      }),
      lastAlive: alive,
      alive: alive
    };
    universe.append(cells[x][y].proxy);
  }
}

// add FPS label
let label = new tabris.TextView({
  text: 'FPS: ',
  textColor: '#fff',
  background: '#a00',
  height: 40,
  width: 80,
  top: 0,
  left: 0,
  alignment: 'center',
  opacity: 0.8
});
universe.append(label);

let lastTime = new Date().getTime(),
  renderTime = 0,
  ctr = 0,
  thisTime;

let x, y, cell;
function render () {
  // render current generation
  for (x = 0; x < xSize; x++) {
    for (y = 0; y < ySize; y++) {
      cell = cells[x][y];

      // minimize number of times we need to modify the proxy object
      if (cell.alive !== cell.lastAlive) {
        cell.proxy.visible = cell.alive;
      }

      // save the state
      cell.lastAlive = cell.alive;
    }
  }

  // build next generation
  for (x = 0; x < xSize; x++) {
    for (y = 0; y < ySize; y++) {
      cell = cells[x][y];
      cell.alive = getNextState(x, y, cell.lastAlive);
    }
  }

  thisTime = new Date().getTime();
  renderTime += thisTime - lastTime;
  lastTime = thisTime;

  // Sadly this shows that the "render" time, which consists solely of changing the visible
  // state of the proxies, consumes about 100x as much time as the "generation" step.
  if (++ctr % 10 === 0) {
    label.text = 'FPS: ' + Math.round(10000.0 / (renderTime / ctr)) / 10;
    renderTime = ctr = 0;
  }
  setTimeout(render, 0);
}

render();
