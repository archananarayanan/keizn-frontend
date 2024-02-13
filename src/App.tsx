import React from 'react';
import logo from './logo.svg';
import './App.css';
import Signin from './Signin';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Register from './Register';
import ForgotPassword from './ForgotPass';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Dashboard from './Dashboard';

function App() {
  const token = localStorage.getItem('accessToken');

  return (
    <div className="text-neutral-500">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Signin/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/forgot-pass' element={<ForgotPassword />} />
          <Route path='/dashboard' element={<Dashboard/>} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
}

export default App;
