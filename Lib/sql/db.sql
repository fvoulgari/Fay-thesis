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
CREATE TABLE public.organizations (
                              id bigserial NOT NULL,
                              name text NOT NULL,
                              githubname text NOT NULL,
                              active boolean DEFAULT false NOT NULL
);

CREATE TABLE public.team (
                              team_id bigserial NOT NULL,
                              team_name text NOT NULL,
                              team_supervisor text NOT NULL,
                              lesson text NOT NULL

                              
);

CREATE TABLE public.team_member (
                              team_member_id bigserial NOT NULL,
                              team_name text NOT NULL,
                              member_github_name text NOT NULL,
                              active boolean NOT NULL
                              
);




ALTER TABLE ONLY public.team_member
   ADD CONSTRAINT team_member_pk PRIMARY KEY (team_member_id);


ALTER TABLE ONLY public.team_member
   ADD CONSTRAINT fk_team_member_ FOREIGN KEY(lesson)  REFERENCES organizaions(githubname);

ALTER TABLE ONLY public.team
   ADD CONSTRAINT team_pk PRIMARY KEY (team_id);


ALTER TABLE ONLY public.team
   ADD CONSTRAINT fk_team FOREIGN KEY(supervisor)  REFERENCES users(githubname);
   

ALTER TABLE ONLY public.team
   ADD CONSTRAINT fk_team2 FOREIGN KEY(team_name)  REFERENCES organizations(team_name);
   

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_pk PRIMARY KEY (user_id);

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_mk UNIQUE (email);

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_gnpk UNIQUE (githubname);

ALTER TABLE ONLY public.users
   ADD CONSTRAINT users_gtpk UNIQUE (githubtoken);

ALTER TABLE ONLY public.organizations
   ADD CONSTRAINT users_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.organizations
   ADD CONSTRAINT organizations_gnpk UNIQUE (githubname);



INSERT INTO organizaions ( id, name, githubname, active)  VALUES (1,'TA-PythonLab','TA-PythonLab',true )
INSERT INTO organizaions ( id, name, githubname, active)  VALUES (2,'TA-JavaLab','TA-JavaLab',true )
INSERT INTO organizaions ( id, name, githubname, active)  VALUES (3,'Uop-Lab-1','Uop-Lab-1',false )
INSERT INTO organizaions ( id, name, githubname, active)  VALUES (4,'Uop-Lab-2','Uop-Lab-2',false )
INSERT INTO organizaions ( id, name, githubname, active ) VALUES (5,'Uop-Lab-3','Uop-Lab-3',false )
INSERT INTO organizaions ( id, name, githubname, active ) VALUES (6,'Uop-Lab-4','Uop-Lab-4',false )
INSERT INTO organizaions ( id, name, githubname, active ) VALUES (7,'Uop-Lab-5','Uop-Lab-5',false )
