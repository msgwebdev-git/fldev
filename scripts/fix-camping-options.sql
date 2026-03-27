-- ============================================================
-- Fix camping options for migrated WP orders
-- Updates ticket_option_id on Camping Pass order items
-- ============================================================

BEGIN;

-- WP#6044 korcevoy.ui@gmail.com | tentSpot | Tent Spot – amplasarea cortului în zona fără vehicule
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'korcevoy.ui@gmail.com' AND created_at::text LIKE '2025-10-03 08:32:00%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'korcevoy.ui@gmail.com' AND created_at::text LIKE '2025-10-03 08:32:00%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6061 oana.pieleanu@yahoo.com | tentSpot | Tent Spot – amplasarea cortului în zona fără vehicule, Parking Spot – parcare pentru 1 vehicul în zona de camping
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'oana.pieleanu@yahoo.com' AND created_at::text LIKE '2025-11-03 10:58:14%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'oana.pieleanu@yahoo.com' AND created_at::text LIKE '2025-11-03 10:58:14%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6062 resiosnicos@gmail.com | tentSpot | Tent Spot – amplasarea cortului în zona fără vehicule, Parking Spot – parcare pentru 1 vehicul în zona de camping
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'resiosnicos@gmail.com' AND created_at::text LIKE '2025-11-03 16:36:10%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'resiosnicos@gmail.com' AND created_at::text LIKE '2025-11-03 16:36:10%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6063 gaby_sv2003@yahoo.com | tentSpot | Tent Spot – amplasarea cortului în zona fără vehicule
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'gaby_sv2003@yahoo.com' AND created_at::text LIKE '2025-11-04 08:14:02%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'gaby_sv2003@yahoo.com' AND created_at::text LIKE '2025-11-04 08:14:02%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6101 dodu.corina@gmail.com | parkingSpot | Parking Spot – parcare pentru 1 vehicul în zona de camping
UPDATE order_items SET ticket_option_id = 'a8d0aaaa-87fd-4503-a451-cec240680082'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'dodu.corina@gmail.com' AND created_at::text LIKE '2026-01-14 08:57:41%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = 'e91d00da-e89a-48f9-b40a-03fce0a28d3b'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'dodu.corina@gmail.com' AND created_at::text LIKE '2026-01-14 08:57:41%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6102 danycosernitan@gmail.com | camperSpot | Camper / RV Spot – parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă
UPDATE order_items SET ticket_option_id = '914661f4-b7ee-4686-b593-51c9b5288b92'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'danycosernitan@gmail.com' AND created_at::text LIKE '2026-01-14 13:54:58%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '99a7867b-84bf-4690-926b-98fd5bfcd08f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'danycosernitan@gmail.com' AND created_at::text LIKE '2026-01-14 13:54:58%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6104 viorelgavrila22@gmail.com | camperSpot | Camper / RV Spot – parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă
UPDATE order_items SET ticket_option_id = '914661f4-b7ee-4686-b593-51c9b5288b92'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'viorelgavrila22@gmail.com' AND created_at::text LIKE '2026-01-15 13:59:47%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '99a7867b-84bf-4690-926b-98fd5bfcd08f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'viorelgavrila22@gmail.com' AND created_at::text LIKE '2026-01-15 13:59:47%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6107 innaciolpan@gmail.com | camperSpot | Camper / RV Spot – parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă
UPDATE order_items SET ticket_option_id = '914661f4-b7ee-4686-b593-51c9b5288b92'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'innaciolpan@gmail.com' AND created_at::text LIKE '2026-01-15 19:31:04%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '99a7867b-84bf-4690-926b-98fd5bfcd08f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'innaciolpan@gmail.com' AND created_at::text LIKE '2026-01-15 19:31:04%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6108 vlad_panait@yahoo.com | tentSpot | Tent Spot – amplasarea cortului în zona fără vehicule
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'vlad_panait@yahoo.com' AND created_at::text LIKE '2026-01-15 21:15:57%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'vlad_panait@yahoo.com' AND created_at::text LIKE '2026-01-15 21:15:57%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6110 ralucadinescu1980@gmail.com | camperSpot | Camper / RV Spot – parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă
UPDATE order_items SET ticket_option_id = '914661f4-b7ee-4686-b593-51c9b5288b92'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'ralucadinescu1980@gmail.com' AND created_at::text LIKE '2026-01-19 13:22:03%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '99a7867b-84bf-4690-926b-98fd5bfcd08f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'ralucadinescu1980@gmail.com' AND created_at::text LIKE '2026-01-19 13:22:03%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6111 roxanaepopovici@gmail.com | camperSpot | Tent Spot – amplasarea cortului în zona fără vehicule, Parking Spot – parcare pentru 1 vehicul în zona de camping, Camper / RV Spot – parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă
UPDATE order_items SET ticket_option_id = '914661f4-b7ee-4686-b593-51c9b5288b92'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'roxanaepopovici@gmail.com' AND created_at::text LIKE '2026-01-19 13:59:30%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '99a7867b-84bf-4690-926b-98fd5bfcd08f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'roxanaepopovici@gmail.com' AND created_at::text LIKE '2026-01-19 13:59:30%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6112 roxana.alexandroaie@gmail.com | tentSpot | Parking Spot – parcare pentru 1 vehicul în zona de camping, Tent Spot – amplasarea cortului în zona fără vehicule
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'roxana.alexandroaie@gmail.com' AND created_at::text LIKE '2026-01-19 17:28:34%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'roxana.alexandroaie@gmail.com' AND created_at::text LIKE '2026-01-19 17:28:34%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6113 gabilazar23@yahoo.com | camperSpot | Tent Spot – amplasarea cortului în zona fără vehicule, Camper / RV Spot – parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă
UPDATE order_items SET ticket_option_id = '914661f4-b7ee-4686-b593-51c9b5288b92'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'gabilazar23@yahoo.com' AND created_at::text LIKE '2026-01-19 17:44:16%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '99a7867b-84bf-4690-926b-98fd5bfcd08f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'gabilazar23@yahoo.com' AND created_at::text LIKE '2026-01-19 17:44:16%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6114 alecsirimia155@gmail.com | camperSpot | Tent Spot – amplasarea cortului în zona fără vehicule, Camper / RV Spot – parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă
UPDATE order_items SET ticket_option_id = '914661f4-b7ee-4686-b593-51c9b5288b92'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'alecsirimia155@gmail.com' AND created_at::text LIKE '2026-01-19 18:03:51%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '99a7867b-84bf-4690-926b-98fd5bfcd08f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'alecsirimia155@gmail.com' AND created_at::text LIKE '2026-01-19 18:03:51%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6126 romanharabara@msn.com | parkingSpot | Parking Spot – parcare pentru 1 vehicul în zona de camping
UPDATE order_items SET ticket_option_id = 'a8d0aaaa-87fd-4503-a451-cec240680082'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'romanharabara@msn.com' AND created_at::text LIKE '2026-01-24 18:28:20%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = 'e91d00da-e89a-48f9-b40a-03fce0a28d3b'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'romanharabara@msn.com' AND created_at::text LIKE '2026-01-24 18:28:20%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6128 ducaradu111@gmail.com | parkingSpot | Parking Spot – parcare pentru 1 vehicul în zona de camping
UPDATE order_items SET ticket_option_id = 'a8d0aaaa-87fd-4503-a451-cec240680082'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'ducaradu111@gmail.com' AND created_at::text LIKE '2026-01-27 19:59:14%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = 'e91d00da-e89a-48f9-b40a-03fce0a28d3b'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'ducaradu111@gmail.com' AND created_at::text LIKE '2026-01-27 19:59:14%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6142 chisvlad.pfa@gmail.com | tentSpot | Tent Spot – amplasarea cortului în zona fără vehicule, Parking Spot – parcare pentru 1 vehicul în zona de camping, Parking Spot – parcare pentru 1 vehicul în zona de camping
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'chisvlad.pfa@gmail.com' AND created_at::text LIKE '2026-02-01 09:52:34%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'chisvlad.pfa@gmail.com' AND created_at::text LIKE '2026-02-01 09:52:34%' AND order_number LIKE 'WP-%' LIMIT 1);

-- WP#6154 patranoiuanacristina@gmail.com | tentSpot | Tent Spot – amplasarea cortului în zona fără vehicule, Tent Spot – amplasarea cortului în zona fără vehicule
UPDATE order_items SET ticket_option_id = '929494db-d110-460c-b536-931315ef9fe5'
WHERE ticket_id = 'dc85e3de-1b17-4c86-b4b5-a6f057ffef63'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'patranoiuanacristina@gmail.com' AND created_at::text LIKE '2026-02-24 12:13:55%' AND order_number LIKE 'WP-%' LIMIT 1);

UPDATE order_items SET ticket_option_id = '3cb582cb-0db3-490b-8d03-40cd8a84286f'
WHERE ticket_id = 'd5da39b7-8afc-441c-be6f-36be47e396dc'
  AND order_id = (SELECT id FROM orders WHERE customer_email = 'patranoiuanacristina@gmail.com' AND created_at::text LIKE '2026-02-24 12:13:55%' AND order_number LIKE 'WP-%' LIMIT 1);

COMMIT;

-- Verify: count items with camping options set
-- SELECT count(*) FROM order_items WHERE ticket_option_id IS NOT NULL AND order_id IN (SELECT id FROM orders WHERE order_number LIKE 'WP-%');
