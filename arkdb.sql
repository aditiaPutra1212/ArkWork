--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-01-21 15:24:21

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 173215)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 876 (class 1247 OID 173228)
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'submitted',
    'review',
    'shortlist',
    'rejected',
    'hired'
);


ALTER TYPE public."ApplicationStatus" OWNER TO postgres;

--
-- TOC entry 891 (class 1247 OID 173292)
-- Name: BillingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BillingStatus" AS ENUM (
    'none',
    'trial',
    'active',
    'past_due',
    'canceled'
);


ALTER TYPE public."BillingStatus" OWNER TO postgres;

--
-- TOC entry 885 (class 1247 OID 173258)
-- Name: Contract; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Contract" AS ENUM (
    'EPC',
    'SUPPLY',
    'CONSULTING',
    'MAINTENANCE',
    'PSC',
    'SERVICE',
    'JOC',
    'TURNKEY',
    'LOGISTICS',
    'DRILLING',
    'O&M'
);


ALTER TYPE public."Contract" OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 173348)
-- Name: Education; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Education" AS ENUM (
    'SMA/SMK',
    'D3',
    'S1',
    'S2',
    'S3'
);


ALTER TYPE public."Education" OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 173340)
-- Name: RemoteMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RemoteMode" AS ENUM (
    'ON_SITE',
    'REMOTE',
    'HYBRID'
);


ALTER TYPE public."RemoteMode" OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 173382)
-- Name: ReportAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportAction" AS ENUM (
    'NONE',
    'HIDE_JOB',
    'DELETE_JOB',
    'BLOCK_EMPLOYER'
);


ALTER TYPE public."ReportAction" OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 173360)
-- Name: ReportReason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportReason" AS ENUM (
    'SCAM',
    'PHISHING',
    'DUPLICATE',
    'MISLEADING',
    'OTHER'
);


ALTER TYPE public."ReportReason" OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 173372)
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'DISMISSED',
    'ACTION_TAKEN'
);


ALTER TYPE public."ReportStatus" OWNER TO postgres;

--
-- TOC entry 879 (class 1247 OID 173240)
-- Name: Sector; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Sector" AS ENUM (
    'OIL_GAS',
    'RENEWABLE_ENERGY',
    'UTILITIES',
    'ENGINEERING'
);


ALTER TYPE public."Sector" OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 173250)
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'OPEN',
    'PREQUALIFICATION',
    'CLOSED'
);


ALTER TYPE public."Status" OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 173304)
-- Name: company_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_size AS ENUM (
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1001-5000',
    '5001-10000',
    '10000+'
);


ALTER TYPE public.company_size OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 173282)
-- Name: employer_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employer_status AS ENUM (
    'draft',
    'active',
    'suspended',
    'archived'
);


ALTER TYPE public.employer_status OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 173330)
-- Name: onboarding_step; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.onboarding_step AS ENUM (
    'PACKAGE',
    'JOB',
    'VERIFY',
    'DONE'
);


ALTER TYPE public.onboarding_step OWNER TO postgres;

--
-- TOC entry 897 (class 1247 OID 173322)
-- Name: verification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.verification_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 173410)
-- Name: Admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    username text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Admin" OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 173532)
-- Name: Job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Job" (
    id uuid NOT NULL,
    "employerId" uuid NOT NULL,
    title text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDraft" boolean DEFAULT false NOT NULL,
    "isHidden" boolean DEFAULT false NOT NULL,
    "hiddenReason" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    location text,
    employment text,
    salary_min integer,
    salary_max integer,
    currency text DEFAULT 'IDR'::text,
    remote_mode public."RemoteMode" DEFAULT 'ON_SITE'::public."RemoteMode",
    exp_min_years integer,
    education public."Education",
    deadline timestamp(3) without time zone,
    tags text[] DEFAULT ARRAY[]::text[],
    requirements text
);


ALTER TABLE public."Job" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 173420)
-- Name: Tender; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tender" (
    id integer NOT NULL,
    title text NOT NULL,
    buyer text NOT NULL,
    sector public."Sector" NOT NULL,
    location text NOT NULL,
    status public."Status" NOT NULL,
    contract public."Contract" NOT NULL,
    deadline timestamp(3) without time zone NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    documents text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "teamSlots" integer DEFAULT 0 NOT NULL,
    budget_usd bigint NOT NULL
);


ALTER TABLE public."Tender" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 173419)
-- Name: Tender_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tender_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tender_id_seq" OWNER TO postgres;

--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 221
-- Name: Tender_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tender_id_seq" OWNED BY public."Tender".id;


--
-- TOC entry 218 (class 1259 OID 173391)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "passwordHash" text,
    "photoUrl" text,
    "cvUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "oauthProvider" text,
    "oauthId" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verificationToken" text,
    "verificationTokenExpiresAt" timestamp(3) without time zone,
    "resetToken" text,
    "resetTokenExpiresAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 173216)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 173455)
-- Name: employer_admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employer_admin_users (
    id uuid NOT NULL,
    employer_id uuid NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    full_name text,
    phone text,
    is_owner boolean DEFAULT true NOT NULL,
    agreed_tos_at timestamp(3) without time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.employer_admin_users OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 173475)
-- Name: employer_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employer_contacts (
    id uuid NOT NULL,
    employer_id uuid NOT NULL,
    full_name text NOT NULL,
    role text,
    email text,
    phone text,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.employer_contacts OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 173485)
-- Name: employer_meta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employer_meta (
    id uuid NOT NULL,
    employer_id uuid NOT NULL,
    key text NOT NULL,
    value text
);


