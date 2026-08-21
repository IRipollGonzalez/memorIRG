import { Route, Routes } from "react-router-dom";

import { StudyPage } from "@/pages/StudyPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<StudyPage />} />
    </Routes>
  );
}
