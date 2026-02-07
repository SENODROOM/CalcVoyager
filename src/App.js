import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';

// PAGES:
import Home from './pages/Home';

// UTILS:
import ScrollToTop from './utils/ScrollToTop';

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout body={<Home />} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;