ALTER TABLE public.employer_meta OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 173465)
-- Name: employer_offices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employer_offices (
    id uuid NOT NULL,
    employer_id uuid NOT NULL,
    label text,
    address1 text,
    address2 text,
    city text,
    state text,
    postal_code text,
    country text,
    lat double precision,
    lng double precision,
    is_remote_hub boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.employer_offices OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 173446)
-- Name: employer_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employer_profiles (
    id uuid NOT NULL,
    employer_id uuid NOT NULL,
    industry text,
    size public.company_size,
    founded_year integer,
    about text,
    logo_url text,
    banner_url text,
    hq_city text,
    hq_country text,
    linkedin text,
    twitter text,
    instagram text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.employer_profiles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 173433)
-- Name: employers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employers (
    id uuid NOT NULL,
    slug text NOT NULL,
    legal_name text NOT NULL,
    display_name text NOT NULL,
    logo_url text,
    website text,
    status public.employer_status DEFAULT 'draft'::public.employer_status NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    onboarding_step public.onboarding_step DEFAULT 'PACKAGE'::public.onboarding_step NOT NULL,
    "blockedAt" timestamp(3) without time zone,
    billing_status public."BillingStatus" DEFAULT 'none'::public."BillingStatus" NOT NULL,
    current_plan_id uuid,
    trial_started_at timestamp(6) with time zone,
    trial_ends_at timestamp(6) with time zone,
    premium_until timestamp(6) with time zone,
    recurring_token text
);


ALTER TABLE public.employers OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 173580)
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id text NOT NULL,
    "jobId" uuid NOT NULL,
    "applicantId" text NOT NULL,
    status public."ApplicationStatus" DEFAULT 'submitted'::public."ApplicationStatus" NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cv_url text,
    cv_file_name text,
    cv_file_type text,
    cv_file_size integer
);


ALTER TABLE public.job_applications OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 173598)
-- Name: job_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_reports (
    id text NOT NULL,
    "jobId" uuid NOT NULL,
    "reporterUserId" text,
    "reporterEmail" text,
    reason public."ReportReason" NOT NULL,
    details text,
    "evidenceUrl" text,
    status public."ReportStatus" DEFAULT 'OPEN'::public."ReportStatus" NOT NULL,
    action public."ReportAction" DEFAULT 'NONE'::public."ReportAction" NOT NULL,
    "resolvedById" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.job_reports OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 175928)
-- Name: job_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_views (
    id text NOT NULL,
    "jobId" uuid NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.job_views OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 173521)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    order_id text NOT NULL,
    plan_id uuid,
    employer_id uuid,
    "userId" text,
    currency text DEFAULT 'IDR'::text NOT NULL,
    gross_amount bigint NOT NULL,
    method text,
    status text DEFAULT 'pending'::text NOT NULL,
    transaction_id text,
    fraud_status text,
    meta jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    redirect_url text,
    token text
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 173492)
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id uuid NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    currency text DEFAULT 'IDR'::text NOT NULL,
    "interval" text DEFAULT 'month'::text NOT NULL,
    amount bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "priceId" text,
    "trialDays" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 173590)
-- Name: saved_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_jobs (
    id text NOT NULL,
    "jobId" uuid NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.saved_jobs OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 173571)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text,
    "employerId" uuid,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(6) with time zone NOT NULL,
    "lastSeenAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip text,
    "userAgent" text,
    "revokedAt" timestamp(3) without time zone
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 173513)
-- Name: subscription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_items (
    id uuid NOT NULL,
    subscription_id uuid NOT NULL,
    name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    metadata jsonb
);


ALTER TABLE public.subscription_items OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 173503)
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    employer_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    provider_id text,
    status text DEFAULT 'active'::text NOT NULL,
    current_period_start timestamp(3) without time zone,
    current_period_end timestamp(3) without time zone,
    start_at timestamp(3) without time zone,
    trial_ends_at timestamp(3) without time zone,
    cancel_at timestamp(3) without time zone,
    canceled_at timestamp(3) without time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 173401)
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    phone text,
    location text,
    headline text,
    about text,
    skills text,
    experience text,
    education text,
    organizations text,
    certifications text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 173556)
-- Name: verification_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_files (
    id uuid NOT NULL,
    verification_id uuid NOT NULL,
    file_url text NOT NULL,
    file_type text,
    uploaded_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.verification_files OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 173547)
-- Name: verification_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_requests (
    id uuid NOT NULL,
    employer_id uuid NOT NULL,
    status public.verification_status DEFAULT 'pending'::public.verification_status NOT NULL,
    note text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at timestamp(3) without time zone
);


ALTER TABLE public.verification_requests OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 173564)
-- Name: verify_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verify_tokens (
    id uuid NOT NULL,
    verification_id uuid NOT NULL,
    type text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone
);


ALTER TABLE public.verify_tokens OWNER TO postgres;

--
-- TOC entry 4784 (class 2604 OID 173423)
-- Name: Tender id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tender" ALTER COLUMN id SET DEFAULT nextval('public."Tender_id_seq"'::regclass);


--
-- TOC entry 5104 (class 0 OID 173410)
-- Dependencies: 220
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admin" (id, username, "passwordHash", "createdAt", "updatedAt") FROM stdin;
cmjmcd5g80000v35g78gy2kzv	kerja	$2b$10$NDmI/4HifS.kMMq.n0qXGO3zGcnoGLjOC4i7bGobEglsaVxXQe4Vq	2025-12-26 03:58:19.352	2025-12-26 03:58:19.352
\.


