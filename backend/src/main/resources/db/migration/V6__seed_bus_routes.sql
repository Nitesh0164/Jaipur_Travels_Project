-- Seed all 27 bus routes from frontend mockBusRoutes.js
INSERT INTO bus_routes (route_no,route_type,category,from_stop,to_stop,via_summary_json,distance_km,stops_count,headway_minutes,buses_on_route,fare_min,fare_max) VALUES
('1','Regular','Urban','Bheru Khejda','Galtagate','["Todi Depot","Harmada","VKI 14,9,5","Alka Cinema","Chomu Pulia","Railway Station","Chandpole"]',24,28,26,6,5,25),
('7','Regular','Urban','Khirni Phatak','Transport Nagar','["Heerapura","Badarwas Mod","Mansarovar Metro","Gurjar Ki Thadi","Gopalpura","Rambag"]',21,32,12,14,5,25),
('9A','Regular','Urban','Dadi Ka Phatak','Agarwal Farm','["Kediya","Murlipura","Road No. 1","Alka Cinema","Chandpole","Ajmeri Gate","Durgapura"]',28,35,12,16,5,30),
('AC 1','AC','AC','Sanganer','Kukas','["Sanganer Police Station","Tonk Fatak","Rambag","Ajmeri Gate","Badi Chopar","Jal Mahal","Amber Fort"]',32,25,24,9,10,60),
('15','Regular','Sub-Urban','Chandpole','Chomu','["Panipech","Chomu Pulia","Khaitan","VKI Road No.1,5,9,14","Todi","Rampura"]',32,20,30,6,5,35),
('32','Regular','Sub-Urban','RSBTDA Terminal Heerapura','Nayla (Lali Gaav)','["Gaj Singh Pura","Badarwas Mode","Gurjar Ki Thadi","Gopalpura","Rambag","Ajmeri Gate","Transport Nagar","Kanota"]',42,40,44,6,5,40),
('28','Regular','Sub-Urban','Ajmeri Gate','Renwal','["Rambag","Durgapura","Sanganer","Muhana Mode"]',31,32,22,8,5,35),
('14','Regular','Sub-Urban','Chomu Pulia','Bassi Chak','["Khatipura","Vaishali Nagar","Sodala","Rambagh","Ajmeri Gate","TP Nagar","Kanota"]',47,33,20,13,5,40),
('26','Regular','Sub-Urban','Chandpole','Bagru Bus Stand','["Government Hostel","Hathroi","Ajmer Puliya","Civil Line Chouraha","Sodala","RSBTDA","Bhankrota","Manipal University"]',34,25,23,8,5,35),
('24','Regular','Sub-Urban','Chandpole','Kalwad','["Panipech","Chomu Puliya","Jhotwada","Hathoj"]',25,28,30,5,5,30),
('10B','Regular','Urban','Niwaru','Khole Ke Hanumanji','["Jhotwara","Panipech","Chinkara","Railway Station","Chandpole","Galtagate"]',22,24,75,2,5,25),
('23A','Regular','Urban','Ajmeri Gate','Patrakar Colony','["Gopalpura","Gurjar Ki Thadi","Mansarovar","VT Road"]',17,18,120,1,5,20),
('1A','Regular','Urban','TP Nagar','VKI Road No. 17','["Ajmeri Gate","GPO","Chandpole","Pital Factory","Chomu Puliya"]',21,37,50,3,5,25),
('3A','Regular','Urban','Sanganer','Choti Chopar','["Sanganer Police Station","Durgapura","Tonk Fatak","Rambag","Ajmeri Gate"]',15,21,9,14,5,20),
('AC 2','AC','AC','Joshi Marg','Mahatma Gandhi Hospital','["Jhotwara","Chomu Pulia","Panipech","Railway Station","Chandpole","Ajmeri Gate","Sanganer"]',32,36,15,16,10,60),
('11','Regular','Sub-Urban','Ajmeri Gate','Goner','["Durgapura","Sanganer","Goner Mode"]',27,29,45,4,5,30),
('6A','Regular','Urban','Khirni Phatak','Jaipur Airport','["Jhotwada","Chomu Pulia","Collectry","Ajmeri Gate","Malviya Nagar"]',26,38,48,4,5,30),
('3','Regular','Urban','Dwarkapuri','Transport Nagar','["Sanganer Police Station","Durgapura","Tonk Fatak","Rambhag","Ajmeri Gate"]',21,32,13,12,5,25),
('34','Regular','Urban','JDA Colony','Ananda Manglam City','["Ramgarh Mode","Badi Chopar","Sanganeri Gate","Ajmeri Gate","Tonk Fatak","Gopalpura"]',28,30,30,7,5,30),
('AC 8','AC','AC','Choti Chopad','Mundiya Ramsar (Dhanakya)','["Chandpole","Railway Station","Hasanpura","Khatipura"]',23,23,28,5,10,50),
('AC 7','AC','AC','Chomu Puliya','Dantli Phatak','["Sanganeri Gate","Ajmeri Gate","Gandhi Nagar Mode","Rambag","Jahalana","Jagatpura"]',25,29,22,8,10,50),
('30','Regular','Sub-Urban','Badi Chopad','Ramgarh','["Sobhash Chok","Ramgad Mode","Nai Ki Thadi","Saipura"]',25,19,35,4,5,30),
('16','Regular','Sub-Urban','Ajmeri Gate','Chaksu','["Sanganer Police Station","12 Meel","Bilwa","Shivdas Pura"]',42,28,20,11,5,40),
('27','Regular','Sub-Urban','Goner','Vatika','["Luniyawas","TP Nagar","Ghategate","Ajmeri Gate","Sanganer","Pratap Nagar"]',47,48,60,4,5,40),
('25A','Regular','Sub-Urban','Ajmeri Gate','Padampura','["SMS","Tonk Phatak","Sanganer Thana","Bilwa"]',34,29,180,1,5,35),
('25B','Regular','Sub-Urban','Ajmeri Gate','Titraya (Bhojyara)','["SMS","Tonk Phatak","Sanganer Thana","Bilwa","Shivdaspura"]',38,31,180,1,5,40),
('RBP-2','Circular','Circular','Ramniwas Bag Parking','Ramniwas Bag Parking','["New Gate","Choda Rasta","Tripoliya","Badi Chopad","Johari Bazaar"]',3,6,10,2,5,10);

