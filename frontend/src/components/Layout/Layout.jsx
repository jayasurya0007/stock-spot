
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Container from '@mui/material/Container';

const Layout = () => {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <main>
          <Outlet />
        </main>
      </Container>
    </>
  );
};

export default Layout;