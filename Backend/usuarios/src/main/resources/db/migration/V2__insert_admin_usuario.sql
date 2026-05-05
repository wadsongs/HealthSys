INSERT INTO usuario (nome, email, senha, perfil, ativo, data_cadastro, data_atualizacao)
VALUES (
    'Administrador',
    'admin@healthsys.com',
    '$2b$10$qHTJ8PsLucoBZ0OsqCZU8.XFrQO6hgrUaBh/pHUe84nY1TWrD/v.G',
    'ADMINISTRADOR',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;