import React, { Suspense, lazy } from 'react';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext.jsx';
import { CollectionProvider } from './context/CollectionContext.jsx';

import Navbar from './components/Navbar.jsx';
import RouteSkeleton from './components/RouteSkeleton.jsx';
import AccessGate from './routes/AccessGate.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Recommend = lazy(() => import('./pages/Recommend.jsx'));
const Games = lazy(() => import('./pages/Games.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Library = lazy(() => import('./pages/Library.jsx'));
const AdminPanel = lazy(() => import('./pages/Adminpanel.jsx'));
const EditSlider = lazy(() => import('./pages/EditSlider.jsx'));
const GameDetail = lazy(() => import('./pages/Gamedetail.jsx'));

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CollectionProvider>
          <div className="app-shell">
            <Navbar />
            <Suspense fallback={<RouteSkeleton />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/getGame/:id" element={<GameDetail />} />

                <Route element={<AccessGate allowGuests />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                <Route element={<AccessGate />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/recommend" element={<Recommend />} />
                  <Route path="/library" element={<Library />} />
                </Route>

                <Route element={<AccessGate allowedRoles={['admin']} fallbackPath="/dashboard" />}>
                  <Route path="/adminpanel" element={<AdminPanel />} />
                  <Route path="/admin/edit-slider" element={<EditSlider />} />
                </Route>

                <Route
                  path="*"
                  element={
                    <div className="page-shell">
                      <div className="page-container flex min-h-[70vh] items-center justify-center">
                        <div className="section-card w-full max-w-[32rem] px-6 py-10 text-center sm:px-10">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl font-black text-cyan-300">
                            404
                          </div>
                          <h1 className="page-subtitle mb-3">Page Not Found</h1>
                          <p className="page-copy">
                            The page you requested is not part of this quest log.
                          </p>
                          <Link
                            to="/"
                            className="btn-solid mx-auto mt-6"
                          >
                            Back to home
                          </Link>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </div>
        </CollectionProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
