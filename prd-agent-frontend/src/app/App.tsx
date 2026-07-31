import { AppRoutes } from "@/shared/routes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  DropzoneProvider,
  GtagProvider,
  ToastProvider,
  UserProvider,
} from "@/app/providers";
import { gtagId } from "@/shared/config";
import { Home } from "@/pages/home";

function App() {
  return (
    <GtagProvider gtagId={gtagId}>
      <UserProvider>
        <DropzoneProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Home />} path={AppRoutes.Home} />
                <Route element={<Navigate to={AppRoutes.Home} />} path="*" />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </DropzoneProvider>
      </UserProvider>
    </GtagProvider>
  );
}

export default App;
