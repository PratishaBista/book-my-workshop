SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON

-- 1. Create a Seed Provider
DECLARE @AdminId NVARCHAR(450);
SELECT @AdminId = Id FROM Users WHERE Email = 'admin@bookmyworkshop.com';

IF NOT EXISTS (SELECT 1 FROM Providers WHERE BusinessName = 'Central Nepal Workshop Hub')
BEGIN
    INSERT INTO Providers (BusinessName, PhoneNumber, Address, State, Status, IsApproved, CreatedAt, UpdatedAt, UserId, Slug)
    VALUES ('Central Nepal Workshop Hub', '9801234567', 'Naxal, Kathmandu', 'Bagmati', 1, 1, GETUTCDATE(), GETUTCDATE(), @AdminId, 'central-hub');
END

DECLARE @PID INT;
SELECT @PID = Id FROM Providers WHERE BusinessName = 'Central Nepal Workshop Hub';

-- 3. Insert diverse workshops (one for each category)
-- CATEGORY: Art & Craft
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'newari-pottery')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Traditional Newari Pottery & Clay Art', 'newari-pottery', 'Learn the ancient art of pottery using traditional wheels. We focus on natural clay preparation and manual molding techniques practiced in Bhaktapur.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '03:00:00', 10, 'Bhaktapur Square', 0);

-- CATEGORY: Cooking & Baking
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'momo-cooking')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Himalayan Spice & Momo Cooking', 'momo-cooking', 'Master the secret recipes of authentic Nepali Momos. From dough rolling to spice blending and steam techniques, learn it all in this culinary session.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '02:30:00', 15, 'Thamel Kitchen', 0);

-- CATEGORY: Wellness & Fitness
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'sunset-yoga')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Sunset Hatha Yoga & Meditation', 'sunset-yoga', 'A calming wellness session focusing on breathing alignment and Hatha yoga postures. Perfect for meditation and stress relief after work.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '01:00:00', 25, 'Boudha Monastery', 0);

-- CATEGORY: Technology & Programming
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'python-ai-basics')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Python for Data Science & AI', 'python-ai-basics', 'Introduction to Python programming focusing on data analysis, machine learning algorithms, and neural network concepts using clean code patterns.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '04:00:00', 30, 'Tech Hub Naxal', 0);

-- CATEGORY: Photography & Videography
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'doc-photography')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Documentary Photography & Storytelling', 'doc-photography', 'Capture powerful stories through your lens. We explore camera settings, composition, and visual storytelling techniques for travel and journalism.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '03:00:00', 12, 'Patan Durbar', 0);

-- CATEGORY: Music & Dance
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'madal-music')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Traditional Madal & Folk Music', 'madal-music', 'Learn the rhythm of Nepal with our Madal workshop. We cover basic beats and complex folk rhythms used in traditional music and ceremonies.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '02:00:00', 10, 'Kirtipur Music School', 0);

-- CATEGORY: Business & Entrepreneurship
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'startup-strategy')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Startup Strategy & Pitch Deck Design', 'startup-strategy', 'Turn your idea into a business. This workshop covers market research, financial modeling, and creating winning pitch decks for investors.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '05:00:00', 20, 'Innovation Lab', 0);

-- CATEGORY: Language Learning
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'nepali-language')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Conversational Nepali for Travelers', 'nepali-language', 'Essential Nepali phrases and grammar for tourists and expats. Learn to communicate effectively in markets, taxis, and social settings.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '01:30:00', 15, 'Pokhara Lakeside', 0);

-- CATEGORY: DIY & Home Improvement
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'bamboo-furniture')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Bamboo Furniture DIY Workshop', 'bamboo-furniture', 'Design and build your own eco-friendly furniture using bamboo. Learn cutting, joining, and finishing techniques for home decor.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '06:00:00', 8, 'Jhamsikhel Studio', 0);

-- CATEGORY: Kids & Family
IF NOT EXISTS (SELECT 1 FROM Workshops WHERE Slug = 'science-kids')
INSERT INTO Workshops (ProviderId, Title, Slug, Description, Status, IsActive, CreatedAt, UpdatedAt, IsManuallyCategorized, Duration, MaxCapacity, LocationAddress, WorkshopType)
VALUES (@PID, 'Science Experiments for Kids', 'science-kids', 'A fun and interactive workshop for children. We explore physics and chemistry through safe, hands-on experiments that spark curiosity.', 1, 1, GETUTCDATE(), GETUTCDATE(), 1, '02:00:00', 20, 'Childrens Discovery Center', 0);

