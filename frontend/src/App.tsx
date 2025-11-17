import React from 'react';
import { TaskList } from './components/TaskList';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const theme = {
  bg: '#0f172a',
  surface: 'rgba(255, 255, 255, 0.05)',
  card: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#f1f5f9',
  primary: '#3b82f6',
  accent: '#60a5fa',
  danger: '#ef4444',
};

const GlobalStyle = createGlobalStyle`
  body {
    background: #0f172a;
    color: ${theme.text};
    font-family: 'Inter', sans-serif;
  }
`;

const Container = styled.div`
  max-width: 1700px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled(motion.header)`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 3.8rem;
  font-weight: 900;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -2px;
  margin: 0px;
`;

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Toaster position="top-right" />
      <Container>
        <Header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Title>Data Insight</Title>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Full-Stack Demo • Django + React (with TypeScript)
          </motion.p>
        </Header>

        <TaskList />
      </Container>
    </ThemeProvider>
  );
}