-- Seed data for local development only. Not run in production.

insert into public.service_categories (id, slug, name_nl, icon, is_energy_transition) values
  (gen_random_uuid(), 'loodgieter',  'Loodgieter',            'wrench',    false),
  (gen_random_uuid(), 'elektricien', 'Elektricien',           'zap',       false),
  (gen_random_uuid(), 'schilder',    'Schilder',              'paint',     false),
  (gen_random_uuid(), 'tegelzetter', 'Tegelzetter',           'grid',      false),
  (gen_random_uuid(), 'warmtepomp',  'Warmtepomp installatie', 'flame',     true),
  (gen_random_uuid(), 'zonnepanelen','Zonnepanelen',           'sun',       true),
  (gen_random_uuid(), 'isolatie',    'Isolatie',               'shield',    true),
  (gen_random_uuid(), 'klusjesman',  'Klusjesman',             'hammer',    false);

insert into public.feature_flags (key, payload) values
  ('ai_voice_post',   '{"enabled": true, "percentage": 100}'::jsonb),
  ('ai_photo_quote',  '{"enabled": true, "percentage": 100}'::jsonb),
  ('chat_translation','{"enabled": true, "percentage": 100}'::jsonb),
  ('subsidy_copilot', '{"enabled": true, "percentage": 100}'::jsonb),
  ('neighbor_blurb',  '{"enabled": false, "percentage": 0}'::jsonb),
  ('instant_payout',  '{"enabled": true, "percentage": 100}'::jsonb);
