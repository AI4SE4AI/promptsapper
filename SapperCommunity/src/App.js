import React, {useState} from "react";
import {TopNavBar, BottomNavBar} from "./NavBar";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
} from "react-router-dom";
import AddStructuredPrompt from "./AddStructuredPrompt";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import BuildStructuredPrompt from "./BuildStructuredPrompt";

const HomePage = () => {
    return (
        <div>
            <div className="title-wrap container">
                <h1 className="title">Sapper Community Version</h1>
                <h2 className="subtitle">A Pattern-Oriented Language for Structured Prompting</h2>
                <div className="btn-group" role="group">
                    <Link type="button" to="/BuildPrompt" className="btn btn-title">
                        <i
                        className="fa fa-plus" style={{marginRight: "15px"}}
                        >
                        </i>
                        Create Prompt</Link>
                </div>
            </div>
            <BottomNavBar />
        </div>
    );
}

export default function App() {
  return (
    <Router>
        <div>
            <TopNavBar/>
        </div>
      <div>
        <Routes>
          <Route path="*" element={<BuildStructuredPrompt />} />
          {/*<Route path="*" element={<AddStructuredPrompt />} />*/}
          {/*<Route path="*" element={<HomePage />} />*/}
        </Routes>
      </div>
    </Router>
  );
}
