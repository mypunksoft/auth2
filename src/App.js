import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./Screens/Signin";
import SignUp from "./Screens/Signup";
import Home from "./Screens/Home";
import SecurityQuestions from "./Screens/SecurityQuestions"; 
import SecurityAns from "./Screens/SecurityAns";
function App() {
  const email = localStorage.getItem("email");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<SignIn />} />
          <Route path="/Signup" element={<SignUp />} />
          <Route path="/security-questions" element={<SecurityQuestions />} />

          <Route path="/Home" element={email ? <Home /> : <Navigate to="/" />} />
          <Route 
            path="/securityans" 
            element={<SecurityAns />} />
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
