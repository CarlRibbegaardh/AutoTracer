import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AppThemeProvider } from "./theme/AppThemeProvider";
import { AppLayout } from "./features/shared";
import { DashboardPage } from "./pages/DashboardPage";
import { SeatReservationTracePage } from "./pages/SeatReservationTracePage";
import { TasksPage } from "./pages/TasksPage";
import { WeatherStationPage } from "./pages/WeatherStationPage";
import { StartPage } from "./pages/StartPage";

/**
 * Main application component
 */
export const App = () => {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<StartPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/trace-lab" element={<SeatReservationTracePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/weather" element={<WeatherStationPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppThemeProvider>
    </Provider>
  );
};
