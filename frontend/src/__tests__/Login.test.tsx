// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

describe('Pruebas de Componentes - Pantalla de Login', () => {
  it('Debe renderizar los elementos de la interfaz', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    // Comprueba que el botón exista correctamente en la vista
    expect(screen.getByRole('button')).toBeTruthy();
  });
});