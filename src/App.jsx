import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import VisualizerPage from './pages/VisualizerPage';
import QuestionsPage from './pages/QuestionsPage';
import CodeEditorPage from './pages/CodeEditorPage';
import PlaygroundPage from './pages/PlaygroundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'visualizer', element: <VisualizerPage /> },
      { path: 'questions', element: <QuestionsPage /> },
      { path: 'editor', element: <CodeEditorPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
