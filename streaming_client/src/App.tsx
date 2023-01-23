import { BrowserRouter, Routes, Route } from "react-router-dom";

import SocketHandler from "@components/SocketHandler";
import EntryPoint from "@pages/Entrypoint";
import Main from "@pages/Main";
import Room from "@pages/Room";
import NotFound from "@pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <SocketHandler>
        <Routes>
          <Route path="/" element={<Main />}></Route>
          <Route path="/entrypoint" element={<EntryPoint />}></Route>
          <Route path="/room" element={<Room />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </SocketHandler>
    </BrowserRouter>
  );
};

export default App;
