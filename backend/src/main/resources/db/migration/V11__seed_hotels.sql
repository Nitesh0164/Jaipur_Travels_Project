-- V11: Seed 25 fallback Jaipur hotels

INSERT INTO hotels (source, name, city, area, address, rating, star_rating, image_url,
                    amenities_json, price_min, price_max, currency, price_type)
VALUES
-- MI Road area
('MANUAL','Hotel Pearl Palace','jaipur','MI Road','Hari Kishan Somani Marg, MI Road',4.4,3,
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
 '["WiFi","AC","Restaurant","Parking","Room Service"]',1500,3500,'INR','ESTIMATED'),

('MANUAL','Arya Niwas Hotel','jaipur','MI Road','Sansar Chandra Road, MI Road',4.2,3,
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
 '["WiFi","AC","Restaurant","Garden","Yoga"]',2000,4500,'INR','ESTIMATED'),

-- Bani Park area
('MANUAL','Alsisar Haveli','jaipur','Bani Park','Sansar Chandra Road, Bani Park',4.5,4,
 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?w=800',
 '["WiFi","Pool","AC","Restaurant","Heritage","Parking"]',4500,9000,'INR','ESTIMATED'),

('MANUAL','Umaid Mahal Hotel','jaipur','Bani Park','B-1/18, Bani Park',4.3,4,
 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
 '["WiFi","AC","Restaurant","Heritage","Room Service"]',3500,7000,'INR','ESTIMATED'),

('MANUAL','Hotel Anuraag Villa','jaipur','Bani Park','D-250, Bani Park',4.1,3,
 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800',
 '["WiFi","AC","Parking","Room Service"]',1800,3500,'INR','ESTIMATED'),

-- C-Scheme area
('MANUAL','The Raj Palace','jaipur','C-Scheme','Zorawar Singh Gate, C-Scheme',4.7,5,
 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
 '["WiFi","Pool","Spa","Restaurant","Heritage","Bar","Gym"]',12000,25000,'INR','ESTIMATED'),

('MANUAL','Holiday Inn Jaipur City Centre','jaipur','C-Scheme','Ashok Marg, C-Scheme',4.3,4,
 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
 '["WiFi","Pool","AC","Restaurant","Bar","Gym","Parking"]',5500,10000,'INR','ESTIMATED'),

-- Vaishali Nagar
('MANUAL','Lemon Tree Hotel Jaipur','jaipur','Vaishali Nagar','B-3 Shyam Nagar, Vaishali Nagar',4.2,3,
 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
 '["WiFi","Pool","AC","Restaurant","Gym","Parking"]',4000,7500,'INR','ESTIMATED'),

('MANUAL','Hotel Rajputana Sarovar Portico','jaipur','Vaishali Nagar','Plot No 6, Airport Road',4.0,3,
 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
 '["WiFi","AC","Restaurant","Parking","Room Service"]',3500,6000,'INR','ESTIMATED'),

-- Malviya Nagar
('MANUAL','Clarks Amer Jaipur','jaipur','Malviya Nagar','Jawaharlal Nehru Marg, Malviya Nagar',4.3,5,
 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
 '["WiFi","Pool","Spa","Restaurant","Bar","Gym","AC","Parking"]',8000,16000,'INR','ESTIMATED'),

('MANUAL','Trident Jaipur','jaipur','Malviya Nagar','Amber Fort Road, Malviya Nagar',4.5,5,
 'https://images.unsplash.com/photo-1596701062351-8ac031d6d000?w=800',
 '["WiFi","Pool","Spa","Restaurant","Heritage View","Bar","Gym"]',10000,20000,'INR','ESTIMATED'),

-- Tonk Road
('MANUAL','ibis Jaipur','jaipur','Tonk Road','B 1-2 Tonk Road, Near Airport',4.1,3,
 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
 '["WiFi","AC","Restaurant","Parking","24hr Front Desk"]',2800,5500,'INR','ESTIMATED'),

