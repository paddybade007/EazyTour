// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import Details from './pages/Details'; // Agar Details.jsx bana li hai toh
// import Login from './pages/Login'; // ✅ Ye line missing hogi, ise add karo
// import AddTour from './pages/AddTour'
// // import ConfigManager from './pages/ConfigManager';


// function App() {
//   return (
//     <Router>
//       <div className="font-sans">
//         <Routes>

//           <Route path="/" element={<Home />} />

//           <Route path="/login" element={<Login />} /> 

//           <Route path="/details/:id" element={<Details />} />
          
//           <Route path="*" element={<Home />} />

//           <Route path="/admin/add" element={<AddTour />} />

//           {/* <Route path="/admin/configs" element={<ConfigManager />} /> */}

//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;




// SAHI CODE NEECHAY HAI, UPPER WAALA THODA PURANA HAI
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Details from './pages/Details';
import Login from './pages/Login'; 
import AddTour from './pages/AddTour';

function App() {
  return (
    <Router>
      <div className="font-sans">
        {/* Agar tum yahan Header dalte toh wo har page par dikhta, 
            lekin tumhare Header ko Home.jsx se kaafi props chahiye, 
            isliye usey Home.jsx ke andar hi rehne dena sahi hai. */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/details/:id" element={<Details />} />
          <Route path="/admin/add" element={<AddTour />} />
          
          {/* Ye default route hai jo galat URL par Home par bhej dega */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;