CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Users] (
    [Id] nvarchar(450) NOT NULL,
    [GoogleId] nvarchar(max) NULL,
    [FullName] nvarchar(max) NOT NULL,
    [Bio] nvarchar(max) NULL,
    [Pronouns] nvarchar(max) NULL,
    [ProfilePictureUrl] nvarchar(max) NULL,
    [CoverImageUrl] nvarchar(max) NULL,
    [Location] nvarchar(max) NULL,
    [Website] nvarchar(max) NULL,
    [FunFact] nvarchar(max) NULL,
    [ProfileUsername] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [WorkshopCategories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [IconUrl] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WorkshopCategories] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Providers] (
    [Id] int NOT NULL IDENTITY,
    [BusinessName] nvarchar(max) NOT NULL,
    [PhoneNumber] nvarchar(max) NOT NULL,
    [Address] nvarchar(max) NOT NULL,
    [State] nvarchar(max) NOT NULL,
    [VenueName] nvarchar(max) NULL,
    [Latitude] decimal(18,10) NULL,
    [Longitude] decimal(18,10) NULL,
    [Website] nvarchar(max) NULL,
    [ReferralSource] nvarchar(max) NULL,
    [Tagline] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [Slug] nvarchar(450) NULL,
    [LogoUrl] nvarchar(max) NULL,
    [CoverImageUrl] nvarchar(max) NULL,
    [Status] int NOT NULL,
    [IsApproved] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Providers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Providers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Venues] (
    [Id] int NOT NULL IDENTITY,
    [ProviderId] int NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [Address] nvarchar(500) NOT NULL,
    [Latitude] decimal(18,10) NOT NULL,
    [Longitude] decimal(18,10) NOT NULL,
    [Description] nvarchar(1000) NULL,
    [IsDefault] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Venues] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Venues_Providers_ProviderId] FOREIGN KEY ([ProviderId]) REFERENCES [Providers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Workshops] (
    [Id] int NOT NULL IDENTITY,
    [ProviderId] int NOT NULL,
    [VenueId] int NULL,
    [Title] nvarchar(200) NOT NULL,
    [Tagline] nvarchar(300) NULL,
    [Subtitle] nvarchar(300) NULL,
    [Slug] nvarchar(500) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [WorkshopType] int NOT NULL,
    [Duration] time NOT NULL,
    [MaxCapacity] int NOT NULL,
    [MinCapacity] int NULL,
    [LocationAddress] nvarchar(500) NOT NULL,
    [LocationName] nvarchar(200) NULL,
    [Latitude] decimal(18,10) NULL,
    [Longitude] decimal(18,10) NULL,
    [LocationDetails] nvarchar(1000) NULL,
    [VenueDescription] nvarchar(max) NULL,
    [Status] int NOT NULL,
    [IsActive] bit NOT NULL,
    [WhatToBring] nvarchar(max) NULL,
    [SkillLevel] nvarchar(max) NULL,
    [Suitability] nvarchar(max) NULL,
    [CancellationPolicy] nvarchar(max) NULL,
    [BookingCutoffHours] int NOT NULL,
    [SafetyRequirements] nvarchar(max) NULL,
    [WhatsIncluded] nvarchar(max) NULL,
    [AISuggestedCategory] nvarchar(100) NULL,
    [AIConfidenceScore] float NULL,
    [AIIsConfident] bit NULL,
    [IsManuallyCategorized] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Workshops] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Workshops_Providers_ProviderId] FOREIGN KEY ([ProviderId]) REFERENCES [Providers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Workshops_Venues_VenueId] FOREIGN KEY ([VenueId]) REFERENCES [Venues] ([Id]) ON DELETE SET NULL
);
GO