-- Seed bus stops (from + viaSummary + to for each route)
-- Using a procedure-style approach: one INSERT per route's stop list

-- Route 1
SET @rid = (SELECT id FROM bus_routes WHERE route_no='1' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Bheru Khejda',1),(@rid,'Todi Depot',2),(@rid,'Harmada',3),(@rid,'VKI',4),(@rid,'Alka Cinema',5),(@rid,'Chomu Pulia',6),(@rid,'Railway Station',7),(@rid,'Chandpole',8),(@rid,'Galtagate',9);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='7' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Khirni Phatak',1),(@rid,'Heerapura',2),(@rid,'Badarwas Mod',3),(@rid,'Mansarovar Metro',4),(@rid,'Gurjar Ki Thadi',5),(@rid,'Gopalpura',6),(@rid,'Rambag',7),(@rid,'Transport Nagar',8);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='9A' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Dadi Ka Phatak',1),(@rid,'Kediya',2),(@rid,'Murlipura',3),(@rid,'Road No. 1',4),(@rid,'Alka Cinema',5),(@rid,'Chandpole',6),(@rid,'Ajmeri Gate',7),(@rid,'Durgapura',8),(@rid,'Agarwal Farm',9);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='AC 1' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Sanganer',1),(@rid,'Sanganer Police Station',2),(@rid,'Tonk Fatak',3),(@rid,'Rambag',4),(@rid,'Ajmeri Gate',5),(@rid,'Badi Chopar',6),(@rid,'Jal Mahal',7),(@rid,'Amber Fort',8),(@rid,'Kukas',9);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='15' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Chandpole',1),(@rid,'Panipech',2),(@rid,'Chomu Pulia',3),(@rid,'Khaitan',4),(@rid,'VKI',5),(@rid,'Todi',6),(@rid,'Rampura',7),(@rid,'Chomu',8);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='32' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'RSBTDA Heerapura',1),(@rid,'Gaj Singh Pura',2),(@rid,'Badarwas Mode',3),(@rid,'Gurjar Ki Thadi',4),(@rid,'Gopalpura',5),(@rid,'Rambag',6),(@rid,'Ajmeri Gate',7),(@rid,'Transport Nagar',8),(@rid,'Kanota',9),(@rid,'Nayla',10);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='28' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Ajmeri Gate',1),(@rid,'Rambag',2),(@rid,'Durgapura',3),(@rid,'Sanganer',4),(@rid,'Muhana Mode',5),(@rid,'Renwal',6);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='14' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Chomu Pulia',1),(@rid,'Khatipura',2),(@rid,'Vaishali Nagar',3),(@rid,'Sodala',4),(@rid,'Rambag',5),(@rid,'Ajmeri Gate',6),(@rid,'TP Nagar',7),(@rid,'Kanota',8),(@rid,'Bassi Chak',9);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='26' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Chandpole',1),(@rid,'Government Hostel',2),(@rid,'Hathroi',3),(@rid,'Ajmer Puliya',4),(@rid,'Civil Line Chouraha',5),(@rid,'Sodala',6),(@rid,'RSBTDA',7),(@rid,'Bhankrota',8),(@rid,'Manipal University',9),(@rid,'Bagru Bus Stand',10);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='24' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Chandpole',1),(@rid,'Panipech',2),(@rid,'Chomu Puliya',3),(@rid,'Jhotwada',4),(@rid,'Hathoj',5),(@rid,'Kalwad',6);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='10B' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Niwaru',1),(@rid,'Jhotwara',2),(@rid,'Panipech',3),(@rid,'Chinkara',4),(@rid,'Railway Station',5),(@rid,'Chandpole',6),(@rid,'Galtagate',7),(@rid,'Khole Ke Hanumanji',8);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='23A' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Ajmeri Gate',1),(@rid,'Gopalpura',2),(@rid,'Gurjar Ki Thadi',3),(@rid,'Mansarovar',4),(@rid,'VT Road',5),(@rid,'Patrakar Colony',6);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='1A' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'TP Nagar',1),(@rid,'Ajmeri Gate',2),(@rid,'GPO',3),(@rid,'Chandpole',4),(@rid,'Pital Factory',5),(@rid,'Chomu Puliya',6),(@rid,'VKI Road No. 17',7);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='3A' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Sanganer',1),(@rid,'Sanganer Police Station',2),(@rid,'Durgapura',3),(@rid,'Tonk Fatak',4),(@rid,'Rambag',5),(@rid,'Ajmeri Gate',6),(@rid,'Choti Chopar',7);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='AC 2' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Joshi Marg',1),(@rid,'Jhotwara',2),(@rid,'Chomu Pulia',3),(@rid,'Panipech',4),(@rid,'Railway Station',5),(@rid,'Chandpole',6),(@rid,'Ajmeri Gate',7),(@rid,'Sanganer',8),(@rid,'Mahatma Gandhi Hospital',9);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='11' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Ajmeri Gate',1),(@rid,'Durgapura',2),(@rid,'Sanganer',3),(@rid,'Goner Mode',4),(@rid,'Goner',5);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='6A' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Khirni Phatak',1),(@rid,'Jhotwada',2),(@rid,'Chomu Pulia',3),(@rid,'Collectry',4),(@rid,'Ajmeri Gate',5),(@rid,'Malviya Nagar',6),(@rid,'Jaipur Airport',7);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='3' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Dwarkapuri',1),(@rid,'Sanganer Police Station',2),(@rid,'Durgapura',3),(@rid,'Tonk Fatak',4),(@rid,'Rambag',5),(@rid,'Ajmeri Gate',6),(@rid,'Transport Nagar',7);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='34' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'JDA Colony',1),(@rid,'Ramgarh Mode',2),(@rid,'Badi Chopar',3),(@rid,'Sanganeri Gate',4),(@rid,'Ajmeri Gate',5),(@rid,'Tonk Fatak',6),(@rid,'Gopalpura',7),(@rid,'Ananda Manglam City',8);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='AC 8' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Choti Chopad',1),(@rid,'Chandpole',2),(@rid,'Railway Station',3),(@rid,'Hasanpura',4),(@rid,'Khatipura',5),(@rid,'Mundiya Ramsar',6);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='AC 7' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Chomu Puliya',1),(@rid,'Sanganeri Gate',2),(@rid,'Ajmeri Gate',3),(@rid,'Gandhi Nagar Mode',4),(@rid,'Rambag',5),(@rid,'Jahalana',6),(@rid,'Jagatpura',7),(@rid,'Dantli Phatak',8);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='30' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Badi Chopad',1),(@rid,'Sobhash Chok',2),(@rid,'Ramgad Mode',3),(@rid,'Nai Ki Thadi',4),(@rid,'Saipura',5),(@rid,'Ramgarh',6);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='16' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Ajmeri Gate',1),(@rid,'Sanganer Police Station',2),(@rid,'12 Meel',3),(@rid,'Bilwa',4),(@rid,'Shivdas Pura',5),(@rid,'Chaksu',6);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='27' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Goner',1),(@rid,'Luniyawas',2),(@rid,'TP Nagar',3),(@rid,'Ghategate',4),(@rid,'Ajmeri Gate',5),(@rid,'Sanganer',6),(@rid,'Pratap Nagar',7),(@rid,'Vatika',8);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='25A' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Ajmeri Gate',1),(@rid,'SMS',2),(@rid,'Tonk Phatak',3),(@rid,'Sanganer Thana',4),(@rid,'Bilwa',5),(@rid,'Padampura',6);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='25B' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Ajmeri Gate',1),(@rid,'SMS',2),(@rid,'Tonk Phatak',3),(@rid,'Sanganer Thana',4),(@rid,'Bilwa',5),(@rid,'Shivdaspura',6),(@rid,'Titraya',7);

SET @rid = (SELECT id FROM bus_routes WHERE route_no='RBP-2' LIMIT 1);
INSERT INTO bus_stops (route_id,stop_name,stop_order) VALUES
(@rid,'Ramniwas Bag Parking',1),(@rid,'New Gate',2),(@rid,'Choda Rasta',3),(@rid,'Tripoliya',4),(@rid,'Badi Chopad',5),(@rid,'Johari Bazaar',6),(@rid,'Ramniwas Bag Parking',7);
