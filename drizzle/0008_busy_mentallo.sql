CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`carId` integer NOT NULL,
	`requestedBy` text NOT NULL,
	`requestedAt` integer NOT NULL,
	`rentedFrom` integer NOT NULL,
	`rentedTo` integer NOT NULL,
	`message` text NOT NULL,
	`rejectReason` text,
	`status` text DEFAULT 'pending',
	`completedAt` integer,
	FOREIGN KEY (`carId`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "status_check" CHECK("requests"."status" in ('pending','approved','rejected', 'cancelled', 'completed'))
);
--> statement-breakpoint
DROP TABLE `rental`;--> statement-breakpoint
ALTER TABLE `cars` ADD `price_per_day` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `created_at` integer NOT NULL;