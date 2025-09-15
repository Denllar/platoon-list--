import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home"
import HomeInfo from "../pages/HomeInfo";
import PlatoonTable from "../components/PlatoonTable"

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route index element={<HomeInfo />} />
                    <Route path=":id" element={<PlatoonTable />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
