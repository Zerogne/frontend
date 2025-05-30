import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx'
import Popular from './pages/Popular.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/SignUp.jsx';
import SearchResults from './pages/SearchResults.jsx';
import Profile from './pages/Profile.jsx';
import TopRated from './pages/TopRated.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/topRated" element={<TopRated />} />
      </Routes>
    </Router>
  );
}

export default App;