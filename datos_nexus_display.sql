-- ============================================================================
-- NEXUS DISPLAY · DATOS DE DEMOSTRACIÓN (PostgreSQL / DBeaver)
-- ----------------------------------------------------------------------------
-- ATENCIÓN: este script BORRA los datos actuales de catálogo, ventas,
-- compras, inventario y usuarios, y los reemplaza por un juego completo.
-- Ejecútalo sobre la base de desarrollo, no sobre producción.
--
-- Contenido:
--   12 sucursales | 325 usuarios (1 admin, 24 vendedores, 300 clientes)
--   20 marcas | 300 modelos | 720 productos (pantallas, baterías, pines, placas)
--   48 proveedores | 9 000 registros de inventario
--   80 compras con detalle | 600 ventas con detalle
--
-- Columnas alineadas con las entidades del backend:
--   usuarios.id_rol, usuarios.nombre, usuarios.primer_apellido,
--   usuarios.segundo_apellido, usuarios.rol, usuarios.id_almacen
--   proveedores.nombre_empresa
--   tablas detalle_venta / detalle_compra (singular)
--
-- Contraseña de TODOS los usuarios: 123456
-- ROLES -> id_rol: 1 = ADMIN, 2 = VENDEDOR, 3 = CLIENTE
-- ============================================================================

SET search_path TO public;

BEGIN;

-- ============================================================================
-- 0. COLUMNAS QUE DEBEN EXISTIR Y LIMPIEZA DE TABLAS
-- ============================================================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(100) DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(100) DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(100) DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_rol INTEGER DEFAULT 3;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_almacen INTEGER;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR(30) DEFAULT 'EFECTIVO';

TRUNCATE TABLE
  detalle_venta,
  ventas,
  detalle_compra,
  compras,
  inventario_almacen,
  pantallas,
  modelos,
  marcas,
  calidades,
  categorias,
  proveedores,
  almacenes,
  usuarios
RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. ALMACENES / SUCURSALES (12)
-- ============================================================================
INSERT INTO almacenes (id, nombre, direccion, telefono) VALUES
(1, 'Sucursal Central Sucre', 'Calle Ravelo #145, Zona Mercado Central - Sucre', '6451122'),
(2, 'Sucursal Sucre Norte', 'Av. Ostria Gutiérrez #320, Zona Parada a Tarabuco - Sucre', '6453344'),
(3, 'Sucursal La Paz', 'Calle Eloy Salmón #540, Galería Tecnológica - La Paz', '22458899'),
(4, 'Sucursal El Alto', 'Av. 6 de Marzo #1020, Zona Ceja - El Alto', '22814455'),
(5, 'Sucursal Cochabamba', 'Av. Ayacucho esq. Esteban Arze, Galería La Cancha - Cochabamba', '44226677'),
(6, 'Sucursal Santa Cruz', 'Av. Grigotá, Comercial Chiriguano Pasillo 4 - Santa Cruz', '33557788'),
(7, 'Sucursal Potosí', 'Av. Universitaria #210, Zona Terminal - Potosí', '26223344'),
(8, 'Sucursal Oruro', 'Calle Bolívar #415 entre 6 de Octubre y Soria Galvarro - Oruro', '25256677'),
(9, 'Sucursal Tarija', 'Av. Domingo Paz #630, Zona Mercado Campesino - Tarija', '46648899'),
(10, 'Sucursal Trinidad', 'Av. 6 de Agosto #180, Zona Central - Trinidad', '34621122'),
(11, 'Sucursal Montero', 'Calle Beni #245, Zona Centro - Montero, Santa Cruz', '39245566'),
(12, 'Sucursal Yacuiba', 'Av. San Martín #118, Zona Centro - Yacuiba, Tarija', '46823311');

-- ============================================================================
-- 2. USUARIOS: 1 ADMIN + 24 VENDEDORES (2 por sucursal) + 300 CLIENTES
-- ============================================================================
INSERT INTO usuarios (id, id_rol, nombre_usuario, nombre, primer_apellido, segundo_apellido,
                      correo, telefono, clave, rol, id_almacen, activo) VALUES
-- ADMIN
(1, 1, 'admin', 'Carlos', 'Mendoza', 'Rojas', 'admin@nexusdisplay.com', '70011122',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'ADMIN', NULL, true),

