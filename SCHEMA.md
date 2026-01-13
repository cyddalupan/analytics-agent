Table: applicant

applicant_id		int(10)
applicant_first		varchar(100)
applicant_middle	varchar(100)
applicant_last		varchar(100)
applicant_remarks	text
applicant_source	int(11)
applicant_employer 	int(10)
applicant_status 	int(10)
applicant_preferred_country int(5)

---

 Table: employer

 employer_id Primary	int(11)	 = applicant_employer
 employer_name	varchar(100)


---

Table: recruitment_agent 

agent_id int(10) = applicant_source
agent_first	varchar(100)
agent_last	varchar(100)

---

Table: statuses

id int(10)	= applicant_status
status	varchar(255)
statusColors	varchar(255)

---

Table: country

country_id int(10) = applicant_preferred_country
country_name	varchar(100)

---


Table: applicant_experiences