--
-- TOC entry 5117 (class 0 OID 173532)
-- Dependencies: 233
-- Data for Name: Job; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Job" (id, "employerId", title, description, "isActive", "isDraft", "isHidden", "hiddenReason", "createdAt", "updatedAt", "deletedAt", location, employment, salary_min, salary_max, currency, remote_mode, exp_min_years, education, deadline, tags, requirements) FROM stdin;
ebdd0e8b-8bb6-44fe-a2bd-8030046e1d13	833d136f-5008-4e44-a2fa-5eba0bff7c4a	test	test	f	f	f	\N	2025-12-26 11:31:40.7+07	2026-01-19 21:25:29.749+07	2026-01-19 14:25:29.739	KABUPATEN AGAM, SUMATERA BARAT	Full-time	\N	\N	IDR	ON_SITE	\N	\N	\N	{}	\N
298b2137-afe3-4f85-9a8e-888641912902	833d136f-5008-4e44-a2fa-5eba0bff7c4a	ets	r	f	f	f	\N	2025-12-28 11:09:33.288+07	2026-01-19 21:26:41.423+07	2026-01-19 14:26:41.421	KABUPATEN WONOGIRI, JAWA TENGAH	Full-time	\N	\N	IDR	ON_SITE	\N	\N	\N	{}	\N
d201e231-1465-4194-84e1-1c3dd344acaa	6a10fa1b-456f-4bf4-a141-7efea355fef5	engginer	deksripsi	t	f	f	\N	2026-01-19 21:43:39.694+07	2026-01-19 21:43:39.694+07	\N	KOTA JAKARTA TIMUR, DKI JAKARTA	Full-time	\N	\N	IDR	ON_SITE	\N	\N	\N	{}	\N
da83625b-b304-4e8c-bb2a-ffb2ff4b3bf6	6a10fa1b-456f-4bf4-a141-7efea355fef5	intern engginer	deskripsideskripsideskripsideskripsi	t	f	f	\N	2026-01-20 23:15:30.058+07	2026-01-20 23:15:30.058+07	\N	KABUPATEN SIJUNJUNG, SUMATERA BARAT	Full-time	12000000	13000000	IDR	ON_SITE	9	\N	2026-02-07 00:00:00	{deskripsi}	deskripsideskripsi
\.


--
-- TOC entry 5106 (class 0 OID 173420)
-- Dependencies: 222
-- Data for Name: Tender; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tender" (id, title, buyer, sector, location, status, contract, deadline, description, documents, "createdAt", "updatedAt", "teamSlots", budget_usd) FROM stdin;
1	perta	pertamina	OIL_GAS	KABUPATEN PASURUAN, JAWA TIMUR	OPEN	MAINTENANCE	2026-02-06 17:00:00	deskripsi	{deskripsi}	2026-01-19 14:51:22.893	2026-01-19 14:51:22.893	0	10000000000
\.


--
-- TOC entry 5102 (class 0 OID 173391)
-- Dependencies: 218
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, name, "passwordHash", "photoUrl", "cvUrl", "createdAt", "updatedAt", "oauthProvider", "oauthId", "isVerified", "verificationToken", "verificationTokenExpiresAt", "resetToken", "resetTokenExpiresAt") FROM stdin;
cmjp2rzgy0000v3zc9uvym1am	aditiaputra88890@gmail.com	Aditia Putra	\N	https://lh3.googleusercontent.com/a/ACg8ocJo8TZZHbTIZVHXJEWE5GU_iOzpUofhBwwOiJYTxsdN3FXyiw=s96-c	\N	2025-12-28 01:53:13.8	2026-01-20 13:22:01.611	google	107110552085485693830	t	\N	\N	\N	\N
\.


--
-- TOC entry 5101 (class 0 OID 173216)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
34991485-fa6a-4b8a-b711-9ee870beff7a	d07a03f0dc7c1e2f823883d4891fb064016a6519d28e201154e1c3d1f4bfdc7f	2025-12-26 10:54:28.45431+07	20251226035427_init_fresh_schema	\N	\N	2025-12-26 10:54:27.555157+07	1
12174fc2-4466-45c8-8bad-ade072c49844	d00d5e5fd46d5347db00ccbbeaf0e44c6ae260c5d2185ea416e494d754f4954e	2025-12-28 09:15:20.176253+07	20251228021520_add_job_views	\N	\N	2025-12-28 09:15:20.079919+07	1
\.


--
-- TOC entry 5109 (class 0 OID 173455)
-- Dependencies: 225
-- Data for Name: employer_admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employer_admin_users (id, employer_id, email, password_hash, full_name, phone, is_owner, agreed_tos_at, created_at, updated_at) FROM stdin;
133fd8dc-0028-44b4-b994-c7bbfe1b4403	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	lamonate1122@gmail.com	$2b$10$dAF3eBSAqqs/p/8h6v1ZHuPjkqKMTbN1LkLKYQFiDUQXxxaUq/V9W	\N	\N	t	\N	2026-01-21 12:03:19.001+07	2026-01-21 12:03:19.001+07
\.


