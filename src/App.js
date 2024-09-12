import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Settings from './pages/settings';
import Editor from './pages/editor';
import ArticlePage from './pages/ArticlePage'; // Đổi từ Article sang ArticlePage
import Profile from './pages/profile';

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:slug" element={<Editor />} />
        <Route path="/article/:slug" element={<ArticlePage />} /> {/* Sử dụng ArticlePage */}
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
