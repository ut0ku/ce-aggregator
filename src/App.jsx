import VolnaApp from './volna/VolnaApp.jsx';
import { AuthProvider } from './volna/authContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <VolnaApp />
    </AuthProvider>
  );
}