-- 4. LINK TO CATEGORIES
INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Art & Craft' AND w.Slug = 'newari-pottery'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Cooking & Baking' AND w.Slug = 'momo-cooking'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Wellness & Fitness' AND w.Slug = 'sunset-yoga'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Technology & Programming' AND w.Slug = 'python-ai-basics'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Photography & Videography' AND w.Slug = 'doc-photography'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Music & Dance' AND w.Slug = 'madal-music'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Business & Entrepreneurship' AND w.Slug = 'startup-strategy'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Language Learning' AND w.Slug = 'nepali-language'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'DIY & Home Improvement' AND w.Slug = 'bamboo-furniture'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

INSERT INTO WorkshopWorkshopCategory (CategoriesId, WorkshopsId)
SELECT c.Id, w.Id FROM WorkshopCategories c, Workshops w 
WHERE c.Name = 'Kids & Family' AND w.Slug = 'science-kids'
AND NOT EXISTS (SELECT 1 FROM WorkshopWorkshopCategory WHERE CategoriesId = c.Id AND WorkshopsId = w.Id);

-- 5. Add Pricing
INSERT INTO WorkshopPricings (WorkshopId, PricingType, BasePrice, Currency, CreatedAt, UpdatedAt)
SELECT Id, 0, 1500.00, 'NPR', GETUTCDATE(), GETUTCDATE() FROM Workshops w 
WHERE Slug = 'newari-pottery' AND NOT EXISTS (SELECT 1 FROM WorkshopPricings WHERE WorkshopId = w.Id);

INSERT INTO WorkshopPricings (WorkshopId, PricingType, BasePrice, Currency, CreatedAt, UpdatedAt)
SELECT Id, 0, 5000.00, 'NPR', GETUTCDATE(), GETUTCDATE() FROM Workshops w 
WHERE Slug = 'python-ai-basics' AND NOT EXISTS (SELECT 1 FROM WorkshopPricings WHERE WorkshopId = w.Id);

INSERT INTO WorkshopPricings (WorkshopId, PricingType, BasePrice, Currency, CreatedAt, UpdatedAt)
SELECT Id, 0, 1200.00, 'NPR', GETUTCDATE(), GETUTCDATE() FROM Workshops w 
WHERE Slug = 'sunset-yoga' AND NOT EXISTS (SELECT 1 FROM WorkshopPricings WHERE WorkshopId = w.Id);

INSERT INTO WorkshopPricings (WorkshopId, PricingType, BasePrice, Currency, CreatedAt, UpdatedAt)
SELECT Id, 0, 2500.00, 'NPR', GETUTCDATE(), GETUTCDATE() FROM Workshops w 
WHERE Slug = 'momo-cooking' AND NOT EXISTS (SELECT 1 FROM WorkshopPricings WHERE WorkshopId = w.Id);

INSERT INTO WorkshopPricings (WorkshopId, PricingType, BasePrice, Currency, CreatedAt, UpdatedAt)
SELECT Id, 0, 3000.00, 'NPR', GETUTCDATE(), GETUTCDATE() FROM Workshops w 
WHERE Slug = 'doc-photography' AND NOT EXISTS (SELECT 1 FROM WorkshopPricings WHERE WorkshopId = w.Id);

-- 6. Add Images
INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'newari-pottery' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'momo-cooking' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'sunset-yoga' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'python-ai-basics' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'doc-photography' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'madal-music' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1559136555-e46be1855a8f?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'startup-strategy' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'nepali-language' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1594912959825-961fa1c5d9bd?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'bamboo-furniture' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);

INSERT INTO WorkshopMedia (WorkshopId, Url, DisplayOrder, MediaType, UploadedAt, IsPrimary)
SELECT Id, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop', 1, 0, GETUTCDATE(), 1 FROM Workshops w 
WHERE Slug = 'science-kids' AND NOT EXISTS (SELECT 1 FROM WorkshopMedia WHERE WorkshopId = w.Id);
