CCREATE TABLE public.users (
	user_id bigserial NOT NULL,
	first_name text NULL,
	last_name text NULL,
	email text NULL,
	pwd text NULL,
	githubname text NULL,
	CONSTRAINT users_gnpk UNIQUE (githubname),
	CONSTRAINT users_mk UNIQUE (email),
	CONSTRAINT users_pk PRIMARY KEY (user_id)
);



CREATE TABLE public.organizations (
	id int4 NOT NULL,
	"name" varchar(50) NULL,
	githubname varchar(50) NULL,
	active bool NULL,
	secret varchar NOT NULL DEFAULT 123,
	"year" text NULL,
	lab_name text NULL,
	CONSTRAINT org_pk PRIMARY KEY (id),
	CONSTRAINT organizations_gnpk UNIQUE (githubname)
);

CREATE TABLE public.team (
	team_id bigserial NOT NULL,
	team_name text NOT NULL,
	team_supervisor text NOT NULL,
	lesson text NOT NULL,
	CONSTRAINT team_pk PRIMARY KEY (team_id),
	CONSTRAINT team_uk UNIQUE (team_name),
	CONSTRAINT fk_team FOREIGN KEY (team_supervisor) REFERENCES public.users(githubname),
	CONSTRAINT fk_team2 FOREIGN KEY (lesson) REFERENCES public.organizations(githubname)
);






CREATE TABLE public.team_member (
	team_member_id bigserial NOT NULL,
	team bigint NOT NULL,
	member_github_name text NOT NULL,
	active bool NOT NULL,
	am text NULL,
	first_name text NULL,
	last_name text NULL,
	CONSTRAINT team_member_pk PRIMARY KEY (team_member_id),
	CONSTRAINT fk_team_member_ FOREIGN KEY (team) REFERENCES public.team(team_id)
);


CREATE TABLE public.exercise (
	exercise_id bigserial NOT NULL,
	team text NOT NULL,
	supervisor text NOT NULL,
	"name" text NULL,
	lesson text NULL,
	no_exercise int4 NULL,
	end_date text NULL,
	initialized text NULL DEFAULT now(),
	CONSTRAINT exercie_pk PRIMARY KEY (exercise_id),
	CONSTRAINT exername_uk UNIQUE (name),
	CONSTRAINT fk_exercise FOREIGN KEY (team) REFERENCES public.team(team_name),
	CONSTRAINT fk_exercise2 FOREIGN KEY (supervisor) REFERENCES public.users(githubname)
);


CREATE TABLE public.organization_supervisors (
	id bigserial NOT NULL,
	organization text NULL,
	supervisor text NULL,
	"owner" bool NULL,
	CONSTRAINT organization_supervisors_gnpk PRIMARY KEY (id),
	CONSTRAINT fk_organization_supervisors FOREIGN KEY (organization) REFERENCES public.organizations(githubname),
	CONSTRAINT fk_organization_supervisors2 FOREIGN KEY (supervisor) REFERENCES public.users(githubname)
);

CREATE TABLE public.grades (
	id bigserial NOT NULL,
	team_member text NULL,
	exercise text NULL,
	grade float8 NULL DEFAULT 0,
	"comment" text NULL,
	CONSTRAINT grades_gnpk PRIMARY KEY (id),
	CONSTRAINT fk_exercise FOREIGN KEY (exercise) REFERENCES public.exercise("name"),
	CONSTRAINT team_member_fk FOREIGN KEY (team_member) REFERENCES public.team_member(member_github_name)
);
/*
CREATE TABLE public.team_member (
	team_member_id bigserial NOT NULL,
	team_name text NOT NULL,
	member_github_name text NOT NULL,
	active bool NOT NULL,
	am text NULL,
	first_name text NULL,
	last_name text NULL,
	CONSTRAINT team_member_pk PRIMARY KEY (team_member_id),
	CONSTRAINT fk_team_member_ FOREIGN KEY (team_name) REFERENCES public.team(team_name)
);
*/

ALTER TABLE ONLY public.team_member
   ADD CONSTRAINT team_member_pk PRIMARY KEY (team_member_id);


ALTER TABLE ONLY public.team_member
   ADD CONSTRAINT fk_team_member_ FOREIGN KEY(lesson)  REFERENCES organizaions(githubname);

ALTER TABLE ONLY public.team
   ADD CONSTRAINT team_pk PRIMARY KEY (team_id);


ALTER TABLE ONLY public.team
   ADD CONSTRAINT fk_team FOREIGN KEY(team_supervisor)  REFERENCES users(githubname);
   

ALTER TABLE ONLY public.exercise
   ADD CONSTRAINT exercie_pk PRIMARY KEY (exercise_id);

ALTER TABLE ONLY public.exercise
   ADD CONSTRAINT fk_exercise FOREIGN KEY(team)  REFERENCES team(team_name);
   
ALTER TABLE ONLY public.exercise
   ADD CONSTRAINT fk_exercise2 FOREIGN KEY(supervisor)  REFERENCES users(githubname);
   
ALTER TABLE ONLY public.team
   ADD CONSTRAINT fk_team2 FOREIGN KEY(team_name)  REFERENCES organizations(githubname);
   

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
