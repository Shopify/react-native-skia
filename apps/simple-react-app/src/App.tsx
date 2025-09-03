import { Canvas, Fill, } from '@shopify/react-native-skia';
function App() {
  console.log({ CanvasKit});
  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple React App with Skia</h1>
        <p>
          This is a basic React application using react-native-skia from the workspace.
        </p>
      </header>
      <main>
        <h2>Skia Canvas Example</h2>

        <p>
          Above is a simple Skia canvas with two circles rendered using react-native-skia.
        </p>
        <Canvas style={{ width: 400, height: 400 }}>
          <Fill color="pink" />
        </Canvas>
      </main>
    </div>
  );
}


export default App;