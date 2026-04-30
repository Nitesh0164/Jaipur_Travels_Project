-- V12: Seed an additional 30 fallback Jaipur hotels to reach 50 total

INSERT INTO hotels (source, name, city, area, address, rating, star_rating, image_url,
                    amenities_json, price_min, price_max, currency, price_type)
VALUES
-- Kukas
('MANUAL','Fairmont Jaipur','jaipur','Kukas','2 Riico RIICO Industrial Area Kukas',4.7,5,
 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
 '["WiFi","Pool","Spa","Restaurant","Bar","Gym","AC","Parking"]',12000,25000,'INR','ESTIMATED'),

('MANUAL','Le Méridien Jaipur Resort & Spa','jaipur','Kukas','Number 1 Riico, Kukas',4.5,5,
 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
 '["WiFi","Pool","Spa","Restaurant","Bar","Gym","AC"]',9000,20000,'INR','ESTIMATED'),

('MANUAL','Shiv Vilas Resort','jaipur','Kukas','Kukas, Jaipur-Delhi Highway',4.4,5,
 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?w=800',
 '["WiFi","Pool","Restaurant","Heritage","Parking"]',8000,18000,'INR','ESTIMATED'),

('MANUAL','Lohagarh Fort Resort','jaipur','Kukas','NH-8, Kukas',4.3,4,
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
 '["WiFi","Pool","Spa","Nature","Restaurant"]',6000,12000,'INR','ESTIMATED'),

('MANUAL','The Gold Palace and Resorts','jaipur','Kukas','Delhi-Jaipur Highway, Kukas',4.0,4,
 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
 '["WiFi","Pool","AC","Restaurant","Parking"]',4500,9000,'INR','ESTIMATED'),

-- Raja Park
('MANUAL','Ramada by Wyndham Jaipur','jaipur','Raja Park','Govind Marg, Raja Park',4.2,4,
 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
 '["WiFi","Pool","Restaurant","Gym","AC","Parking"]',5000,10000,'INR','ESTIMATED'),

('MANUAL','Hotel Grand Lotus','jaipur','Raja Park','Lane 2, Raja Park',3.9,3,
 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800',
 '["WiFi","AC","Restaurant","Room Service"]',2000,4000,'INR','ESTIMATED'),

('MANUAL','The Fern Residency','jaipur','Raja Park','Govind Marg, Near Raja Park',4.1,3,
 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
 '["WiFi","AC","Restaurant","Eco-friendly","Parking"]',3000,6000,'INR','ESTIMATED'),

('MANUAL','Hotel Ruby','jaipur','Raja Park','Street 1, Raja Park',3.8,2,
 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800',
 '["WiFi","AC","24hr Front Desk"]',1200,2500,'INR','ESTIMATED'),

('MANUAL','Opal Hotel','jaipur','Raja Park','Lane 5, Raja Park',3.7,2,
 'https://images.unsplash.com/photo-1587874522487-fe10e9539ef1?w=800',
 '["AC","Room Service"]',1000,2000,'INR','ESTIMATED'),

-- Ajmer Road
('MANUAL','Itc Rajputana','jaipur','Ajmer Road','Palace Road, Ajmer Road',4.6,5,
 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
 '["WiFi","Pool","Spa","Restaurant","Bar","Gym","AC","Parking"]',11000,22000,'INR','ESTIMATED'),

('MANUAL','Ibis Jaipur Civil Lines','jaipur','Ajmer Road','Ajmer Road, Near Civil Lines',4.1,3,
 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
 '["WiFi","AC","Restaurant","Pool","Parking"]',2500,5000,'INR','ESTIMATED'),

('MANUAL','Vesta International','jaipur','Ajmer Road','S-3, Ajmer Road',4.0,4,
 'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800',
 '["WiFi","AC","Restaurant","Pool","Gym"]',3500,7000,'INR','ESTIMATED'),

('MANUAL','Hotel Om Tower','jaipur','Ajmer Road','Church Road, Ajmer Road',3.9,3,
 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800',
 '["WiFi","AC","Revolving Restaurant","Parking"]',2000,4500,'INR','ESTIMATED'),

('MANUAL','Hotel Genesis','jaipur','Ajmer Road','Near Ajmer Road',3.8,2,
 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
 '["WiFi","AC","Room Service"]',1500,3000,'INR','ESTIMATED'),

