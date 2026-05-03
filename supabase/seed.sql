insert into public.businesses (id, name, industry, phone, whatsapp)
values (
  '00000000-0000-4000-8000-000000000001',
  'LeadPilot Furniture',
  'ריהוט והתקנות',
  '03-5551234',
  '050-1234567'
)
on conflict (id) do update set
  name = excluded.name,
  industry = excluded.industry,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp;

insert into public.business_settings (business_id, automation_items)
values (
  '00000000-0000-4000-8000-000000000001',
  array[
    'סוכן קולי: שכבת provider תתווסף בשלבים הבאים.',
    'WhatsApp: נשמור על abstraction לפני חיבור Meta.',
    'Payments: קישורי תשלום ייכנסו עם mock provider נפרד.'
  ]
)
on conflict (business_id) do update set
  automation_items = excluded.automation_items;

insert into public.leads (id, business_id, name, phone, source, status, estimated_value_agorot, interest_notes)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'נועה כהן', '050-123-4567', 'פייסבוק', 'חדש', 950000, 'מעוניינת בארון הזזה כולל התקנה'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'אורי לוי', '052-987-6543', 'אתר', 'מעקב', 1420000, 'ממתין לאישור סלוט התקנה מתאים'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'חן ישראלי', '054-444-8899', 'WhatsApp', 'נקבעה פגישה', 680000, 'נקבעה פגישה למדידה בבית הלקוח')
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  source = excluded.source,
  status = excluded.status,
  estimated_value_agorot = excluded.estimated_value_agorot,
  interest_notes = excluded.interest_notes;

insert into public.products (id, business_id, name, price_agorot, stock, tag)
values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'ארון הזזה דגם כרמל', 349000, 8, 'הנמכר ביותר'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'מזנון אלון טבעי', 219000, 3, 'במלאי מוגבל'),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'שולחן אוכל נפתח', 485000, 5, 'חדש')
on conflict (id) do update set
  name = excluded.name,
  price_agorot = excluded.price_agorot,
  stock = excluded.stock,
  tag = excluded.tag;

insert into public.calendar_slots (id, business_id, title, window_label, starts_at, ends_at, status, owner)
values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'התקנה בתל אביב', 'יום ג'', 09:00-11:00', '2026-05-05 09:00:00+03', '2026-05-05 11:00:00+03', 'שמור', 'נועה כהן'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'אספקה בפתח תקווה', 'יום ד'', 12:00-14:00', '2026-05-06 12:00:00+03', '2026-05-06 14:00:00+03', 'פנוי', 'צוות לוגיסטיקה'),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'מדידה בבית הלקוח', 'יום ה'', 17:00-18:00', '2026-05-07 17:00:00+03', '2026-05-07 18:00:00+03', 'הושלם', 'אורי לוי')
on conflict (id) do update set
  title = excluded.title,
  window_label = excluded.window_label,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  owner = excluded.owner;

insert into public.sales_calls (id, business_id, lead_id, lead_name, phone, interest, status, summary, created_at)
values
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'נועה כהן', '050-123-4567', 'מעוניינת בארון הזזה כולל התקנה', 'ended', 'הלקוחה ביקשה לקבל דוגמאות ולהמשיך לשיחת מעקב מחר.', now() - interval '2 hours'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'אורי לוי', '052-987-6543', 'ממתין לאישור סלוט התקנה מתאים ליום חמישי', 'in-progress', 'ממתין לאישור סלוט התקנה מתאים ליום חמישי.', now() - interval '3 hours')
on conflict (id) do update set
  lead_id = excluded.lead_id,
  lead_name = excluded.lead_name,
  phone = excluded.phone,
  interest = excluded.interest,
  status = excluded.status,
  summary = excluded.summary;