--
-- TOC entry 5111 (class 0 OID 173475)
-- Dependencies: 227
-- Data for Name: employer_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employer_contacts (id, employer_id, full_name, role, email, phone, is_primary, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5112 (class 0 OID 173485)
-- Dependencies: 228
-- Data for Name: employer_meta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employer_meta (id, employer_id, key, value) FROM stdin;
\.


--
-- TOC entry 5110 (class 0 OID 173465)
-- Dependencies: 226
-- Data for Name: employer_offices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employer_offices (id, employer_id, label, address1, address2, city, state, postal_code, country, lat, lng, is_remote_hub, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5108 (class 0 OID 173446)
-- Dependencies: 224
-- Data for Name: employer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employer_profiles (id, employer_id, industry, size, founded_year, about, logo_url, banner_url, hq_city, hq_country, linkedin, twitter, instagram, created_at, updated_at) FROM stdin;
b6041c28-297d-4584-af79-d0625b5bdb8f	833d136f-5008-4e44-a2fa-5eba0bff7c4a	Energy	201-500	\N	\N	/uploads/employers/833d136f-5008-4e44-a2fa-5eba0bff7c4a/logo-1766990738218.jpg	\N	\N	\N	\N	\N	\N	2025-12-26 11:01:45.681+07	2025-12-29 13:45:38.231+07
50912eaa-e018-4df3-8129-d1bdb57ba3c7	6a10fa1b-456f-4bf4-a141-7efea355fef5	Energy	201-500	\N	deskripsi	\N	\N	deskripsi	\N	\N	\N	\N	2026-01-19 21:30:12.156+07	2026-01-19 21:31:02.127+07
e1842665-85f5-47eb-a503-a020031f0742	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:03:19.001+07	2026-01-21 12:03:19.001+07
\.


--
-- TOC entry 5107 (class 0 OID 173433)
-- Dependencies: 223
-- Data for Name: employers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employers (id, slug, legal_name, display_name, logo_url, website, status, is_verified, created_at, updated_at, onboarding_step, "blockedAt", billing_status, current_plan_id, trial_started_at, trial_ends_at, premium_until, recurring_token) FROM stdin;
833d136f-5008-4e44-a2fa-5eba0bff7c4a	companu	Companu	Companu	/uploads/employers/833d136f-5008-4e44-a2fa-5eba0bff7c4a/logo-1766990738218.jpg	https://company.com	draft	f	2025-12-26 11:01:45.681+07	2025-12-29 13:45:38.231+07	VERIFY	\N	active	312298e6-fa23-4aaa-af23-c3af19c1b57a	\N	\N	2026-01-26 11:04:17.916+07	\N
6a10fa1b-456f-4bf4-a141-7efea355fef5	perta	perta	perta	\N	https://perta.com	draft	f	2026-01-19 21:30:12.156+07	2026-01-19 21:31:10.906+07	VERIFY	\N	none	292fd898-02ff-451c-b54b-1aed12085bf9	\N	\N	\N	\N
96149957-a4a4-4cd7-9cbd-2f3caffb3c25	perta-1	perta	perta	\N	https://perta.com	draft	f	2026-01-21 12:03:19.001+07	2026-01-21 12:04:42.308+07	VERIFY	\N	active	292fd898-02ff-451c-b54b-1aed12085bf9	\N	\N	2026-03-21 12:04:37.55+07	\N
\.


--
-- TOC entry 5122 (class 0 OID 173580)
-- Dependencies: 238
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_applications (id, "jobId", "applicantId", status, "createdAt", "updatedAt", cv_url, cv_file_name, cv_file_type, cv_file_size) FROM stdin;
cmkla2d2p0005v3ew0uh4y2vp	d201e231-1465-4194-84e1-1c3dd344acaa	cmjp2rzgy0000v3zc9uvym1am	hired	2026-01-19 21:45:52.945+07	2026-01-19 21:47:24.646+07	/uploads/2d1aee4a6dd5273f2426bd26a72f3621.pdf	CV_HAFIS YULIANTO.pdf	application/pdf	435869
\.


--
-- TOC entry 5124 (class 0 OID 173598)
-- Dependencies: 240
-- Data for Name: job_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_reports (id, "jobId", "reporterUserId", "reporterEmail", reason, details, "evidenceUrl", status, action, "resolvedById", "resolvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5125 (class 0 OID 175928)
-- Dependencies: 241
-- Data for Name: job_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_views (id, "jobId", "createdAt") FROM stdin;
03e577b9-acda-4033-a1ef-f45a01b5f037	298b2137-afe3-4f85-9a8e-888641912902	2025-12-28 19:16:46.392+07
2382844c-a32d-4f95-ad21-b54e02b9329b	ebdd0e8b-8bb6-44fe-a2bd-8030046e1d13	2025-12-28 19:16:49.366+07
736518aa-35b3-4d41-b48c-c3b6d58a8073	298b2137-afe3-4f85-9a8e-888641912902	2026-01-19 21:23:02.351+07
9e673e90-3648-49c0-8412-266c2410918e	ebdd0e8b-8bb6-44fe-a2bd-8030046e1d13	2026-01-19 21:23:17.651+07
1f658244-6d5d-48d2-87a7-fe368d36af97	d201e231-1465-4194-84e1-1c3dd344acaa	2026-01-19 21:44:07.031+07
9376101e-6453-4d0c-9912-fa186045cf63	d201e231-1465-4194-84e1-1c3dd344acaa	2026-01-20 22:44:35.424+07
e3992ab5-8c85-40ad-82cd-29a3e7fcdd49	d201e231-1465-4194-84e1-1c3dd344acaa	2026-01-20 22:55:20.156+07
34b39daf-90fc-4bb7-ab19-a6b94c9df310	d201e231-1465-4194-84e1-1c3dd344acaa	2026-01-20 23:01:03.325+07
0ad6a444-f134-467f-893f-b08e1b0d6227	d201e231-1465-4194-84e1-1c3dd344acaa	2026-01-20 23:01:08.379+07
2e76d536-c7f7-4222-9e01-041c121d8aaf	da83625b-b304-4e8c-bb2a-ffb2ff4b3bf6	2026-01-20 23:15:34.608+07
3d1b8e67-81ae-47ad-a0a1-41d72e123bae	da83625b-b304-4e8c-bb2a-ffb2ff4b3bf6	2026-01-21 13:10:40.351+07
\.


--
-- TOC entry 5116 (class 0 OID 173521)
-- Dependencies: 232
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, plan_id, employer_id, "userId", currency, gross_amount, method, status, transaction_id, fraud_status, meta, created_at, updated_at, redirect_url, token) FROM stdin;
d4c03a70-8608-4175-a4e1-27bdb2a36092	plan-121212-1768833071255	292fd898-02ff-451c-b54b-1aed12085bf9	6a10fa1b-456f-4bf4-a141-7efea355fef5	\N	IDR	1000000	\N	pending	\N	\N	{"provider": "midtrans", "createdAt": "2026-01-19T14:31:13.643Z"}	2026-01-19 21:31:13.645+07	2026-01-19 21:31:13.645+07	https://app.sandbox.midtrans.com/snap/v4/redirection/eef1bef2-4ef6-4699-ae2a-327dca8c7ee6	eef1bef2-4ef6-4699-ae2a-327dca8c7ee6
f641e8f7-48a3-4306-93a6-13890350af8b	plan-121212-1768971804679	292fd898-02ff-451c-b54b-1aed12085bf9	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	\N	IDR	1000000	qris	settlement	dc8280c4-a403-4097-93e7-a8ba73354a44	accept	{"set": {"issuer": "gopay", "pop_id": "a235d343-3d5a-4802-a26b-dbd77320c425", "acquirer": "gopay", "currency": "IDR", "order_id": "plan-121212-1768971804679", "updatedAt": "2026-01-21T05:04:37.503Z", "expiry_time": "2026-01-21 12:18:34", "merchant_id": "G035327265", "status_code": "200", "fraud_status": "accept", "gross_amount": "1000000.00", "payment_type": "qris", "signature_key": "4dea8775db0039f1abefc661dc4df6949a24809deb6818fb15e567839c80dffabb7a81df11201b418187ad584cc95693bb23e709be244330b23bd33aecf0e126", "status_message": "midtrans payment notification", "transaction_id": "dc8280c4-a403-4097-93e7-a8ba73354a44", "settlement_time": "2026-01-21 12:04:41", "customer_details": {"email": "lamonate1122@gmail.com", "full_name": "perta guest"}, "transaction_time": "2026-01-21 12:03:34", "transaction_type": "on-us", "transaction_status": "settlement", "merchant_cross_reference_id": "7326285a-c8f7-4758-b570-067e62fc661f"}}	2026-01-21 12:03:26.284+07	2026-01-21 12:04:37.504+07	https://app.sandbox.midtrans.com/snap/v4/redirection/d766cac1-8b24-400a-95fa-768571eed580	d766cac1-8b24-400a-95fa-768571eed580
\.


--
-- TOC entry 5113 (class 0 OID 173492)
-- Dependencies: 229
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, slug, name, description, currency, "interval", amount, active, "priceId", "trialDays") FROM stdin;
312298e6-fa23-4aaa-af23-c3af19c1b57a	129088	free trial	free	IDR	month	0	t	\N	7
292fd898-02ff-451c-b54b-1aed12085bf9	121212	premium pro	premium promax	IDR	month	1000000	t	\N	0
\.


--
-- TOC entry 5123 (class 0 OID 173590)
-- Dependencies: 239
-- Data for Name: saved_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_jobs (id, "jobId", "userId", "createdAt") FROM stdin;
\.


--
-- TOC entry 5121 (class 0 OID 173571)
-- Dependencies: 237
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, "userId", "employerId", "createdAt", "expiresAt", "lastSeenAt", ip, "userAgent", "revokedAt") FROM stdin;
cmjmcllmb0001v3a40l0dsc91	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-26 11:04:53.545+07	2025-12-26 23:04:53.545+07	2025-12-26 11:04:53.545+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 06:17:25.18
cmjp2vjnj0002v3zcj2wniq3t	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-28 08:55:59.925+07	2025-12-28 20:55:59.925+07	2025-12-28 08:55:59.925+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmjp4elxc0001v3lguif0cb11	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-28 09:38:48.957+07	2025-12-28 21:38:48.957+07	2025-12-28 09:38:48.957+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmjp55jyx0001v3pk7bp58wj0	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-28 09:59:46.131+07	2025-12-28 21:59:46.131+07	2025-12-28 09:59:46.131+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmjpixw4h0001v3mouw549nqp	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-28 16:25:43.23+07	2025-12-29 04:25:43.23+07	2025-12-28 16:25:43.23+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmjqsn5230001v3x05lf9cgcd	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-29 13:45:03.952+07	2025-12-30 01:45:03.952+07	2025-12-29 13:45:03.952+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-29 06:56:33.364
cmjtlhohl0001v3pw38tt3zvb	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-31 12:48:10.387+07	2026-01-01 00:48:10.387+07	2025-12-31 12:48:10.387+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmjtm3yyt0001v36k5yiuj3y0	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-31 13:05:30.433+07	2026-01-01 01:05:30.433+07	2025-12-31 13:05:30.433+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmjtmm6720001v3i4mfbwvs4c	\N	833d136f-5008-4e44-a2fa-5eba0bff7c4a	2025-12-31 13:19:39.611+07	2026-01-01 01:19:39.611+07	2025-12-31 13:19:39.611+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmkl9o3mv0003v3ewlhhxcl5m	\N	6a10fa1b-456f-4bf4-a141-7efea355fef5	2026-01-19 21:34:47.525+07	2026-01-20 09:34:47.525+07	2026-01-19 21:34:47.525+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmkmrj5qy0001v3a09js4qz8v	\N	6a10fa1b-456f-4bf4-a141-7efea355fef5	2026-01-20 22:42:36.238+07	2026-01-21 10:42:36.238+07	2026-01-20 22:42:36.238+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmjmhempm0001v3us3vcmextp	\N	\N	2025-12-26 13:19:26.45+07	2025-12-27 01:19:26.45+07	2025-12-26 13:19:26.45+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
cmknk78cy0001v34gplszoka9	\N	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	2026-01-21 12:05:08.615+07	2026-01-22 00:05:08.615+07	2026-01-21 12:05:08.615+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-21 06:13:11.996
cmknnzab90003v34g3dlfoosu	\N	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	2026-01-21 13:50:56.371+07	2026-01-22 01:50:56.371+07	2026-01-21 13:50:56.371+07	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N
\.


