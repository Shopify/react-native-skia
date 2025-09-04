import { Canvas, Fill, } from '@shopify/react-native-skia';
function App() {
  console.log({ CanvasKit});
  
  const canvases = [];
  for (let i = 0; i < 20; i++) {
    canvases.push(
      <div key={i} style={{ margin: '10px', display: 'inline-block' }}>
        <h4>Canvas {i + 1}</h4>
        <Canvas style={{ width: 200, height: 200,  }}>
          <Fill color={`hsl(${(i * 18) % 360}, 70%, 50%)`} />
        </Canvas>
      </div>
    );
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>WebGL Canvas Stress Test</h1>
        <p>
          Testing how many WebGL canvases this browser can support (20 total).
        </p>
      </header>
      <main>
        <h2>20 Skia WebGL Canvases</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {canvases}
        </div>
      </main>
    </div>
  );
}


export default App;