-- ============================================================
-- Migration: WordPress/WooCommerce -> Supabase
-- Generated: 2026-03-27T09:54:22.493Z
-- Orders: from 2025-09-05
-- ============================================================

BEGIN;

-- WP Order #5710 | Carolina Mirzenco | paduraru2525@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-QX7XUC3S', 'paid', 'paduraru2525@gmail.com', 'Carolina Mirzenco', '060256878', 500, 0, 'ok', '2025-09-05 11:05:22', 'ro', '2025-09-05 11:05:22', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-343972A10621', '{"code":"FL26-343972A10621","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-C50B5A30389E', '{"code":"FL26-C50B5A30389E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5712 | Olga Adam | voicaolga@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-64JKEG43', 'paid', 'voicaolga@gmail.com', 'Olga Adam', '0 (69', 800, 0, 'ok', '2025-09-05 11:15:03', 'ro', '2025-09-05 11:15:03', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-CF94FE08EE74', '{"code":"FL26-CF94FE08EE74","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-DF582D673F83', '{"code":"FL26-DF582D673F83","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5713 | Oleg Vrabie | ovrabie@outlook.com | 400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-84MY2GJ8', 'paid', 'ovrabie@outlook.com', 'Oleg Vrabie', '+4915202696521', 400, 0, 'ok', '2025-09-05 11:19:26', 'ro', '2025-09-05 11:19:26', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-1530A34B6317', '{"code":"FL26-1530A34B6317","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5714 | Dumitru Mel | kurai7hikari+festivalullupilor@gmail.com | 400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-GN78ZFDX', 'paid', 'kurai7hikari+festivalullupilor@gmail.com', 'Dumitru Mel', '069031182', 400, 0, 'ok', '2025-09-05 11:48:09', 'ro', '2025-09-05 11:48:09', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-EB94416C9F5E', '{"code":"FL26-EB94416C9F5E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5715 | Tadiana H | tanea1997@yandex.ru | 400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-26AKZYS8', 'paid', 'tanea1997@yandex.ru', 'Tadiana H', '+373 68 570 726', 400, 0, 'ok', '2025-09-05 12:46:09', 'ro', '2025-09-05 12:46:09', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-F364D8D59E40', '{"code":"FL26-F364D8D59E40","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5716 | Diana Iacub | diana.iacub.998@gmail.com | 400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-KE48DKXC', 'paid', 'diana.iacub.998@gmail.com', 'Diana Iacub', '+37360304680', 400, 0, 'ok', '2025-09-05 14:38:52', 'ro', '2025-09-05 14:38:52', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-BBC7FDDC4318', '{"code":"FL26-BBC7FDDC4318","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5717 | Marius Marinciu | marinciumarius@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-2SZ3P4MA', 'paid', 'marinciumarius@gmail.com', 'Marius Marinciu', '+40758248666', 800, 0, 'ok', '2025-09-05 15:11:31', 'ro', '2025-09-05 15:11:31', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-58962B2BAF29', '{"code":"FL26-58962B2BAF29","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-9E5A67B9AB86', '{"code":"FL26-9E5A67B9AB86","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5718 | Cristina Racu | cristina.racu1212@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7BC4FSPP', 'paid', 'cristina.racu1212@gmail.com', 'Cristina Racu', '0 (69', 500, 0, 'ok', '2025-09-05 18:30:25', 'ro', '2025-09-05 18:30:25', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-350E0DC49410', '{"code":"FL26-350E0DC49410","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-CA190C66B64A', '{"code":"FL26-CA190C66B64A","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5719 | Lucian Drumia | lucian.drumia@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-4LDBTVNF', 'paid', 'lucian.drumia@gmail.com', 'Lucian Drumia', '0040742029937', 800, 0, 'ok', '2025-09-05 21:53:49', 'ro', '2025-09-05 21:53:49', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-637380213532', '{"code":"FL26-637380213532","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-BE5922B1216B', '{"code":"FL26-BE5922B1216B","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5720 | Cristina Racu | cristina.racu1212@gmail.com | 250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-SGDPV5F4', 'paid', 'cristina.racu1212@gmail.com', 'Cristina Racu', '069043309', 250, 0, 'ok', '2025-09-06 06:15:54', 'ro', '2025-09-06 06:15:54', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-63CD7EE6EBFF', '{"code":"FL26-63CD7EE6EBFF","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5721 | Cristina Racu | cristina.racu1212@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-8AC5YXL5', 'paid', 'cristina.racu1212@gmail.com', 'Cristina Racu', '069043309', 500, 0, 'ok', '2025-09-06 06:19:10', 'ro', '2025-09-06 06:19:10', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-0E76410F5CC0', '{"code":"FL26-0E76410F5CC0","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-0E2790A5857B', '{"code":"FL26-0E2790A5857B","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5722 | Cristina Racu | cristina.racu1212@gmail.com | 250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-87HYB4Y7', 'paid', 'cristina.racu1212@gmail.com', 'Cristina Racu', '069043309', 250, 0, 'ok', '2025-09-06 06:22:47', 'ro', '2025-09-06 06:22:47', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-9588D1545B1A', '{"code":"FL26-9588D1545B1A","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5723 | Cristina Racu | cristina.racu1212@gmail.com | 250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-EHJ46685', 'paid', 'cristina.racu1212@gmail.com', 'Cristina Racu', '069043309', 250, 0, 'ok', '2025-09-06 06:25:39', 'ro', '2025-09-06 06:25:39', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-883F3265090D', '{"code":"FL26-883F3265090D","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5724 | Cristina Racu | cristina.racu1212@gmail.com | 250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-F73F2GHM', 'paid', 'cristina.racu1212@gmail.com', 'Cristina Racu', '069043309', 250, 0, 'ok', '2025-09-06 06:27:48', 'ro', '2025-09-06 06:27:48', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-2D420690D105', '{"code":"FL26-2D420690D105","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5727 | Diana Chercheja-Macari | dianachercheja@yahoo.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-RYSWPDVS', 'paid', 'dianachercheja@yahoo.com', 'Diana Chercheja-Macari', '069504904', 1000, 0, 'ok', '2025-09-07 05:52:38', 'ro', '2025-09-07 05:52:38', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-AD7D5E9588ED', '{"code":"FL26-AD7D5E9588ED","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-0D8F9B54C163', '{"code":"FL26-0D8F9B54C163","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-8C542BE39929', '{"code":"FL26-8C542BE39929","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-4B5CA57D8AC5', '{"code":"FL26-4B5CA57D8AC5","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5728 | Ana Popa | anavpopa@gmail.com | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-2GF76YV5', 'paid', 'anavpopa@gmail.com', 'Ana Popa', '069270507', 600, 0, 'ok', '2025-09-07 06:09:33', 'ro', '2025-09-07 06:09:33', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-DB539A356B1D', '{"code":"FL26-DB539A356B1D","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5729 | Sabina Eliza Tiba | sabina.tiba@yahoo.com | 400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-L4MNAZAD', 'paid', 'sabina.tiba@yahoo.com', 'Sabina Eliza Tiba', '0040740225187', 400, 0, 'ok', '2025-09-07 06:54:50', 'ro', '2025-09-07 06:54:50', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-7E6891F3B0DE', '{"code":"FL26-7E6891F3B0DE","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5730 | Corina Tifin | dodu.corina@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-MPJ27DY2', 'paid', 'dodu.corina@gmail.com', 'Corina Tifin', '069023551', 800, 0, 'ok', '2025-09-07 12:25:21', 'ro', '2025-09-07 12:25:21', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-AE0B50A75D1D', '{"code":"FL26-AE0B50A75D1D","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-0BC57ECF7E0F', '{"code":"FL26-0BC57ECF7E0F","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5732 | Diana Vlad | diana_vlad2000@yahoo.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-5RV53YAR', 'paid', 'diana_vlad2000@yahoo.com', 'Diana Vlad', '+40724352830', 800, 0, 'ok', '2025-09-08 14:17:07', 'ro', '2025-09-08 14:17:07', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-D9B000BF189D', '{"code":"FL26-D9B000BF189D","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-3B10FA097C02', '{"code":"FL26-3B10FA097C02","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5733 | Daniela Petrov Druet | Petrovadana55@gmail.com | 400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-EPC8JHN2', 'paid', 'Petrovadana55@gmail.com', 'Daniela Petrov Druet', '068428455', 400, 0, 'ok', '2025-09-08 20:04:07', 'ro', '2025-09-08 20:04:07', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-B4FCED333B54', '{"code":"FL26-B4FCED333B54","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5734 | Ilie Lupasco | lupasco88@gmail.com | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7VX5QNUY', 'paid', 'lupasco88@gmail.com', 'Ilie Lupasco', '069881139', 600, 0, 'ok', '2025-09-09 05:26:31', 'ro', '2025-09-09 05:26:31', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-F28F2BDDB277', '{"code":"FL26-F28F2BDDB277","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5735 | Emilian Margina | emilianmargina@yahoo.com | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-PC4C5JH4', 'paid', 'emilianmargina@yahoo.com', 'Emilian Margina', '069881166', 600, 0, 'ok', '2025-09-09 06:23:50', 'ro', '2025-09-09 06:23:50', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-D040D36A86D3', '{"code":"FL26-D040D36A86D3","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5736 | Victor Friptuleac | victorfriptuleac04@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-457HYQN6', 'paid', 'victorfriptuleac04@gmail.com', 'Victor Friptuleac', '+31635629293', 800, 0, 'ok', '2025-09-09 06:54:43', 'ro', '2025-09-09 06:54:43', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-E9EEF8927AB8', '{"code":"FL26-E9EEF8927AB8","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-8088174A7712', '{"code":"FL26-8088174A7712","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5737 | Lilia Marciuc | l_marc2008@mail.ru | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-H67SE44U', 'paid', 'l_marc2008@mail.ru', 'Lilia Marciuc', '069966877', 600, 0, 'ok', '2025-09-09 06:56:36', 'ro', '2025-09-09 06:56:36', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-327890E3B654', '{"code":"FL26-327890E3B654","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5738 | Ana Ţurcanu | tzurcanu_anna@yahoo.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-XWEF4EV7', 'paid', 'tzurcanu_anna@yahoo.com', 'Ana Ţurcanu', '069393339', 500, 0, 'ok', '2025-09-09 07:04:13', 'ro', '2025-09-09 07:04:13', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-A0A31F558A3F', '{"code":"FL26-A0A31F558A3F","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-FBFF93B6157F', '{"code":"FL26-FBFF93B6157F","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5739 | Ana Ciocoi | ciocoianisoara@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-AN2TY4E2', 'paid', 'ciocoianisoara@gmail.com', 'Ana Ciocoi', '069988888', 500, 0, 'ok', '2025-09-09 07:05:36', 'ro', '2025-09-09 07:05:36', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-DCD11EC2ABFA', '{"code":"FL26-DCD11EC2ABFA","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-BD36D77C2BAF', '{"code":"FL26-BD36D77C2BAF","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5740 | Tatiana Braduteanu | tatiana.sandu@filletti.md | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-22M2YHKW', 'paid', 'tatiana.sandu@filletti.md', 'Tatiana Braduteanu', '078877238', 600, 0, 'ok', '2025-09-09 07:05:38', 'ro', '2025-09-09 07:05:38', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-1976E85B3187', '{"code":"FL26-1976E85B3187","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5741 | Eugeniu Lupascu | eugeniu.lupascu@outlook.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-MX8CLS3V', 'paid', 'eugeniu.lupascu@outlook.com', 'Eugeniu Lupascu', '+37369750728', 500, 0, 'ok', '2025-09-09 07:31:47', 'ro', '2025-09-09 07:31:47', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-6A5F60477542', '{"code":"FL26-6A5F60477542","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-5F4CC5C43A28', '{"code":"FL26-5F4CC5C43A28","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5742 | Raluca Elena Dinescu | ralucadinescu1980@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-LVYV88VC', 'paid', 'ralucadinescu1980@gmail.com', 'Raluca Elena Dinescu', '+40727857857', 800, 0, 'ok', '2025-09-09 07:48:57', 'ro', '2025-09-09 07:48:57', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-7D326FF79BD6', '{"code":"FL26-7D326FF79BD6","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-8DF389C0B9AD', '{"code":"FL26-8DF389C0B9AD","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5743 | Maxim Ghiumiusliu | ghiumiusliu@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-SQSSYN8B', 'paid', 'ghiumiusliu@gmail.com', 'Maxim Ghiumiusliu', '079647587', 800, 0, 'ok', '2025-09-09 07:51:49', 'ro', '2025-09-09 07:51:49', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-17FDDC7DCC70', '{"code":"FL26-17FDDC7DCC70","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-86F7AF77BFE2', '{"code":"FL26-86F7AF77BFE2","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5744 | Tatiana Mosneaga | tatiana.mosneaga7@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-X4T4GUDW', 'paid', 'tatiana.mosneaga7@gmail.com', 'Tatiana Mosneaga', '+32486375315', 800, 0, 'ok', '2025-09-09 08:08:24', 'ro', '2025-09-09 08:08:24', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-83741E4AA0A6', '{"code":"FL26-83741E4AA0A6","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-747459963DC9', '{"code":"FL26-747459963DC9","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5745 | Tornea Sergiu | ss.tornea@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-RSDBWCC2', 'paid', 'ss.tornea@gmail.com', 'Tornea Sergiu', '069518389', 500, 0, 'ok', '2025-09-09 08:17:31', 'ro', '2025-09-09 08:17:31', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-773E3DF760D9', '{"code":"FL26-773E3DF760D9","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-EFFE89634231', '{"code":"FL26-EFFE89634231","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5748 | Vitalue BURCOVSCHI | vburcovschi@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-6REC3H4X', 'paid', 'vburcovschi@gmail.com', 'Vitalue BURCOVSCHI', '+373 694 51 412', 1000, 0, 'ok', '2025-09-10 20:07:36', 'ro', '2025-09-10 20:07:36', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('9c8639e3-5f85-428f-9a26-c8e61428d678', 1000, 'FL26-7375AF323F5A', '{"code":"FL26-7375AF323F5A","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5749 | Adrian Rusu | rs.adrian2012@gmail.con | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-QHR7GCGH', 'paid', 'rs.adrian2012@gmail.con', 'Adrian Rusu', '078234296', 500, 0, 'ok', '2025-09-10 22:05:19', 'ro', '2025-09-10 22:05:19', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-5F858861BD05', '{"code":"FL26-5F858861BD05","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-A3D0594F40E6', '{"code":"FL26-A3D0594F40E6","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5750 | Ilescu Vasilii | ilescuvasilii@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7E6ET637', 'paid', 'ilescuvasilii@gmail.com', 'Ilescu Vasilii', '+37369951916', 1000, 0, 'ok', '2025-09-11 07:01:28', 'ro', '2025-09-11 07:01:28', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-1943981223B6', '{"code":"FL26-1943981223B6","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-3053CCCE0657', '{"code":"FL26-3053CCCE0657","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-2EEF40E23082', '{"code":"FL26-2EEF40E23082","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-2EADCB2301CE', '{"code":"FL26-2EADCB2301CE","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5751 | Vasile Poianu | poianu.vasile@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-UXZBLL3R', 'paid', 'poianu.vasile@gmail.com', 'Vasile Poianu', '069980904', 800, 0, 'ok', '2025-09-11 07:35:53', 'ro', '2025-09-11 07:35:53', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-504EDBD27E78', '{"code":"FL26-504EDBD27E78","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-827C6D8E575A', '{"code":"FL26-827C6D8E575A","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5752 | Mihai Rusu | mihai199764@yahoo.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-4NRMMU3J', 'paid', 'mihai199764@yahoo.com', 'Mihai Rusu', '+37368720128', 800, 0, 'ok', '2025-09-11 12:46:43', 'ro', '2025-09-11 12:46:43', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-98254570E24B', '{"code":"FL26-98254570E24B","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-349AC92C939D', '{"code":"FL26-349AC92C939D","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5753 | Andrei-Alexandru Bobes | bobesalexandrei@yahoo.ro | 4000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-2SWKQWZA', 'paid', 'bobesalexandrei@yahoo.ro', 'Andrei-Alexandru Bobes', '0786605111', 4000, 0, 'ok', '2025-09-12 08:55:40', 'ro', '2025-09-12 08:55:40', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-3587C440351C', '{"code":"FL26-3587C440351C","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-6203C4399862', '{"code":"FL26-6203C4399862","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-12866ECF1320', '{"code":"FL26-12866ECF1320","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-81AB385B7346', '{"code":"FL26-81AB385B7346","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-78A6A6E9EF4A', '{"code":"FL26-78A6A6E9EF4A","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-9A31860ADE3F', '{"code":"FL26-9A31860ADE3F","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-DB790B7CD325', '{"code":"FL26-DB790B7CD325","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-A65CC37C05DD', '{"code":"FL26-A65CC37C05DD","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-88720B505A36', '{"code":"FL26-88720B505A36","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-9E5930C60FC1', '{"code":"FL26-9E5930C60FC1","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5754 | Viorel Gavrila | viorelgavrila22@gmail.com | 1600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-SGNBEYML', 'paid', 'viorelgavrila22@gmail.com', 'Viorel Gavrila', '0751191100', 1600, 0, 'ok', '2025-09-12 09:15:22', 'ro', '2025-09-12 09:15:22', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-94D26149EA69', '{"code":"FL26-94D26149EA69","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-15BA1409ACD7', '{"code":"FL26-15BA1409ACD7","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-5122C3CEF769', '{"code":"FL26-5122C3CEF769","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-6C6F0EDD4F74', '{"code":"FL26-6C6F0EDD4F74","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5755 | Adelina Ceban | adelina.fuior@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-WHKEMPUY', 'paid', 'adelina.fuior@gmail.com', 'Adelina Ceban', '+37360917777', 500, 0, 'ok', '2025-09-12 15:12:10', 'ro', '2025-09-12 15:12:10', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-8151ED1EED57', '{"code":"FL26-8151ED1EED57","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-6804CEA10AEE', '{"code":"FL26-6804CEA10AEE","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5758 | Iuliana Leonte | leonte937@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-D8ECYNTT', 'paid', 'leonte937@gmail.com', 'Iuliana Leonte', '062131246', 1000, 0, 'ok', '2025-09-13 06:19:22', 'ro', '2025-09-13 06:19:22', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-8BB45489CF15', '{"code":"FL26-8BB45489CF15","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-9B8F5173ECD7', '{"code":"FL26-9B8F5173ECD7","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-F3BD762937E8', '{"code":"FL26-F3BD762937E8","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-698682459901', '{"code":"FL26-698682459901","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5760 | Stanislav Scerbatiuc | scerbatiuc.stas@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-YC7VX9KA', 'paid', 'scerbatiuc.stas@gmail.com', 'Stanislav Scerbatiuc', '069264836', 500, 0, 'ok', '2025-09-14 16:31:50', 'ro', '2025-09-14 16:31:50', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-4C5D736DC07A', '{"code":"FL26-4C5D736DC07A","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-2639100BAB98', '{"code":"FL26-2639100BAB98","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5762 | ION CIOCOI | ciocoiion@icloud.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7BL9MCNX', 'paid', 'ciocoiion@icloud.com', 'ION CIOCOI', '078370960', 800, 0, 'ok', '2025-09-14 20:08:57', 'ro', '2025-09-14 20:08:57', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-A23C31A67F05', '{"code":"FL26-A23C31A67F05","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-DB69118DE994', '{"code":"FL26-DB69118DE994","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5765 | Chiril Toderica | toderica.c@gmail.com | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-YESBF8VY', 'paid', 'toderica.c@gmail.com', 'Chiril Toderica', '069518441', 600, 0, 'ok', '2025-09-15 13:24:09', 'ro', '2025-09-15 13:24:09', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-C4D04BAF88FF', '{"code":"FL26-C4D04BAF88FF","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5766 | Emanuel Baltig | ebaltig@yahoo.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-AVLR3G2W', 'paid', 'ebaltig@yahoo.com', 'Emanuel Baltig', '+40745545595', 800, 0, 'ok', '2025-09-15 19:17:31', 'ro', '2025-09-15 19:17:31', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-E81DFE895183', '{"code":"FL26-E81DFE895183","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-3C0C4088BD37', '{"code":"FL26-3C0C4088BD37","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5767 | Mosneaga Andrei | mosneagaandrei2@gmail.com | 250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-L3UL8YX2', 'paid', 'mosneagaandrei2@gmail.com', 'Mosneaga Andrei', '062040462', 250, 0, 'ok', '2025-09-16 14:48:16', 'ro', '2025-09-16 14:48:16', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-B6F0C5441C39', '{"code":"FL26-B6F0C5441C39","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5771 | Andrei Tarus | tarusandrei@outlook.com | 1400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7ALFURN7', 'paid', 'tarusandrei@outlook.com', 'Andrei Tarus', '+40757110880', 1400, 0, 'ok', '2025-09-18 11:48:39', 'ro', '2025-09-18 11:48:39', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-B7A27E60D3D6', '{"code":"FL26-B7A27E60D3D6","event":"Festivalul Lupilor 2026","version":2}'),
  ('9c8639e3-5f85-428f-9a26-c8e61428d678', 1000, 'FL26-79393DECBA07', '{"code":"FL26-79393DECBA07","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5772 | Vișan Andrei | andreivisan@ymail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-UFQA34K2', 'paid', 'andreivisan@ymail.com', 'Vișan Andrei', '0724283235', 1000, 0, 'ok', '2025-09-18 17:06:02', 'ro', '2025-09-18 17:06:02', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('9c8639e3-5f85-428f-9a26-c8e61428d678', 1000, 'FL26-BD6EB3533E29', '{"code":"FL26-BD6EB3533E29","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5776 | Vasile Gorbatovschi | gorbatovschi.v@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-2M9K26Y7', 'paid', 'gorbatovschi.v@gmail.com', 'Vasile Gorbatovschi', '069631866', 500, 0, 'ok', '2025-09-20 04:28:49', 'ro', '2025-09-20 04:28:49', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-58EE6CA0A8CD', '{"code":"FL26-58EE6CA0A8CD","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-46D36D835C3C', '{"code":"FL26-46D36D835C3C","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5777 | Ana Nitu | nitu.ana82@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-VWVSWMZF', 'paid', 'nitu.ana82@gmail.com', 'Ana Nitu', '069123198', 1000, 0, 'ok', '2025-09-20 20:35:59', 'ro', '2025-09-20 20:35:59', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-71F5AC6D4EA2', '{"code":"FL26-71F5AC6D4EA2","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-79854DBF6CA7', '{"code":"FL26-79854DBF6CA7","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-59A34C13D8FF', '{"code":"FL26-59A34C13D8FF","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-9680F86A21D9', '{"code":"FL26-9680F86A21D9","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5780 | Goroșevscaia Carina | corin4k@mail.ru | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-XKK7Z3XK', 'paid', 'corin4k@mail.ru', 'Goroșevscaia Carina', '068788862', 600, 0, 'ok', '2025-09-22 10:17:40', 'ro', '2025-09-22 10:17:40', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-240F2EB0B032', '{"code":"FL26-240F2EB0B032","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5946 | Cristina Crasovschii | cristia98@yandex.ru | 1200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-AS87PLZ3', 'paid', 'cristia98@yandex.ru', 'Cristina Crasovschii', '+37368813195', 1200, 0, 'ok', '2025-09-24 15:15:29', 'ro', '2025-09-24 15:15:29', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-778B27884877', '{"code":"FL26-778B27884877","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-937DEB61AF6C', '{"code":"FL26-937DEB61AF6C","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-E54779230309', '{"code":"FL26-E54779230309","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5947 | Anna Severin | anaseverin.md@gmail.com | 1250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-44DBF3RG', 'paid', 'anaseverin.md@gmail.com', 'Anna Severin', '079790011', 1250, 0, 'ok', '2025-09-24 15:31:44', 'ro', '2025-09-24 15:31:44', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1250, 'FL26-938EE4E6D70E', '{"code":"FL26-938EE4E6D70E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5948 | Perdelean Victoria | parkm8181@mail.ru | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7ZAD6X75', 'paid', 'parkm8181@mail.ru', 'Perdelean Victoria', '060601014', 1500, 0, 'ok', '2025-09-24 15:40:55', 'ro', '2025-09-24 15:40:55', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-CF4BF5EF6CC1', '{"code":"FL26-CF4BF5EF6CC1","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-8ED62F670E6D', '{"code":"FL26-8ED62F670E6D","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-11FDEDCE9C55', '{"code":"FL26-11FDEDCE9C55","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5949 | Diana Vlad | diana_vlad2000@yahoo.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-6CNAUZBE', 'paid', 'diana_vlad2000@yahoo.com', 'Diana Vlad', '0724352830', 1000, 0, 'ok', '2025-09-24 17:49:46', 'ro', '2025-09-24 17:49:46', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-D7624F87393D', '{"code":"FL26-D7624F87393D","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-7A178E211C6E', '{"code":"FL26-7A178E211C6E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5950 | Emanuel Baltig | ebaltig@yahoo.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-AMKTZEM6', 'paid', 'ebaltig@yahoo.com', 'Emanuel Baltig', '+40745545595', 1000, 0, 'ok', '2025-09-24 18:19:29', 'ro', '2025-09-24 18:19:29', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-7F7E4852B97D', '{"code":"FL26-7F7E4852B97D","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-7F37DEA68109', '{"code":"FL26-7F37DEA68109","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5956 | Marius Marinciu | marinciumarius@gmail.com | 200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-GDFSDTFU', 'paid', 'marinciumarius@gmail.com', 'Marius Marinciu', '0758248666', 200, 0, 'ok', '2025-09-25 07:07:17', 'ro', '2025-09-25 07:07:17', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-4B80BCEB4AFF', '{"code":"FL26-4B80BCEB4AFF","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-B6D17D7EC80B', '{"code":"FL26-B6D17D7EC80B","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5959 | Lisu Marina | voloveimarina@ymail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-2QYLLLTR', 'paid', 'voloveimarina@ymail.com', 'Lisu Marina', '+37369638069', 800, 0, 'ok', '2025-09-25 14:15:51', 'ro', '2025-09-25 14:15:51', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-C6961D0BB101', '{"code":"FL26-C6961D0BB101","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-68B65245045F', '{"code":"FL26-68B65245045F","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5961 | Racu Mihaela | miaracu.2001@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-FJUVDEB5', 'paid', 'miaracu.2001@gmail.com', 'Racu Mihaela', '0 (67', 1000, 0, 'ok', '2025-09-25 18:43:08', 'ro', '2025-09-25 18:43:08', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-C15AAE12D36C', '{"code":"FL26-C15AAE12D36C","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-B91BB7ACF65E', '{"code":"FL26-B91BB7ACF65E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5987 | Ana Lupan | anabezdiga@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-D4Q4K78V', 'paid', 'anabezdiga@gmail.com', 'Ana Lupan', '068674312', 500, 0, 'ok', '2025-09-26 17:37:36', 'ro', '2025-09-26 17:37:36', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-96FC4FB571C1', '{"code":"FL26-96FC4FB571C1","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-35495D6DD913', '{"code":"FL26-35495D6DD913","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5988 | Gabriela Matei | gabrriela.matei@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-MNSGLPMB', 'paid', 'gabrriela.matei@gmail.com', 'Gabriela Matei', '+40747035498', 1000, 0, 'ok', '2025-09-26 18:15:49', 'ro', '2025-09-26 18:15:49', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-CFCEF5AE8D41', '{"code":"FL26-CFCEF5AE8D41","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-4A05FB7A9ADA', '{"code":"FL26-4A05FB7A9ADA","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5989 | Denis Topa | topa.denis@gmail.com | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-CRDBJBSD', 'paid', 'topa.denis@gmail.com', 'Denis Topa', '069642096', 600, 0, 'ok', '2025-09-27 04:12:48', 'ro', '2025-09-27 04:12:48', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-6C166ED23CFE', '{"code":"FL26-6C166ED23CFE","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5990 | SVETLANA Iatco | iatco.svetlana@outlook.com | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-YDTT3V3F', 'paid', 'iatco.svetlana@outlook.com', 'SVETLANA Iatco', '+37369003355', 600, 0, 'ok', '2025-09-27 07:59:28', 'ro', '2025-09-27 07:59:28', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-408DF979EFE7', '{"code":"FL26-408DF979EFE7","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5991 | Ghiumiusliu Mihail | ghiumiusliu.mihail@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-VDNJXHEB', 'paid', 'ghiumiusliu.mihail@gmail.com', 'Ghiumiusliu Mihail', '079742968', 500, 0, 'ok', '2025-09-27 08:23:45', 'ro', '2025-09-27 08:23:45', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-E1A8D6AB8BA2', '{"code":"FL26-E1A8D6AB8BA2","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5993 | Ionut Galusca | ionut.galusca@yahoo.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-4VNHKJAB', 'paid', 'ionut.galusca@yahoo.com', 'Ionut Galusca', '0744826239', 800, 0, 'ok', '2025-09-27 18:14:16', 'ro', '2025-09-27 18:14:16', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-8D82B5E1C855', '{"code":"FL26-8D82B5E1C855","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-2F7F46E2B81E', '{"code":"FL26-2F7F46E2B81E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5994 | SERGIU VASILOI | sergiuvs@gmail.com | 750 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-LGG4UKRM', 'paid', 'sergiuvs@gmail.com', 'SERGIU VASILOI', '067360401', 750, 0, 'ok', '2025-09-28 13:55:45', 'ro', '2025-09-28 13:55:45', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-065233AF3019', '{"code":"FL26-065233AF3019","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-41D68D402671', '{"code":"FL26-41D68D402671","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-FC3E67326803', '{"code":"FL26-FC3E67326803","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5995 | Ana-Maria Botezat | iavorschiana3@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-KAUF7J35', 'paid', 'iavorschiana3@gmail.com', 'Ana-Maria Botezat', '068958990', 1000, 0, 'ok', '2025-09-28 14:40:28', 'ro', '2025-09-28 14:40:28', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-017D460F7CBC', '{"code":"FL26-017D460F7CBC","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-0D0D6C2B39AF', '{"code":"FL26-0D0D6C2B39AF","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5996 | Anghel Elena | Anghel.elena17@gmail.com | 1250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-LQNKK5FY', 'paid', 'Anghel.elena17@gmail.com', 'Anghel Elena', '+40727497773', 1250, 0, 'ok', '2025-09-28 14:56:47', 'ro', '2025-09-28 14:56:47', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1250, 'FL26-F35947EFA680', '{"code":"FL26-F35947EFA680","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5998 | selivanov angela | alviagrup@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-53HU46S8', 'paid', 'alviagrup@gmail.com', 'selivanov angela', '067150162', 500, 0, 'ok', '2025-09-28 18:48:35', 'ro', '2025-09-28 18:48:35', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-E17E258CD417', '{"code":"FL26-E17E258CD417","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-5CA981B574AF', '{"code":"FL26-5CA981B574AF","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #5999 | Andrei Teslaru | andu_ur@yahoo.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-WED9F6QS', 'paid', 'andu_ur@yahoo.com', 'Andrei Teslaru', '0040726196714', 1000, 0, 'ok', '2025-09-29 05:08:47', 'ro', '2025-09-29 05:08:47', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-B9334E490E59', '{"code":"FL26-B9334E490E59","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-BDEC163C252C', '{"code":"FL26-BDEC163C252C","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6000 | Aliona Zagorodniuc | aliona.zagorodniuc@gmail.com | 1250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-9ENW3XQ7', 'paid', 'aliona.zagorodniuc@gmail.com', 'Aliona Zagorodniuc', '79860045', 1250, 0, 'ok', '2025-09-29 06:00:50', 'ro', '2025-09-29 06:00:50', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1250, 'FL26-1EEE8CAD8D60', '{"code":"FL26-1EEE8CAD8D60","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6001 | Angela Bors | angelika.borsh@gmail.com | 750 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-4BPXAFJH', 'paid', 'angelika.borsh@gmail.com', 'Angela Bors', '079087780', 750, 0, 'ok', '2025-09-29 09:06:59', 'ro', '2025-09-29 09:06:59', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-47477D8C7712', '{"code":"FL26-47477D8C7712","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-437C51173F8B', '{"code":"FL26-437C51173F8B","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-3AE4F2944A0B', '{"code":"FL26-3AE4F2944A0B","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6002 | Liviu Tudor Popescu | barzafurioasa@yahoo.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-WZ25WSUS', 'paid', 'barzafurioasa@yahoo.com', 'Liviu Tudor Popescu', '0723510209', 1000, 0, 'ok', '2025-09-29 09:31:16', 'ro', '2025-09-29 09:31:16', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-574F15C2C68B', '{"code":"FL26-574F15C2C68B","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-6833D86CE855', '{"code":"FL26-6833D86CE855","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6003 | Alexandr Selivanov | alviagrup@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-48SN5TWL', 'paid', 'alviagrup@gmail.com', 'Alexandr Selivanov', '067150152', 500, 0, 'ok', '2025-09-29 10:46:56', 'ro', '2025-09-29 10:46:56', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-6C64BA9C3469', '{"code":"FL26-6C64BA9C3469","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-D4F91EF66A03', '{"code":"FL26-D4F91EF66A03","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6004 | ZAHARESCU MARINELA | zaharescuav@yahoo.com | 1600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-SQL82PU4', 'paid', 'zaharescuav@yahoo.com', 'ZAHARESCU MARINELA', '0751689432', 1600, 0, 'ok', '2025-09-30 06:01:43', 'ro', '2025-09-30 06:01:43', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-26F12C0735A6', '{"code":"FL26-26F12C0735A6","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-34D51FB913B0', '{"code":"FL26-34D51FB913B0","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-34CDD6CCB28C', '{"code":"FL26-34CDD6CCB28C","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-07D33CE0FDC0', '{"code":"FL26-07D33CE0FDC0","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6006 | Sabina Tiba | sabina.tiba@yahoo.com | 100 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-6U3U6PTX', 'paid', 'sabina.tiba@yahoo.com', 'Sabina Tiba', '0040740225187', 100, 0, 'ok', '2025-09-30 08:25:10', 'ro', '2025-09-30 08:25:10', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-9B26AAF9C9C9', '{"code":"FL26-9B26AAF9C9C9","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6007 | Sabina Tiba | sabina.tiba@yahoo.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-FLNL4P5A', 'paid', 'sabina.tiba@yahoo.com', 'Sabina Tiba', '0040740225187', 500, 0, 'ok', '2025-09-30 08:29:25', 'ro', '2025-09-30 08:29:25', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-21D107EE78F7', '{"code":"FL26-21D107EE78F7","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6009 | Popa Doina | doinapopa_2@yahoo.com | 1250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-T8FRRS6R', 'paid', 'doinapopa_2@yahoo.com', 'Popa Doina', '069280022', 1250, 0, 'ok', '2025-09-30 11:55:53', 'ro', '2025-09-30 11:55:53', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1250, 'FL26-F8BB55C04FCD', '{"code":"FL26-F8BB55C04FCD","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6010 | Emilian Olaru | emiolaru@yahoo.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-GMWLX4M2', 'paid', 'emiolaru@yahoo.com', 'Emilian Olaru', '078864455', 500, 0, 'ok', '2025-09-30 12:36:17', 'ro', '2025-09-30 12:36:17', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-17A45B9DBBC6', '{"code":"FL26-17A45B9DBBC6","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-5F5BF415BF8D', '{"code":"FL26-5F5BF415BF8D","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6012 | Dumi Potirniche | dumitrita.potirniche@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-SV4GSV2R', 'paid', 'dumitrita.potirniche@gmail.com', 'Dumi Potirniche', '+37379696441', 800, 0, 'ok', '2025-09-30 12:45:29', 'ro', '2025-09-30 12:45:29', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-8144E434944B', '{"code":"FL26-8144E434944B","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-0AE646C17131', '{"code":"FL26-0AE646C17131","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6013 | Eugen Hadirca | jenea_h@mail.ru | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-U7JL22XB', 'paid', 'jenea_h@mail.ru', 'Eugen Hadirca', '+40756050675', 1500, 0, 'ok', '2025-09-30 13:18:01', 'ro', '2025-09-30 13:18:01', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-E350222EEBB3', '{"code":"FL26-E350222EEBB3","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-A3B9B58C3318', '{"code":"FL26-A3B9B58C3318","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-104ED22E5FA3', '{"code":"FL26-104ED22E5FA3","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-0F2A1175CB05', '{"code":"FL26-0F2A1175CB05","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-49B25EFA6E32', '{"code":"FL26-49B25EFA6E32","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-9986D522502C', '{"code":"FL26-9986D522502C","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6014 | Adina Tigan | adina.starniciuc@gmail.com | 1300 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7NNWPXGT', 'paid', 'adina.starniciuc@gmail.com', 'Adina Tigan', '79216542', 1300, 0, 'ok', '2025-09-30 14:59:53', 'ro', '2025-09-30 14:59:53', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-F358C330C39E', '{"code":"FL26-F358C330C39E","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-A67264AC774F', '{"code":"FL26-A67264AC774F","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-8499A3A91943', '{"code":"FL26-8499A3A91943","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-8723116C7072', '{"code":"FL26-8723116C7072","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6015 | Irina Anghel | anghel.irinuta@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-FEUUAW82', 'paid', 'anghel.irinuta@gmail.com', 'Irina Anghel', '079298239', 1000, 0, 'ok', '2025-09-30 15:21:08', 'ro', '2025-09-30 15:21:08', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-1AC127CCCDB4', '{"code":"FL26-1AC127CCCDB4","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-A4D38904F3A4', '{"code":"FL26-A4D38904F3A4","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6016 | Cristina Smetanca | smetano4ka.cristina@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-Y59J2QKR', 'paid', 'smetano4ka.cristina@gmail.com', 'Cristina Smetanca', '0659812925', 800, 0, 'ok', '2025-09-30 16:11:02', 'ro', '2025-09-30 16:11:02', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-6016C1438681', '{"code":"FL26-6016C1438681","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-C3345FEE6145', '{"code":"FL26-C3345FEE6145","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6017 | Simion Ionuț Ciprian | simionionut97@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-LFLFXRVA', 'paid', 'simionionut97@gmail.com', 'Simion Ionuț Ciprian', '0756944783', 1000, 0, 'ok', '2025-09-30 17:02:12', 'ro', '2025-09-30 17:02:12', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-A3AB8E932017', '{"code":"FL26-A3AB8E932017","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-087A67CA86FB', '{"code":"FL26-087A67CA86FB","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6018 | Andriana Nastas | andriana.nastas98@gmail.com | 800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-PFUC8QE6', 'paid', 'andriana.nastas98@gmail.com', 'Andriana Nastas', '060073177', 800, 0, 'ok', '2025-09-30 18:54:25', 'ro', '2025-09-30 18:54:25', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-4A12372D7452', '{"code":"FL26-4A12372D7452","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 400, 'FL26-7F7AF83DA715', '{"code":"FL26-7F7AF83DA715","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6019 | Eugeniu Bicos | jeneabicos@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-22Y8H8KD', 'paid', 'jeneabicos@gmail.com', 'Eugeniu Bicos', '078513423', 1000, 0, 'ok', '2025-09-30 19:02:11', 'ro', '2025-09-30 19:02:11', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-8F6F3949342F', '{"code":"FL26-8F6F3949342F","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-C53B7FC30BE6', '{"code":"FL26-C53B7FC30BE6","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6020 | Cepraga Alina | Alinacepraga90@mail.ru | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-Y2YV79T2', 'paid', 'Alinacepraga90@mail.ru', 'Cepraga Alina', '069817743', 600, 0, 'ok', '2025-09-30 19:04:11', 'ro', '2025-09-30 19:04:11', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 600, 'FL26-00D3C974342C', '{"code":"FL26-00D3C974342C","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6021 | Moldoveanu Alina | moldoveanualina79@yahoo.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-249BR3FR', 'paid', 'moldoveanualina79@yahoo.com', 'Moldoveanu Alina', '0040744954542', 1000, 0, 'ok', '2025-09-30 19:36:41', 'ro', '2025-09-30 19:36:41', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-4179CD6FAAAD', '{"code":"FL26-4179CD6FAAAD","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-20526CCB83D0', '{"code":"FL26-20526CCB83D0","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6023 | Stepan Şişianu | tepik93@list.ru | 2250 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-9ZXP25QW', 'paid', 'tepik93@list.ru', 'Stepan Şişianu', '079781688', 2250, 0, 'ok', '2025-09-30 20:28:41', 'ro', '2025-09-30 20:28:41', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-E041AD0ACDA4', '{"code":"FL26-E041AD0ACDA4","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-9E7EFDAA0524', '{"code":"FL26-9E7EFDAA0524","event":"Festivalul Lupilor 2026","version":2}'),
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1250, 'FL26-306627500D95', '{"code":"FL26-306627500D95","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6024 | Andreea Petrovschi | petrovschiandreea5@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-83Y9V7WB', 'paid', 'petrovschiandreea5@gmail.com', 'Andreea Petrovschi', '069143618', 1000, 0, 'ok', '2025-09-30 20:52:08', 'ro', '2025-09-30 20:52:08', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-876BAF4E0660', '{"code":"FL26-876BAF4E0660","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-320C38D6E277', '{"code":"FL26-320C38D6E277","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-F2153FF99853', '{"code":"FL26-F2153FF99853","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 250, 'FL26-5224BC7FE8A9', '{"code":"FL26-5224BC7FE8A9","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6025 | Cristian Răducu | artistic.cristi@gmail.com | 500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-SCQVFW77', 'paid', 'artistic.cristi@gmail.com', 'Cristian Răducu', '0733763735', 500, 0, 'ok', '2025-09-30 21:14:27', 'ro', '2025-09-30 21:14:27', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 500, 'FL26-188C05C07C9B', '{"code":"FL26-188C05C07C9B","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6039 | Andrei Rusnac | andreirusnac1987@gmail.com | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-UFAQ9MMN', 'paid', 'andreirusnac1987@gmail.com', 'Andrei Rusnac', '060679633', 1500, 0, 'ok', '2025-10-01 07:30:36', 'ro', '2025-10-01 07:30:36', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-38B9F9A35B03', '{"code":"FL26-38B9F9A35B03","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-819A7673FCBB', '{"code":"FL26-819A7673FCBB","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6044 | Test Test | korcevoy.ui@gmail.com | 3800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-MTHGBY8K', 'paid', 'korcevoy.ui@gmail.com', 'Test Test', '+37361011187', 3800, 0, 'ok', '2025-10-03 08:32:00', 'ro', '2025-10-03 08:32:00', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1900, 'FL26-8A0D9F8B6226', '{"code":"FL26-8A0D9F8B6226","event":"Festivalul Lupilor 2026","version":2}'),
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1900, 'FL26-B59617C8ACB2', '{"code":"FL26-B59617C8ACB2","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6048 | Volovei Anastasia | volovei.anastasia@yahoo.com | 600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-GWMCN7C2', 'paid', 'volovei.anastasia@yahoo.com', 'Volovei Anastasia', '068877687', 600, 0, 'ok', '2025-10-11 04:24:48', 'ro', '2025-10-11 04:24:48', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-251F318C49E6', '{"code":"FL26-251F318C49E6","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6061 | Oana Pieleanu | oana.pieleanu@yahoo.com | 3000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-3T42CFJH', 'paid', 'oana.pieleanu@yahoo.com', 'Oana Pieleanu', '+40768458084', 3000, 0, 'ok', '2025-11-03 10:58:14', 'ro', '2025-11-03 10:58:14', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-778F9BFA8DFD', '{"code":"FL26-778F9BFA8DFD","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-5F434AD86D9F', '{"code":"FL26-5F434AD86D9F","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-F63D119131B0', '{"code":"FL26-F63D119131B0","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-2BEE7150CC49', '{"code":"FL26-2BEE7150CC49","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6062 | NICOS Resios | resiosnicos@gmail.com | 1900 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-B75R9Q8R', 'paid', 'resiosnicos@gmail.com', 'NICOS Resios', '0040770877097', 1900, 0, 'ok', '2025-11-03 16:36:10', 'ro', '2025-11-03 16:36:10', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1900, 'FL26-10E47D5118C9', '{"code":"FL26-10E47D5118C9","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6063 | Gabriel-Albert Florea-Dragoi | gaby_sv2003@yahoo.com | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-KM5D6F67', 'paid', 'gaby_sv2003@yahoo.com', 'Gabriel-Albert Florea-Dragoi', '0751024103', 1500, 0, 'ok', '2025-11-04 08:14:02', 'ro', '2025-11-04 08:14:02', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-0352F5B8F55B', '{"code":"FL26-0352F5B8F55B","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-8A47871EBB81', '{"code":"FL26-8A47871EBB81","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6065 | Postica Ecaterina | posticaecaterina3@gmail.com | 760 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-9D7P4CTN', 'paid', 'posticaecaterina3@gmail.com', 'Postica Ecaterina', '067575809', 760, 0, 'ok', '2025-11-26 22:45:44', 'ro', '2025-11-26 22:45:44', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-723BC3E5B4C2', '{"code":"FL26-723BC3E5B4C2","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-03940952C5FE', '{"code":"FL26-03940952C5FE","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6068 | maria-marcelina panuta | panutamariamarcelina09@gmail.com | 380 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-ZKZ3G5FZ', 'paid', 'panutamariamarcelina09@gmail.com', 'maria-marcelina panuta', '+373 062153039', 380, 0, 'ok', '2025-11-27 15:01:40', 'ro', '2025-11-27 15:01:40', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-03699AA2D78A', '{"code":"FL26-03699AA2D78A","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6069 | Marcela Paula Pescarus | pescarus@gmx.de | 1200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-AU8GCATF', 'paid', 'pescarus@gmx.de', 'Marcela Paula Pescarus', '+40725072424', 1200, 0, 'ok', '2025-11-30 05:33:06', 'ro', '2025-11-30 05:33:06', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-739E9BBE4F0C', '{"code":"FL26-739E9BBE4F0C","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-4D1C26B2FE2E', '{"code":"FL26-4D1C26B2FE2E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6092 | Nicolae Laiu | laiu.n.ciprian@gmail.com | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-UAWS7X3X', 'paid', 'laiu.n.ciprian@gmail.com', 'Nicolae Laiu', '0040747366259', 1500, 0, 'ok', '2026-01-05 16:31:23', 'ro', '2026-01-05 16:31:23', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('9c8639e3-5f85-428f-9a26-c8e61428d678', 1500, 'FL26-5C89EF7F62ED', '{"code":"FL26-5C89EF7F62ED","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6095 | raluca berea | raluca_rugina@yahoo.fr | 2400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-TYBG55FF', 'paid', 'raluca_rugina@yahoo.fr', 'raluca berea', '0766499000', 2400, 0, 'ok', '2026-01-09 18:39:51', 'ro', '2026-01-09 18:39:51', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-13535FF5335F', '{"code":"FL26-13535FF5335F","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-7D03D9022078', '{"code":"FL26-7D03D9022078","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-2F70E5951362', '{"code":"FL26-2F70E5951362","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-FBD071D9513C', '{"code":"FL26-FBD071D9513C","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6096 | Iuliana Leonte | leonte937@gmail.com | 1800 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-2HAX6G9Z', 'paid', 'leonte937@gmail.com', 'Iuliana Leonte', '062131246', 1800, 0, 'ok', '2026-01-10 12:37:33', 'ro', '2026-01-10 12:37:33', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-FBD2E7182C12', '{"code":"FL26-FBD2E7182C12","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-F9513F9E5460', '{"code":"FL26-F9513F9E5460","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-21C3629E3F3D', '{"code":"FL26-21C3629E3F3D","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6097 | Maria Dubceac | dubceac.maria07@gmail.com | 1140 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-YYKCKDPF', 'paid', 'dubceac.maria07@gmail.com', 'Maria Dubceac', '+37379909192', 1140, 0, 'ok', '2026-01-12 07:03:56', 'ro', '2026-01-12 07:03:56', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-221F190CB1F8', '{"code":"FL26-221F190CB1F8","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-1D12B9A55CBE', '{"code":"FL26-1D12B9A55CBE","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-0AE72BA822D8', '{"code":"FL26-0AE72BA822D8","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6101 | Corina Tifin | dodu.corina@gmail.com | 200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-6Y3D3UBB', 'paid', 'dodu.corina@gmail.com', 'Corina Tifin', '069023551', 200, 0, 'ok', '2026-01-14 08:57:41', 'ro', '2026-01-14 08:57:41', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-F1EE1FC3B42C', '{"code":"FL26-F1EE1FC3B42C","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-E86284B2EAE2', '{"code":"FL26-E86284B2EAE2","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6102 | Daniela Grecu | danycosernitan@gmail.com | 1900 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-25AN324L', 'paid', 'danycosernitan@gmail.com', 'Daniela Grecu', '079205006', 1900, 0, 'ok', '2026-01-14 13:54:58', 'ro', '2026-01-14 13:54:58', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1900, 'FL26-78DF8939E9BA', '{"code":"FL26-78DF8939E9BA","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6104 | viorel Gavrilă | viorelgavrila22@gmail.com | 400 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-VEV4YV25', 'paid', 'viorelgavrila22@gmail.com', 'viorel Gavrilă', '0751191100', 400, 0, 'ok', '2026-01-15 13:59:47', 'ro', '2026-01-15 13:59:47', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-C94E94474076', '{"code":"FL26-C94E94474076","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-DD16EF09264B', '{"code":"FL26-DD16EF09264B","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-BC0F7F412F92', '{"code":"FL26-BC0F7F412F92","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-EC50AD339C29', '{"code":"FL26-EC50AD339C29","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6105 | Valentina Sanduta | raducanvalentina92@gmail.com | 1200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-43GQMCFC', 'paid', 'raducanvalentina92@gmail.com', 'Valentina Sanduta', '37368682532', 1200, 0, 'ok', '2026-01-15 16:19:06', 'ro', '2026-01-15 16:19:06', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-D5910BDE341C', '{"code":"FL26-D5910BDE341C","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-E9C17985A3D8', '{"code":"FL26-E9C17985A3D8","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6106 | Cristea Anatol | anatolcristea98@gmail.com | 1200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-ESWHGXHS', 'paid', 'anatolcristea98@gmail.com', 'Cristea Anatol', '0756323392', 1200, 0, 'ok', '2026-01-15 17:01:57', 'ro', '2026-01-15 17:01:57', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-6D7BB5844109', '{"code":"FL26-6D7BB5844109","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 600, 'FL26-9E54DBD5EE1D', '{"code":"FL26-9E54DBD5EE1D","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6107 | Caraba Sebastian Ionut | innaciolpan@gmail.com | 1900 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-4Q9CTKLG', 'paid', 'innaciolpan@gmail.com', 'Caraba Sebastian Ionut', '069698289', 1900, 0, 'ok', '2026-01-15 19:31:04', 'ro', '2026-01-15 19:31:04', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 1900, 'FL26-3CAD71E0C27E', '{"code":"FL26-3CAD71E0C27E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6108 | Vlad-Florin Panait | vlad_panait@yahoo.com | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-PXF3JMVK', 'paid', 'vlad_panait@yahoo.com', 'Vlad-Florin Panait', '0726653325', 1500, 0, 'ok', '2026-01-15 21:15:57', 'ro', '2026-01-15 21:15:57', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-2E712B62B79D', '{"code":"FL26-2E712B62B79D","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-E78F89910F88', '{"code":"FL26-E78F89910F88","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6110 | Raluca Elena Dinescu | ralucadinescu1980@gmail.com | 200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-TA3H8ZKE', 'paid', 'ralucadinescu1980@gmail.com', 'Raluca Elena Dinescu', '+40727857857', 200, 0, 'ok', '2026-01-19 13:22:03', 'ro', '2026-01-19 13:22:03', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-EAD20EA22864', '{"code":"FL26-EAD20EA22864","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 100, 'FL26-659BC1D1F852', '{"code":"FL26-659BC1D1F852","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6111 | Roxana Elena Fediuc | roxanaepopovici@gmail.com | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-WL63VHXM', 'paid', 'roxanaepopovici@gmail.com', 'Roxana Elena Fediuc', '0745063587', 1500, 0, 'ok', '2026-01-19 13:59:30', 'ro', '2026-01-19 13:59:30', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-26664BF69C95', '{"code":"FL26-26664BF69C95","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-41434B0AFABB', '{"code":"FL26-41434B0AFABB","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6112 | Roxana Ciubotariu | roxana.alexandroaie@gmail.com | 1500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-P63RAC4X', 'paid', 'roxana.alexandroaie@gmail.com', 'Roxana Ciubotariu', '0774406024', 1500, 0, 'ok', '2026-01-19 17:28:34', 'ro', '2026-01-19 17:28:34', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-216D6BB1877A', '{"code":"FL26-216D6BB1877A","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-2048CA452CC9', '{"code":"FL26-2048CA452CC9","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6113 | Gabriela Lazar | gabilazar23@yahoo.com | 750 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-T3A6DYN3', 'paid', 'gabilazar23@yahoo.com', 'Gabriela Lazar', '0040747377767', 750, 0, 'ok', '2026-01-19 17:44:16', 'ro', '2026-01-19 17:44:16', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-E25EFDBE6417', '{"code":"FL26-E25EFDBE6417","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6114 | Alexandru Irimia | alecsirimia155@gmail.com | 750 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-8J9JZMFS', 'paid', 'alecsirimia155@gmail.com', 'Alexandru Irimia', '0747360116', 750, 0, 'ok', '2026-01-19 18:03:51', 'ro', '2026-01-19 18:03:51', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 750, 'FL26-F9FB683532BF', '{"code":"FL26-F9FB683532BF","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6116 | Ghindea Elisabeta Rozalia | bettycuta@yahoo.com | 900 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-LE5FUBD2', 'paid', 'bettycuta@yahoo.com', 'Ghindea Elisabeta Rozalia', '+40 726983397', 900, 0, 'ok', '2026-01-19 18:35:14', 'ro', '2026-01-19 18:35:14', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 900, 'FL26-6F1575E9051B', '{"code":"FL26-6F1575E9051B","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6117 | Pasesnic Dmitrii | dimpas8804@gmail.com | 1660 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-F7KQUXD3', 'paid', 'dimpas8804@gmail.com', 'Pasesnic Dmitrii', '068595583', 1660, 0, 'ok', '2026-01-19 19:46:23', 'ro', '2026-01-19 19:46:23', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-C34DAF0812F9', '{"code":"FL26-C34DAF0812F9","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 380, 'FL26-0EAB5FB1A601', '{"code":"FL26-0EAB5FB1A601","event":"Festivalul Lupilor 2026","version":2}'),
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 900, 'FL26-0821D9979D81', '{"code":"FL26-0821D9979D81","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6124 | Cristina Janau | janau.cristina@gmail.com | 1200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-C8VSRSKT', 'paid', 'janau.cristina@gmail.com', 'Cristina Janau', '069067826', 1200, 0, 'ok', '2026-01-21 15:00:29', 'ro', '2026-01-21 15:00:29', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 1200, 'FL26-68B996C284CA', '{"code":"FL26-68B996C284CA","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6125 | Pistrui Veaceslav | adriana.pistrui.87@mail.ru | 1200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-W4DZ8SWQ', 'paid', 'adriana.pistrui.87@mail.ru', 'Pistrui Veaceslav', '078079005', 1200, 0, 'ok', '2026-01-22 17:57:15', 'ro', '2026-01-22 17:57:15', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('fa77706c-6abf-4724-ac6e-e70ddda678fe', 1200, 'FL26-BE6D79E9C56C', '{"code":"FL26-BE6D79E9C56C","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6126 | roman harabara | romanharabara@msn.com | 2500 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-M4Y38GBH', 'paid', 'romanharabara@msn.com', 'roman harabara', '00393292041621', 2500, 0, 'ok', '2026-01-24 18:28:20', 'ro', '2026-01-24 18:28:20', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('d5da39b7-8afc-441c-be6f-36be47e396dc', 2500, 'FL26-B86997B663C5', '{"code":"FL26-B86997B663C5","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6128 | Radu Duca | ducaradu111@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-UB4DL9H6', 'paid', 'ducaradu111@gmail.com', 'Radu Duca', '07377827960', 1000, 0, 'ok', '2026-01-27 19:59:14', 'ro', '2026-01-27 19:59:14', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 1000, 'FL26-88634E876D64', '{"code":"FL26-88634E876D64","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6142 | Vlad Chis | chisvlad.pfa@gmail.com | 2000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-BW6EJBA7', 'paid', 'chisvlad.pfa@gmail.com', 'Vlad Chis', '0748171661', 2000, 0, 'ok', '2026-02-01 09:52:34', 'ro', '2026-02-01 09:52:34', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 1000, 'FL26-F2BD9C42B17E', '{"code":"FL26-F2BD9C42B17E","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 1000, 'FL26-B32688FB6579', '{"code":"FL26-B32688FB6579","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6143 | Ramona Apreutesei | ramona.apreutesei@yahoo.com | 2000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-265TAP3L', 'paid', 'ramona.apreutesei@yahoo.com', 'Ramona Apreutesei', '0740690643', 2000, 0, 'ok', '2026-02-03 12:38:41', 'ro', '2026-02-03 12:38:41', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('9c8639e3-5f85-428f-9a26-c8e61428d678', 2000, 'FL26-9928CDA3DFBA', '{"code":"FL26-9928CDA3DFBA","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6146 | Vasea Pincov | wasea.pinkov@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-G4XBBQSY', 'paid', 'wasea.pinkov@gmail.com', 'Vasea Pincov', '60442001', 1000, 0, 'ok', '2026-02-14 20:31:07', 'ro', '2026-02-14 20:31:07', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-072FF1CCB2F3', '{"code":"FL26-072FF1CCB2F3","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-CEE721D9782A', '{"code":"FL26-CEE721D9782A","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6150 | Concurs winner | NULL | 1600 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-7HXVU3RL', 'paid', 'NULL', 'Concurs winner', '', 1600, 0, 'ok', '2026-02-16 11:15:07', 'ro', '2026-02-16 11:15:07', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 800, 'FL26-6166DA8905A5', '{"code":"FL26-6166DA8905A5","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 800, 'FL26-118AD939EC00', '{"code":"FL26-118AD939EC00","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6151 | Daniela Petrov | petrovadana55@gmail.com | 1170 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-6ZF7VU5F', 'paid', 'petrovadana55@gmail.com', 'Daniela Petrov', '+37368428455', 1170, 0, 'ok', '2026-02-18 08:18:45', 'ro', '2026-02-18 08:18:45', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 720, 'FL26-336958949EC5', '{"code":"FL26-336958949EC5","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 450, 'FL26-E3579EA45CBB', '{"code":"FL26-E3579EA45CBB","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6153 | Alexia Buzenco | lexibuzenco@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-HKQ2ES8X', 'paid', 'lexibuzenco@gmail.com', 'Alexia Buzenco', '078998320', 1000, 0, 'ok', '2026-02-23 13:39:28', 'ro', '2026-02-23 13:39:28', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-1D83C2445933', '{"code":"FL26-1D83C2445933","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-FDEFB4710BFD', '{"code":"FL26-FDEFB4710BFD","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6154 | Ana-Cristina Patranoiu | patranoiuanacristina@gmail.com | 2000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-CD3XTMEK', 'paid', 'patranoiuanacristina@gmail.com', 'Ana-Cristina Patranoiu', '+41782476131', 2000, 0, 'ok', '2026-02-24 12:13:55', 'ro', '2026-02-24 12:13:55', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 1000, 'FL26-ADC8E2A8E7BA', '{"code":"FL26-ADC8E2A8E7BA","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 1000, 'FL26-6E684CFC5206', '{"code":"FL26-6E684CFC5206","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6156 | Oleg Vrabie | ovrabie@outlook.com | 2000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-ZH5TVB7S', 'paid', 'ovrabie@outlook.com', 'Oleg Vrabie', '+4915202696521', 2000, 0, 'ok', '2026-03-01 13:43:57', 'ro', '2026-03-01 13:43:57', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 1000, 'FL26-C8D8BD5A1002', '{"code":"FL26-C8D8BD5A1002","event":"Festivalul Lupilor 2026","version":2}'),
  ('dc85e3de-1b17-4c86-b4b5-a6f057ffef63', 1000, 'FL26-F4614D7DD8C4', '{"code":"FL26-F4614D7DD8C4","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6157 | Alexandru Buzenco | abuzenco@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-DPUFQH8C', 'paid', 'abuzenco@gmail.com', 'Alexandru Buzenco', '+4915154169579', 1000, 0, 'ok', '2026-03-02 09:15:49', 'ro', '2026-03-02 09:15:49', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-7EAD5C5AC1FA', '{"code":"FL26-7EAD5C5AC1FA","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-30248A2A175E', '{"code":"FL26-30248A2A175E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6158 | Ioana Popescu | popescumioana@gmail.com | 3200 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-CRTEGE6D', 'paid', 'popescumioana@gmail.com', 'Ioana Popescu', '0722456216', 3200, 0, 'ok', '2026-03-06 07:53:14', 'ro', '2026-03-06 07:53:14', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 800, 'FL26-0B49A975ECEB', '{"code":"FL26-0B49A975ECEB","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 800, 'FL26-92DBD8EC42C8', '{"code":"FL26-92DBD8EC42C8","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 800, 'FL26-56406AFD83FD', '{"code":"FL26-56406AFD83FD","event":"Festivalul Lupilor 2026","version":2}'),
  ('22a27b41-1ec5-451d-91bc-b765a2e30ce3', 800, 'FL26-5313D09C675E', '{"code":"FL26-5313D09C675E","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

-- WP Order #6162 | Ana Popa | anavpopa@gmail.com | 1000 MDL
WITH new_order AS (
  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)
  VALUES ('WP-ASQ9TSW7', 'paid', 'anavpopa@gmail.com', 'Ana Popa', '069270507', 1000, 0, 'ok', '2026-03-19 15:30:42', 'ro', '2026-03-19 15:30:42', NOW())
  RETURNING id
)
INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)
SELECT new_order.id,
  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false
FROM new_order,
(VALUES
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-18F1A2E581DC', '{"code":"FL26-18F1A2E581DC","event":"Festivalul Lupilor 2026","version":2}'),
  ('6a783e5a-5984-4b08-a9db-d5ef294335f6', 500, 'FL26-67641E655D60', '{"code":"FL26-67641E655D60","event":"Festivalul Lupilor 2026","version":2}')
) AS v(ticket_id, unit_price, ticket_code, qr_data);

COMMIT;

-- Summary: 134 orders, 267 items, 135,110 MDL