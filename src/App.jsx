import MelodySketcher from './components/MelodySketcher';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <MelodySketcher />
      </ErrorBoundary>
    </div>
  );
}

export default App;