-- Gopalpura
('MANUAL','Hotel Surya Villa','jaipur','Gopalpura','Gopalpura Bypass Road',4.2,3,
 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800',
 '["WiFi","AC","Restaurant","Parking","Room Service"]',2200,4500,'INR','ESTIMATED'),

('MANUAL','Royal Orchid Central','jaipur','Gopalpura','Near Gopalpura',4.3,4,
 'https://images.unsplash.com/photo-1596701062351-8ac031d6d000?w=800',
 '["WiFi","AC","Restaurant","Pool","Gym","Parking"]',4000,8000,'INR','ESTIMATED'),

('MANUAL','Hotel Aangan','jaipur','Gopalpura','Main Road, Gopalpura',3.9,2,
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
 '["WiFi","AC","24hr Front Desk"]',1000,2200,'INR','ESTIMATED'),

('MANUAL','Gopalpura Inn','jaipur','Gopalpura','Lane 3, Gopalpura',3.8,2,
 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
 '["AC","Parking"]',900,1800,'INR','ESTIMATED'),

('MANUAL','The Grand Anukampa','jaipur','Gopalpura','Elevated Road, Gopalpura',4.1,3,
 'https://images.unsplash.com/photo-1567498136773-dc4d5d30e2ee?w=800',
 '["WiFi","Pool","AC","Restaurant","Gym"]',3000,6000,'INR','ESTIMATED'),

-- JLN Marg
('MANUAL','Jaipur Marriott Hotel','jaipur','JLN Marg','Ashram Marg, Near Jawahar Circle',4.6,5,
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
 '["WiFi","Pool","Spa","Restaurant","Bar","Gym","AC","Parking"]',10000,20000,'INR','ESTIMATED'),

('MANUAL','The Lalit Jaipur','jaipur','JLN Marg','2B & 2C, Jawahar Circle',4.5,5,
 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800',
 '["WiFi","Pool","Spa","Restaurant","Bar","Gym","AC"]',9500,19000,'INR','ESTIMATED'),

('MANUAL','Radisson Blu Jaipur','jaipur','JLN Marg','Plot No 8 & 9, JLN Marg',4.4,5,
 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
 '["WiFi","Pool","Spa","Restaurant","Gym","AC","Parking"]',8500,17000,'INR','ESTIMATED'),

('MANUAL','Clarks Inn Jaipur','jaipur','JLN Marg','Near JLN Marg',4.0,3,
 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800',
 '["WiFi","AC","Restaurant","Parking","Room Service"]',2500,5000,'INR','ESTIMATED'),

('MANUAL','Hotel Royal Empire','jaipur','JLN Marg','JLN Marg, Near Airport',3.9,3,
 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
 '["WiFi","AC","Restaurant","Parking"]',2000,4000,'INR','ESTIMATED'),

-- Malviya Industrial Area
('MANUAL','Hotel Malviya Palace','jaipur','Malviya Industrial Area','Plot 14, Malviya Industrial Area',4.1,3,
 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
 '["WiFi","AC","Restaurant","Parking","Business Center"]',2500,4500,'INR','ESTIMATED'),

('MANUAL','The Byke Grassfield Resort','jaipur','Malviya Industrial Area','K-125, Shyam Nagar',4.0,4,
 'https://images.unsplash.com/photo-1596701062351-8ac031d6d000?w=800',
 '["WiFi","Pool","AC","Restaurant","Spa","Parking"]',4000,7500,'INR','ESTIMATED'),

('MANUAL','Hotel Aqua','jaipur','Malviya Industrial Area','Industrial Area Road',3.8,2,
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
 '["WiFi","AC","Room Service"]',1200,2500,'INR','ESTIMATED'),

('MANUAL','Industrial Inn','jaipur','Malviya Industrial Area','Sector 4, Malviya Industrial Area',3.5,1,
 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800',
 '["AC","24hr Front Desk"]',800,1500,'INR','ESTIMATED'),

('MANUAL','Zang Inn','jaipur','Malviya Industrial Area','Phase 1, Industrial Area',3.7,2,
 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800',
 '["WiFi","AC","Parking"]',1000,2200,'INR','ESTIMATED');
