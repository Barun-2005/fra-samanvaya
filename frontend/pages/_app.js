import '../src/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { AuthProvider } from '../src/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import FraBot from '../src/components/Assistant/FraBot';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <FraBot />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp;