--
-- TOC entry 5115 (class 0 OID 173513)
-- Dependencies: 231
-- Data for Name: subscription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_items (id, subscription_id, name, quantity, metadata) FROM stdin;
\.


--
-- TOC entry 5114 (class 0 OID 173503)
-- Dependencies: 230
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, employer_id, plan_id, provider_id, status, current_period_start, current_period_end, start_at, trial_ends_at, cancel_at, canceled_at, created_at, updated_at) FROM stdin;
dc3c6170-08cb-479a-bcfc-5354940a471d	833d136f-5008-4e44-a2fa-5eba0bff7c4a	312298e6-fa23-4aaa-af23-c3af19c1b57a	\N	active	2025-12-26 04:04:17.916	2026-01-26 04:04:17.916	\N	\N	\N	\N	2025-12-26 11:04:18.051+07	2025-12-26 11:04:18.051+07
e87e0464-238c-432e-b0db-e5854c442f69	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	292fd898-02ff-451c-b54b-1aed12085bf9	\N	active	2026-01-21 05:04:37.55	2026-02-21 05:04:37.55	\N	\N	\N	\N	2026-01-21 12:04:37.929+07	2026-01-21 12:04:37.929+07
62fdf20d-7a82-4e80-9f66-56d1a9d7595c	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	292fd898-02ff-451c-b54b-1aed12085bf9	\N	active	2026-02-21 05:04:37.55	2026-03-21 05:04:37.55	\N	\N	\N	\N	2026-01-21 12:04:42.313+07	2026-01-21 12:04:42.313+07
\.


