-- Table: public.user
CREATE TABLE IF NOT EXISTS public."user"
(
    user_id serial,
    name character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    image character varying(255) COLLATE pg_catalog."default",
    auth_through json,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    is_anonymous boolean,
    is_email_verified boolean,
    is_mobile_verified boolean,
    mobile character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT user_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_email_key UNIQUE (email)
);

-- Table: public.resume_template
CREATE TABLE IF NOT EXISTS public.resume_template
(
    resume_template_id serial,
    name character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    template_view_content text NOT NULL,
    template_render_content text NOT NULL,
    template_used_count text NOT NULL,
    default_settings jsonb,
    header_template text NOT NULL,
    footer_template text NOT NULL,
    CONSTRAINT resume_template_pkey PRIMARY KEY (resume_template_id)
);
-- Table: public.resume
CREATE TABLE IF NOT EXISTS public.resume
(
    resume_id serial,
    user_id integer,
    title character varying(255) COLLATE pg_catalog."default",
    resume_data jsonb,
    resume_template_id integer,
    ats_score integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT resume_pkey PRIMARY KEY (resume_id),
    CONSTRAINT resume_user_id_key UNIQUE (user_id),
    CONSTRAINT resume_resume_template_id_fkey FOREIGN KEY (resume_template_id)
        REFERENCES public.resume_template (resume_template_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT resume_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (user_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);


-- Table: public.job_description
CREATE TABLE IF NOT EXISTS public.job_description
(
    job_description_id serial,
    user_id integer,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    required_skills jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT job_description_pkey PRIMARY KEY (job_description_id),
    CONSTRAINT job_description_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user" (user_id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Table: public.ats_keyword
CREATE TABLE IF NOT EXISTS public.ats_keyword
(
    ats_keyword_id serial,
    industry character varying(255) NOT NULL,
    keywords jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT ats_keyword_pkey PRIMARY KEY (ats_keyword_id)
);
