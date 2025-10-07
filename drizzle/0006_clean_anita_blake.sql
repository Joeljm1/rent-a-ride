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
	`mileage` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "status_check" CHECK("__new_cars"."status" in ('available','unavailable','renting'))
);
--> statement-breakpoint
INSERT INTO `__new_cars`("id", "user_id", "distanceUsed", "description", "brand", "model", "year", "fuel_type", "transmission", "seats", "status", "mileage") SELECT "id", "user_id", "distanceUsed", "description", "brand", "model", "year", "fuel_type", "transmission", "seats", "status", "id" FROM `cars`;--> statement-breakpoint
DROP TABLE `cars`;--> statement-breakpoint
ALTER TABLE `__new_cars` RENAME TO `cars`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