-- VENDEDORES: dos por cada sucursal (IDs 2 al 25)
(2, 2, 'vend_sucre_central1', 'Rodrigo', 'Quispe', 'Flores', 'sucre.central1@nexusdisplay.com', '72861001',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 1, true),
(3, 2, 'vend_sucre_central2', 'Mariela', 'Vargas', 'Choque', 'sucre.central2@nexusdisplay.com', '72861002',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 1, true),
(4, 2, 'vend_sucre_norte1', 'Marco Antonio', 'Rojas', 'Condori', 'sucre.norte1@nexusdisplay.com', '72861003',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 2, true),
(5, 2, 'vend_sucre_norte2', 'Carla Andrea', 'Gutiérrez', 'Cruz', 'sucre.norte2@nexusdisplay.com', '72861004',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 2, true),
(6, 2, 'vend_lapaz1', 'Álvaro', 'Mamani', 'Apaza', 'lapaz1@nexusdisplay.com', '71541005',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 3, true),
(7, 2, 'vend_lapaz2', 'Verónica', 'Tito', 'Laura', 'lapaz2@nexusdisplay.com', '71541006',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 3, true),
(8, 2, 'vend_elalto1', 'Cristian', 'Huanca', 'Copa', 'elalto1@nexusdisplay.com', '71541007',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 4, true),
(9, 2, 'vend_elalto2', 'Rocío', 'Nina', 'Callisaya', 'elalto2@nexusdisplay.com', '71541008',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 4, true),
(10, 2, 'vend_cbba1', 'Fernando', 'Aguilar', 'Medina', 'cbba1@nexusdisplay.com', '70741009',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 5, true),
(11, 2, 'vend_cbba2', 'Daniela', 'Castro', 'Villarroel', 'cbba2@nexusdisplay.com', '70741010',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 5, true),
(12, 2, 'vend_scz1', 'Marcelo', 'Justiniano', 'Saucedo', 'scz1@nexusdisplay.com', '75041011',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 6, true),
(13, 2, 'vend_scz2', 'Camila', 'Antelo', 'Parada', 'scz2@nexusdisplay.com', '75041012',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 6, true),
(14, 2, 'vend_potosi1', 'Ramiro', 'Velasco', 'Fuentes', 'potosi1@nexusdisplay.com', '72441013',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 7, true),
(15, 2, 'vend_potosi2', 'Silvia', 'Montaño', 'Padilla', 'potosi2@nexusdisplay.com', '72441014',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 7, true),
(16, 2, 'vend_oruro1', 'Javier', 'Espinoza', 'Molina', 'oruro1@nexusdisplay.com', '71841015',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 8, true),
(17, 2, 'vend_oruro2', 'Lorena', 'Guzmán', 'Loza', 'oruro2@nexusdisplay.com', '71841016',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 8, true),
(18, 2, 'vend_tarija1', 'Gonzalo', 'Tapia', 'Claros', 'tarija1@nexusdisplay.com', '72941017',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 9, true),
(19, 2, 'vend_tarija2', 'Karina', 'Balderrama', 'Zeballos', 'tarija2@nexusdisplay.com', '72941018',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 9, true),
(20, 2, 'vend_trinidad1', 'Fabricio', 'Cuéllar', 'Vaca', 'trinidad1@nexusdisplay.com', '73941019',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 10, true),
(21, 2, 'vend_trinidad2', 'Tatiana', 'Montero', 'Sandoval', 'trinidad2@nexusdisplay.com', '73941020',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 10, true),
(22, 2, 'vend_montero1', 'Ernesto', 'Barrientos', 'Sandoval', 'montero1@nexusdisplay.com', '78041021',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 11, true),
(23, 2, 'vend_montero2', 'Lizeth', 'Paniagua', 'Rojas', 'montero2@nexusdisplay.com', '78041022',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 11, true),
(24, 2, 'vend_yacuiba1', 'Nelson', 'Paniagua', 'Rojas', 'yacuiba1@nexusdisplay.com', '79041023',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 12, true),
(25, 2, 'vend_yacuiba2', 'Jimena', 'Parada', 'Barrientos', 'yacuiba2@nexusdisplay.com', '79041024',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'VENDEDOR', 12, true),

-- CLIENTE DEMO (usuario/clave del login web)
(26, 3, 'cliente', 'Diego', 'Ramírez', 'Soto', 'cliente@nexusdisplay.com', '70055566',
 '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu', 'CLIENTE', NULL, true);

-- 299 CLIENTES MÁS (IDs 27 al 325), generados con nombres y apellidos combinados
WITH nombres(lista) AS (
  VALUES (ARRAY['Ana','María','Carlos','Juan','Lucía','Pedro','Daniela','Jorge','Sofía','Miguel',
                'Valeria','Fernando','Gabriela','Ricardo','Natalia','Roberto','Patricia','Hugo',
                'Claudia','Raúl','Verónica','Óscar','Paola','Sergio','Mónica','Andrés','Carolina',
                'Gustavo','Adriana','Cristian','Vanessa','Álvaro','Rocío','Marco','Beatriz','Héctor',
                'Noemí','Gonzalo','Karina','Iván'])
),
apellidos(lista) AS (
  VALUES (ARRAY['Mamani','Quispe','Flores','Choque','Rojas','Condori','Vargas','Gutiérrez','Cruz',
                'Medina','Aguilar','Castro','Ortiz','Silva','Romero','Suárez','Mendoza','Peralta',
                'Salazar','Chávez','Ramos','Delgado','Vega','Fuentes','Campos','Zambrana','Padilla',
                'Navarro','Miranda','Arteaga','Tórrez','Huanca','Apaza','Tito','Laura','Copa','Nina',
                'Solíz','Pacheco','Villarroel'])
)
INSERT INTO usuarios (id, id_rol, nombre_usuario, nombre, primer_apellido, segundo_apellido,
                      correo, telefono, clave, rol, id_almacen, activo)
SELECT
  26 + g,
  3,
  'cli_' || LPAD(g::text, 3, '0'),
  n.lista[1 + ((g * 11) % 40)],
  a1.lista[1 + ((g * 7) % 40)],
  a2.lista[1 + ((g * 17) % 40)],
  'cli' || LPAD(g::text, 3, '0') || '@nexusdisplay.com',
  '7' || LPAD(((g * 37) % 1000000)::text, 6, '0'),
  '$2b$10$/gYhW33A4muEGna1Yp1ulO73abo8P0rnmH7zKNg1fDA40eM/rk3Qu',
  'CLIENTE',
  NULL,
  true