('MANUAL','Hotel Mansingh Tower','jaipur','Tonk Road','Sansar Chandra Road, Tonk Road',4.0,4,
 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800',
 '["WiFi","AC","Restaurant","Pool","Parking","Bar"]',4500,8000,'INR','ESTIMATED'),

-- Amer Road
('MANUAL','Samode Haveli','jaipur','Amer Road','Gangapole, Near Amer Fort',4.6,5,
 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800',
 '["WiFi","Pool","AC","Restaurant","Heritage","Spa","Garden"]',15000,30000,'INR','ESTIMATED'),

('MANUAL','Hotel Narain Niwas Palace','jaipur','Amer Road','Kanota Bagh, Narain Singh Road',4.4,4,
 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800',
 '["WiFi","Pool","AC","Restaurant","Heritage","Garden"]',5000,10000,'INR','ESTIMATED'),

-- Sindhi Camp
('MANUAL','Hotel Diggi Palace','jaipur','Sindhi Camp','Shivaji Nagar, SMS Hospital Road',4.3,3,
 'https://images.unsplash.com/photo-1587874522487-fe10e9539ef1?w=800',
 '["WiFi","Pool","AC","Restaurant","Garden","Parking"]',3000,6500,'INR','ESTIMATED'),

('MANUAL','Hotel Kailash','jaipur','Sindhi Camp','Station Road, Sindhi Camp',3.8,2,
 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800',
 '["WiFi","AC","Room Service","24hr Front Desk"]',800,2000,'INR','ESTIMATED'),

-- Mansarovar
('MANUAL','Fortune Select Metropolitan','jaipur','Mansarovar','Opposite Jai Club, Mansarovar',4.2,4,
 'https://images.unsplash.com/photo-1567498136773-dc4d5d30e2ee?w=800',
 '["WiFi","Pool","AC","Restaurant","Gym","Bar","Parking"]',5000,9000,'INR','ESTIMATED'),

('MANUAL','The Royale Assure Jaypee Jaipur','jaipur','Mansarovar','Jagatpura Road, Mansarovar',4.0,3,
 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
 '["WiFi","AC","Restaurant","Parking","Room Service"]',2500,5000,'INR','ESTIMATED'),

-- Near Airport
('MANUAL','Courtyard by Marriott Jaipur','jaipur','Near Airport','Adjoining World Trade Park, Malviya Nagar',4.4,4,
 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
 '["WiFi","Pool","Spa","Restaurant","Bar","Gym","AC","Parking"]',7000,14000,'INR','ESTIMATED'),

('MANUAL','Hotel Apex International','jaipur','Near Airport','Tonk Road, Near Sanganer Airport',3.9,3,
 'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800',
 '["WiFi","AC","Restaurant","Parking","Airport Transfer"]',2200,4500,'INR','ESTIMATED'),

-- Civil Lines
('MANUAL','ITC Rajputana','jaipur','Civil Lines','Palace Road, Civil Lines',4.6,5,
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
 '["WiFi","Pool","Spa","Restaurant","Heritage","Bar","Gym","AC","Parking"]',11000,22000,'INR','ESTIMATED'),

('MANUAL','Jai Mahal Palace','jaipur','Civil Lines','Jacob Road, Civil Lines',4.5,5,
 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
 '["WiFi","Pool","Spa","Restaurant","Heritage","Bar","Gym","Garden"]',13000,28000,'INR','ESTIMATED'),

-- Johari Bazaar
('MANUAL','Hotel Bissau Palace','jaipur','Johari Bazaar','Outside Chand Pole, Johari Bazaar',4.2,3,
 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
 '["WiFi","Pool","AC","Restaurant","Heritage","Garden"]',3500,7000,'INR','ESTIMATED'),

('MANUAL','Zostel Jaipur','jaipur','Johari Bazaar','Motilal Atal Road, Near Johari Bazaar',4.4,1,
 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800',
 '["WiFi","Common Lounge","Lockers","AC","Social Events"]',500,1500,'INR','ESTIMATED');