CREATE TABLE [WorkshopMedia] (
    [Id] int NOT NULL IDENTITY,
    [WorkshopId] int NOT NULL,
    [MediaType] int NOT NULL,
    [Url] nvarchar(max) NOT NULL,
    [PublicId] nvarchar(max) NULL,
    [IsPrimary] bit NOT NULL,
    [StoryPodId] int NOT NULL,
    [DisplayOrder] int NOT NULL,
    [AspectRatio] nvarchar(20) NULL,
    [FileSizeBytes] bigint NULL,
    [UploadedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WorkshopMedia] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WorkshopMedia_Workshops_WorkshopId] FOREIGN KEY ([WorkshopId]) REFERENCES [Workshops] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [WorkshopPricings] (
    [Id] int NOT NULL IDENTITY,
    [WorkshopId] int NOT NULL,
    [PricingType] int NOT NULL,
    [BasePrice] decimal(18,2) NOT NULL,
    [Currency] nvarchar(10) NOT NULL,
    [GroupDiscountPercentage] decimal(5,2) NULL,
    [GroupDiscountMinSize] int NULL,
    [ExtraCharges] nvarchar(max) NULL,
    [PriceExplanation] nvarchar(1000) NULL,
    [TieredPricing] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WorkshopPricings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WorkshopPricings_Workshops_WorkshopId] FOREIGN KEY ([WorkshopId]) REFERENCES [Workshops] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [WorkshopSchedules] (
    [Id] int NOT NULL IDENTITY,
    [WorkshopId] int NOT NULL,
    [StartDateTime] datetime2 NOT NULL,
    [EndDateTime] datetime2 NOT NULL,
    [AvailableSeats] int NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WorkshopSchedules] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WorkshopSchedules_Workshops_WorkshopId] FOREIGN KEY ([WorkshopId]) REFERENCES [Workshops] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [WorkshopWorkshopCategory] (
    [CategoriesId] int NOT NULL,
    [WorkshopsId] int NOT NULL,
    CONSTRAINT [PK_WorkshopWorkshopCategory] PRIMARY KEY ([CategoriesId], [WorkshopsId]),
    CONSTRAINT [FK_WorkshopWorkshopCategory_WorkshopCategories_CategoriesId] FOREIGN KEY ([CategoriesId]) REFERENCES [WorkshopCategories] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_WorkshopWorkshopCategory_Workshops_WorkshopsId] FOREIGN KEY ([WorkshopsId]) REFERENCES [Workshops] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Bookings] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [WorkshopScheduleId] int NOT NULL,
    [NumberOfSeats] int NOT NULL,
    [TotalAmount] decimal(18,2) NOT NULL,
    [BookingStatus] int NOT NULL,
    [PaymentStatus] int NOT NULL,
    [PaymentGateway] nvarchar(50) NULL,
    [TransactionId] nvarchar(200) NULL,
    [PaymentReference] nvarchar(200) NULL,
    [PaymentCompletedAt] datetime2 NULL,
    [ConfirmationCode] nvarchar(100) NOT NULL,
    [CancelledAt] datetime2 NULL,
    [CancellationReason] nvarchar(1000) NULL,
    [BookingDate] datetime2 NOT NULL,
    CONSTRAINT [PK_Bookings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Bookings_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Bookings_WorkshopSchedules_WorkshopScheduleId] FOREIGN KEY ([WorkshopScheduleId]) REFERENCES [WorkshopSchedules] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [WorkshopReviews] (
    [Id] int NOT NULL IDENTITY,
    [WorkshopId] int NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [BookingId] int NOT NULL,
    [Rating] int NOT NULL,
    [Comment] nvarchar(2000) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WorkshopReviews] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WorkshopReviews_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_WorkshopReviews_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_WorkshopReviews_Workshops_WorkshopId] FOREIGN KEY ([WorkshopId]) REFERENCES [Workshops] ([Id]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO


CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO


CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
GO


CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
GO


CREATE INDEX [IX_Bookings_BookingStatus_PaymentStatus] ON [Bookings] ([BookingStatus], [PaymentStatus]);
GO


CREATE UNIQUE INDEX [IX_Bookings_ConfirmationCode] ON [Bookings] ([ConfirmationCode]);
GO


CREATE INDEX [IX_Bookings_UserId] ON [Bookings] ([UserId]);
GO


CREATE INDEX [IX_Bookings_WorkshopScheduleId] ON [Bookings] ([WorkshopScheduleId]);
GO


CREATE UNIQUE INDEX [IX_Providers_Slug] ON [Providers] ([Slug]) WHERE [Slug] IS NOT NULL;
GO


CREATE INDEX [IX_Providers_UserId] ON [Providers] ([UserId]);
GO


CREATE INDEX [EmailIndex] ON [Users] ([NormalizedEmail]);
GO


CREATE UNIQUE INDEX [UserNameIndex] ON [Users] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO


CREATE INDEX [IX_Venues_ProviderId] ON [Venues] ([ProviderId]);
GO


CREATE UNIQUE INDEX [IX_WorkshopCategories_Name] ON [WorkshopCategories] ([Name]);
GO


CREATE INDEX [IX_WorkshopMedia_WorkshopId] ON [WorkshopMedia] ([WorkshopId]);
GO


CREATE UNIQUE INDEX [IX_WorkshopPricings_WorkshopId] ON [WorkshopPricings] ([WorkshopId]);
GO


CREATE UNIQUE INDEX [IX_WorkshopReviews_BookingId] ON [WorkshopReviews] ([BookingId]);
GO


CREATE INDEX [IX_WorkshopReviews_UserId] ON [WorkshopReviews] ([UserId]);
GO


CREATE INDEX [IX_WorkshopReviews_WorkshopId] ON [WorkshopReviews] ([WorkshopId]);
GO


CREATE INDEX [IX_Workshops_ProviderId] ON [Workshops] ([ProviderId]);
GO


CREATE INDEX [IX_Workshops_Status] ON [Workshops] ([Status]);
GO


CREATE INDEX [IX_Workshops_VenueId] ON [Workshops] ([VenueId]);
GO


CREATE INDEX [IX_WorkshopSchedules_StartDateTime] ON [WorkshopSchedules] ([StartDateTime]);
GO


CREATE INDEX [IX_WorkshopSchedules_WorkshopId] ON [WorkshopSchedules] ([WorkshopId]);
GO


CREATE INDEX [IX_WorkshopWorkshopCategory_WorkshopsId] ON [WorkshopWorkshopCategory] ([WorkshopsId]);
GO


