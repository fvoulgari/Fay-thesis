CREATE TABLE public.users (
                              user_id bigserial NOT NULL,
                              first_name text NOT NULL,
                              last_name text NOT NULL,
                              githubname text NOT NULL,
                              githubtoken text NOT NULL,
                              email text NOT NULL,
                              pwd text NOT NULL,
                              admin boolean DEFAULT false NOT NULL
);

CREATE TABLE public.organizaions (
                              id bigserial NOT NULL,
                              name text NOT NULL,
                              githubname text NOT NULL,
                              active boolean DEFAULT false NOT NULL
);


ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_pk PRIMARY KEY (user_id);

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_mk UNIQUE (email);

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_gnpk UNIQUE (githubname);

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_gtpk UNIQUE (githubtoken);

ALTER TABLE ONLY public.organizaions
   ADD CONSTRAINT users_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.organizaions
   ADD CONSTRAINT organizaions_gnpk UNIQUE (githubname);



INSERT INTO organizaions ( id, name, githubname, active)  VALUES (1,'TA-PythonLab','TA-PythonLab',true )
INSERT INTO organizaions ( id, name, githubname, active)  VALUES (2,'TA-JavaLab','TA-JavaLab',true )
INSERT INTO organizaions ( id, name, githubname, active)  VALUES (3,'Uop-Lab-1','Uop-Lab-1',false )
INSERT INTO organizaions ( id, name, githubname, active)  VALUES (4,'Uop-Lab-2','Uop-Lab-2',false )
INSERT INTO organizaions ( id, name, githubname, active ) VALUES (5,'Uop-Lab-3','Uop-Lab-3',false )
INSERT INTO organizaions ( id, name, githubname, active ) VALUES (6,'Uop-Lab-4','Uop-Lab-4',false )
INSERT INTO organizaions ( id, name, githubname, active ) VALUES (7,'Uop-Lab-5','Uop-Lab-5',false )
