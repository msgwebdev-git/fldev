-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title_ro text NOT NULL,
  title_ru text NOT NULL,
  description_ro text,
  description_ru text,
  category text NOT NULL CHECK (category = ANY (ARRAY['entertainment'::text, 'workshops'::text, 'relaxation'::text, 'food'::text, 'family'::text])),
  icon text NOT NULL,
  location text,
  time text,
  is_highlight boolean DEFAULT false,
  year text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.aftermovies (
  id integer NOT NULL DEFAULT nextval('aftermovies_id_seq'::regclass),
  year text NOT NULL,
  video_id text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT aftermovies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.app_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE CHECK (platform = ANY (ARRAY['ios'::text, 'android'::text])),
  latest_version text NOT NULL,
  min_version text NOT NULL,
  update_url text NOT NULL,
  release_notes_ro text,
  release_notes_ru text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT app_versions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.artists (
  id integer NOT NULL DEFAULT nextval('artists_id_seq'::regclass),
  name character varying NOT NULL,
  image_url text,
  genre character varying,
  country character varying,
  is_headliner boolean DEFAULT false,
  day integer DEFAULT 1,
  stage character varying,
  year character varying NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_active boolean DEFAULT true,
  performance_time character varying,
  instagram_url text,
  spotify_url text,
  youtube_url text,
  CONSTRAINT artists_pkey PRIMARY KEY (id)
);
CREATE TABLE public.b2b_order_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  b2b_order_id uuid NOT NULL,
  status text NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT b2b_order_history_pkey PRIMARY KEY (id),
  CONSTRAINT b2b_order_history_b2b_order_id_fkey FOREIGN KEY (b2b_order_id) REFERENCES public.b2b_orders(id),
  CONSTRAINT b2b_order_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.b2b_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  b2b_order_id uuid NOT NULL,
  ticket_id uuid NOT NULL,
  ticket_option_id uuid,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  discount_percent numeric DEFAULT 0 CHECK (discount_percent >= 0::numeric AND discount_percent <= 100::numeric),
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  ticket_code character varying UNIQUE,
  qr_data text,
  status character varying DEFAULT 'pending'::character varying,
  scanned_at timestamp with time zone,
  ticket_url text,
  checked_in_at timestamp with time zone,
  checked_in_by text,
  CONSTRAINT b2b_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT b2b_order_items_b2b_order_id_fkey FOREIGN KEY (b2b_order_id) REFERENCES public.b2b_orders(id),
  CONSTRAINT b2b_order_items_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id),
  CONSTRAINT b2b_order_items_ticket_option_id_fkey FOREIGN KEY (ticket_option_id) REFERENCES public.ticket_options(id)
);
CREATE TABLE public.b2b_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_tax_id text,
  company_address text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['online'::text, 'invoice'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'invoice_sent'::text, 'paid'::text, 'tickets_generated'::text, 'tickets_sent'::text, 'completed'::text, 'cancelled'::text])),
  total_amount numeric NOT NULL,
  discount_percent numeric DEFAULT 0 CHECK (discount_percent >= 0::numeric AND discount_percent <= 100::numeric),
  discount_amount numeric DEFAULT 0,
  final_amount numeric NOT NULL,
  invoice_url text,
  invoice_number text UNIQUE,
  invoice_sent_at timestamp with time zone,
  paid_at timestamp with time zone,
  tickets_sent_at timestamp with time zone,
  maib_transaction_id text,
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'ok'::text, 'failed'::text, 'reversed'::text])),
  failure_reason text,
  notes text,
  language text DEFAULT 'ro'::text CHECK (language = ANY (ARRAY['ro'::text, 'ru'::text])),
  client_ip text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tickets_generated_at timestamp with time zone,
  CONSTRAINT b2b_orders_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contacts (
  id integer NOT NULL DEFAULT nextval('contacts_id_seq'::regclass),
  department_key character varying NOT NULL UNIQUE,
  email character varying NOT NULL,
  phone character varying,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.device_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform = ANY (ARRAY['ios'::text, 'android'::text])),
  language text DEFAULT 'ro'::text CHECK (language = ANY (ARRAY['ro'::text, 'ru'::text])),
  user_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT device_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT device_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  email_type text NOT NULL CHECK (email_type = ANY (ARRAY['confirmation'::text, 'reminder'::text, 'refund'::text])),
  recipient text NOT NULL,
  status text DEFAULT 'sent'::text CHECK (status = ANY (ARRAY['sent'::text, 'failed'::text, 'bounced'::text])),
  error_message text,
  sent_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_logs_pkey PRIMARY KEY (id),
  CONSTRAINT email_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.faq (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_ro text NOT NULL,
  question_ru text NOT NULL,
  answer_ro text NOT NULL,
  answer_ru text NOT NULL,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faq_pkey PRIMARY KEY (id)
);
CREATE TABLE public.festival_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id text NOT NULL UNIQUE,
  title_ro text NOT NULL,
  title_ru text NOT NULL,
  icon text NOT NULL,
  keywords_ro jsonb NOT NULL DEFAULT '[]'::jsonb,
  keywords_ru jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_ro jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_ru jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT festival_rules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gallery (
  id integer NOT NULL DEFAULT nextval('gallery_id_seq'::regclass),
  year character varying NOT NULL,
  filename character varying NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  width integer DEFAULT 800,
  height integer DEFAULT 600,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_active boolean DEFAULT true,
  thumbnail_url text,
  full_url text,
  CONSTRAINT gallery_pkey PRIMARY KEY (id)
);
CREATE TABLE public.news (
  id integer NOT NULL DEFAULT nextval('news_id_seq'::regclass),
  slug text NOT NULL UNIQUE,
  title_ru text NOT NULL,
  excerpt_ru text,
  image text,
  date date DEFAULT CURRENT_DATE,
  category text,
  published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  content_ru text,
  title_ro text,
  excerpt_ro text,
  content_ro text,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  CONSTRAINT news_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  ticket_id uuid NOT NULL,
  ticket_option_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  ticket_code text NOT NULL UNIQUE,
  qr_data text NOT NULL,
  pdf_url text,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'valid'::text CHECK (status = ANY (ARRAY['valid'::text, 'used'::text, 'refunded'::text])),
  scanned_at timestamp with time zone,
  is_invitation boolean DEFAULT false,
  checked_in_at timestamp with time zone,
  checked_in_by text,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id),
  CONSTRAINT order_items_ticket_option_id_fkey FOREIGN KEY (ticket_option_id) REFERENCES public.ticket_options(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text, 'expired'::text, 'cancelled'::text])),
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  total_amount numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  promo_code text,
  maib_transaction_id text,
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'ok'::text, 'failed'::text, 'reversed'::text])),
  failure_reason text,
  paid_at timestamp with time zone,
  reminder_sent_at timestamp with time zone,
  language text DEFAULT 'ro'::text CHECK (language = ANY (ARRAY['ro'::text, 'ru'::text])),
  client_ip text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reminder_count integer DEFAULT 0,
  refund_reason text,
  refunded_at timestamp with time zone,
  refunded_by text,
  is_invitation boolean DEFAULT false,
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);
CREATE TABLE public.partners (
  id integer NOT NULL DEFAULT nextval('partners_id_seq'::regclass),
  name character varying NOT NULL,
  logo_url text,
  website text,
  category character varying NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.program_events (
  id integer NOT NULL DEFAULT nextval('program_events_id_seq'::regclass),
  date character varying NOT NULL,
  day integer NOT NULL DEFAULT 1,
  time character varying NOT NULL,
  artist character varying NOT NULL,
  stage character varying NOT NULL,
  genre character varying,
  is_headliner boolean DEFAULT false,
  year character varying(10) NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT program_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent numeric CHECK (discount_percent >= 0::numeric AND discount_percent <= 100::numeric),
  discount_amount numeric CHECK (discount_amount >= 0::numeric),
  usage_limit integer,
  used_count integer DEFAULT 0,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  min_order_amount numeric DEFAULT NULL::numeric,
  allowed_ticket_ids ARRAY,
  one_per_email boolean DEFAULT false,
  CONSTRAINT promo_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.push_notifications_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  target_platform text CHECK (target_platform = ANY (ARRAY['ios'::text, 'android'::text, 'all'::text])),
  target_language text CHECK (target_language = ANY (ARRAY['ro'::text, 'ru'::text, 'all'::text])),
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  sent_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT push_notifications_log_pkey PRIMARY KEY (id),
  CONSTRAINT push_notifications_log_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.site_contacts (
  id integer NOT NULL DEFAULT nextval('site_contacts_id_seq'::regclass),
  key character varying NOT NULL UNIQUE,
  value text NOT NULL,
  type character varying DEFAULT 'text'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_contacts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  description text,
  category text DEFAULT 'general'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ticket_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid,
  name text NOT NULL,
  name_ro text NOT NULL,
  name_ru text NOT NULL,
  description_ro text,
  description_ru text,
  price_modifier numeric DEFAULT 0,
  is_default boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ticket_options_pkey PRIMARY KEY (id),
  CONSTRAINT ticket_options_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id)
);
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_ro text NOT NULL,
  name_ru text NOT NULL,
  description_ro text,
  description_ru text,
  features_ro ARRAY DEFAULT '{}'::text[],
  features_ru ARRAY DEFAULT '{}'::text[],
  price numeric NOT NULL,
  original_price numeric,
  currency text DEFAULT 'MDL'::text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  max_per_order integer DEFAULT 10,
  has_options boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id)
);