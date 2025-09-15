import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Router from './routes/index';

function App() {
  return (
    <MantineProvider>
      <Router />
    </MantineProvider>
  )
}

export default App
