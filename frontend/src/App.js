import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { AuthState } from "./states/AuthState";
import Adddoc from "./components/Adddoc";
import Docs from "./components/Docs";
import { TokenState } from "./states/TokenState";
import Complain from "./components/Complain";

function App() {
  const [loading, setLoading] = useState(true);
  const auth = useRecoilValue(AuthState);
  const setAuth = useSetRecoilState(AuthState);
  const setToken = useSetRecoilState(TokenState);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuth(true);
      setToken(token);
    }
    setLoading(false);
  }, [setAuth, setToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={loading ? "loading" : auth ? <Docs /> : <Login />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/addoc" element={<Adddoc />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/missing" element={<Complain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