--
-- TOC entry 5103 (class 0 OID 173401)
-- Dependencies: 219
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, "userId", phone, location, headline, about, skills, experience, education, organizations, certifications, "createdAt", "updatedAt") FROM stdin;
cmkl8xbhk0001v3ewv8obi9l0	cmjp2rzgy0000v3zc9uvym1am	0822222222222	PANCORAN, KOTA JAKARTA SELATAN, DKI JAKARTA	\N	\N	backend dev, frontend dev,postgre sql	\N	\N	\N	\N	2026-01-19 14:13:57.935	2026-01-20 13:22:01.614
\.


--
-- TOC entry 5119 (class 0 OID 173556)
-- Dependencies: 235
-- Data for Name: verification_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_files (id, verification_id, file_url, file_type, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5118 (class 0 OID 173547)
-- Dependencies: 234
-- Data for Name: verification_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_requests (id, employer_id, status, note, created_at, reviewed_at) FROM stdin;
f3ee82f0-96b2-4633-bc16-b6dc699d2ca7	833d136f-5008-4e44-a2fa-5eba0bff7c4a	pending	Verifikasi otomatis dari UI. Company: company	2025-12-26 11:04:53.36+07	\N
67e1b27c-b28f-4592-ac26-20b38e91daa6	6a10fa1b-456f-4bf4-a141-7efea355fef5	pending	Verifikasi otomatis dari UI. Company: perta	2026-01-19 21:34:46.854+07	\N
1b68517e-1940-4f35-9102-86818fedafe0	96149957-a4a4-4cd7-9cbd-2f3caffb3c25	pending	Verifikasi otomatis dari UI. Company: perta	2026-01-21 12:05:08.424+07	\N
\.


--
-- TOC entry 5120 (class 0 OID 173564)
-- Dependencies: 236
-- Data for Name: verify_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verify_tokens (id, verification_id, type, token, expires_at, used_at) FROM stdin;
\.


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 221
-- Name: Tender_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tender_id_seq"', 1, true);


--
-- TOC entry 4855 (class 2606 OID 173418)
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 173546)
-- Name: Job Job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Job"
    ADD CONSTRAINT "Job_pkey" PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 173432)
-- Name: Tender Tender_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tender"
    ADD CONSTRAINT "Tender_pkey" PRIMARY KEY (id);


--
-- TOC entry 4846 (class 2606 OID 173400)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 173224)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 173464)
-- Name: employer_admin_users employer_admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_admin_users
    ADD CONSTRAINT employer_admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4877 (class 2606 OID 173484)
-- Name: employer_contacts employer_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_contacts
    ADD CONSTRAINT employer_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 173491)
-- Name: employer_meta employer_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_meta
    ADD CONSTRAINT employer_meta_pkey PRIMARY KEY (id);


