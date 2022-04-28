CREATE TABLE public.users (
                              user_id bigint NOT NULL,
                              first_name text NOT NULL,
                              last_name text NOT NULL,
                              email text NOT NULL,
                              pwd text NOT NULL,
                              admin boolean DEFAULT false NOT NULL,
                        
);


ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_pk PRIMARY KEY (user_id);

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_pk UNIQUE (email);

