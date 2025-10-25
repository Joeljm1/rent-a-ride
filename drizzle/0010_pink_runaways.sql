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
	`status` text DEFAULT 'available',
	`mileage` integer NOT NULL,
	`price_per_day` integer NOT NULL,
	`created_at` integer NOT NULL,
	`gps` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "status_check" CHECK("__new_cars"."status" in ('available','unavailable','renting','approved'))
);
--> statement-breakpoint
INSERT INTO `__new_cars`("id", "user_id", "distanceUsed", "description", "brand", "model", "year", "fuel_type", "transmission", "seats", "status", "mileage", "price_per_day", "created_at", "gps") SELECT "id", "user_id", "distanceUsed", "description", "brand", "model", "year", "fuel_type", "transmission", "seats", "status", "mileage", "price_per_day", "created_at", "gps" FROM `cars`;--> statement-breakpoint
DROP TABLE `cars`;--> statement-breakpoint
ALTER TABLE `__new_cars` RENAME TO `cars`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `requests` ADD `gpsId` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `gpsPass` text;