--
-- TOC entry 4874 (class 2606 OID 173474)
-- Name: employer_offices employer_offices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_offices
    ADD CONSTRAINT employer_offices_pkey PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 173454)
-- Name: employer_profiles employer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 173445)
-- Name: employers employers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employers
    ADD CONSTRAINT employers_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 173589)
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 173608)
-- Name: job_reports job_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_reports
    ADD CONSTRAINT job_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4931 (class 2606 OID 175935)
-- Name: job_views job_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT job_views_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 173531)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 173502)
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 173597)
-- Name: saved_jobs saved_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 173579)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4891 (class 2606 OID 173520)
-- Name: subscription_items subscription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_items
    ADD CONSTRAINT subscription_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 173512)
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 173409)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4906 (class 2606 OID 173563)
-- Name: verification_files verification_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_files
    ADD CONSTRAINT verification_files_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 173555)
-- Name: verification_requests verification_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 173570)
-- Name: verify_tokens verify_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verify_tokens
    ADD CONSTRAINT verify_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4856 (class 1259 OID 173616)
-- Name: Admin_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_username_key" ON public."Admin" USING btree (username);


--
-- TOC entry 4898 (class 1259 OID 173637)
-- Name: Job_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Job_createdAt_idx" ON public."Job" USING btree ("createdAt");


--
-- TOC entry 4899 (class 1259 OID 173636)
-- Name: Job_employerId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Job_employerId_isActive_idx" ON public."Job" USING btree ("employerId", "isActive");


--
-- TOC entry 4843 (class 1259 OID 173609)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4844 (class 1259 OID 173614)
-- Name: User_oauthProvider_oauthId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_oauthProvider_oauthId_key" ON public."User" USING btree ("oauthProvider", "oauthId");


--
-- TOC entry 4847 (class 1259 OID 173613)
-- Name: User_resetToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_resetToken_idx" ON public."User" USING btree ("resetToken");


--
-- TOC entry 4848 (class 1259 OID 173611)
-- Name: User_resetToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_resetToken_key" ON public."User" USING btree ("resetToken");


--
-- TOC entry 4849 (class 1259 OID 173612)
-- Name: User_verificationToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_verificationToken_idx" ON public."User" USING btree ("verificationToken");


--
-- TOC entry 4850 (class 1259 OID 173610)
-- Name: User_verificationToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_verificationToken_key" ON public."User" USING btree ("verificationToken");


--
-- TOC entry 4868 (class 1259 OID 173622)
-- Name: employer_admin_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employer_admin_users_email_key ON public.employer_admin_users USING btree (email);


--
-- TOC entry 4869 (class 1259 OID 173623)
-- Name: employer_admin_users_employer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employer_admin_users_employer_id_idx ON public.employer_admin_users USING btree (employer_id);


--
-- TOC entry 4875 (class 1259 OID 173625)
-- Name: employer_contacts_employer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employer_contacts_employer_id_idx ON public.employer_contacts USING btree (employer_id);


--
-- TOC entry 4878 (class 1259 OID 173626)
-- Name: employer_meta_employer_id_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employer_meta_employer_id_key_key ON public.employer_meta USING btree (employer_id, key);


--
-- TOC entry 4872 (class 1259 OID 173624)
-- Name: employer_offices_employer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employer_offices_employer_id_idx ON public.employer_offices USING btree (employer_id);


--
-- TOC entry 4865 (class 1259 OID 173621)
-- Name: employer_profiles_employer_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employer_profiles_employer_id_key ON public.employer_profiles USING btree (employer_id);


--
-- TOC entry 4859 (class 1259 OID 173618)
-- Name: employers_billing_status_trial_ends_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employers_billing_status_trial_ends_at_idx ON public.employers USING btree (billing_status, trial_ends_at);


--
-- TOC entry 4860 (class 1259 OID 173619)
-- Name: employers_current_plan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employers_current_plan_id_idx ON public.employers USING btree (current_plan_id);


--
-- TOC entry 4863 (class 1259 OID 173620)
-- Name: employers_premium_until_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employers_premium_until_idx ON public.employers USING btree (premium_until);


--
-- TOC entry 4864 (class 1259 OID 173617)
-- Name: employers_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employers_slug_key ON public.employers USING btree (slug);


--
-- TOC entry 4915 (class 1259 OID 173643)
-- Name: job_applications_applicantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "job_applications_applicantId_idx" ON public.job_applications USING btree ("applicantId");


--
-- TOC entry 4916 (class 1259 OID 173645)
-- Name: job_applications_jobId_applicantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "job_applications_jobId_applicantId_key" ON public.job_applications USING btree ("jobId", "applicantId");


--
-- TOC entry 4917 (class 1259 OID 173644)
-- Name: job_applications_jobId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "job_applications_jobId_idx" ON public.job_applications USING btree ("jobId");


--
-- TOC entry 4925 (class 1259 OID 173649)
-- Name: job_reports_jobId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "job_reports_jobId_status_idx" ON public.job_reports USING btree ("jobId", status);


--
-- TOC entry 4928 (class 1259 OID 173650)
-- Name: job_reports_status_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "job_reports_status_createdAt_idx" ON public.job_reports USING btree (status, "createdAt");


--
-- TOC entry 4929 (class 1259 OID 175936)
-- Name: job_views_jobId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "job_views_jobId_createdAt_idx" ON public.job_views USING btree ("jobId", "createdAt");


--
-- TOC entry 4893 (class 1259 OID 173635)
-- Name: payments_employer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_employer_id_idx ON public.payments USING btree (employer_id);


--
-- TOC entry 4894 (class 1259 OID 173633)
-- Name: payments_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payments_order_id_key ON public.payments USING btree (order_id);


