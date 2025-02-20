import { Route, Routes, Link } from 'react-router-dom';
import { Header } from './components/Header/Header';

export const Options = () => {
  return (
    <>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/signup/signup">Signup/Signup</Link>
        </li>
        <li>
          <Link to="/signup">Signup</Link>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/login" element={<div>LoginForm</div>} />
        <Route path="/signup" element={<div>Signup</div>}>
          <Route path="signup" element={<Header />} />
        </Route>
        <Route path="/signup" element={<div>Signup/Signup</div>} />
      </Routes>
    </>
  );
};
