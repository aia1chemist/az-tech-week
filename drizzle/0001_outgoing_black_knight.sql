CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rsvp_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`going` int DEFAULT 0,
	`interested` int DEFAULT 0,
	`maybe` int DEFAULT 0,
	`spotsLeft` int,
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rsvp_snapshots_id` PRIMARY KEY(`id`)
);