--
-- TOC entry 4897 (class 1259 OID 173634)
-- Name: payments_plan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_plan_id_idx ON public.payments USING btree (plan_id);


--
-- TOC entry 4883 (class 1259 OID 173627)
-- Name: plans_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX plans_slug_key ON public.plans USING btree (slug);


--
-- TOC entry 4920 (class 1259 OID 173647)
-- Name: saved_jobs_jobId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "saved_jobs_jobId_idx" ON public.saved_jobs USING btree ("jobId");


--
-- TOC entry 4921 (class 1259 OID 173648)
-- Name: saved_jobs_jobId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "saved_jobs_jobId_userId_key" ON public.saved_jobs USING btree ("jobId", "userId");


--
-- TOC entry 4924 (class 1259 OID 173646)
-- Name: saved_jobs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "saved_jobs_userId_idx" ON public.saved_jobs USING btree ("userId");


--
-- TOC entry 4910 (class 1259 OID 173641)
-- Name: sessions_employerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_employerId_idx" ON public.sessions USING btree ("employerId");


--
-- TOC entry 4913 (class 1259 OID 173642)
-- Name: sessions_revokedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_revokedAt_idx" ON public.sessions USING btree ("revokedAt");


--
-- TOC entry 4914 (class 1259 OID 173640)
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- TOC entry 4892 (class 1259 OID 173632)
-- Name: subscription_items_subscription_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscription_items_subscription_id_idx ON public.subscription_items USING btree (subscription_id);


--
-- TOC entry 4884 (class 1259 OID 173628)
-- Name: subscriptions_employer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_employer_id_idx ON public.subscriptions USING btree (employer_id);


--
-- TOC entry 4887 (class 1259 OID 173629)
-- Name: subscriptions_plan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_plan_id_idx ON public.subscriptions USING btree (plan_id);


--
-- TOC entry 4888 (class 1259 OID 173630)
-- Name: subscriptions_status_current_period_end_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_status_current_period_end_idx ON public.subscriptions USING btree (status, current_period_end);


--
-- TOC entry 4889 (class 1259 OID 173631)
-- Name: subscriptions_trial_ends_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_trial_ends_at_idx ON public.subscriptions USING btree (trial_ends_at);


--
-- TOC entry 4853 (class 1259 OID 173615)
-- Name: user_profiles_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_profiles_userId_key" ON public.user_profiles USING btree ("userId");


--
-- TOC entry 4902 (class 1259 OID 173638)
-- Name: verification_requests_employer_id_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX verification_requests_employer_id_status_idx ON public.verification_requests USING btree (employer_id, status);


--
-- TOC entry 4909 (class 1259 OID 173639)
-- Name: verify_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX verify_tokens_token_key ON public.verify_tokens USING btree (token);


--
-- TOC entry 4944 (class 2606 OID 173711)
-- Name: Job Job_employerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Job"
    ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4935 (class 2606 OID 173666)
-- Name: employer_admin_users employer_admin_users_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_admin_users
    ADD CONSTRAINT employer_admin_users_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4937 (class 2606 OID 173676)
-- Name: employer_contacts employer_contacts_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_contacts
    ADD CONSTRAINT employer_contacts_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4938 (class 2606 OID 173681)
-- Name: employer_meta employer_meta_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_meta
    ADD CONSTRAINT employer_meta_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 173671)
-- Name: employer_offices employer_offices_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_offices
    ADD CONSTRAINT employer_offices_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4934 (class 2606 OID 173661)
-- Name: employer_profiles employer_profiles_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4933 (class 2606 OID 173656)
-- Name: employers employers_current_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employers
    ADD CONSTRAINT employers_current_plan_id_fkey FOREIGN KEY (current_plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4950 (class 2606 OID 173746)
-- Name: job_applications job_applications_applicantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT "job_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4951 (class 2606 OID 173741)
-- Name: job_applications job_applications_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4954 (class 2606 OID 173761)
-- Name: job_reports job_reports_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_reports
    ADD CONSTRAINT "job_reports_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4955 (class 2606 OID 175937)
-- Name: job_views job_views_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT "job_views_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4942 (class 2606 OID 173701)
-- Name: payments payments_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4943 (class 2606 OID 173706)
-- Name: payments payments_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4952 (class 2606 OID 173751)
-- Name: saved_jobs saved_jobs_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4953 (class 2606 OID 173756)
-- Name: saved_jobs saved_jobs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT "saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4948 (class 2606 OID 173731)
-- Name: sessions sessions_employerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4949 (class 2606 OID 173736)
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4941 (class 2606 OID 173696)
-- Name: subscription_items subscription_items_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_items
    ADD CONSTRAINT subscription_items_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4939 (class 2606 OID 173686)
-- Name: subscriptions subscriptions_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4940 (class 2606 OID 173691)
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4932 (class 2606 OID 173651)
-- Name: user_profiles user_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4946 (class 2606 OID 173721)
-- Name: verification_files verification_files_verification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_files
    ADD CONSTRAINT verification_files_verification_id_fkey FOREIGN KEY (verification_id) REFERENCES public.verification_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4945 (class 2606 OID 173716)
-- Name: verification_requests verification_requests_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4947 (class 2606 OID 173726)
-- Name: verify_tokens verify_tokens_verification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verify_tokens
    ADD CONSTRAINT verify_tokens_verification_id_fkey FOREIGN KEY (verification_id) REFERENCES public.verification_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-01-21 15:24:21

--
-- PostgreSQL database dump complete
--

