import { BrowserRouter, Routes, Route } from "react-router-dom";
/* {{AUTH_IMPORTS}} */
import Home from "./Home";

function App() {
  return (
    /* {{AUTH_PROVIDER_START}} */
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        /* {{AUTH_ROUTES}} */
      </Routes>
    </BrowserRouter>
    /* {{AUTH_PROVIDER_END}} */
  );
}

export default App;