import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';

// PAGES:
import Home from './pages/Home';

// UTILS:
import ScrollToTop from './utils/ScrollToTop';
import ContinuityFinder from "./pages/ContinuityFinder";

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout body={<Home />} />} />
          <Route path="/test" element={<Layout body={<ContinuityFinder />} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;