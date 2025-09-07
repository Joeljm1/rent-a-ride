CREATE TABLE `rental` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`carid` text NOT NULL,
	`rentedBy` text NOT NULL,
	`rentedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`isComplete` integer NOT NULL,
	FOREIGN KEY (`carid`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rentedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`distanceUsed` integer NOT NULL,
	`description` text,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`fuel_type` text NOT NULL,
	`transmission` text NOT NULL,
	`seats` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_cars`("id", "user_id", "distanceUsed", "description", "brand", "model", "year", "fuel_type", "transmission", "seats") SELECT "id", "user_id", "distanceUsed", "description", "brand", "model", "year", "fuel_type", "transmission", "seats" FROM `cars`;--> statement-breakpoint
DROP TABLE `cars`;--> statement-breakpoint
ALTER TABLE `__new_cars` RENAME TO `cars`;--> statement-breakpoint
PRAGMA foreign_keys=ON;