FROM generate_series(1, 299) AS g
CROSS JOIN nombres n
CROSS JOIN apellidos a1
CROSS JOIN apellidos a2;

-- ============================================================================
-- 3. MARCAS (20)
-- ============================================================================
INSERT INTO marcas (id, nombre, fotografia) VALUES
(1,  'SAMSUNG',      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png'),
(2,  'XIAOMI',       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/512px-Xiaomi_logo_%282021-%29.svg.png'),
(3,  'APPLE',        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png'),
(4,  'MOTOROLA',     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Motorola_logo.svg/512px-Motorola_logo.svg.png'),
(5,  'HONOR',        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Honor_Logo.svg/512px-Honor_Logo.svg.png'),
(6,  'TECNO',        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tecno_Mobile_logo.svg/512px-Tecno_Mobile_logo.svg.png'),
(7,  'INFINIX',      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Infinix_logo.svg/512px-Infinix_logo.svg.png'),
(8,  'REALME',       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Realme-realme-logo-box-RGB-01.svg/512px-Realme-realme-logo-box-RGB-01.svg.png'),
(9,  'HUAWEI',       'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Huawei_Logo.svg/512px-Huawei_Logo.svg.png'),
(10, 'ZTE',          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/ZTE-logo.svg/512px-ZTE-logo.svg.png'),
(11, 'OPPO',         'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/OPPO_Logo.svg/512px-OPPO_Logo.svg.png'),
(12, 'VIVO',         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vivo_mobile_logo.png/512px-Vivo_mobile_logo.png'),
(13, 'ONEPLUS',      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/OnePlus_logo.svg/512px-OnePlus_logo.svg.png'),
(14, 'NOKIA',        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nokia_wordmark.svg/512px-Nokia_wordmark.svg.png'),
(15, 'GOOGLE PIXEL', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png'),
(16, 'ASUS',         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/512px-ASUS_Logo.svg.png'),
(17, 'SONY',         'https://placehold.co/200x200/0f172a/38bdf8?text=SONY'),
(18, 'LENOVO',       'https://placehold.co/200x200/0f172a/38bdf8?text=LENOVO'),
(19, 'ITEL',         'https://placehold.co/200x200/0f172a/38bdf8?text=ITEL'),
(20, 'OUKITEL',      'https://placehold.co/200x200/0f172a/38bdf8?text=OUKITEL');

-- ============================================================================
-- 4. MODELOS (300: 15 por marca)
-- ============================================================================
INSERT INTO modelos (id_marca, nombre) VALUES
-- 1. SAMSUNG
(1,'Galaxy A05'),(1,'Galaxy A05s'),(1,'Galaxy A14'),(1,'Galaxy A15'),(1,'Galaxy A24'),
(1,'Galaxy A25 5G'),(1,'Galaxy A34 5G'),(1,'Galaxy A35 5G'),(1,'Galaxy A54 5G'),(1,'Galaxy A55 5G'),
(1,'Galaxy A73 5G'),(1,'Galaxy M14'),(1,'Galaxy M34 5G'),(1,'Galaxy S23 Ultra'),(1,'Galaxy S24 Ultra'),
-- 2. XIAOMI
(2,'Redmi 12C'),(2,'Redmi 13C'),(2,'Redmi A3'),(2,'Redmi Note 12'),(2,'Redmi Note 13'),
(2,'Redmi Note 13 Pro'),(2,'Redmi Note 13 Pro+'),(2,'POCO F5'),(2,'POCO F5 Pro'),(2,'POCO M6 Pro'),
(2,'POCO X6 Pro'),(2,'Xiaomi 12T'),(2,'Xiaomi 13T'),(2,'Xiaomi 14'),(2,'Xiaomi 14 Ultra'),
-- 3. APPLE
(3,'iPhone XR'),(3,'iPhone XS Max'),(3,'iPhone 11'),(3,'iPhone 11 Pro'),(3,'iPhone 11 Pro Max'),
(3,'iPhone 12'),(3,'iPhone 12 Pro'),(3,'iPhone 12 Pro Max'),(3,'iPhone 13'),(3,'iPhone 13 Pro'),
(3,'iPhone 13 Pro Max'),(3,'iPhone 14'),(3,'iPhone 14 Pro Max'),(3,'iPhone 15'),(3,'iPhone 15 Pro Max'),
-- 4. MOTOROLA
(4,'Moto E13'),(4,'Moto E22'),(4,'Moto G14'),(4,'Moto G24'),(4,'Moto G34 5G'),
(4,'Moto G54 5G'),(4,'Moto G73 5G'),(4,'Moto G84 5G'),(4,'Moto Edge 30 Neo'),(4,'Moto Edge 40'),
(4,'Moto Edge 40 Neo'),(4,'Moto Edge 50 Pro'),(4,'Moto G Play'),(4,'Moto G Power'),(4,'Moto Razr 40'),
-- 5. HONOR
(5,'Honor X5 Plus'),(5,'Honor X6a'),(5,'Honor X7a'),(5,'Honor X7b'),(5,'Honor X8a'),
(5,'Honor X8b'),(5,'Honor X9a'),(5,'Honor X9b'),(5,'Honor Magic 5 Lite'),(5,'Honor Magic 6 Lite'),
(5,'Honor Magic 6 Pro'),(5,'Honor 90'),(5,'Honor 90 Lite'),(5,'Honor 200 Lite'),(5,'Honor 200 Pro'),
-- 6. TECNO
(6,'Spark 10'),(6,'Spark 10 Pro'),(6,'Spark 20'),(6,'Spark 20 Pro'),(6,'Spark Go 2024'),
(6,'Camon 19'),(6,'Camon 19 Pro'),(6,'Camon 20'),(6,'Camon 20 Pro'),(6,'Camon 30'),
(6,'Pova 5'),(6,'Pova 5 Pro'),(6,'Pova 6 Pro'),(6,'Phantom X2'),(6,'Phantom V Fold'),
-- 7. INFINIX
(7,'Hot 30'),(7,'Hot 30i'),(7,'Hot 40'),(7,'Hot 40 Pro'),(7,'Hot 40i'),
(7,'Note 12'),(7,'Note 30'),(7,'Note 30 Pro'),(7,'Note 40'),(7,'Note 40 Pro'),
(7,'Note 40 Pro+'),(7,'Smart 7'),(7,'Smart 8'),(7,'Zero 30'),(7,'GT 10 Pro'),
-- 8. REALME
(8,'Realme C53'),(8,'Realme C55'),(8,'Realme C65'),(8,'Realme C67'),(8,'Realme Note 50'),
(8,'Realme 10'),(8,'Realme 11'),(8,'Realme 11 Pro'),(8,'Realme 12'),(8,'Realme 12 Pro'),
(8,'Realme 12 Pro+'),(8,'Realme GT Neo 3'),(8,'Realme GT 5 Pro'),(8,'Realme Narzo 60'),(8,'Realme Narzo 70'),
-- 9. HUAWEI
(9,'Y6p'),(9,'Y7a'),(9,'Y9 Prime 2019'),(9,'Nova 9'),(9,'Nova 10 SE'),
(9,'Nova 11i'),(9,'Nova 12s'),(9,'Nova Y61'),(9,'Nova Y72'),(9,'Nova Y91'),
(9,'P30 Lite'),(9,'P40 Lite'),(9,'P60 Pro'),(9,'Mate 50 Pro'),(9,'Mate 60 Pro'),
-- 10. ZTE
(10,'Blade A34'),(10,'Blade A54'),(10,'Blade A73'),(10,'Blade V40 Vita'),(10,'Blade V50 Design'),
(10,'Blade V50 Smart'),(10,'Axon 40 SE'),(10,'Axon 50 Lite'),(10,'Nubia Neo 5G'),(10,'Nubia Z50'),
(10,'RedMagic 8 Pro'),(10,'RedMagic 9 Pro'),(10,'Blade L210'),(10,'Blade A53'),(10,'Voyage 30'),
-- 11. OPPO
(11,'Oppo A17'),(11,'Oppo A18'),(11,'Oppo A38'),(11,'Oppo A58'),(11,'Oppo A78'),
(11,'Oppo A79 5G'),(11,'Reno 8T'),(11,'Reno 10 5G'),(11,'Reno 11 5G'),(11,'Reno 11 F'),
(11,'Reno 12'),(11,'Find X6 Pro'),(11,'Find X7 Ultra'),(11,'Oppo A98'),(11,'Oppo A57'),
-- 12. VIVO
(12,'Vivo Y03'),(12,'Vivo Y17s'),(12,'Vivo Y27'),(12,'Vivo Y36'),(12,'Vivo Y100'),
(12,'Vivo V25'),(12,'Vivo V27'),(12,'Vivo V29 5G'),(12,'Vivo V29 Lite'),(12,'Vivo V30'),
(12,'Vivo V30 Pro'),(12,'Vivo X90 Pro'),(12,'Vivo X100 Pro'),(12,'Vivo Y02'),(12,'Vivo Y16'),
-- 13. ONEPLUS
(13,'OnePlus 9 Pro'),(13,'OnePlus 10 Pro'),(13,'OnePlus 10T'),(13,'OnePlus 11 5G'),(13,'OnePlus 12'),
(13,'OnePlus 12R'),(13,'OnePlus Nord 2T'),(13,'OnePlus Nord 3'),(13,'OnePlus Nord CE 3'),(13,'OnePlus Nord CE 4'),
(13,'OnePlus Nord N20'),(13,'OnePlus Nord N30'),(13,'OnePlus Ace 2'),(13,'OnePlus Ace 3'),(13,'OnePlus Open'),
-- 14. NOKIA
(14,'Nokia C12'),(14,'Nokia C22'),(14,'Nokia C32'),(14,'Nokia G21'),(14,'Nokia G22'),
(14,'Nokia G42 5G'),(14,'Nokia G50'),(14,'Nokia G60'),(14,'Nokia X20'),(14,'Nokia X30 5G'),
(14,'Nokia XR21'),(14,'Nokia 105'),(14,'Nokia 110 4G'),(14,'Nokia 8.3 5G'),(14,'Nokia 5.4'),
-- 15. GOOGLE PIXEL
(15,'Pixel 5'),(15,'Pixel 5a'),(15,'Pixel 6'),(15,'Pixel 6 Pro'),(15,'Pixel 6a'),
(15,'Pixel 7'),(15,'Pixel 7 Pro'),(15,'Pixel 7a'),(15,'Pixel 8'),(15,'Pixel 8 Pro'),
(15,'Pixel 8a'),(15,'Pixel Fold'),(15,'Pixel 4a'),(15,'Pixel 4 XL'),(15,'Pixel 3a XL'),
-- 16. ASUS
(16,'Zenfone 8'),(16,'Zenfone 9'),(16,'Zenfone 10'),(16,'Zenfone 11 Ultra'),(16,'ROG Phone 5'),
(16,'ROG Phone 6'),(16,'ROG Phone 6D'),(16,'ROG Phone 7'),(16,'ROG Phone 7 Ultimate'),(16,'ROG Phone 8'),
(16,'ROG Phone 8 Pro'),(16,'Zenfone 7 Pro'),(16,'ROG Phone 3'),(16,'Zenfone 6'),(16,'ROG Phone 2'),
-- 17. SONY
(17,'Xperia 1 II'),(17,'Xperia 1 III'),(17,'Xperia 1 IV'),(17,'Xperia 1 V'),(17,'Xperia 5 II'),
(17,'Xperia 5 III'),(17,'Xperia 5 IV'),(17,'Xperia 5 V'),(17,'Xperia 10 II'),(17,'Xperia 10 III'),
(17,'Xperia 10 IV'),(17,'Xperia 10 V'),(17,'Xperia Pro-I'),(17,'Xperia L4'),(17,'Xperia XZ3'),
-- 18. LENOVO
(18,'Lenovo K14 Plus'),(18,'Lenovo K13'),(18,'Lenovo K12 Note'),(18,'Legion Y70'),(18,'Legion Duel 2'),
(18,'Lenovo Z6 Pro'),(18,'Lenovo Z5s'),(18,'Lenovo K10 Note'),(18,'Lenovo K10 Plus'),(18,'Lenovo K9'),
(18,'Lenovo K8 Note'),(18,'Lenovo P2'),(18,'Vibe K5'),(18,'Lenovo S5'),(18,'ZUK Z2'),
-- 19. ITEL
(19,'Itel A60'),(19,'Itel A70'),(19,'Itel A48'),(19,'Itel A23'),(19,'Itel A27'),
(19,'Itel A56'),(19,'Itel P40'),(19,'Itel P55'),(19,'Itel P38'),(19,'Itel Vision 1'),
(19,'Itel Vision 2'),(19,'Itel S23'),(19,'Itel S23+'),(19,'Itel it2160'),(19,'Itel it5081'),
-- 20. OUKITEL
(20,'Oukitel C32'),(20,'Oukitel C33'),(20,'Oukitel C35'),(20,'Oukitel C36'),(20,'Oukitel C38'),
(20,'Oukitel WP18'),(20,'Oukitel WP19'),(20,'Oukitel WP20'),(20,'Oukitel WP21'),(20,'Oukitel WP28'),
(20,'Oukitel K15 Plus'),(20,'Oukitel K10'),(20,'Oukitel C21'),(20,'Oukitel C19'),(20,'Oukitel WP12');

-- ============================================================================
-- 5. CATEGORÍAS
-- ============================================================================
INSERT INTO categorias (id, nombre, descripcion) VALUES
(1, 'Pantallas', 'Módulos de display completos con touch integrado (con y sin marco)'),
(2, 'Baterías', 'Baterías internas de polímero de litio de reemplazo de alta capacidad'),
(3, 'Pines de Carga', 'Conectores micro-USB y Tipo-C individuales para soldadura SMD en placa'),
(4, 'Entradas de Carga', 'Placas sub-board y flex completos con puerto de carga y micrófono integrado');

-- ============================================================================
-- 6. CALIDADES
-- ============================================================================
INSERT INTO calidades (id, nombre, descripcion) VALUES
(1, 'Original Service Pack', 'Repuesto 100% original de fábrica con certificación OEM'),
(2, 'AMOLED / OLED', 'Alta definición con soporte de huella en pantalla y colores vivos'),
(3, 'Incell / Alta Capacidad', 'Excelente relación calidad-precio para pantallas IPS y celdas reforzadas'),
(4, 'OEM Reforzado', 'Componentes de carga y conectores con baño de oro de alta durabilidad');

-- ============================================================================
-- 7. CATÁLOGO DE 720 PRODUCTOS
--    IDs 1-300   : pantallas principales (1 por modelo)
--    IDs 301-420 : pantallas económicas sin marco (modelos 1-120)
--    IDs 421-540 : baterías (modelos 1-120)
--    IDs 541-630 : pines de carga (modelos 121-210)
--    IDs 631-720 : entradas de carga / sub-placas (modelos 211-300)
-- ============================================================================

-- 7.1 Pantallas principales
INSERT INTO pantallas (id, id_modelo, id_calidad, id_categoria, nombre, codigo, color, con_marco, fotografia, precio_venta)
SELECT
  ROW_NUMBER() OVER (ORDER BY m.id),
  m.id,
  CASE WHEN m.id % 3 = 1 THEN 1 WHEN m.id % 3 = 2 THEN 2 ELSE 3 END,
  1,
  'Pantalla ' || ma.nombre || ' ' || m.nombre || ' ' ||
    CASE WHEN m.id % 3 = 1 THEN 'Original Con Marco'
         WHEN m.id % 3 = 2 THEN 'AMOLED'
         ELSE 'Incell' END,
  'PAN-' || LPAD(m.id::text, 3, '0'),
  'Negro',
  (m.id % 2 = 1),
  CASE (m.id % 4)
    WHEN 0 THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    WHEN 1 THEN 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'
    ELSE 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'
  END,
  ROUND(CASE WHEN m.id % 3 = 1 THEN 450 + m.id * 2.50
             WHEN m.id % 3 = 2 THEN 310 + m.id * 1.80
             ELSE 175 + m.id * 1.20 END, 2)
FROM modelos m
JOIN marcas ma ON ma.id = m.id_marca
ORDER BY m.id;

-- 7.2 Pantallas económicas sin marco
INSERT INTO pantallas (id, id_modelo, id_calidad, id_categoria, nombre, codigo, color, con_marco, fotografia, precio_venta)
SELECT
  300 + m.id,
  m.id,
  CASE WHEN m.id % 2 = 0 THEN 2 ELSE 3 END,
  1,
  'Pantalla ' || ma.nombre || ' ' || m.nombre || ' ' ||
    CASE WHEN m.id % 2 = 0 THEN 'OLED Sin Marco' ELSE 'Incell Económica' END,
  'PAN-ECO-' || LPAD(m.id::text, 3, '0'),
  'Negro',
  false,
  'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500',
  ROUND(CASE WHEN m.id % 2 = 0 THEN 260 + m.id * 2.20 ELSE 145 + m.id * 1.60 END, 2)
FROM modelos m
JOIN marcas ma ON ma.id = m.id_marca
WHERE m.id <= 120
ORDER BY m.id;

-- 7.3 Baterías
INSERT INTO pantallas (id, id_modelo, id_calidad, id_categoria, nombre, codigo, color, con_marco, fotografia, precio_venta)
SELECT
  420 + m.id,
  m.id,
  3,
  2,
  'Batería ' || ma.nombre || ' ' || m.nombre || ' 5000mAh Alta Capacidad',
  'BAT-' || LPAD(m.id::text, 3, '0'),
  'Negro',
  false,
  'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500',
  ROUND(95 + m.id * 1.90, 2)
FROM modelos m
JOIN marcas ma ON ma.id = m.id_marca
WHERE m.id <= 120
ORDER BY m.id;

-- 7.4 Pines de carga
INSERT INTO pantallas (id, id_modelo, id_calidad, id_categoria, nombre, codigo, color, con_marco, fotografia, precio_venta)
SELECT
  540 + ROW_NUMBER() OVER (ORDER BY m.id),
  m.id,
  4,
  3,
  'Pin de Carga Tipo-C ' || ma.nombre || ' ' || m.nombre || ' SMD Reforzado',
  'PIN-' || LPAD(m.id::text, 3, '0'),
  'Plateado',
  false,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500',
  ROUND(12 + (m.id % 10) * 1.50, 2)
FROM modelos m
JOIN marcas ma ON ma.id = m.id_marca
WHERE m.id BETWEEN 121 AND 210
ORDER BY m.id;

-- 7.5 Entradas de carga / sub-placas
INSERT INTO pantallas (id, id_modelo, id_calidad, id_categoria, nombre, codigo, color, con_marco, fotografia, precio_venta)
SELECT
  630 + ROW_NUMBER() OVER (ORDER BY m.id),
  m.id,
  1,
  4,
  'Placa Entrada de Carga Sub-Board ' || ma.nombre || ' ' || m.nombre,
  'ENT-' || LPAD(m.id::text, 3, '0'),
  'Verde/Negro',
  false,
  'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500',
  ROUND(55 + (m.id % 25) * 1.20, 2)
FROM modelos m
JOIN marcas ma ON ma.id = m.id_marca
WHERE m.id BETWEEN 211 AND 300
ORDER BY m.id;

-- ============================================================================
-- 8. PROVEEDORES (48)
-- ============================================================================
INSERT INTO proveedores (id, nombre_empresa, nit, telefono, direccion) VALUES
(1,'AMOVIL Importaciones S.R.L.','1020304001','71022301','Av. Grigotá #450, Santa Cruz'),
(2,'Shenzhen GSM Parts Co.','1020304002','71022302','Zona Franca Iquique Galpón 12'),
(3,'Importadora CeluPartes Bolivia','1020304003','71022303','Calle Eloy Salmón #880, La Paz'),
(4,'Distribuidora Sur Display Sucre','1020304004','64599004','Av. Las Américas #205, Sucre'),
(5,'TechMobile Mayorista Cbba','1020304005','71022305','Av. Heroínas #512, Cochabamba'),
(6,'Global LCD Electronics','1020304006','71022306','Av. 6 de Marzo #120, El Alto'),
(7,'Importadora Andina GSM','1020304007','71022307','Calle Huyustus #310, La Paz'),
(8,'Oriente Parts Santa Cruz','1020304008','71022308','Comercial Chiriguano Local 44, Santa Cruz'),
(9,'Vallecito Repuestos Móviles','1020304009','71022309','Calle Esteban Arze #412, Cochabamba'),
(10,'Chuquisaca Parts Import','1020304010','71022310','Calle Junín #620, Sucre'),
(11,'Potosí Tech Mayorista','1020304011','71022311','Av. Cívica #105, Potosí'),
(12,'Pagador GSM Oruro','1020304012','71022312','Calle Adolfo Mier #330, Oruro'),
(13,'Guadalquivir Parts Tarija','1020304013','71022313','Av. Las Américas #890, Tarija'),
(14,'Moxos Celulares Trinidad','1020304014','71022314','Calle Cipriano Barace #140, Trinidad'),
(15,'Guangzhou OLED Factory','1020304015','71022315','Zona Franca Arica Módulo 8'),
(16,'Foxconn Spare Parts Latam','1020304016','71022316','Av. Busch #900, Santa Cruz'),
(17,'Baterías Plus Bolivia S.R.L.','1020304017','71022317','Calle Tumusla #410, La Paz'),
(18,'Flex & Pines SMD Import','1020304018','71022318','Av. San Martín #720, Cochabamba'),
(19,'Incell Pro Distribuidora','1020304019','71022319','Calle Colón #230, Sucre'),
(20,'Service Pack Directo Bo','1020304020','71022320','Av. Cañoto #550, Santa Cruz'),
(21,'MegaDisplay Importadores','1020304021','71022321','Calle Buenos Aires #1120, La Paz'),
(22,'EuroParts Móvil Bolivia','1020304022','71022322','Av. Oquendo #305, Cochabamba'),
(23,'Kowloon Tech Hong Kong','1020304023','71022323','Zona Franca Iquique Manzana D'),
(24,'Altiplano Componentes SMD','1020304024','71022324','Av. Juan Pablo II #400, El Alto'),
(25,'Realce Repuestos Celulares','1020304025','71022325','Calle España #115, Sucre'),
(26,'Baterías Litio Max S.A.','1020304026','71022326','Av. Mutualista 3er Anillo, Santa Cruz'),
(27,'Pantallas Express Nacional','1020304027','71022327','Av. Montes #710, La Paz'),
(28,'Importadora Dragón Rojo','1020304028','71022328','Calle 25 de Mayo #615, Cochabamba'),
(29,'Conecta2 Microelectrónica','1020304029','71022329','Calle Calvo #190, Sucre'),
(30,'Titan Touch & Glass Bo','1020304030','71022330','Av. Brasil #830, Santa Cruz'),
(31,'Fénix Repuestos Originales','1020304031','71022331','Calle Potosí #440, La Paz'),
(32,'Unión GSM Importaciones','1020304032','71022332','Av. Aroma #915, Cochabamba'),
(33,'Charcas Tech Import','1020304033','71022333','Av. Hernando Siles #510, Sucre'),
(34,'Illimani Parts Mayorista','1020304034','71022334','Calle Murillo #670, La Paz'),
(35,'Grigotá Touch Center','1020304035','71022335','Av. Grigotá 2do Anillo, Santa Cruz'),
(36,'Sajama GSM Import','1020304036','71022336','Av. 6 de Octubre #920, Oruro'),
(37,'Tunari Parts Mayorista','1020304037','71022337','Av. Blanco Galindo Km 4, Cochabamba'),
(38,'Beni Touch Distribuidora','1020304038','71022338','Av. Bolívar #310, Trinidad'),
(39,'Villa Imperial Repuestos','1020304039','71022339','Calle Chayanta #220, Potosí'),
(40,'Chapaco Móvil Parts','1020304040','71022340','Calle Sucre #480, Tarija'),
(41,'Pantallas del Oriente S.R.L.','1020304041','71022341','Av. Cristo Redentor #1350, Santa Cruz'),
(42,'Microflex Bolivia Import','1020304042','71022342','Calle Yanacocha #245, La Paz'),
(43,'Display Master Perú S.A.C.','1020304043','71022343','Av. Aviación #2100, Lima'),
(44,'Tecno Repuestos Montero','1020304044','71022344','Calle Beni #180, Montero'),
(45,'Yacuiba Cell Parts','1020304045','71022345','Av. San Martín #90, Yacuiba'),
(46,'Baterías Global Life','1020304046','71022346','Av. 6 de Agosto #1770, La Paz'),
(47,'Smart Parts Chile Ltda.','1020304047','71022347','Av. Vicuña Mackenna #1500, Santiago'),
(48,'Distribuidora Andina Móvil','1020304048','71022348','Av. Mariscal Santa Cruz #1200, La Paz');

-- ============================================================================
-- 9. INVENTARIO: 720 productos x 12 sucursales (8 640 registros, mínimo 25 uds.)
-- ============================================================================
INSERT INTO inventario_almacen (id_pantalla, id_almacen, cantidad)
SELECT
  p.id,
  a.id,
  CASE
    WHEN a.id = 1 THEN 60 + (p.id % 21)
    WHEN a.id = 2 THEN 40 + (p.id % 15)
    WHEN a.id IN (3, 5, 6, 7) THEN 35 + (p.id % 16)
    ELSE 25 + (p.id % 11)
  END
FROM pantallas p
CROSS JOIN almacenes a
ORDER BY a.id, p.id;

-- ============================================================================
-- 10. COMPRAS A PROVEEDORES (80) CON DETALLE
-- ============================================================================
INSERT INTO compras (id, id_proveedor, id_usuario, id_almacen, total, fecha, fecha_creacion)
SELECT
  g,
  1 + ((g * 7) % 48),
  1,
  1 + ((g - 1) % 12),
  0,
  NOW() - ((g * 2) % 150) * INTERVAL '1 day' - ((g % 10) * INTERVAL '2 hours'),
  NOW() - ((g * 2) % 150) * INTERVAL '1 day' - ((g % 10) * INTERVAL '2 hours')
FROM generate_series(1, 80) AS g;

INSERT INTO detalle_compra (id_compra, id_pantalla, cantidad, costo_unitario, subtotal)
SELECT
  c.id,
  p.id,
  q.cant,
  cc.costo,
  ROUND(cc.costo * q.cant, 2)
FROM compras c
CROSS JOIN LATERAL generate_series(1, 2 + (c.id % 3)) AS n
JOIN pantallas p ON p.id = 1 + (((c.id * 41) + (n * 17)) % 720)
CROSS JOIN LATERAL (SELECT 10 + ((c.id + n * 7) % 31) AS cant) q
CROSS JOIN LATERAL (SELECT ROUND(p.precio_venta * 0.58, 2) AS costo) cc;

UPDATE compras c
SET total = t.suma
FROM (SELECT id_compra, SUM(subtotal) AS suma FROM detalle_compra GROUP BY id_compra) t
WHERE t.id_compra = c.id;

-- ============================================================================
-- 11. VENTAS (600) CON DETALLE
--     Repartidas en las 12 sucursales, atendidas por los vendedores de cada una
--     y con clientes registrados. Fechas dentro de los últimos 180 días.
-- ============================================================================
INSERT INTO ventas (id, id_usuario, id_almacen, nombre_cliente, documento_cliente,
                    tipo_pago, fecha, total, fecha_creacion)
SELECT
  g.id,
  2 + 2 * ((g.id - 1) % 12) + (g.id % 2),
  1 + ((g.id - 1) % 12),
  u.nombre || ' ' || u.primer_apellido,
  '5' || LPAD(((g.id * 137) % 1000000)::text, 6, '0'),
  (ARRAY['EFECTIVO','QR / YAPE','TRANSFERENCIA BANCARIA','TARJETA'])[1 + (g.id % 4)],
  NOW() - ((g.id * 3) % 180) * INTERVAL '1 day' - ((g.id % 12) * INTERVAL '1 hour'),
  0,
  NOW() - ((g.id * 3) % 180) * INTERVAL '1 day' - ((g.id % 12) * INTERVAL '1 hour')
FROM generate_series(1, 600) AS g(id)
JOIN usuarios u ON u.id = 26 + ((g.id * 7) % 300);

INSERT INTO detalle_venta (id_venta, id_pantalla, cantidad, precio_unitario, subtotal)
SELECT
  v.id,
  p.id,
  q.cant,
  pr.precio,
  ROUND(pr.precio * q.cant, 2)
FROM ventas v
CROSS JOIN LATERAL generate_series(1, 1 + (v.id % 3)) AS n
JOIN pantallas p ON p.id = 1 + (((v.id * 37) + (n * 53)) % 720)
CROSS JOIN LATERAL (SELECT 1 + ((v.id + n * 3) % 3) AS cant) q
CROSS JOIN LATERAL (
  SELECT ROUND(p.precio_venta * (CASE WHEN v.id % 5 = 0 THEN 0.90 ELSE 1 END), 2) AS precio
) pr;

UPDATE ventas v
SET total = t.suma
FROM (SELECT id_venta, SUM(subtotal) AS suma FROM detalle_venta GROUP BY id_venta) t
WHERE t.id_venta = v.id;

-- ============================================================================
-- 12. SINCRONIZAR SECUENCIAS (obligatorio: se insertaron IDs manuales)
-- ============================================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['almacenes','usuarios','marcas','modelos','pantallas','proveedores',
                           'compras','detalle_compra','ventas','detalle_venta',
                           'inventario_almacen','categorias','calidades'] LOOP
    EXECUTE format(
      'SELECT setval(pg_get_serial_sequence(%L, %L), COALESCE((SELECT MAX(id) FROM %I), 1))',
      t, 'id', t
    );
  END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- 13. VERIFICACIÓN
-- ============================================================================
SELECT 'almacenes' AS tabla, COUNT(*) AS filas FROM almacenes
UNION ALL SELECT 'usuarios (admin)', COUNT(*) FROM usuarios WHERE rol = 'ADMIN'
UNION ALL SELECT 'usuarios (vendedores)', COUNT(*) FROM usuarios WHERE rol = 'VENDEDOR'
UNION ALL SELECT 'usuarios (clientes)', COUNT(*) FROM usuarios WHERE rol = 'CLIENTE'
UNION ALL SELECT 'marcas', COUNT(*) FROM marcas
UNION ALL SELECT 'modelos', COUNT(*) FROM modelos
UNION ALL SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL SELECT 'calidades', COUNT(*) FROM calidades
UNION ALL SELECT 'pantallas/productos', COUNT(*) FROM pantallas
UNION ALL SELECT 'proveedores', COUNT(*) FROM proveedores
UNION ALL SELECT 'inventario_almacen', COUNT(*) FROM inventario_almacen
UNION ALL SELECT 'compras', COUNT(*) FROM compras
UNION ALL SELECT 'detalle_compra', COUNT(*) FROM detalle_compra
UNION ALL SELECT 'ventas', COUNT(*) FROM ventas
UNION ALL SELECT 'detalle_venta', COUNT(*) FROM detalle_venta;
